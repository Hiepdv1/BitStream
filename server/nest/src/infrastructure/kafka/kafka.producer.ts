import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Partitioners, Producer } from 'kafkajs';
import { kafka } from './kafka.config';
import { KafkaTopic, topicsConfig } from './kafka.topics';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  async onModuleInit() {
    await this.setupTopics();
    await this.producer.connect();
  }

  async setupTopics() {
    const admin = kafka.admin();
    await admin.connect();

    await admin.createTopics({
      waitForLeaders: true,
      topics: topicsConfig,
    });

    await admin.disconnect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publish(
    topic: KafkaTopic,
    payload: unknown,
    key?: string,
    partition?: number,
  ) {
    await this.producer.send({
      topic,
      messages: [
        {
          key,
          partition,
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}
