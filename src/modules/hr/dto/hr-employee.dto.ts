import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  HrContractType,
  HrDependentRelation,
  HrDocumentType,
  HrEmployeeStatus,
  HrEmploymentType,
  HrGender,
  HrMaritalStatus,
  HrStaffGrade,
} from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
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

export class HrPaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  first_name!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  last_name!: string;

  @ApiProperty()
  @IsDateString()
  joining_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ enum: HrGender })
  @IsOptional()
  @IsEnum(HrGender)
  gender?: HrGender;

  @ApiPropertyOptional({ enum: HrMaritalStatus })
  @IsOptional()
  @IsEnum(HrMaritalStatus)
  marital_status?: HrMaritalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergency_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emergency_phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  exit_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  designation_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ enum: HrEmploymentType })
  @IsOptional()
  @IsEnum(HrEmploymentType)
  employment_type?: HrEmploymentType;

  @ApiPropertyOptional({ enum: HrEmployeeStatus })
  @IsOptional()
  @IsEnum(HrEmployeeStatus)
  status?: HrEmployeeStatus;

  @ApiPropertyOptional({ enum: HrStaffGrade })
  @IsOptional()
  @IsEnum(HrStaffGrade)
  staff_grade?: HrStaffGrade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reporting_manager_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_head_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  skip_level_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basic_salary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  housing_allowance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  transport_allowance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mobile_allowance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  overtime_rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  other_allowance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  social_security_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mol_employee_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bank_routing_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiPropertyOptional({ enum: HrContractType })
  @IsOptional()
  @IsEnum(HrContractType)
  contract_type?: HrContractType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  contract_start?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  contract_end?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  notice_period_days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  probation_end?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class EmployeeQueryDto extends HrPaginationQueryDto {
  @ApiPropertyOptional({ enum: HrEmployeeStatus })
  @IsOptional()
  @IsEnum(HrEmployeeStatus)
  status?: HrEmployeeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  search?: string;
}

export class LinkUserDto {
  @ApiProperty()
  @IsUUID()
  user_id!: string;
}

export class CreateDocumentDto {
  @ApiProperty({ enum: HrDocumentType })
  @IsEnum(HrDocumentType)
  document_type!: HrDocumentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  document_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issued_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  file_path?: string;
}

export class CreateDependentDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  full_name!: string;

  @ApiProperty({ enum: HrDependentRelation })
  @IsEnum(HrDependentRelation)
  relation!: HrDependentRelation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  passport_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  passport_expires_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visa_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  visa_expires_at?: string;
}

export class CreateSkillDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;
}

export class CreateQualificationDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year_awarded?: number;
}

export class CreateEmploymentHistoryDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  employer_name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  job_title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
