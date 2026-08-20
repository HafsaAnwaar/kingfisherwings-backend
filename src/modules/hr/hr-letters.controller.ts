import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { CurrentUser as CurrentUserType } from '../users/interfaces/current-user.interface';
import { HR_PERMISSIONS } from './constants/hr-permission.constants';
import { GenerateLetterDto } from './dto/hr-letter.dto';
import { HrLettersService } from './hr-letters.service';

@ApiTags('HR Letters')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('hr/letters')
export class HrLettersController {
  constructor(private readonly letters: HrLettersService) {}

  @Get()
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List generated HR letters' })
  list(@CurrentUser() user: CurrentUserType, @Query('employee_id') employeeId?: string) {
    return this.letters.list(user, employeeId);
  }

  @Post('generate')
  @RequirePermissions(HR_PERMISSIONS.GENERATE_LETTERS)
  @ApiOperation({ summary: 'Generate HR letter PDF' })
  generate(@CurrentUser() user: CurrentUserType, @Body() dto: GenerateLetterDto) {
    return this.letters.generate(user, dto);
  }

  @Get(':id')
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  findOne(@CurrentUser() user: CurrentUserType, @Param('id', ParseUUIDPipe) id: string) {
    return this.letters.findOne(user, id);
  }
}
