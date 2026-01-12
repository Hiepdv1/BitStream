import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function Match<T extends object>(
  property: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: T, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return `${propertyName} must match ${String(relatedPropertyName)}`;
        },
      },
    });
  };
}
