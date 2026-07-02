import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { PERMISSION_CONSTANTS } from '../constants/permission.constants';

/**
 * Validates that a string follows the `module.action` permission code
 * format (see Permission model: unique on [tenant_id, module, action]).
 * This is a format-only check; existence in the tenant's permission table
 * is verified by UsersService.validatePermission at write time.
 */
export function IsPermissionCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPermissionCode',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' &&
            PERMISSION_CONSTANTS.CODE_REGEX.test(value)
          );
        },
        defaultMessage(): string {
          return 'Permission code must be in "module.action" format (lowercase, e.g. "users.create").';
        },
      },
    });
  };
}
