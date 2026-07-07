import { ContainerSize } from '@prisma/client';
export declare class CreateContainerTypeDto {
    code: string;
    name: string;
    size: ContainerSize;
    teu?: number;
    max_payload?: number;
    volume_cbm?: number;
    is_active?: boolean;
}
declare const UpdateContainerTypeDto_base: import("@nestjs/common").Type<Partial<CreateContainerTypeDto>>;
export declare class UpdateContainerTypeDto extends UpdateContainerTypeDto_base {
}
export {};
