package consumer

type Registration struct {
	Topics        []string
	Handler       MessageHandler
	ConsumerCount int
}

var registry []Registration

func Register(r Registration) {
	registry = append(registry, r)
}

func All() []Registration {
	return registry
}
