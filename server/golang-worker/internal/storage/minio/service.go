package minio

import (
	"context"
	"fmt"

	"github.com/bitstream/backend-go/internal/config"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Service struct {
	client     *minio.Client
	bucketName string
}

func NewService(cfg config.MinIOConfig) (*Service, error) {
	minioClient, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	return &Service{
		client:     minioClient,
		bucketName: cfg.BucketName,
	}, nil
}

func (s *Service) EnsureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucketName)
	if err != nil {
		return fmt.Errorf("failed to check bucket existence: %w", err)
	}

	if !exists {
		err = s.client.MakeBucket(ctx, s.bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("failed to create bucket: %w", err)
		}

		policy := fmt.Sprintf(`{
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Principal": {"AWS": ["*"]},
					"Action": ["s3:GetObject"],
					"Resource": ["arn:aws:s3:::%s/*"]
				}
			]
		}`, s.bucketName)

		if err = s.client.SetBucketPolicy(ctx, s.bucketName, policy); err != nil {
			return fmt.Errorf("failed to set bucket policy: %w", err)
		}
	}
	return nil
}

func (s *Service) UploadFile(ctx context.Context, localPath, remotePath, contentType string) error {
	_, err := s.client.FPutObject(ctx, s.bucketName, remotePath, localPath, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("failed to upload file %s: %w", localPath, err)
	}
	return nil
}

func (s *Service) DeleteObject(ctx context.Context, remotePath string) error {
	err := s.client.RemoveObject(ctx, s.bucketName, remotePath, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete object %s: %w", remotePath, err)
	}
	return nil
}
