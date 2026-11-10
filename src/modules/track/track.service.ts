import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PdfService } from "../../shared/pdf/pdf.service";
import { LiveTransportTrackingService } from "./live-transport-tracking.service";
import { buildTrackTraceHtml } from "./track-pdf.util";
import { jobPublicTrackRefOrClauses } from "./tracking-ref.util";
import {
  TrackTimelinePayload,
  TrackTimelineService,
} from "./track-timeline.service";

type TenantResolveInput = {
  tenantSlug?: string;
  host?: string;
};

type TrackOpts = {
  /** Attach live vessel/flight card (default true). Pass false for PDF. */
  includeLive?: boolean;
};

type PublicTenantBrand = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  website: string | null;
  domain: string | null;
};

type PublicJobHit = {
  id: string;
  primary_container_number: string | null;
  containers_job: Array<{
    container_number: string | null;
    container_kind: string | null;
  }>;
};

@Injectable()
export class TrackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeline: TrackTimelineService,
    private readonly pdf: PdfService,
    private readonly live: LiveTransportTrackingService,
  ) {}

  /**
   * Public track — `ref` only (container / BL / AWB / booking / token).
   * `tenant_slug` is optional hint; never required.
   */
  async track(
    ref: string,
    resolve: TenantResolveInput = {},
    opts: TrackOpts = {},
  ) {
    const q = ref.trim();
    if (q.length < 2) {
      throw new NotFoundException("Shipment not found.");
    }

    const hinted = await this.resolveTenant(resolve, true);
    let tenant: PublicTenantBrand | null = hinted;
    let job: PublicJobHit | null = null;

    if (tenant) {
      job = await this.findPublicJobInTenant(tenant.id, q);
    }
    if (!job) {
      const hit = await this.findPublicJobAcrossTenants(q, tenant?.id);
      if (hit) {
        tenant = hit.tenant;
        job = hit.job;
      }
    }

    if (!tenant || !job) {
      throw new NotFoundException("Shipment not found.");
    }

    const qLower = q.toLowerCase();
    const matched =
      job.containers_job.find(
        (c) => c.container_number?.toLowerCase() === qLower,
      )?.container_number ??
      (job.primary_container_number?.toLowerCase() === qLower
        ? job.primary_container_number
        : null);

    const payload = await this.timeline.getTimelineForJob(tenant.id, job.id, {
      includeNotes: false,
      tenantSlug: tenant.slug,
      focusContainerNumber: matched,
    });

    const includeLive = opts.includeLive !== false;
    const live_tracking = includeLive
      ? await this.live.forJob(tenant.id, job.id)
      : undefined;

    return {
      success: true,
      data: {
        branding: {
          tenant_name: tenant.display_name ?? tenant.name,
          logo_url: tenant.logo_url,
          primary_color: tenant.primary_color,
          website: tenant.website,
        },
        query: q,
        matched_container: matched ?? payload.container_number,
        shipment: this.toPublicShipment(payload),
        /** Flat aliases for FE that reads data.* instead of data.shipment.* */
        current_status: payload.current_status,
        container_number: payload.container_number,
        container_type: payload.container_type,
        iso_size: payload.iso_size,
        progress_legs: payload.progress_legs,
        route_legs: payload.route_legs,
        ports: payload.ports,
        history: payload.history,
        moves: payload.moves,
        events: payload.events,
        timeline: payload.timeline,
        route: payload.route,
        cargo_info: payload.cargo_info,
        pre_manifest: payload.pre_manifest,
        qty_gw_vol: payload.qty_gw_vol,
        milestones: payload.milestones,
        summary: payload.summary,
        public_url: payload.public_url,
        pdf_url: `/track/pdf?ref=${encodeURIComponent(q)}`,
        ...(live_tracking ? { live_tracking } : {}),
      },
    };
  }

  /** Staff/portal: full timeline by job id (current status + complete history). */
  async trackByJobId(
    tenantId: string,
    jobId: string,
    opts?: {
      shipmentId?: string | null;
      includeNotes?: boolean;
      focusContainerNumber?: string | null;
    },
  ) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { slug: true },
    });
    const payload = await this.timeline.getTimelineForJob(tenantId, jobId, {
      includeNotes: opts?.includeNotes ?? true,
      shipmentId: opts?.shipmentId,
      tenantSlug: tenant?.slug,
      focusContainerNumber: opts?.focusContainerNumber,
    });
    return {
      success: true,
      data: {
        ...payload,
        pdf_url: `/jobs/${jobId}/tracking/pdf`,
      },
    };
  }

  async trackPdf(ref: string, resolve: TenantResolveInput): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
    const result = await this.track(ref, resolve, { includeLive: false });
    const shipment = result.data.shipment as TrackTimelinePayload;
    const html = buildTrackTraceHtml(shipment, {
      tenant_name: result.data.branding.tenant_name,
      query: result.data.query,
    });
    const buffer = await this.pdf.renderHtmlToPdf(html);
    const safe =
      (shipment.container_number || shipment.job_number || "track")
        .replace(/[^\w.-]+/g, "_")
        .slice(0, 60) || "track";
    return { buffer, filename: `track-${safe}.pdf` };
  }

  async trackPdfByJobId(
    tenantId: string,
    jobId: string,
    opts?: { shipmentId?: string | null; focusContainerNumber?: string | null },
  ): Promise<{ buffer: Buffer; filename: string }> {
    const tracked = await this.trackByJobId(tenantId, jobId, {
      ...opts,
      includeNotes: false,
    });
    const payload = tracked.data;
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { display_name: true, name: true },
    });
    const html = buildTrackTraceHtml(payload, {
      tenant_name: tenant?.display_name ?? tenant?.name,
      query: payload.job_number,
    });
    const buffer = await this.pdf.renderHtmlToPdf(html);
    const safe =
      (payload.container_number || payload.job_number || "track")
        .replace(/[^\w.-]+/g, "_")
        .slice(0, 60) || "track";
    return { buffer, filename: `track-${safe}.pdf` };
  }

  async embedConfig(resolve: TenantResolveInput) {
    const tenant = await this.resolveTenant(resolve, false);
    if (!tenant) {
      throw new NotFoundException("Tenant not found.");
    }

    return {
      success: true,
      data: {
        tenant_slug: tenant.slug,
        tenant_name: tenant.display_name ?? tenant.name,
        logo_url: tenant.logo_url,
        primary_color: tenant.primary_color ?? "#0B5FFF",
        website: tenant.website,
        track_endpoint: "/track",
        track_pdf_endpoint: "/track/pdf",
        widget_script: `/track/widget.js?tenant_slug=${encodeURIComponent(tenant.slug)}`,
        placeholder: "Enter container, BL, or AWB number",
      },
    };
  }

  async widgetScript(resolve: TenantResolveInput): Promise<string> {
    const tenant = await this.resolveTenant(resolve, false);
    if (!tenant) {
      throw new NotFoundException("Tenant not found.");
    }

    const color = (tenant.primary_color ?? "#0B5FFF").replace(/'/g, "");
    const name = (tenant.display_name ?? tenant.name)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");

    return `(function(){
  var COLOR='${color}';
  var NAME='${name}';
  var root=document.currentScript && document.currentScript.parentElement || document.body;
  var box=document.createElement('div');
  box.setAttribute('data-kf-track','1');
  box.style.cssText='font-family:system-ui,sans-serif;max-width:520px;border:1px solid #E2E8F0;padding:16px;border-radius:8px;background:#fff;';
  box.innerHTML='<div style="font-weight:600;color:'+COLOR+';margin-bottom:8px;">'+NAME+' Track & Trace</div>'+
    '<input id="kf-track-ref" placeholder="Container / BL / AWB number" style="width:100%;padding:8px;margin-bottom:8px;box-sizing:border-box;"/>'+
    '<button id="kf-track-btn" style="background:'+COLOR+';color:#fff;border:0;padding:8px 14px;border-radius:4px;cursor:pointer;">Track</button>'+
    '<div id="kf-track-out" style="margin-top:12px;font-size:13px;line-height:1.45;color:#0F172A;"></div>';
  root.appendChild(box);
  function apiBase(){
    var s=document.currentScript && document.currentScript.src;
    if(s){ try { return new URL(s).origin; } catch(e){} }
    return '';
  }
  document.getElementById('kf-track-btn').onclick=function(){
    var ref=(document.getElementById('kf-track-ref').value||'').trim();
    var out=document.getElementById('kf-track-out');
    if(!ref){ out.textContent='Enter a reference.'; return; }
    out.textContent='Loading…';
    fetch(apiBase()+'/track?ref='+encodeURIComponent(ref))
      .then(function(r){ return r.json().then(function(j){ if(!r.ok) throw new Error(j.message||'Not found'); return j; }); })
      .then(function(j){
        var s=j.data && j.data.shipment;
        if(!s){ out.textContent='No data'; return; }
        var sum=s.summary||{};
        var hist=s.history||s.moves||s.milestones||[];
        var head='<div style="font-weight:600;margin-bottom:6px;">'+
          (s.job_number||'')+' · '+(s.current_status||s.status_label||s.status||'')+'</div>';
        if(s.container_number){
          head+='<div style="color:#475569;margin-bottom:6px;">Container '+(s.container_number||'')+
            (s.iso_size?' · '+s.iso_size:'')+'</div>';
        }
        if(sum.last_event){
          head+='<div style="color:#475569;margin-bottom:8px;">Latest: '+(sum.last_event.move||sum.last_event.label||'')+'</div>';
        }
        if(sum.progress){
          head+='<div style="color:#64748B;font-size:12px;margin-bottom:10px;">Progress '+
            sum.progress.completed+'/'+sum.progress.total+' ('+sum.progress.percent+'%)</div>';
        }
        var lines=hist.map(function(m){
          var done=m.is_completed;
          var label=m.move||m.label||m.milestone||m.code||'';
          var when=m.completed_at||m.occurred_at||m.actual_at||m.planned_at||'';
          return '<div style="padding:4px 0;border-bottom:1px solid #F1F5F9;">'+
            (done?'✓ ':'○ ')+label+
            (when?' <span style="color:#94A3B8;font-size:11px;">'+when+'</span>':'')+
            '</div>';
        }).join('');
        out.innerHTML=head+lines;
      })
      .catch(function(e){ out.textContent=e.message||'Error'; });
  };
})();`;
  }

  private async findPublicJobInTenant(
    tenantId: string,
    q: string,
  ): Promise<PublicJobHit | null> {
    return this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: jobPublicTrackRefOrClauses(q),
        },
        orderBy: { updated_at: "desc" },
        select: {
          id: true,
          primary_container_number: true,
          containers_job: {
            where: { deleted_at: null },
            select: { container_number: true, container_kind: true },
          },
        },
      }),
    );
  }

  /**
   * Cross-tenant public lookup when no slug/host is provided.
   * Scans active tenants until the first container/BL/AWB hit.
   */
  private async findPublicJobAcrossTenants(
    q: string,
    skipTenantId?: string,
  ): Promise<{ tenant: PublicTenantBrand; job: PublicJobHit } | null> {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        deleted_at: null,
        is_active: true,
        ...(skipTenantId ? { id: { not: skipTenantId } } : {}),
      },
      orderBy: { updated_at: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        display_name: true,
        logo_url: true,
        primary_color: true,
        website: true,
        domain: true,
      },
    });

    for (const tenant of tenants) {
      const job = await this.findPublicJobInTenant(tenant.id, q);
      if (job) return { tenant, job };
    }
    return null;
  }

  private toPublicShipment(payload: TrackTimelinePayload) {
    return {
      job_id: payload.job_id,
      job_number: payload.job_number,
      job_type: payload.job_type,
      shipment_id: payload.shipment_id,
      shipment_number: payload.shipment_number,
      shipment_status: payload.shipment_status,
      status: payload.status,
      status_code: payload.status_code,
      status_label: payload.status_label,
      current_status: payload.current_status,
      container_number: payload.container_number,
      container_type: payload.container_type,
      iso_size: payload.iso_size,
      container_kind: payload.container_kind,
      progress_legs: payload.progress_legs,
      route_legs: payload.route_legs,
      ports: payload.ports,
      etd: payload.etd,
      eta: payload.eta,
      expected_delivery: payload.expected_delivery,
      hold: payload.hold,
      commodity: payload.commodity,
      pieces: payload.pieces,
      gross_weight: payload.gross_weight,
      origin: payload.origin,
      destination: payload.destination,
      vessel_name: payload.vessel_name,
      voyage_number: payload.voyage_number,
      location_terminal: payload.location_terminal,
      terminal: payload.terminal,
      location: payload.location,
      references: payload.references,
      containers: payload.containers,
      linked_shipments: payload.linked_shipments,
      /** @deprecated Prefer `history` — kept for embed/widget compatibility. */
      milestones: payload.milestones,
      history: payload.history,
      moves: payload.moves,
      events: payload.events,
      timeline: payload.timeline,
      route: payload.route,
      cargo_info: payload.cargo_info,
      pre_manifest: payload.pre_manifest,
      qty_gw_vol: payload.qty_gw_vol,
      tracking_profile_updated_at: payload.tracking_profile_updated_at,
      summary: payload.summary,
    };
  }

  private async resolveTenant(
    resolve: TenantResolveInput,
    softNotFound: boolean,
  ) {
    const slug = resolve.tenantSlug?.trim();
    if (slug) {
      return this.prisma.tenant.findFirst({
        where: { slug, deleted_at: null, is_active: true },
        select: {
          id: true,
          slug: true,
          name: true,
          display_name: true,
          logo_url: true,
          primary_color: true,
          website: true,
          domain: true,
        },
      });
    }

    const domain = this.normalizeHost(resolve.host);
    if (!domain) {
      if (softNotFound) return null;
      throw new NotFoundException("Tenant not found.");
    }

    return this.prisma.tenant.findFirst({
      where: {
        deleted_at: null,
        is_active: true,
        OR: [
          { domain: { equals: domain, mode: "insensitive" } },
          { domain: { equals: `www.${domain}`, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        display_name: true,
        logo_url: true,
        primary_color: true,
        website: true,
        domain: true,
      },
    });
  }

  private normalizeHost(host?: string): string | null {
    if (!host?.trim()) return null;
    return host
      .trim()
      .toLowerCase()
      .replace(/:\d+$/, "")
      .replace(/^www\./, "");
  }
}
