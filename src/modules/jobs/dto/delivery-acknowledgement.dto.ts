import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class SubmitDeliveryAcknowledgementDto {
  @ApiProperty({ example: "Ahmed Al-Mansoori" })
  @IsString()
  @MaxLength(200)
  receiver_name!: string;

  @ApiPropertyOptional({ example: "Warehouse Supervisor" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  receiver_title?: string;

  @ApiPropertyOptional({
    example: "Good condition",
    description: "Condition of goods on receipt",
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  goods_condition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  remarks?: string;
}

export class ReceiveDeliveryAcknowledgementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
