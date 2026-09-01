import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class CreateJobNoteDto {
  @ApiProperty()
  @IsString()
  @Length(1, 5000)
  note!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_private?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_pinned?: boolean;
}

export class UpdateJobNoteDto extends PartialType(CreateJobNoteDto) {}
