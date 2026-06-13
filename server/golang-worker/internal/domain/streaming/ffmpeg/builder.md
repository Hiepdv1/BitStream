# 📖 TÀI LIỆU GIẢI PHẪU: Kiến trúc `builder.go` (Hệ thống Build Lệnh FFmpeg)

**Mục đích của file này:** Giải thích cặn kẽ cách hệ thống backend tạo ra chuỗi lệnh FFmpeg để xử lý luồng Live Stream. Đọc file này để hiểu cơ chế phân luồng, ép dung lượng và chống giật lag, rất hữu ích khi cần bảo trì hoặc tinh chỉnh (optimize) hệ thống sau này.

---

## PHẦN 1: Kiến trúc Option Pattern (Cấu hình linh hoạt)

Thay vì viết một hàm nhận vào hàng chục tham số (rất rối và dễ lỗi), hệ thống dùng pattern `Functional Options`.

### Đoạn code cốt lõi:

```go
type StreamConfig struct {
    VideoCodec  string // CPU (libx264) hay GPU (h264_nvenc)
    VideoPreset string // Tốc độ nén (ultrafast, veryfast, p4...)
    // ...
}

type BuilderOption func(*StreamConfig)

func WithVideoCodec(codec string) BuilderOption {
    return func(c *StreamConfig) { c.VideoCodec = codec }
}
```

### 💡 Giải thích & Ví dụ:

- **Tác dụng:** Giúp chúng ta dễ dàng nhồi thêm các cấu hình mới từ biến môi trường (Environment Variables) mà không làm vỡ cấu trúc hàm cũ.
- **Ví dụ thực tế:** Khi chạy thật trên Production, chúng ta dùng GPU `h264_nvenc`. Nhưng khi đem code về test trên VPS cấu hình thấp, bạn truyền biến môi trường `STREAM_VIDEO_PRESET=ultrafast` và `STREAM_VIDEO_CODEC=libx264`. Hàm Option sẽ tự động cập nhật cấu hình mà không cần can thiệp sửa code Golang.

---

## PHẦN 2: Cơ chế "Nối sóng" (Resume / Recovery)

Trong thực tế, máy chủ có thể bị Crash hoặc FFmpeg bị chết đột ngột. Cơ chế này giúp video VOD (xem lại) không bị đứt đoạn hay ghi đè.

### Đoạn code cốt lõi:

```go
var segmentRegex = regexp.MustCompile(`chunk-.*-(\d+)\.m4s$`)

func getLastSegmentNumber(dir string) (int, error) { ... }
```

### 💡 Giải thích & Ví dụ:

- **Regex toàn cục:** Biến `segmentRegex` được khai báo ở ngoài cùng (Global) để Golang chỉ phải biên dịch nó 1 lần duy nhất lúc khởi động app, giúp tiết kiệm CPU.
- **Ví dụ thực tế:** Streamer đang live đến file `chunk-0-45.m4s` thì máy chủ cúp điện. Khi server khởi động lại, hàm `getLastSegmentNumber` sẽ quét ổ đĩa (hoặc RAM), nhận ra số lớn nhất là `45`. Nó sẽ báo cho FFmpeg: _"Hãy chạy tiếp và đánh số chunk tiếp theo là 46 nhé!"_. Nhờ vậy, chuỗi video của người xem luôn liền mạch.

---

## PHẦN 3: Trái tim hệ thống - `filter_complex` (Ma thuật nhân bản)

Đây là kỹ thuật **1 luồng vào - Nhiều luồng ra**. Thay vì chạy FFmpeg 4 lần tốn x4 RAM và CPU, chúng ta dùng `filter_complex` làm một "dây chuyền nhà máy" xử lý đồng thời.

### Đoạn code cốt lõi:

```go
filter := "[0:v]setsar=1,fps=60,split=4[v1][v2][v3][v4];"

for i, h := range ladders {
    filter += splitLabels[i] + "scale=-2:" + strconv.Itoa(h) + ":flags=lanczos,setsar=1,setdar=16/9,format=yuv420p[vout" + strconv.Itoa(i) + "];"
}
```

### 💡 Giải thích & Ví dụ (Ví von như ống nước):

1.  **Khởi tạo (Split):** `[0:v]` là luồng video gốc Streamer đẩy lên. Lệnh `split=4` sẽ copy luồng này ra làm 4 bản y hệt nhau, chảy vào 4 cái ống nước nhãn hiệu `[v1]`, `[v2]`, `[v3]`, `[v4]`.
2.  **Thu nhỏ (Scale):**
    - Ống `[v1]` đi qua cỗ máy `scale`. Thuật toán `flags=lanczos` được dùng để ép video nhỏ lại thành 720p hoặc 480p mà không bị mờ nhòe (chất lượng nội suy cao nhất của FFmpeg).
    - `setsar=1` và `setdar=16/9`: Ép video luôn hiển thị khung hình ngang (tránh tình trạng streamer dùng điện thoại quay dọc làm méo hình).
    - `format=yuv420p`: Ép hệ màu chuẩn yuv420p. Đây là hệ màu "quốc dân", đảm bảo iPhone, Android, hay mọi trình duyệt đều xem được mà không bị lỗi xanh màn hình.
