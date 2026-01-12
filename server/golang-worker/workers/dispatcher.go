package workers

type Dispatcher struct {
	jobQueue chan Job
	workers  int
}
