import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationType } from "@prisma/client";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from "class-validator";

/** FE create targeting audiences (resolved to staff users at write time). */
export enum NotificationTargetAudience {
  tenant_manager = "tenant_manager",
  staff = "staff",
  user = "user",
  all = "all",
}

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ example: "Quote approved" })
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 4000)
  message!: string;

  @ApiPropertyOptional({
    example: "quotation",
    description: "Stable entity type for FE deep-link inference",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entity_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiPropertyOptional({
    description: "Optional app-relative path; filled from entity when omitted",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  link_path?: string;

  @ApiPropertyOptional({ enum: NotificationTargetAudience })
  @IsOptional()
  @IsEnum(NotificationTargetAudience)
  audience?: NotificationTargetAudience;

  @ApiPropertyOptional({
    type: [String],
    description: "Explicit staff user ids (required when audience=user)",
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(200)
  @IsUUID("4", { each: true })
  recipient_user_ids?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ["OPERATIONS_MANAGER", "TENANT_ADMIN"],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ["jobs.view", "quotations.create"],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({
    type: [String],
    description:
      "Product/module keys; matches permission codes starting with `${module}.` or `operations_`",
    example: ["operations", "sales"],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  modules?: string[];
}
