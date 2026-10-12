import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

export class JobGpumLineDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  user_id!: string;

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
