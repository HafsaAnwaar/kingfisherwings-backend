"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentSuperAdminUser = void 0;
const common_1 = require("@nestjs/common");
const request_with_user_interface_1 = require("../interfaces/request-with-user.interface");
exports.CurrentSuperAdminUser = (0, common_1.createParamDecorator)((field, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const principal = request.user;
    if (!principal || !(0, request_with_user_interface_1.isSuperAdmin)(principal)) {
        throw new common_1.ForbiddenException('Super admin authentication required.');
    }
    return field ? principal[field] : principal;
});
//# sourceMappingURL=current-super-admin.decorator.js.map