3.  **Đầu ra:** Dán cho luồng đã xử lý cái nhãn mới là `[vout0]`, `[vout1]` chuẩn bị mang đi nén.

---

## PHẦN 4: Ép dung lượng & Cấu hình Card mạng (Encoding)

Sau khi có khung hình chuẩn, chúng ta phải nén nó lại để truyền qua mạng Internet. Đây là bước quyết định video mượt hay lag.

### Đoạn code cốt lõi:

```go
"-map", "[vout0]", // Lấy ống nước vout0
"-b:v:0", "4000k", // Bitrate mục tiêu
"-maxrate:v:0", "4500k", // Cấm vượt qua ngưỡng này
"-bufsize:v:0", "8000k", // Kích thước đệm để FFmpeg tính toán
```

### 💡 Giải thích & Ví dụ:

> Hệ thống áp dụng chuẩn **CBR/VBR bị kiểm soát** (Constrained VBR).

- **Ví dụ thực tế:** Khi Streamer chơi game nhập vai, nhân vật đứng yên thì video chỉ tốn `1000k` (1 Mbps). Nhưng khi có combat nổ tung tóe, dung lượng thực tế cần đến `10000k` (10 Mbps) để nhìn rõ chi tiết.
- Nếu không có `-maxrate 4500k`, cục mạng của người xem sẽ không tải kịp 10Mbps -> **Video bị đứng hoặc xoay vòng vòng**. Lệnh `maxrate` ép FFmpeg phải "hi sinh" một xíu độ nét trong lúc combat để đảm bảo dung lượng không bao giờ vượt ngưỡng gây đứt mạng.

---

## PHẦN 5: Tham số Tối ưu CPU / GPU (Presets)

Đây là các cờ (flags) để ép phần cứng làm việc theo cường độ mong muốn.

### Đoạn code cốt lõi:

```go
// NẾU DÙNG GPU NVIDIA (h264_nvenc)
"-preset:v:0", "p4", // Hoặc p1 -> p7
"-rc:v:0", "vbr",

// NẾU DÙNG CPU (libx264)
"-x264-params", "nal-hrd=cbr:force-cfr=1:rc-lookahead=10:sliced-threads=0",
"-preset", "ultrafast" // Hoặc veryfast, medium
```

### 💡 Giải thích & Ví dụ:

**1. Preset (Tốc độ):**

- **CPU (libx264):** Có các mức: `ultrafast`, `superfast`, `veryfast`, `medium`.
  - _Mẹo:_ `ultrafast` chạy cực nhanh (không tốn CPU) nhưng file `.m4s` xuất ra sẽ hơi nặng (tốn băng thông mạng). `medium` chạy rất mệt CPU nhưng file nén cực nhẹ và nét. Code cho phép ghi đè bằng `STREAM_VIDEO_PRESET` để chống giật khi test trên server yếu.
- **GPU (h264_nvenc):** Phân chia từ `p1` (nhanh/nhẹ) đến `p7` (chậm/nét). Mặc định là `p4` - mức cân bằng hoàn hảo nhất của card NVIDIA.

**2. Các cờ bí quyết của CPU (`x264-params`):**

- `nal-hrd=cbr`: Giúp xuất tín hiệu ra cực kỳ đều đặn (nhịp nhàng như nhịp tim). Nhờ vậy Web Player của Client không bị nghẹn khi nhận file.
- `rc-lookahead=10`: Cho phép bộ nén "tiên tri" trước 10 khung hình tương lai để tìm cách nén tốt nhất, giúp những cảnh chuyển động nhanh mượt mà hơn.
- `sliced-threads=0`: Tối ưu hóa đa luồng tối đa cho kiến trúc CPU.

---

## PHẦN 6: Đóng gói DASH Streaming (`dashArgs`)

Biến video mp4 nguyên khối thành các khối `.m4s` (chunk) để phát Live.

### Đoạn code cốt lõi:

```go
"-window_size", "5",
"-extra_window_size", "5",
"-utc_timing_url", "[https://time.akamai.com/?iso](https://time.akamai.com/?iso)",
"-remove_at_exit", "0",
```

### 💡 Giải thích & Ví dụ:

- `-window_size 5`: Yêu cầu file danh sách `manifest.mpd` chỉ hiển thị 5 chunk mới nhất (khoảng 10s video) để Web Player biết cần tải file nào.
- `-utc_timing_url`: **Cực kỳ quan trọng cho Live Streaming!** Cung cấp giờ quốc tế chuẩn cho Player (trình duyệt). Nhờ vậy, trình duyệt biết căn chỉnh (Sync) độ trễ, không tải file `.m4s` nhanh hơn tốc độ FFmpeg sinh ra file trên server (nguyên nhân chính gây lỗi 404 và lặp lại video).
- `-remove_at_exit 0`: Khi tắt stream, cấm FFmpeg tự động xóa các file `.m4s`. Việc xóa dọn rác đã có cơ chế `segment.go` (Golang) chuyên trách xử lý an toàn và triệt để hơn trên RAM Disk.
