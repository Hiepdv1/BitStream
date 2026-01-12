import { Injectable, OnModuleInit } from '@nestjs/common';
import { Consumer } from 'kafkajs';
import { SendMailPayload } from 'src/common/kafka-payloads/mail';
import { validateKafkaPayload } from 'src/common/utils';
import { kafka } from 'src/infrastructure/kafka/kafka.config';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { MailService } from 'src/workers/mail/mail.service';

@Injectable()
export class MailConsumer implements OnModuleInit {
  private consumer: Consumer = kafka.consumer({
    groupId: 'mail-worker-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });

  constructor(
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly producer: KafkaProducerService,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topics: [KafkaTopic.MAIL_SEND, KafkaTopic.MAIL_SEND_RETRY],
    });

    await this.consumer.run({
      eachMessage: async ({ message, topic, partition }) => {
        let raw: any;
        try {
          raw = JSON.parse(message.value!.toString());

          const { data, errors } = await validateKafkaPayload(
            SendMailPayload,
            raw,
          );

          if (errors) {
            await this.sendToDLQ(
              raw,
              `VALIDATION_ERROR: ${JSON.stringify(errors)}`,
            );
            return;
          }

          await this.mailService.send(data);
        } catch (err) {
          this.logger.error({
            message: `Error processing message from topic ${topic}: ${err.message}`,
            service: 'Mail Consumer',
            context: 'onModuleInit',
            timestamp: new Date().toISOString(),
            error: {
              name: err.name,
              message: err.message,
              stack: err.stack,
            },
          });

          if (raw) {
            await this.handleRetry(raw, err);
          } else {
            await this.sendToDLQ(
              { originalValue: message.value?.toString() } as any,
              'JSON_PARSE_ERROR',
            );
          }
        }
      },
    });
  }

  private async handleRetry(payload: SendMailPayload, err: any) {
    const currentRetry = payload.retryCount || 0;
    const maxRetry = payload.maxRetry || 3;

    if (currentRetry >= maxRetry) {
      await this.sendToDLQ(payload, `MAX_RETRY_REACHED: ${err.message}`);
      return;
    }

    payload.retryCount = currentRetry + 1;

    const delay = payload.retryCount * 5000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    await this.producer.publish(KafkaTopic.MAIL_SEND_RETRY, payload);

    this.logger.warn({
      message: `Retrying mail (${payload.retryCount}/${maxRetry}) for ${payload.to}`,
      service: 'Mail Consumer',
      context: 'handleRetry',
      timestamp: new Date().toISOString(),
    });
  }

  private async sendToDLQ(payload: SendMailPayload, reason: string) {
    await this.producer.publish(KafkaTopic.MAIL_SEND_DLQ, {
      ...payload,
      failedReason: reason,
      failedAt: new Date().toISOString(),
    });

    this.logger.error({
      message: 'Mail moved to DLQ',
      service: 'Mail Consumer',
      context: 'sendToDLO',
      timestamp: new Date().toISOString(),
      error: {
        name: 'Mail Worker Exception',
        message: reason,
      },
    });
  }
}
