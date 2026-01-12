import { ValidationError } from 'class-validator';

export interface ValidationErrorFormat {
  field: string;
  errors: string[];
}

export function formatValidationErrors(
  errors: ValidationError[],
  parentProperty = '',
): ValidationErrorFormat[] {
  const formattedErrors: ValidationErrorFormat[] = [];

  for (const error of errors) {
    const propertyPath = parentProperty
      ? `${parentProperty}.${error.property}`
      : error.property;

    if (error.constraints) {
      formattedErrors.push({
        field: propertyPath,
        errors: Object.values(error.constraints),
      });
    }

    if (error.children && error.children.length > 0) {
      formattedErrors.push(
        ...formatValidationErrors(error.children, propertyPath),
      );
    }
  }

  return formattedErrors;
}
