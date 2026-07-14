import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PartiesService } from './parties.service';

import { CreatePartyDto, UpdatePartyDto } from './dto/party.dto';
import { PartyQueryDto } from './dto/party-query.dto';
import { UpdateCreditStatusDto } from './dto/update-credit-status.dto';
import { CreatePartyContactDto, UpdatePartyContactDto } from './dto/party-contact.dto';
import { CreatePartyAddressDto, UpdatePartyAddressDto } from './dto/party-address.dto';
import { PartyImportResultDto } from './dto/party-import-result.dto';

import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { PARTIES_PERMISSIONS } from './constants/parties-permission.constants';

@ApiTags('Parties')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('parties')
export class PartiesController {
  constructor(private readonly service: PartiesService) {}

  // ============================================================
  // PARTY CRUD
  // ============================================================

  @Get()
  @RequirePermissions(PARTIES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List parties (customers, agents, suppliers, carriers, etc.)' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: PartyQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('export')
  @RequirePermissions(PARTIES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Export parties as CSV' })
  exportCsv(@CurrentUser('tenantId') tenantId: string, @Query() query: PartyQueryDto) {
    return this.service.exportCsv(tenantId, query);
  }

  @Get(':id/history')
  @RequirePermissions(PARTIES_PERMISSIONS.VIEW)
  @ApiOperation({
    summary: 'Party transaction history — jobs, quotations, invoices, payment requests, audit trail',
  })
  history(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getHistory(tenantId, id);
  }

  @Get(':id')
  @RequirePermissions(PARTIES_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a party with its contacts and addresses' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(PARTIES_PERMISSIONS.CREATE)
  @ApiOperation({ summary: 'Create a party' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreatePartyDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Post('import')
  @RequirePermissions(PARTIES_PERMISSIONS.CREATE)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); ' +
      'use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!file.originalname.toLowerCase().endsWith('.csv') && file.mimetype !== 'text/csv') {
          return callback(new BadRequestException('Only .csv files are accepted.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async bulkImport(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<PartyImportResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded — attach it under the "file" field.');
    }

    return this.service.bulkImport(tenantId, file.buffer, actorId);
  }

  @Patch(':id')
  @RequirePermissions(PARTIES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a party' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartyDto,
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PARTIES_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a party' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  // ============================================================
  // CREDIT STATUS
  // ============================================================

  @Patch(':id/credit-status')
  @RequirePermissions(PARTIES_PERMISSIONS.MANAGE_CREDIT)
  @ApiOperation({ summary: 'Change credit status (Active / On Hold / Blacklisted)' })
  updateCreditStatus(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCreditStatusDto,
  ) {
    return this.service.updateCreditStatus(tenantId, id, dto, actorId);
  }

  // ============================================================
  // CONTACTS
  // ============================================================

  @Post(':id/contacts')
  @RequirePermissions(PARTIES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add a contact to a party' })
  addContact(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePartyContactDto,
  ) {
    return this.service.addContact(tenantId, id, { ...dto }, actorId);
  }

  @Patch(':id/contacts/:contactId')
  @RequirePermissions(PARTIES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a party's contact" })
  updateContact(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body() dto: UpdatePartyContactDto,
  ) {
    return this.service.updateContact(tenantId, id, contactId, { ...dto }, actorId);
  }

  @Delete(':id/contacts/:contactId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PARTIES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a party's contact" })
  async removeContact(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    await this.service.removeContact(tenantId, id, contactId, actorId);
  }

  // ============================================================
  // ADDRESSES
  // ============================================================

  @Post(':id/addresses')
  @RequirePermissions(PARTIES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add an address to a party' })
  addAddress(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePartyAddressDto,
  ) {
    return this.service.addAddress(tenantId, id, { ...dto }, actorId);
  }

  @Patch(':id/addresses/:addressId')
  @RequirePermissions(PARTIES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Update a party's address" })
  updateAddress(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @Body() dto: UpdatePartyAddressDto,
  ) {
    return this.service.updateAddress(tenantId, id, addressId, { ...dto }, actorId);
  }

  @Delete(':id/addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PARTIES_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Remove a party's address" })
  async removeAddress(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
  ) {
    await this.service.removeAddress(tenantId, id, addressId, actorId);
  }
}
