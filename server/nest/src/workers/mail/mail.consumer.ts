import { Injectable, OnModuleInit } from '@nestjs/common';
import { Consumer } from 'kafkajs';
import { SendMailPayload } from 'src/common/kafka-payloads/mail';
import { validateKafkaPayload } from 'src/common/utils';
import { kafka } from 'src/infrastructure/kafka/kafka.config';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { RecoveryEntry } from 'src/infrastructure/local-recovery/interfaces/recovery-entry.interface';
import { LocalRecoveryService } from 'src/infrastructure/local-recovery/local-recovery.service';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { MailService } from 'src/workers/mail/mail.service';

@Injectable()
export class MailConsumer implements OnModuleInit {
  private readonly SERVICE_NAME = 'mail-consumer';

  private consumer: Consumer = kafka.consumer({
    groupId: 'mail-worker-group',
    sessionTimeout: 45000,
    heartbeatInterval: 3000,
  });

  constructor(
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly producer: KafkaProducerService,
    private readonly storage: LocalRecoveryService,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topics: [KafkaTopic.MAIL_SEND, KafkaTopic.MAIL_SEND_RETRY],
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        let rawPayload: any;
        const rawString = message.value.toString();

        try {
          rawPayload = JSON.parse(rawString);

          const { data, errors } = await validateKafkaPayload(
            SendMailPayload,
            rawPayload,
          );

          if (errors) {
            return await this.sendToDLQ(
              rawPayload,
              'MAIL_PAYLOAD_VALIDATION_FAILED',
            );
          }

          await this.mailService.send(data);

          this.logger.info({
            message: `Send mail to ${data.to} successfully`,
            service: this.SERVICE_NAME,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          this.logger.error({
            message: 'mail consumer processing failed',
            service: this.SERVICE_NAME,
            timestamp: new Date().toISOString(),
            error: err,
          });

          if (rawPayload) {
            await this.handleRetry(rawPayload, err);
          } else {
            await this.sendToDLQ(
              { raw: rawString },
              'MAIL_PAYLOAD_JSON_PARSE_FAILED',
            );
          }
        }
      },
    });
  }

  private async handleRetry(payload: SendMailPayload, err: any) {
    try {
      const currentRetry = payload.retryCount || 0;
      const maxRetry = payload.maxRetry || 3;

      if (currentRetry >= maxRetry) {
        return await this.sendToDLQ(payload, 'MAIL_MAX_RETRY_EXCEEDED');
      }

      payload.retryCount = currentRetry + 1;

      await this.producer.publish(KafkaTopic.MAIL_SEND_RETRY, payload);

      this.logger.warn({
        message: 'mail send failed, retry queued',
        service: this.SERVICE_NAME,
        error: err,
        timestamp: new Date().toISOString(),
      });
    } catch (retryErr) {
      this.logger.error({
        message: 'mail retry publish failed',
        service: this.SERVICE_NAME,
        timestamp: new Date().toISOString(),
        error: retryErr,
      });

      const entry: RecoveryEntry<SendMailPayload> = {
        data: payload,
        timestamp: Date.now(),
        source: this.SERVICE_NAME,
        type: 'mail.retry.publish.failed',
        reason: retryErr?.message,
      };

      await this.storage.save(entry);
    }
  }

  private async sendToDLQ<T>(payload: T, reason: string) {
    try {
      await this.producer.publish(KafkaTopic.MAIL_SEND_DLQ, {
        ...payload,
        failedReason: reason,
        failedAt: new Date().toISOString(),
      });
    } catch (dlqErr) {
      this.logger.error({
        message: 'mail dlq publish failed',
        service: this.SERVICE_NAME,
        timestamp: new Date().toISOString(),
        error: dlqErr,
      });

      const entry: RecoveryEntry<T> = {
        data: payload,
        source: this.SERVICE_NAME,
        timestamp: Date.now(),
        type: 'mail.dlq.publish.failed',
        reason: dlqErr?.message,
      };

      await this.storage.save(entry);
    }
  }
}
