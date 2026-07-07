export declare class CreateAirlineDto {
    iata_code: string;
    icao_code?: string;
    prefix_code?: string;
    name: string;
    country_code?: string;
    is_active?: boolean;
}
declare const UpdateAirlineDto_base: import("@nestjs/common").Type<Partial<CreateAirlineDto>>;
export declare class UpdateAirlineDto extends UpdateAirlineDto_base {
}
export {};
