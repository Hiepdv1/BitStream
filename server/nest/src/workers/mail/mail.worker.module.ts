import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailConsumer } from './mail.consumer';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/infrastructure/logger/logger.module';
import { MailService } from './mail.service';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      template: {
        dir:
          process.env.NODE_ENV === 'production'
            ? join(__dirname, 'templates')
            : join(process.cwd(), 'src/workers/mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    LoggerModule,
    KafkaModule,
  ],
  providers: [MailConsumer, MailService],
})
export class MailWorkerModule {}
