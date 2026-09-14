import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OutboundMessageChannel } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateOutboundMessageLogDto {
  @ApiProperty({ enum: ["WHATSAPP", "SMS"] })
  @IsEnum(OutboundMessageChannel)
  channel!: OutboundMessageChannel;

  @ApiProperty({ example: "+971501234567" })
  @IsString()
  @Length(3, 100)
  to_address!: string;

  @ApiProperty({ example: "Shipment AE123 departed" })
  @IsString()
  @Length(1, 500)
  body_snippet!: string;

  @ApiPropertyOptional({ example: "SENT", default: "SENT" })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  status?: string;
}
