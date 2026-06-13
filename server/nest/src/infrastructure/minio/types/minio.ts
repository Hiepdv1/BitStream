export interface DeleteObjectOptions {
  ignoreNotFound?: boolean;
}

export enum BucketType {
  GIFT = 'gift',
  LIVE = 'live',
  STREAM_THUMBNAIL = 'stream-thumbnail',
  AVATAR = 'avatar',
}
