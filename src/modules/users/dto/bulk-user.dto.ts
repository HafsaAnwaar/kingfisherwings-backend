import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsUUID } from 'class-validator';

export enum BulkUserAction {
  ACTIVATE = 'ACTIVATE',
  DEACTIVATE = 'DEACTIVATE',
  SUSPEND = 'SUSPEND',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
}

export class BulkUserDto {
  @ApiProperty({ type: [String], format: 'uuid', minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  ids!: string[];

  @ApiProperty({ enum: BulkUserAction })
  @IsEnum(BulkUserAction)
  action!: BulkUserAction;
}
