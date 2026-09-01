import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { HrSalaryComponentCode } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreatePayrollRunDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  payroll_year!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  payroll_month!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional({ default: "AED" })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency_code?: string;
}

export class SalaryComponentDto {
  @ApiProperty({ enum: HrSalaryComponentCode })
  @IsEnum(HrSalaryComponentCode)
  code!: HrSalaryComponentCode;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_earning?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort_order?: number;
}

export class PayslipEmailDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;
}

export class GratuityQueryDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  as_of?: string;
}

export class PayrollGlSettingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  salary_expense_account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  payroll_payable_account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  deduction_account_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bonus_percent_per_score_point?: number;
}
