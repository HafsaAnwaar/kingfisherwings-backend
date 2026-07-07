import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextStorage } from '../context/tenant-context.storage';
export declare class TenantContextInterceptor implements NestInterceptor {
    private readonly tenantContext;
    constructor(tenantContext: TenantContextStorage);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
