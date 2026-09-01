import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { GenerateJobDocumentDto } from "../../jobs/dto/generate-job-document.dto";
import { SendPreAlertDto } from "../../jobs/dto/pre-alert.dto";

export { GenerateJobDocumentDto, SendPreAlertDto };

export class RecordNvoccMblReceivedDto {
  @ApiPropertyOptional({
    description: "MBL number; defaults to voyage MBL if omitted",
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mbl_number?: string;
}
