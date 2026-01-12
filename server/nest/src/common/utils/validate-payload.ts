import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { formatValidationErrors } from '../validators';

export async function validateKafkaPayload<T extends object>(
  cls: new () => T,
  payload: any,
) {
  const instance = plainToInstance(cls, payload, {
    enableImplicitConversion: true,
  });

  const validationErrors: ValidationError[] = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: false,
    forbidUnknownValues: true,
  });

  if (validationErrors.length > 0) {
    return {
      errors: formatValidationErrors(validationErrors),
    };
  }

  return {
    data: instance,
  };
}
