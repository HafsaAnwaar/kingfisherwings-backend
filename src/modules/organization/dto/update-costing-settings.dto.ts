import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateCostingSettingsDto {
  @ApiProperty({
    description:
      "When true, costing attachment purpose=PAYMENT_PROOF auto-marks that sale/cost amount paid",
  })
  @IsBoolean()
  costing_payment_proof_auto_mark_paid!: boolean;
}
