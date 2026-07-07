import { ShipmentMode } from '@prisma/client';
export declare class CreatePortDto {
    un_locode: string;
    name: string;
    city?: string;
    country_code: string;
    mode?: ShipmentMode;
    latitude?: number;
    longitude?: number;
    is_active?: boolean;
}
declare const UpdatePortDto_base: import("@nestjs/common").Type<Partial<CreatePortDto>>;
export declare class UpdatePortDto extends UpdatePortDto_base {
}
export {};
