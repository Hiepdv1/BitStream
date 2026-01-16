package model

type StreamAction string

const (
	StreamStart StreamAction = "START"
	StreamStop  StreamAction = "STOP"
)

type StreamPayload struct {
	EventID  string       `json:"eventId"`
	StreamID string       `json:"streamId"`
	Action   StreamAction `json:"action"`

	RTMPUrl string `json:"rtmpUrl"`

	RetryCount int `json:"retryCount"`
	MaxRetry   int `json:"maxRetry"`

	OccurredAt string `json:"occurredAt"`
}
