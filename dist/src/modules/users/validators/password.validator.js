"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsStrongPassword = IsStrongPassword;
exports.Match = Match;
const class_validator_1 = require("class-validator");
const password_constants_1 = require("../constants/password.constants");
function IsStrongPassword(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    if (typeof value !== 'string') {
                        return false;
                    }
                    if (value.length < password_constants_1.PASSWORD_CONSTANTS.MIN_LENGTH ||
                        value.length > password_constants_1.PASSWORD_CONSTANTS.MAX_LENGTH) {
                        return false;
                    }
                    return password_constants_1.PASSWORD_CONSTANTS.STRENGTH_REGEX.test(value);
                },
                defaultMessage() {
                    return `Password must be ${password_constants_1.PASSWORD_CONSTANTS.MIN_LENGTH}-${password_constants_1.PASSWORD_CONSTANTS.MAX_LENGTH} characters and include uppercase, lowercase, a number, and a special character.`;
                },
            },
        });
    };
}
function Match(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'match',
            target: object.constructor,
            propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = args.object[relatedPropertyName];
                    return value === relatedValue;
                },
                defaultMessage(args) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must match ${relatedPropertyName}.`;
                },
            },
        });
    };
}
//# sourceMappingURL=password.validator.js.map