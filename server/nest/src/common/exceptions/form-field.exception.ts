import { BadRequestException } from '@nestjs/common';

export interface FormFieldError {
  field: string;
  errors: string[];
}

export class FormFieldException<T = any> extends BadRequestException {
  constructor(field: keyof T, error: string, customMessage?: string);

  constructor(errors: FormFieldError[], customMessage?: string);

  constructor(arg1: keyof T | FormFieldError[], arg2?: string, arg3?: string) {
    let errorList: FormFieldError[];
    let finalMessage = 'Validation failed';

    if (Array.isArray(arg1)) {
      errorList = arg1;
      finalMessage = arg2 || finalMessage;
    } else {
      errorList = [
        {
          field: arg1 as string,
          errors: arg2 ? [arg2] : [],
        },
      ];
      finalMessage = arg3 || finalMessage;
    }

    super({
      message: finalMessage,
      errors: errorList,
    });
  }
}
