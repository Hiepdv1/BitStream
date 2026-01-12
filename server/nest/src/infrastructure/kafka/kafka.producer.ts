import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Partitioners, Producer } from 'kafkajs';
import { kafka } from './kafka.config';
import { KafkaTopic } from './kafka.topics';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publish(topic: KafkaTopic, payload: unknown) {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}
