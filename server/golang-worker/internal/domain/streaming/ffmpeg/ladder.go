package ffmpeg

type LadderConfig struct {
	Height  int
	Width   int
	Bitrate string
	MaxRate string
	BufSize string
	Level   string
}

var AllLadders = []LadderConfig{
	{Height: 1080, Width: 1920, Bitrate: "6000k", MaxRate: "6500k", BufSize: "12000k", Level: "4.2"},

	{Height: 720, Width: 1280, Bitrate: "4000k", MaxRate: "4500k", BufSize: "8000k", Level: "4.1"},

	{Height: 480, Width: 854, Bitrate: "1500k", MaxRate: "1800k", BufSize: "3000k", Level: "3.1"},

	{Height: 360, Width: 640, Bitrate: "800k", MaxRate: "1000k", BufSize: "1600k", Level: "3.0"},
}

func ComputeLadders(sourceHeight int) []int {
	var ladders []int

	for _, l := range AllLadders {
		if sourceHeight >= (l.Height - 10) {
			ladders = append(ladders, l.Height)
		}
	}

	if len(ladders) == 0 {
		ladders = []int{sourceHeight}
	}

	return ladders
}

func GetLadderConfig(height int) LadderConfig {
	for _, l := range AllLadders {
		if l.Height == height {
			return l
		}
	}

	return LadderConfig{
		Height:  height,
		Width:   (height * 16 / 9) / 2 * 2,
		Bitrate: "800k",
		MaxRate: "1000k",
		BufSize: "2000k",
		Level:   "3.1",
	}
}
