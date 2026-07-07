export declare class CreateHolidayDto {
    country_code: string;
    date: string;
    name: string;
    is_recurring?: boolean;
}
declare const UpdateHolidayDto_base: import("@nestjs/common").Type<Partial<CreateHolidayDto>>;
export declare class UpdateHolidayDto extends UpdateHolidayDto_base {
}
export {};
