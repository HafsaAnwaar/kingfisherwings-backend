import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type TenantResolveInput = {
  tenantSlug?: string;
  host?: string;
};

@Injectable()
export class TrackService {
  constructor(private readonly prisma: PrismaService) {}

  async track(ref: string, resolve: TenantResolveInput) {
    const tenant = await this.resolveTenant(resolve, true);
    if (!tenant) {
      throw new NotFoundException('Shipment not found.');
    }

    const q = ref.trim();
    if (q.length < 2) {
      throw new NotFoundException('Shipment not found.');
    }

    const job = await this.prisma.runWithTenant(tenant.id, (tx) =>
      tx.job.findFirst({
        where: {
          tenant_id: tenant.id,
          deleted_at: null,
          OR: [
            { job_number: { equals: q, mode: 'insensitive' } },
            { air_details: { hawb_number: { equals: q, mode: 'insensitive' } } },
            { air_details: { mawb_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { hbl_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { mbl_number: { equals: q, mode: 'insensitive' } } },
            { sea_fcl_details: { booking_number: { equals: q, mode: 'insensitive' } } },
          ],
        },
        include: {
          air_details: {
            select: {
              hawb_number: true,
              mawb_number: true,
              flight_number: true,
              flight_date: true,
              origin_airport_id: true,
              dest_airport_id: true,
            },
          },
          sea_fcl_details: {
            select: {
              voyage_number: true,
              hbl_number: true,
              mbl_number: true,
              booking_number: true,
              vessel_id: true,
              etd: true,
              eta: true,
              sailed_at: true,
              place_of_receipt: true,
              place_of_delivery: true,
            },
          },
          milestones: {
            where: { deleted_at: null },
            orderBy: { created_at: 'asc' },
            select: {
              milestone: true,
              planned_date: true,
              actual_date: true,
              notes: true,
            },
          },
        },
      }),
    );

    if (!job) {
      throw new NotFoundException('Shipment not found.');
    }

    const [ports, airports, vessel] = await this.prisma.runWithTenant(tenant.id, async (tx) => {
      const portIds = [job.origin_port_id, job.dest_port_id].filter(Boolean) as string[];
      const airportIds = [
        job.air_details?.origin_airport_id,
        job.air_details?.dest_airport_id,
      ].filter(Boolean) as string[];

      return Promise.all([
        portIds.length
          ? tx.port.findMany({
              where: { tenant_id: tenant.id, id: { in: portIds }, deleted_at: null },
              select: { id: true, name: true, un_locode: true, country_code: true },
            })
          : [],
        airportIds.length
          ? tx.airport.findMany({
              where: { tenant_id: tenant.id, id: { in: airportIds }, deleted_at: null },
              select: { id: true, name: true, iata_code: true, country_code: true },
            })
          : [],
        job.sea_fcl_details?.vessel_id
          ? tx.vessel.findFirst({
              where: {
                tenant_id: tenant.id,
                id: job.sea_fcl_details.vessel_id,
                deleted_at: null,
              },
              select: { name: true, imo_number: true },
            })
          : null,
      ]);
    });

    const portMap = new Map(ports.map((p) => [p.id, p]));
    const airportMap = new Map(airports.map((a) => [a.id, a]));

    const originPort = job.origin_port_id ? portMap.get(job.origin_port_id) : null;
    const destPort = job.dest_port_id ? portMap.get(job.dest_port_id) : null;
    const originAirport = job.air_details?.origin_airport_id
      ? airportMap.get(job.air_details.origin_airport_id)
      : null;
    const destAirport = job.air_details?.dest_airport_id
      ? airportMap.get(job.air_details.dest_airport_id)
      : null;

    return {
      success: true,
      data: {
        branding: {
          tenant_name: tenant.display_name ?? tenant.name,
          logo_url: tenant.logo_url,
          primary_color: tenant.primary_color,
          website: tenant.website,
        },
        shipment: {
          job_number: job.job_number,
          job_type: job.job_type,
          status: job.status,
          etd: job.etd ?? job.sea_fcl_details?.etd ?? null,
          eta: job.eta ?? job.sea_fcl_details?.eta ?? null,
          commodity: job.commodity,
          pieces: job.pieces,
          gross_weight: job.gross_weight,
          origin: originPort
            ? { name: originPort.name, code: originPort.un_locode, country_code: originPort.country_code }
            : originAirport
              ? {
                  name: originAirport.name,
                  code: originAirport.iata_code,
                  country_code: originAirport.country_code,
                }
              : null,
          destination: destPort
            ? { name: destPort.name, code: destPort.un_locode, country_code: destPort.country_code }
            : destAirport
              ? {
                  name: destAirport.name,
                  code: destAirport.iata_code,
                  country_code: destAirport.country_code,
                }
              : null,
          references: {
            hawb_number: job.air_details?.hawb_number ?? null,
            mawb_number: job.air_details?.mawb_number ?? null,
            hbl_number: job.sea_fcl_details?.hbl_number ?? null,
            mbl_number: job.sea_fcl_details?.mbl_number ?? null,
            booking_number: job.sea_fcl_details?.booking_number ?? null,
            flight_number: job.air_details?.flight_number ?? null,
            voyage_number: job.sea_fcl_details?.voyage_number ?? null,
            vessel_name: vessel?.name ?? null,
          },
          milestones: job.milestones.map((m) => ({
            milestone: m.milestone,
            planned_date: m.planned_date,
            actual_date: m.actual_date,
            notes: m.notes,
            is_completed: Boolean(m.actual_date),
          })),
        },
      },
    };
  }

  async embedConfig(resolve: TenantResolveInput) {
    const tenant = await this.resolveTenant(resolve, false);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return {
      success: true,
      data: {
        tenant_slug: tenant.slug,
        tenant_name: tenant.display_name ?? tenant.name,
        logo_url: tenant.logo_url,
        primary_color: tenant.primary_color ?? '#0B3D5C',
        website: tenant.website,
        track_endpoint: '/track',
        widget_script: `/track/widget.js?tenant_slug=${encodeURIComponent(tenant.slug)}`,
        placeholder: 'Enter job number, BL, or AWB',
      },
    };
  }

  async widgetScript(resolve: TenantResolveInput): Promise<string> {
    const tenant = await this.resolveTenant(resolve, false);
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    const color = (tenant.primary_color ?? '#0B3D5C').replace(/'/g, '');
    const name = (tenant.display_name ?? tenant.name).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const slug = tenant.slug;

    return `(function(){
  var SLUG='${slug}';
  var COLOR='${color}';
  var NAME='${name}';
  var root=document.currentScript && document.currentScript.parentElement || document.body;
  var box=document.createElement('div');
  box.setAttribute('data-kf-track','1');
  box.style.cssText='font-family:system-ui,sans-serif;max-width:480px;border:1px solid #ddd;padding:16px;border-radius:8px;';
  box.innerHTML='<div style="font-weight:600;color:'+COLOR+';margin-bottom:8px;">'+NAME+' Track & Trace</div>'+
    '<input id="kf-track-ref" placeholder="Job / BL / AWB" style="width:100%;padding:8px;margin-bottom:8px;box-sizing:border-box;"/>'+
    '<button id="kf-track-btn" style="background:'+COLOR+';color:#fff;border:0;padding:8px 14px;border-radius:4px;cursor:pointer;">Track</button>'+
    '<pre id="kf-track-out" style="margin-top:12px;white-space:pre-wrap;font-size:12px;"></pre>';
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
        out.textContent=s.job_number+' · '+s.status+'\\n'+
          (s.origin&&s.origin.code?s.origin.code:'?')+' → '+(s.destination&&s.destination.code?s.destination.code:'?')+'\\n'+
          (s.milestones||[]).map(function(m){ return (m.is_completed?'✓ ':'○ ')+m.milestone; }).join('\\n');
      })
      .catch(function(e){ out.textContent=e.message||'Error'; });
  };
})();`;
  }

  private async resolveTenant(resolve: TenantResolveInput, softNotFound: boolean) {
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
      throw new NotFoundException('Tenant not found.');
    }

    return this.prisma.tenant.findFirst({
      where: {
        deleted_at: null,
        is_active: true,
        OR: [{ domain: { equals: domain, mode: 'insensitive' } }, { domain: { equals: `www.${domain}`, mode: 'insensitive' } }],
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
    return host.trim().toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '');
  }
}
