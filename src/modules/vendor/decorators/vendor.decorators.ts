import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CurrentVendorUser } from "../interfaces/vendor-auth.interfaces";

export const CurrentVendor = createParamDecorator(
  (field: keyof CurrentVendorUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ vendorUser?: CurrentVendorUser }>();
    const user = request.vendorUser;
    return field ? user?.[field] : user;
  },
);
