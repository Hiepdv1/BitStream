import {
  BadRequestException,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { formatValidationErrors } from 'src/common/validators';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          message: 'Validation failed',
          errors: formatValidationErrors(errors),
        });
      },
    });
  }
}
