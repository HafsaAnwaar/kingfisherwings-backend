import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const ROLE_CODE_REGEX = /^[A-Z][A-Z0-9_]{1,49}$/;

/**
 * Validates the shape of a Role.code value (VarChar(50), conventionally
 * UPPER_SNAKE_CASE, e.g. "BRANCH_MANAGER"). Format-only; existence within
 * the tenant is verified by UsersService.validateRole at write time.
 */
export function IsRoleCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRoleCode',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && ROLE_CODE_REGEX.test(value);
        },
        defaultMessage(): string {
          return 'Role code must be UPPER_SNAKE_CASE, e.g. "BRANCH_MANAGER".';
        },
      },
    });
  };
}
