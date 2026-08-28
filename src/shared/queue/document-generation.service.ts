import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DocumentEntityType, DocumentGenerationStatus, DocumentType, Prisma, QuotationPdfMode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEmitterService } from '../../modules/notifications/notification-emitter.service';
import { PdfService, SeaFclDocumentPdfData } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';
import { DOCUMENT_GENERATION_QUEUE, DocumentGenerationJobPayload } from './queue.constants';
import { isSeaFclDocumentType } from '../../modules/jobs/constants/sea-fcl-document-types';
import { SeaFclDocumentOptions } from '../../modules/jobs/dto/generate-job-document.dto';

type SeaFclJobDocContext = {
  job_number: string;
  shipper_id: string | null;
  consignee_id: string | null;
  origin_port_id: string | null;
  dest_port_id: string | null;
  commodity: string | null;
  pieces: number | null;
  gross_weight: { toString(): string } | null;
  volume_cbm: { toString(): string } | null;
  etd: Date | null;
  eta: Date | null;
  revenue_total: { toString(): string };
  cost_total: { toString(): string };
  gp_amount: { toString(): string };
  gp_percent: { toString(): string };
  sea_fcl_details: {
    shipping_line_id: string | null;
    vessel_id: string | null;
    voyage_number: string | null;
    hbl_number: string | null;
    mbl_number: string | null;
    booking_number: string | null;
    carrier_booking_ref: string | null;
    place_of_receipt: string | null;
    place_of_delivery: string | null;
    etd: Date | null;
    eta: Date | null;
    freight_terms: string | null;
    port_of_loading_id: string | null;
    port_of_discharge_id: string | null;
    transhipment_port: string | null;
    sailed_at: Date | null;
    containers: Array<{
      id: string;
      container_type_id: string;
      container_number: string | null;
      seal_number: string | null;
      status: string;
      gross_weight: { toString(): string } | null;
      vgm_weight: { toString(): string } | null;
      cbm: { toString(): string } | null;
    }>;
  } | null;
  charges: Array<{
    description: string;
    quantity: { toString(): string };
    unit_price: { toString(): string };
    amount: { toString(): string };
    is_cost: boolean;
  }>;
  cargo_lines: Array<{
    container_id: string | null;
    commodity: string | null;
    marks_numbers: string | null;
    packages: number | null;
    gross_weight: { toString(): string } | null;
    measurement: { toString(): string } | null;
  }>;
  stuffing_records: Array<{
    container_id: string | null;
    supervisor_name: string;
    stuffing_date: Date;
    location: string | null;
    goods_condition: string | null;
  }>;
  bills_of_lading: Array<{
    id: string;
    bl_type: string;
    bl_number: string | null;
    shipper_id: string | null;
    consignee_id: string | null;
    notify_id: string | null;
    pol: string | null;
    pod: string | null;
    place_of_receipt: string | null;
    place_of_delivery: string | null;
    vessel_name: string | null;
    voyage_number: string | null;
    etd: Date | null;
    eta: Date | null;
    description_of_goods: string | null;
    marks_numbers: string | null;
    packages: number | null;
    gross_weight: { toString(): string } | null;
    measurement: { toString(): string } | null;
    freight_payable_at: string | null;
    freight_terms: string | null;
    number_of_originals: number | null;
    bl_conditions: string | null;
    rider_terms: string | null;
    switched_from_bl_number: string | null;
    switch_consignee_id: string | null;
    switch_notify_id: string | null;
    proxy_forwarder_name: string | null;
    proxy_forwarder_address: string | null;
    is_original: boolean;
    is_express_release: boolean;
  }>;
  house_jobs: Array<{
    sea_fcl_details: { hbl_number: string | null } | null;
  }>;
};

@Injectable()
export class DocumentGenerationService {
  private readonly logger = new Logger(DocumentGenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationEmitterService,
    @InjectQueue(DOCUMENT_GENERATION_QUEUE) private readonly queue: Queue<DocumentGenerationJobPayload>,
  ) {}

