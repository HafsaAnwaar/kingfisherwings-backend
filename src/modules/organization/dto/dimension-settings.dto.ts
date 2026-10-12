import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class UpdateDimensionSettingsDto {
  @ApiProperty({
    example: 6000,
    description:
      "Volumetric weight divisor for cm³ → kg (common: 6000 air, 5000/366 sea variants)",
  })
  @IsInt()
  @Min(1)
  @Max(100_000)
  volumetric_divisor_cm!: number;
}
