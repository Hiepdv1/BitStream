package ffmpeg

import (
	"sync"
	"time"
)

// FileDebouncer coalesces multiple fsnotify events for the same file
// into a single handler call after a quiet period (duration).
//
// fsnotify fires CREATE + WRITE + WRITE... for a single file write.
// Debouncer resets the timer on each event, only firing handler once
// the file has been quiet for the configured duration.
type FileDebouncer struct {
	mu       sync.Mutex
	timers   map[string]*time.Timer
	duration time.Duration
	handler  func(string)
}

func NewFileDebouncer(duration time.Duration, handler func(string)) *FileDebouncer {
	return &FileDebouncer{
		timers:   make(map[string]*time.Timer),
		duration: duration,
		handler:  handler,
	}
}

// Trigger resets the timer for the given path.
// If no new event arrives within duration, handler(path) is called.
func (d *FileDebouncer) Trigger(path string) {
	d.mu.Lock()
	defer d.mu.Unlock()

	if t, ok := d.timers[path]; ok {
		t.Reset(d.duration)
		return
	}

	d.timers[path] = time.AfterFunc(d.duration, func() {
		d.mu.Lock()
		delete(d.timers, path)
		d.mu.Unlock()

		d.handler(path)
	})
}

// Close stops all pending timers and fires their handlers immediately.
// Used during graceful shutdown to flush pending files.
func (d *FileDebouncer) Close() {
	d.mu.Lock()
	defer d.mu.Unlock()

	for path, t := range d.timers {
		t.Stop()
		delete(d.timers, path)

		// Fire handler for pending files so they don't get lost
		go d.handler(path)
	}
}