  async enqueueQuotationPdf(
    tenantId: string,
    quotationId: string,
    mode: QuotationPdfMode,
    requestedBy?: string,
    layoutVariant?: string,
  ) {
    const task = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentGenerationTask.create({
        data: {
          tenant_id: tenantId,
          entity_type: 'QUOTATION',
          quotation_id: quotationId,
          pdf_mode: mode,
          layout_variant: layoutVariant,
          status: 'PENDING',
          requested_by: requestedBy,
        },
      }),
    );

    const bullJob = await this.queue.add({ taskId: task.id, tenantId });
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentGenerationTask.update({
        where: { id: task.id },
        data: { bull_job_id: String(bullJob.id) },
      }),
    );

    return task;
  }

  async enqueueJobDocument(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    requestedBy?: string,
    layoutVariant?: string,
    isOriginal = false,
    options?: SeaFclDocumentOptions,
  ) {
    const task = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentGenerationTask.create({
        data: {
          tenant_id: tenantId,
          entity_type: 'JOB',
          job_id: jobId,
          document_type: documentType,
          layout_variant: layoutVariant,
          options: options ? (options as Prisma.InputJsonValue) : undefined,
          status: 'PENDING',
          requested_by: requestedBy,
        },
      }),
    );

    const bullJob = await this.queue.add({
      taskId: task.id,
      tenantId,
      isOriginal,
    });

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentGenerationTask.update({
        where: { id: task.id },
        data: { bull_job_id: String(bullJob.id) },
      }),
    );

    return task;
  }

  async getTask(tenantId: string, taskId: string) {
    const task = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentGenerationTask.findFirst({
        where: { id: taskId, tenant_id: tenantId },
      }),
    );

    if (!task) {
      throw new NotFoundException('Document generation task not found.');
    }

    return task;
  }

  async listTasks(tenantId: string, filters: { quotationId?: string; jobId?: string; status?: DocumentGenerationStatus }) {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentGenerationTask.findMany({
        where: {
          tenant_id: tenantId,
          ...(filters.quotationId ? { quotation_id: filters.quotationId } : {}),
          ...(filters.jobId ? { job_id: filters.jobId } : {}),
          ...(filters.status ? { status: filters.status } : {}),
        },
        orderBy: { created_at: 'desc' },
        take: 20,
      }),
    );
  }

  async processTask(taskId: string, tenantId: string, isOriginal = false) {
    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentGenerationTask.update({
        where: { id: taskId },
        data: { status: 'PROCESSING', started_at: new Date() },
      }),
    );

    try {
      const task = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.documentGenerationTask.findFirstOrThrow({
          where: { id: taskId, tenant_id: tenantId },
        }),
      );

      let buffer: Buffer;
      let filename: string;

      if (task.entity_type === 'QUOTATION' && task.quotation_id && task.pdf_mode) {
        const result = await this.buildQuotationPdf(tenantId, task.quotation_id, task.pdf_mode);
        buffer = result.buffer;
        filename = result.filename;
      } else if (task.entity_type === 'JOB' && task.job_id && task.document_type) {
        const options = (task.options as SeaFclDocumentOptions | null) ?? undefined;
        const result = await this.buildJobDocumentPdf(
          tenantId,
          task.job_id,
          task.document_type,
          isOriginal,
          task.layout_variant ?? undefined,
          options,
        );
        buffer = result.buffer;
        filename = result.filename;
      } else {
        throw new Error('Invalid document generation task configuration.');
      }

      const stored = await this.storage.saveBuffer(tenantId, buffer, filename);

      const completed = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.documentGenerationTask.update({
          where: { id: taskId },
          data: {
            status: 'COMPLETED',
            file_url: stored.fileUrl,
            s3_key: stored.s3Key,
            file_name: filename,
            file_size: stored.fileSize,
            completed_at: new Date(),
          },
        }),
      );

      if (task.entity_type === 'QUOTATION' && task.quotation_id && task.pdf_mode) {
        const pdfData =
          task.pdf_mode === 'CUSTOMER'
            ? {
                customer_pdf_url: stored.fileUrl,
                customer_pdf_s3_key: stored.s3Key,
                customer_pdf_generated_at: new Date(),
              }
            : {
                internal_pdf_url: stored.fileUrl,
                internal_pdf_s3_key: stored.s3Key,
                internal_pdf_generated_at: new Date(),
              };

        await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.quotation.update({ where: { id: task.quotation_id! }, data: pdfData }),
        );
      }

      if (task.entity_type === 'JOB' && task.job_id && task.document_type && task.requested_by) {
        const jobDocument = await this.prisma.runWithTenant(tenantId, (tx) =>
          tx.jobDocument.create({
            data: {
              tenant_id: tenantId,
              job_id: task.job_id!,
              document_type: task.document_type!,
              file_name: filename,
              file_url: stored.fileUrl,
              s3_key: stored.s3Key,
              file_size: stored.fileSize,
              mime_type: 'application/pdf',
              version: 1,
              is_original: isOriginal,
              layout_variant: task.layout_variant,
              generation_status: 'COMPLETED',
              generated_at: new Date(),
              generation_task_id: taskId,
              uploaded_by: task.requested_by!,
              created_by: task.requested_by!,
              updated_by: task.requested_by!,
            },
          }),
        );

        await this.notifications.notifyPortalDocumentReadyForJob(tenantId, task.job_id, jobDocument);
      }

      return completed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Document generation failed';
      this.logger.error(`Task ${taskId} failed: ${message}`);

      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.documentGenerationTask.update({
          where: { id: taskId },
          data: { status: 'FAILED', error_message: message, completed_at: new Date() },
        }),
      );

      throw error;
    }
  }

  private async buildQuotationPdf(tenantId: string, quotationId: string, mode: QuotationPdfMode) {
    const quotation = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findFirst({
        where: { id: quotationId, tenant_id: tenantId, deleted_at: null },
        include: { lines: { orderBy: { sort_order: 'asc' } } },
      }),
    );

    if (!quotation) {
      throw new NotFoundException('Quotation not found.');
    }

    const customer = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findFirst({ where: { id: quotation.customer_id, tenant_id: tenantId } }),
    );

    const buffer = await this.pdfService.generateQuotationPdf(
      {
        quotation_number: quotation.quotation_number,
        status: quotation.status,
        job_type: quotation.job_type,
        customer_name: customer?.name,
        commodity: quotation.commodity ?? undefined,
        gross_weight: quotation.gross_weight?.toString(),
        chargeable_weight: quotation.chargeable_weight?.toString(),
        volume_cbm: quotation.volume_cbm?.toString(),
        pieces: quotation.pieces ?? undefined,
        currency_code: quotation.currency_code,
        revenue_total: quotation.revenue_total.toString(),
        cost_total: quotation.cost_total.toString(),
        gp_amount: quotation.gp_amount.toString(),
        gp_percent: quotation.gp_percent.toString(),
        valid_until: quotation.valid_until?.toISOString().slice(0, 10),
        remarks: quotation.remarks ?? undefined,
        lines: quotation.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity.toString(),
          unit_price: l.unit_price.toString(),
          amount: l.amount.toString(),
          is_cost: l.is_cost,
        })),
      },
      mode,
    );

    const filename = `${quotation.quotation_number}-${mode.toLowerCase()}.pdf`;
    return { buffer, filename };
  }

  private async buildJobDocumentPdf(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    isOriginal: boolean,
    layoutVariant?: string,
    options?: SeaFclDocumentOptions,
  ) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          air_details: true,
          sea_fcl_details: {
            include: {
              containers: {
                where: { deleted_at: null },
                include: { cargo_lines: { where: { deleted_at: null } } },
              },
            },
          },
          charges: { where: { deleted_at: null }, orderBy: { created_at: 'asc' } },
          cargo_lines: { where: { deleted_at: null }, orderBy: { created_at: 'asc' } },
          stuffing_records: { where: { deleted_at: null }, orderBy: { stuffing_date: 'desc' } },
          bills_of_lading: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
          house_jobs: {
            where: { deleted_at: null },
            include: { sea_fcl_details: true },
          },
        },
      }),
    );

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    const useSeaFcl =
      job.job_type !== 'AIR_IMPORT' &&
      (job.job_type === 'SEA_FCL_EXPORT' ||
        job.job_type === 'SEA_FCL_IMPORT' ||
        isSeaFclDocumentType(documentType));

    if (useSeaFcl && job.sea_fcl_details) {
      const data = await this.buildSeaFclPdfData(
        tenantId,
        job as SeaFclJobDocContext,
        documentType,
        isOriginal,
        layoutVariant,
        options,
      );
      const buffer = await this.pdfService.generateSeaFclDocumentPdf(data);
      const filename = `${job.job_number}-${documentType.toLowerCase()}${isOriginal ? '-original' : '-draft'}.pdf`;
      return { buffer, filename };
    }

    const [shipper, consignee, originPort, destPort, airline, notifyParty] =
      await this.prisma.runWithTenant(tenantId, async (tx) => {
      const s = job.shipper_id
        ? await tx.party.findFirst({ where: { id: job.shipper_id, tenant_id: tenantId } })
        : null;
      const c = job.consignee_id
        ? await tx.party.findFirst({ where: { id: job.consignee_id, tenant_id: tenantId } })
        : null;
      const o = job.origin_port_id
        ? await tx.port.findFirst({ where: { id: job.origin_port_id, tenant_id: tenantId } })
        : null;
      const d = job.dest_port_id
        ? await tx.port.findFirst({ where: { id: job.dest_port_id, tenant_id: tenantId } })
        : null;
      const a =
        job.air_details?.airline_id
          ? await tx.airline.findFirst({ where: { id: job.air_details.airline_id, tenant_id: tenantId } })
          : null;
      const n =
        job.air_details?.notify_party_id
          ? await tx.party.findFirst({ where: { id: job.air_details.notify_party_id, tenant_id: tenantId } })
          : null;
      return [s, c, o, d, a, n] as const;
    });

    const isAirImport = job.job_type === 'AIR_IMPORT';
    const ad = job.air_details;

    const buffer = await this.pdfService.generateJobDocumentPdf({
      job_number: job.job_number,
      job_type: job.job_type,
      document_type: documentType,
      shipper_name: shipper?.name,
      consignee_name: consignee?.name,
      commodity: job.commodity ?? undefined,
      gross_weight: job.gross_weight?.toString(),
      chargeable_weight: job.chargeable_weight?.toString(),
      pieces: job.pieces ?? undefined,
      hawb_number: isAirImport
        ? (ad?.hawb_number_from_origin_agent ?? ad?.hawb_number ?? undefined)
        : (ad?.hawb_number ?? undefined),
      mawb_number: isAirImport
        ? (ad?.mawb_number_from_origin ?? ad?.mawb_number ?? undefined)
        : (ad?.mawb_number ?? undefined),
      origin_hawb_number: isAirImport ? (ad?.hawb_number_from_origin_agent ?? undefined) : undefined,
      origin_mawb_number: isAirImport ? (ad?.mawb_number_from_origin ?? undefined) : undefined,
      flight_number: isAirImport
        ? (ad?.arrival_flight_number ?? ad?.flight_number ?? undefined)
        : (ad?.flight_number ?? undefined),
      arrival_flight_number: isAirImport ? (ad?.arrival_flight_number ?? undefined) : undefined,
      actual_eta: ad?.actual_eta ? ad.actual_eta.toISOString().slice(0, 10) : undefined,
      notify_party_name: notifyParty?.name,
      delivery_address: ad?.delivery_address ?? undefined,
      final_destination: ad?.final_destination ?? undefined,
      airline_name: airline?.name,
      origin: originPort?.name,
      destination: destPort?.name,
      is_original: isOriginal,
    });

    const filename = `${job.job_number}-${documentType.toLowerCase()}${isOriginal ? '-original' : '-draft'}.pdf`;
    return { buffer, filename };
  }

  private async buildSeaFclPdfData(
    tenantId: string,
    job: SeaFclJobDocContext,
    documentType: DocumentType,
    isOriginal: boolean,
    layoutVariant?: string,
    options?: SeaFclDocumentOptions,
  ): Promise<SeaFclDocumentPdfData> {
    const detail = job.sea_fcl_details!;
    const bl =
      (options?.bl_id
        ? job.bills_of_lading.find((b) => b.id === options.bl_id)
        : undefined) ??
      job.bills_of_lading.find((b) => this.blMatchesDocumentType(b.bl_type, documentType)) ??
      job.bills_of_lading[0];

    const partyIds = [
      job.shipper_id,
      job.consignee_id,
      bl?.shipper_id,
      bl?.consignee_id,
      bl?.notify_id,
      options?.switch_consignee_id ?? bl?.switch_consignee_id,
      options?.switch_notify_id ?? bl?.switch_notify_id,
    ].filter((id): id is string => !!id);

    const containerTypeIds = detail.containers.map((c) => c.container_type_id);

    const lookups = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const parties = await tx.party.findMany({
        where: { tenant_id: tenantId, id: { in: partyIds } },
      });
      const ports = await tx.port.findMany({
        where: {
          tenant_id: tenantId,
          id: {
            in: [detail.port_of_loading_id, detail.port_of_discharge_id, job.origin_port_id, job.dest_port_id].filter(
              (id): id is string => !!id,
            ),
          },
        },
      });
      const vessel = detail.vessel_id
        ? await tx.vessel.findFirst({ where: { id: detail.vessel_id, tenant_id: tenantId } })
        : null;
      const shippingLine = detail.shipping_line_id
        ? await tx.shippingLine.findFirst({ where: { id: detail.shipping_line_id, tenant_id: tenantId } })
        : null;
      const containerTypes = await tx.containerType.findMany({
        where: { tenant_id: tenantId, id: { in: containerTypeIds } },
      });
      return { parties, ports, vessel, shippingLine, containerTypes };
    });

    const partyName = (id?: string | null) => lookups.parties.find((p) => p.id === id)?.name;
    const portName = (id?: string | null) => lookups.ports.find((p) => p.id === id)?.name;
    const typeCode = (id: string) => lookups.containerTypes.find((t) => t.id === id)?.code;

    const isExpress =
      documentType === 'HBL_EXPRESS_RELEASE' ||
      options?.is_express_release === true ||
      bl?.is_express_release === true;

    const titleMap: Partial<Record<DocumentType, string>> = {
      HBL: 'House Bill of Lading (HBL)',
      HBL_EXPRESS_RELEASE: 'House Bill of Lading — Express / Telex Release',
      MBL: 'Master Bill of Lading (MBL / OBL)',
      FIATA_BL: 'FIATA Bill of Lading (FBL)',
      RIDER_BL: 'Rider / Addendum to Bill of Lading',
      SWITCH_BL: 'Switch Bill of Lading',
      PROXY_BL: 'Proxy Bill of Lading',
      BACK_TO_BACK_BL: 'Back-to-Back Bill of Lading',
      SURRENDER_NOTICE: 'Bill of Lading Surrender Notice',
      SHIPPING_INSTRUCTION: 'Shipping Instruction (SI)',
      STUFFING_REPORT: 'Stuffing Report',
      SAILING_CONFIRMATION: 'Sailing Confirmation',
      TRANSHIPMENT_CONFIRMATION: 'Transhipment Confirmation',
      CARGO_MANIFEST: 'Cargo Manifest',
      FREIGHT_MANIFEST: 'Freight Manifest',
      JOB_CARD: 'Job Card',
      JOB_PNL: 'Job P&L Statement',
      PROFORMA_INVOICE: 'Proforma Invoice',
      PRE_ALERT: 'Pre-Alert',
      VGM: 'VGM Submission',
      PRE_CAN: 'Pre-Arrival Notice (Pre-CAN)',
      CAN: 'Cargo Arrival Notice (CAN)',
      EXCHANGE_LETTER: 'Exchange Letter',
      UNDERTAKE_LETTER: 'Undertake Letter',
      DELIVERY_ORDER: 'Delivery Order',
      TRANSPORT_REQUEST: 'Transport Request',
      PROOF_OF_DELIVERY: 'Proof of Delivery',
      SHIPPING_ADVICE: 'Shipping Advice',
      ARRIVAL_NOTICE: 'Arrival Notice',
      E_AWB: 'Electronic Air Waybill (E-AWB)',
      BARCODE_LABEL: 'Barcode Label',
      CONSIGNEE_LABEL: 'Consignee Label',
      JOB_COSTING: 'Job Costing Sheet',
      FREIGHT_CERTIFICATE: 'Freight Certificate',
      HAWB: 'House Air Waybill (HAWB)',
      MAWB: 'Master Air Waybill (MAWB)',
      CROSS_BORDER_DECLARATION: 'Cross-Border Declaration',
      CUSTOMS_TRANSIT: 'Customs Transit Document',
      DELIVERY_NOTE: 'Delivery Note',
      COURIER_REPORT: 'Courier Report',
      CUSTOMS_ENTRY: 'Customs Declaration',
      BOOKING_CONFIRMATION: 'Booking Confirmation',
    };

    const houseJob = job.house_jobs[0];
    const containerById = new Map(detail.containers.map((c) => [c.id, c]));

    return {
      job_number: job.job_number,
      document_type: documentType,
      title: titleMap[documentType] ?? documentType.replace(/_/g, ' '),
      watermark: isOriginal || bl?.is_original ? 'ORIGINAL' : 'DRAFT',
      layout_variant: layoutVariant,
      is_express_release: isExpress,
      is_fiata: documentType === 'FIATA_BL',
      is_non_negotiable: isExpress,
      shipper_name: partyName(bl?.shipper_id ?? job.shipper_id),
      consignee_name: partyName(bl?.consignee_id ?? job.consignee_id),
      notify_name: partyName(bl?.notify_id),
      pol: bl?.pol ?? portName(detail.port_of_loading_id ?? job.origin_port_id),
      pod: bl?.pod ?? portName(detail.port_of_discharge_id ?? job.dest_port_id),
      place_of_receipt: bl?.place_of_receipt ?? detail.place_of_receipt ?? undefined,
      place_of_delivery: bl?.place_of_delivery ?? detail.place_of_delivery ?? undefined,
      vessel_name: bl?.vessel_name ?? lookups.vessel?.name,
      voyage_number: bl?.voyage_number ?? detail.voyage_number ?? undefined,
      etd: this.fmtDate(bl?.etd ?? detail.etd ?? job.etd),
      eta: this.fmtDate(bl?.eta ?? detail.eta ?? job.eta),
      sailed_at: this.fmtDate(detail.sailed_at),
      bl_number: bl?.bl_number ?? detail.hbl_number ?? detail.mbl_number ?? undefined,
      hbl_number: detail.hbl_number ?? undefined,
      mbl_number: detail.mbl_number ?? undefined,
      booking_number: detail.booking_number ?? detail.carrier_booking_ref ?? undefined,
      freight_terms: bl?.freight_terms ?? detail.freight_terms ?? undefined,
      freight_payable_at: bl?.freight_payable_at ?? undefined,
      number_of_originals: options?.number_of_originals ?? bl?.number_of_originals ?? 3,
      description_of_goods: bl?.description_of_goods ?? job.commodity ?? undefined,
      marks_numbers: bl?.marks_numbers ?? undefined,
      packages: bl?.packages ?? job.pieces ?? undefined,
      gross_weight: (bl?.gross_weight ?? job.gross_weight)?.toString(),
      measurement: (bl?.measurement ?? job.volume_cbm)?.toString(),
      commodity: job.commodity ?? undefined,
      shipping_line_name: lookups.shippingLine?.name,
      bl_conditions: bl?.bl_conditions ?? undefined,
      rider_terms: options?.rider_terms ?? bl?.rider_terms ?? undefined,
      switched_from_bl_number: options?.switched_from_bl_number ?? bl?.switched_from_bl_number ?? undefined,
      switch_consignee_name: partyName(options?.switch_consignee_id ?? bl?.switch_consignee_id),
      switch_notify_name: partyName(options?.switch_notify_id ?? bl?.switch_notify_id),
      proxy_forwarder_name: options?.proxy_forwarder_name ?? bl?.proxy_forwarder_name ?? undefined,
      proxy_forwarder_address: options?.proxy_forwarder_address ?? bl?.proxy_forwarder_address ?? undefined,
      transhipment_port: options?.transhipment_port ?? detail.transhipment_port ?? undefined,
      house_bl_number: houseJob?.sea_fcl_details?.hbl_number ?? detail.hbl_number ?? undefined,
      master_bl_number: detail.mbl_number ?? undefined,
      revenue_total: job.revenue_total.toString(),
      cost_total: job.cost_total.toString(),
      gp_amount: job.gp_amount.toString(),
      gp_percent: job.gp_percent.toString(),
      containers: detail.containers.map((c) => ({
        container_number: c.container_number ?? undefined,
        seal_number: c.seal_number ?? undefined,
        container_type: typeCode(c.container_type_id),
        status: c.status,
        gross_weight: c.gross_weight?.toString(),
        vgm_weight: c.vgm_weight?.toString(),
        cbm: c.cbm?.toString(),
      })),
      cargo_lines: job.cargo_lines.map((line) => ({
        commodity: line.commodity ?? undefined,
        marks_numbers: line.marks_numbers ?? undefined,
        packages: line.packages ?? undefined,
        gross_weight: line.gross_weight?.toString(),
        measurement: line.measurement?.toString(),
        container_number: line.container_id
          ? containerById.get(line.container_id)?.container_number ?? undefined
          : undefined,
      })),
      stuffing_records: job.stuffing_records.map((r) => ({
        supervisor_name: r.supervisor_name,
        stuffing_date: this.fmtDate(r.stuffing_date),
        location: r.location ?? undefined,
        goods_condition: r.goods_condition ?? undefined,
        container_number: r.container_id
          ? containerById.get(r.container_id)?.container_number ?? undefined
          : undefined,
      })),
      charge_lines: job.charges.map((c) => ({
        description: c.description,
        quantity: c.quantity.toString(),
        unit_price: c.unit_price.toString(),
        amount: c.amount.toString(),
        is_cost: c.is_cost,
      })),
    };
  }

  private blMatchesDocumentType(blType: string, documentType: DocumentType): boolean {
    const normalized = blType.toUpperCase().replace(/[\s-]+/g, '_');
    if (documentType === 'HBL_EXPRESS_RELEASE') {
      return normalized.includes('EXPRESS') || normalized === 'HBL';
    }
    if (documentType === 'FIATA_BL') return normalized.includes('FIATA');
    if (documentType === 'SWITCH_BL') return normalized.includes('SWITCH');
    if (documentType === 'PROXY_BL') return normalized.includes('PROXY');
    if (documentType === 'BACK_TO_BACK_BL') return normalized.includes('BACK');
    if (documentType === 'RIDER_BL') return normalized.includes('RIDER');
    if (documentType === 'HBL') return normalized === 'HBL' || normalized.includes('HOUSE');
    if (documentType === 'MBL') return normalized === 'MBL' || normalized.includes('MASTER') || normalized === 'OBL';
    return false;
  }

  private fmtDate(value?: Date | string | null): string | undefined {
    if (!value) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
}
