package utils

import "os"

func GetProjectRoot() string {
	root, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	return root
}
