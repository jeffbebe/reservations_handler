import { ValidationError } from 'class-validator';

export const mapValidationErrors = (errors: ValidationError[]) => {
  return errors
    .map((it) => Object.values(it.constraints ?? {}).join(', '))
    .join(',\n');
};
