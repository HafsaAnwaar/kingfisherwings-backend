import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class JobGpumLineDto {
  @ApiProperty({
    example: "Ayesha Khan",
    description:
      "Employee full name or email from GET /jobs/lookups/dropdowns (employees). Preferred over user_id.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  employee_name?: string;

  @ApiPropertyOptional({
    format: "uuid",
    deprecated: true,
    description: "Optional. Prefer employee_name.",
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  @Max(100)
  gp_percent!: number;
}

export class PutJobGpumDto {
  @ApiProperty({ type: [JobGpumLineDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => JobGpumLineDto)
  allocations!: JobGpumLineDto[];
}
