import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { PASSWORD_CONSTANTS } from '../constants/password.constants';

/**
 * Enforces the platform password policy: length bounds plus at least one
 * lowercase, uppercase, digit, and special character.
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }

          if (
            value.length < PASSWORD_CONSTANTS.MIN_LENGTH ||
            value.length > PASSWORD_CONSTANTS.MAX_LENGTH
          ) {
            return false;
          }

          return PASSWORD_CONSTANTS.STRENGTH_REGEX.test(value);
        },
        defaultMessage(): string {
          return `Password must be ${PASSWORD_CONSTANTS.MIN_LENGTH}-${PASSWORD_CONSTANTS.MAX_LENGTH} characters and include uppercase, lowercase, a number, and a special character.`;
        },
      },
    });
  };
}

/**
 * Cross-field equality check, e.g. confirm_password === new_password.
 */
export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must match ${relatedPropertyName}.`;
        },
      },
    });
  };
}
