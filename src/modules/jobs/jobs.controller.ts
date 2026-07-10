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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JobsService } from './jobs.service';

import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { UpdateAirJobDetailDto } from './dto/air-job-detail.dto';
import { UpdateSeaFclJobDetailDto } from './dto/sea-fcl-job-detail.dto';
import { CreateJobChargeDto, UpdateJobChargeDto } from './dto/job-charge.dto';
import { UpdateJobMilestoneDto, CreateCustomMilestoneDto } from './dto/job-milestone.dto';
import { CreateJobNoteDto, UpdateJobNoteDto } from './dto/job-note.dto';
import { CreateJobDocumentDto, UpdateJobDocumentDto, FinalizeJobDocumentDto } from './dto/job-document.dto';
import { CreateJobContainerDto, UpdateJobContainerDto } from './dto/job-container.dto';
import { SendPreAlertDto } from './dto/pre-alert.dto';
import { GenerateJobDocumentDto } from './dto/generate-job-document.dto';
import { JobQueryDto } from './dto/job-query.dto';

import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { JOBS_PERMISSIONS } from './constants/jobs-permission.constants';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List jobs' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: JobQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get(':id')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get a job with air details, charges, milestones, and its house jobs (if a master)' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get(':id/house-jobs')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List the house jobs consolidated under this master job' })
  getHouseJobs(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getHouseJobs(tenantId, id);
  }

  @Get(':id/milestones')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List all milestones for a job' })
  getMilestones(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getMilestones(tenantId, id);
  }

  @Get(':id/pnl')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW_GP)
  @ApiOperation({ summary: 'Job P&L breakdown — revenue lines, cost lines, GP summary (Ch.8.2)' })
  getPnl(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getPnl(tenantId, id);
  }

  @Get(':id/notes')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List notes on a job' })
  listNotes(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.listNotes(tenantId, id);
  }

  @Get(':id/documents')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List documents attached to a job' })
  listDocuments(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.listDocuments(tenantId, id);
  }

  @Get(':id/containers')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List containers on a Sea FCL job' })
  listContainers(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.listContainers(tenantId, id);
  }

  @Post()
  @RequirePermissions(JOBS_PERMISSIONS.CREATE)
  @ApiOperation({
    summary:
      'Create a job (booking). AIR_EXPORT jobs auto-get their detail row + the full 15-milestone taxonomy. Set parent_job_id to create a HOUSE job under an existing master.',
  })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a job (not allowed once COMPLETED or CANCELLED)' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Post(':id/close')
  @RequirePermissions(JOBS_PERMISSIONS.CLOSE)
  @ApiOperation({ summary: 'Close a job (status -> COMPLETED)' })
  closeJob(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.closeJob(tenantId, id, actorId);
  }

  @Post(':id/cancel')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Cancel a job (status -> CANCELLED)' })
  cancelJob(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.cancelJob(tenantId, id, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.DELETE)
  @ApiOperation({ summary: 'Soft-delete a completed or cancelled job' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }

  @Patch(':id/air-details')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update Air Export-specific booking fields (airline, HAWB/MAWB, flight, AWB type, freight type)' })
  updateAirDetails(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAirJobDetailDto,
  ) {
    return this.service.updateAirDetails(tenantId, id, dto, actorId);
  }

  @Patch(':id/sea-fcl-details')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update Sea FCL-specific booking fields (shipping line, BL numbers, cutoffs)' })
  updateSeaFclDetails(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeaFclJobDetailDto,
  ) {
    return this.service.updateSeaFclDetails(tenantId, id, dto, actorId);
  }

  @Patch(':id/milestones/:milestoneId')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a milestone — set actual_date to mark it complete' })
  completeMilestone(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
    @Body() dto: UpdateJobMilestoneDto,
  ) {
    return this.service.completeMilestone(tenantId, id, milestoneId, dto, actorId);
  }

  @Post(':id/milestones')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add a custom milestone outside the standard taxonomy' })
  addCustomMilestone(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCustomMilestoneDto,
  ) {
    return this.service.addCustomMilestone(tenantId, id, dto, actorId);
  }

  @Post(':id/charges')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add a charge line — Job P&L recalculates automatically' })
  addCharge(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateJobChargeDto,
  ) {
    return this.service.addCharge(tenantId, id, dto, actorId);
  }

  @Patch(':id/charges/:chargeId')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a charge line' })
  updateCharge(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('chargeId', ParseUUIDPipe) chargeId: string,
    @Body() dto: UpdateJobChargeDto,
  ) {
    return this.service.updateCharge(tenantId, id, chargeId, dto, actorId);
  }

  @Delete(':id/charges/:chargeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Remove a charge line' })
  async removeCharge(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('chargeId', ParseUUIDPipe) chargeId: string,
  ) {
    await this.service.removeCharge(tenantId, id, chargeId);
  }

  @Post(':id/prorate-cost/:chargeCodeId')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Distribute a master job's cost line to its house jobs, proportionally by chargeable weight" })
  prorateMasterCost(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('chargeCodeId', ParseUUIDPipe) chargeCodeId: string,
  ) {
    return this.service.prorateMasterCost(tenantId, id, chargeCodeId, actorId);
  }

  @Post(':id/notes')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add a note to a job' })
  addNote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateJobNoteDto,
  ) {
    return this.service.addNote(tenantId, id, dto, actorId);
  }

  @Patch(':id/notes/:noteId')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a job note' })
  updateNote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body() dto: UpdateJobNoteDto,
  ) {
    return this.service.updateNote(tenantId, id, noteId, dto, actorId);
  }

  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Remove a job note' })
  async removeNote(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
  ) {
    await this.service.removeNote(tenantId, id, noteId, actorId);
  }

  @Post(':id/documents')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Register a document on a job (metadata + file URL)' })
  addDocument(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateJobDocumentDto,
  ) {
    return this.service.addDocument(tenantId, id, dto, actorId);
  }

  @Patch(':id/documents/:documentId')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a draft document metadata' })
  updateDocument(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: UpdateJobDocumentDto,
  ) {
    return this.service.updateDocument(tenantId, id, documentId, dto, actorId);
  }

  @Post(':id/documents/:documentId/finalize')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Finalize a document (DRAFT -> ORIGINAL, locked)' })
  finalizeDocument(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: FinalizeJobDocumentDto,
  ) {
    return this.service.finalizeDocument(tenantId, id, documentId, dto, actorId);
  }

  @Delete(':id/documents/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Remove a draft document' })
  async removeDocument(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    await this.service.removeDocument(tenantId, id, documentId, actorId);
  }

  @Get(':id/documents/generation-status')
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List async document generation tasks for a job' })
  getDocumentGenerationStatus(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getDocumentGenerationStatus(tenantId, id);
  }

  @Post(':id/documents/hawb')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Queue HAWB PDF generation (Puppeteer + BullMQ)' })
  generateHawb(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, 'HAWB', dto, actorId);
  }

  @Post(':id/documents/mawb')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Queue MAWB PDF generation (Puppeteer + BullMQ)' })
  generateMawb(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, 'MAWB', dto, actorId);
  }

  @Post(':id/documents/pre-alert')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Queue pre-alert document PDF generation' })
  generatePreAlertDoc(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, 'PRE_ALERT', dto, actorId);
  }

  @Post(':id/documents/cargo-manifest')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Queue cargo manifest PDF generation' })
  generateCargoManifest(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.service.generateDocument(tenantId, id, 'CARGO_MANIFEST', dto, actorId);
  }

  @Post(':id/pre-alert/send')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Send pre-alert and mark PRE_ALERT_SENT milestone complete' })
  sendPreAlert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendPreAlertDto,
  ) {
    return this.service.sendPreAlert(tenantId, id, dto, actorId);
  }

  @Post(':id/containers')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Add a container to a Sea FCL job' })
  addContainer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateJobContainerDto,
  ) {
    return this.service.addContainer(tenantId, id, dto, actorId);
  }

  @Patch(':id/containers/:containerId')
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Update a container on a Sea FCL job' })
  updateContainer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('containerId', ParseUUIDPipe) containerId: string,
    @Body() dto: UpdateJobContainerDto,
  ) {
    return this.service.updateContainer(tenantId, id, containerId, dto, actorId);
  }

  @Delete(':id/containers/:containerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Remove a container from a Sea FCL job' })
  async removeContainer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('containerId', ParseUUIDPipe) containerId: string,
  ) {
    await this.service.removeContainer(tenantId, id, containerId, actorId);
  }
}
