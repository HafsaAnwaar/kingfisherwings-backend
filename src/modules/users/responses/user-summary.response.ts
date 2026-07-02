import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UserSummaryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() full_name!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiProperty({ enum: UserStatus }) status!: UserStatus;
  @ApiPropertyOptional() avatar_url?: string;
  @ApiPropertyOptional() branch_id?: string;
}
