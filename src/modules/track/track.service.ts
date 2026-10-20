import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { jobTrackRefOrClauses } from "./tracking-ref.util";
import { TrackTimelineService } from "./track-timeline.service";

type TenantResolveInput = {
  tenantSlug?: string;
  host?: string;
};

@Injectable()
export class TrackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeline: TrackTimelineService,
  ) {}

  async track(ref: string, resolve: TenantResolveInput) {
    const tenant = await this.resolveTenant(resolve, true);
    if (!tenant) {
      throw new NotFoundException("Shipment not found.");
    }

    const q = ref.trim();
    if (q.length < 2) {
      throw new NotFoundException("Shipment not found.");
    }

    const job = await this.prisma.runWithTenant(tenant.id, (tx) =>
      tx.job.findFirst({
        where: {
          tenant_id: tenant.id,
          deleted_at: null,
          OR: jobTrackRefOrClauses(q),
        },
        orderBy: { updated_at: "desc" },
        select: {
          id: true,
          containers_job: {
            where: { deleted_at: null },
            select: { container_number: true },
          },
        },
      }),
    );

    if (!job) {
      throw new NotFoundException("Shipment not found.");
    }

    const payload = await this.timeline.getTimelineForJob(tenant.id, job.id, {
      includeNotes: false,
      tenantSlug: tenant.slug,
    });

    const qLower = q.toLowerCase();
    const matched =
      job.containers_job.find(
        (c) => c.container_number?.toLowerCase() === qLower,
      )?.container_number ??
      (payload.references.container_numbers as string[] | undefined)?.find(
        (n) => n?.toLowerCase() === qLower,
      ) ??
      null;

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
        matched_container: matched,
        shipment: {
          job_id: payload.job_id,
          job_number: payload.job_number,
          job_type: payload.job_type,
          shipment_id: payload.shipment_id,
          shipment_number: payload.shipment_number,
          shipment_status: payload.shipment_status,
          status: payload.status,
          status_code: payload.status_code,
          status_label: payload.status_label,
          etd: payload.etd,
          eta: payload.eta,
          commodity: payload.commodity,
          pieces: payload.pieces,
          gross_weight: payload.gross_weight,
          origin: payload.origin,
          destination: payload.destination,
          references: payload.references,
          containers: payload.containers,
          linked_shipments: payload.linked_shipments,
          /** @deprecated Prefer `history` — kept for embed/widget compatibility. */
          milestones: payload.milestones,
          history: payload.history,
          summary: payload.summary,
        },
        public_url: payload.public_url,
      },
    };
  }

  /** Staff/portal: full timeline by job id (current status + complete history). */
  async trackByJobId(
    tenantId: string,
    jobId: string,
    opts?: { shipmentId?: string | null; includeNotes?: boolean },
  ) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { slug: true },
    });
    const payload = await this.timeline.getTimelineForJob(tenantId, jobId, {
      includeNotes: opts?.includeNotes ?? true,
      shipmentId: opts?.shipmentId,
      tenantSlug: tenant?.slug,
    });
    return { success: true, data: payload };
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
        widget_script: `/track/widget.js?tenant_slug=${encodeURIComponent(tenant.slug)}`,
        placeholder:
          "Enter job, shipment, BL, AWB, booking, or container number",
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
    const slug = tenant.slug;

    return `(function(){
  var SLUG='${slug}';
  var COLOR='${color}';
  var NAME='${name}';
  var root=document.currentScript && document.currentScript.parentElement || document.body;
  var box=document.createElement('div');
  box.setAttribute('data-kf-track','1');
  box.style.cssText='font-family:system-ui,sans-serif;max-width:520px;border:1px solid #E2E8F0;padding:16px;border-radius:8px;background:#fff;';
  box.innerHTML='<div style="font-weight:600;color:'+COLOR+';margin-bottom:8px;">'+NAME+' Track & Trace</div>'+
    '<input id="kf-track-ref" placeholder="Job / shipment / BL / AWB / container" style="width:100%;padding:8px;margin-bottom:8px;box-sizing:border-box;"/>'+
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
    fetch(apiBase()+'/track?tenant_slug='+encodeURIComponent(SLUG)+'&ref='+encodeURIComponent(ref))
      .then(function(r){ return r.json().then(function(j){ if(!r.ok) throw new Error(j.message||'Not found'); return j; }); })
      .then(function(j){
        var s=j.data && j.data.shipment;
        if(!s){ out.textContent='No data'; return; }
        var sum=s.summary||{};
        var hist=s.history||s.milestones||[];
        var head='<div style="font-weight:600;margin-bottom:6px;">'+
          (s.job_number||'')+' · '+(s.status_label||s.status||'')+'</div>';
        if(sum.last_event){
          head+='<div style="color:#475569;margin-bottom:8px;">Latest: '+(sum.last_event.label||'')+'</div>';
        }
        if(sum.progress){
          head+='<div style="color:#64748B;font-size:12px;margin-bottom:10px;">Progress '+
            sum.progress.completed+'/'+sum.progress.total+' ('+sum.progress.percent+'%)</div>';
        }
        var lines=hist.map(function(m){
          var done=m.is_completed;
          var label=m.label||m.milestone||m.code||'';
          var when=m.actual_at||m.planned_at||'';
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
