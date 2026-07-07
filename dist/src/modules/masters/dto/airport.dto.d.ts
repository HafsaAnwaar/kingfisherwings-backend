export declare class CreateAirportDto {
    iata_code: string;
    icao_code?: string;
    name: string;
    city?: string;
    country_code: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    is_active?: boolean;
}
declare const UpdateAirportDto_base: import("@nestjs/common").Type<Partial<CreateAirportDto>>;
export declare class UpdateAirportDto extends UpdateAirportDto_base {
}
export {};
