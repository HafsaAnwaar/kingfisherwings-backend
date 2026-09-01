import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, ValidateNested } from "class-validator";
import { VendorDocumentType } from "@prisma/client";

export class VendorPermissionEntryDto {
  @ApiProperty({ enum: VendorDocumentType })
  @IsEnum(VendorDocumentType)
  document_type!: VendorDocumentType;

  @ApiProperty()
  @IsBoolean()
  can_view!: boolean;

  @ApiProperty()
  @IsBoolean()
  can_download!: boolean;
}

export class UpsertVendorPermissionsBodyDto {
  @ApiProperty({ type: [VendorPermissionEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorPermissionEntryDto)
  permissions!: VendorPermissionEntryDto[];
}
