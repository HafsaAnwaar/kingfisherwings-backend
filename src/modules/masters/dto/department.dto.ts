import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateDepartmentDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({ example: 'Operations' })
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiProperty({ example: 'OPS' })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Parent department, for hierarchy.' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
