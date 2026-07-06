import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class TenantLoginDto {
  @ApiProperty({ description: 'The tenant slug (same identifier used in POST /tenants).' })
  @IsString()
  tenant_slug!: string;

  @ApiProperty({ description: "The tenant's own password, set at creation." })
  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsBoolean()
  remember_me?: boolean;

  @IsOptional()
  @IsString()
  device_name?: string;
}
