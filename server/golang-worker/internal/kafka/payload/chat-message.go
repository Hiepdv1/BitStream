package payload

import "encoding/json"

type ChatMessageDLQ struct {
	StreamID   string          `json:"streamID"`
	Reason     string          `json:"reason"`
	Data       json.RawMessage `json:"data"`
	EventId    string          `json:"eventId"`
	OccurredAt string          `json:"occurredAt"`
}
