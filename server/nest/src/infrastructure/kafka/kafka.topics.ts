export enum KafkaTopic {
  MAIL_SEND = 'mail.send',
  MAIL_SEND_RETRY = 'mail.send.retry',
  MAIL_SEND_DLQ = 'mail.send.dlq',

  NOTIFICATION_PUSH = 'notification.push',
  NOTIFICATION_PUSH_DLQ = 'notification.push.dlq',

  CHAT_MESSAGE = 'chat.message',
  CHAT_MESSAGE_DLQ = 'chat.message.dlq',

  STREAM_ON_PUBLISH = 'stream.on_publish',
  STREAM_ON_PUBLISH_DLQ = 'stream.on_publish.dlq',
}
