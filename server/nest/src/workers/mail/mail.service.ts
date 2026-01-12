import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { SendMailPayload } from 'src/common/kafka-payloads/mail';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly logger: LoggerService,
  ) {}

  async send(payload: SendMailPayload) {
    try {
      await this.mailer.sendMail({
        to: payload.to,
        subject: payload.subject,
        template: payload.template,
        context: payload.context,
      });

      this.logger.info({
        message: 'Mail sent successfully',
        service: 'Mail Service',
        context: 'send',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.error({
        message: 'Failed to send mail',
        service: 'Mail Service',
        context: 'send',
        timestamp: new Date().toISOString(),
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
      });

      throw err;
    }
  }
}
