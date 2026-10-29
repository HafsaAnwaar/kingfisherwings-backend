import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export enum WhatsAppRecipientType {
  USER = "USER",
  PARTY = "PARTY",
  RAW = "RAW",
}

export class SendWhatsAppDto {
  @ApiProperty({
    enum: WhatsAppRecipientType,
    description:
      "USER = staff user; PARTY = customer/vendor party; RAW = explicit E.164 phone",
  })
  @IsEnum(WhatsAppRecipientType)
  recipient_type!: WhatsAppRecipientType;

  @ApiPropertyOptional({
    format: "uuid",
    description: "Required for USER / PARTY",
  })
  @ValidateIf(
    (o: SendWhatsAppDto) =>
      o.recipient_type === WhatsAppRecipientType.USER ||
      o.recipient_type === WhatsAppRecipientType.PARTY,
  )
  @IsUUID()
  recipient_id?: string;

  @ApiPropertyOptional({
    example: "+971501234567",
    description:
      "Required for RAW; optional override for USER/PARTY when set",
  })
  @ValidateIf(
    (o: SendWhatsAppDto) =>
      o.recipient_type === WhatsAppRecipientType.RAW || !!o.to_phone,
  )
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  to_phone?: string;

  @ApiProperty({ example: "Your shipment KFWD-AE-10-26-00001 has sailed." })
  @IsString()
  @MinLength(1)
  @MaxLength(1600)
  message!: string;
}
