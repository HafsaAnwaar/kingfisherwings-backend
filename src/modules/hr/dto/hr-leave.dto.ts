import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  HrLeaveRequestStatus,
  HrLeaveType,
  HrStaffGrade,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class LeavePolicyDto {
  @ApiProperty({ enum: HrLeaveType })
  @IsEnum(HrLeaveType)
  leave_type!: HrLeaveType;

  @ApiProperty({ enum: HrStaffGrade })
  @IsEnum(HrStaffGrade)
  staff_grade!: HrStaffGrade;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  entitlement_days!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carry_forward_max?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  encashment_allowed?: boolean;
}

export class UpdateLeavePolicyDto extends PartialType(LeavePolicyDto) {}

export class LeaveRequestDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiProperty({ enum: HrLeaveType })
  @IsEnum(HrLeaveType)
  leave_type!: HrLeaveType;

  @ApiProperty()
  @IsDateString()
  start_date!: string;

  @ApiProperty()
  @IsDateString()
  end_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  attachment_path?: string;
}

export class LeaveReviewDto {
  @ApiProperty({ enum: HrLeaveRequestStatus })
  @IsEnum(HrLeaveRequestStatus)
  status!: HrLeaveRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  review_notes?: string;
}

export class LeaveCalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  from!: string;

  @ApiProperty()
  @IsDateString()
  to!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_id?: string;
}

export class DocumentExpiryQueryDto {
  @ApiPropertyOptional({ default: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  within_days?: number = 90;
}

export class LeaveEncashmentDto {
  @ApiProperty()
  @IsUUID()
  employee_id!: string;

  @ApiProperty({ enum: HrLeaveType, default: "ANNUAL" })
  @IsEnum(HrLeaveType)
  leave_type!: HrLeaveType;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  days!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}

export class AbsentReportQueryDto {
  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  department_id?: string;
}
