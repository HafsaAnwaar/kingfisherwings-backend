"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsPermissionCode = IsPermissionCode;
const class_validator_1 = require("class-validator");
const permission_constants_1 = require("../constants/permission.constants");
function IsPermissionCode(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isPermissionCode',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    return (typeof value === 'string' &&
                        permission_constants_1.PERMISSION_CONSTANTS.CODE_REGEX.test(value));
                },
                defaultMessage() {
                    return 'Permission code must be in "module.action" format (lowercase, e.g. "users.create").';
                },
            },
        });
    };
}
//# sourceMappingURL=permission.validator.js.map