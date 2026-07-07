import { AuthenticatedUser } from '../interfaces/request-with-user.interface';
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | keyof AuthenticatedUser | undefined)[]) => ParameterDecorator;
