import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { IsStrictEmail } from '../../../common/validators/input-format.validators';

export class SuperAdminLoginDto {
  @ApiProperty()
  @IsStrictEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}
