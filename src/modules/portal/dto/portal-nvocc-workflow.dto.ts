import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class PortalConfirmPortTokenDto {
  @ApiProperty({ example: "MBL123456" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  bl_number!: string;

  @ApiProperty({ example: "MSCU1234567" })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  container_number!: string;

  @ApiProperty({ format: "date", example: "2026-10-31" })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: "Jebel Ali Gate 3" })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  delivery_location!: string;

  @ApiProperty({ example: "Ahmed Khan" })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  receiver_name!: string;

  @ApiProperty({ example: "+971501234567" })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  receiver_contact!: string;

  @ApiPropertyOptional({
    description: "Optional customer-entered gate token; otherwise server issues one",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  port_gate_token?: string;
}

export class PortalRequestDraftBlDto {
  @ApiProperty({
    description: "Customer comment for Docs / ops (visible to admin)",
    example: "Please issue draft HBL for customs filing",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  comment!: string;
}
