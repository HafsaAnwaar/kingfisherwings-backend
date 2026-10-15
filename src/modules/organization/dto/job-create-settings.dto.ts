import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateJobCreateSettingsDto {
  @ApiProperty({
    description:
      "When false, inline create_party on job organizations requires parties.create",
  })
  @IsBoolean()
  allow_create_party_from_job!: boolean;
}
