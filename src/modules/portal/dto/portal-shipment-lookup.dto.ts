import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class PortalShipmentLookupDto {
  @ApiPropertyOptional({
    description: 'Job number, HAWB, MAWB, HBL, MBL, or booking reference.',
    example: 'KFW-J-00042',
  })
  @IsString()
  @Length(2, 100)
  ref!: string;
}
