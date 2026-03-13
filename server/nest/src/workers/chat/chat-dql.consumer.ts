import { Injectable, OnModuleInit } from '@nestjs/common';
import { Consumer } from 'kafkajs';
import { kafka } from 'src/infrastructure/kafka/kafka.config';
import { validateKafkaPayload } from 'src/common/utils';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { ChatDLQPayload } from 'src/common/kafka-payloads/chat/send-message.payload';

@Injectable()
export class ChatDLQConsumer implements OnModuleInit {
  private consumer: Consumer = kafka.consumer({
    groupId: 'chat-worker-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });

  constructor() {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: KafkaTopic.CHAT_MESSAGE_DLQ });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value!.toString());

          const { errors } = await validateKafkaPayload(ChatDLQPayload, data);

          if (errors) {
          }

          //   Insert to db
        } catch (err) {}
      },
    });
  }
}
