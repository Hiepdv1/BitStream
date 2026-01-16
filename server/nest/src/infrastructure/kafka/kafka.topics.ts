import { ITopicConfig } from 'kafkajs';

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

export const topicsConfig: ITopicConfig[] = [
  {
    topic: KafkaTopic.STREAM_ON_PUBLISH,
    numPartitions: 10,
    replicationFactor: 1,
  },
  {
    topic: KafkaTopic.MAIL_SEND,
    numPartitions: 3,
    replicationFactor: 1,
  },
];
