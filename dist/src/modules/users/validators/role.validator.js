"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsRoleCode = IsRoleCode;
const class_validator_1 = require("class-validator");
const ROLE_CODE_REGEX = /^[A-Z][A-Z0-9_]{1,49}$/;
function IsRoleCode(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isRoleCode',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    return typeof value === 'string' && ROLE_CODE_REGEX.test(value);
                },
                defaultMessage() {
                    return 'Role code must be UPPER_SNAKE_CASE, e.g. "BRANCH_MANAGER".';
                },
            },
        });
    };
}
//# sourceMappingURL=role.validator.js.map