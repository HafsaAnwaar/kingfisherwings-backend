import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  jobTrackRefOrClauses,
  publicTrackUrl,
  sortTrackHistory,
  TrackHistoryEvent,
} from "./tracking-ref.util";

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
        include: {
          air_details: {
            select: {
              hawb_number: true,
              mawb_number: true,
              hawb_number_from_origin_agent: true,
              mawb_number_from_origin: true,
              flight_number: true,
              arrival_flight_number: true,
              actual_eta: true,
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
              carrier_booking_ref: true,
              vessel_id: true,
              etd: true,
              eta: true,
              sailed_at: true,
              place_of_receipt: true,
              place_of_delivery: true,
            },
          },
          sea_lcl_details: {
            select: {
              voyage_number: true,
              hbl_number: true,
              mbl_number: true,
              booking_number: true,
              carrier_booking_ref: true,
              consolidation_number: true,
              vessel_id: true,
              etd: true,
              eta: true,
              sailed_at: true,
            },
          },
          nvocc_details: {
            select: {
              hbl_number: true,
              mbl_number: true,
              carrier_booking_ref: true,
            },
          },
          land_details: {
            select: {
              vehicle_number: true,
              vehicle_type: true,
              driver_name: true,
              origin_city_country: true,
              destination_city_country: true,
              etd: true,
              eta: true,
            },
          },
          courier_details: {
            select: {
              tracking_number: true,
              service_type: true,
              pickup_address: true,
              delivery_address: true,
            },
          },
          road_freight_details: {
            select: { vehicle_number: true },
          },
          milestones: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
            select: {
              milestone: true,
              planned_date: true,
              actual_date: true,
            },
          },
          courier_checkpoints: {
            where: { deleted_at: null },
            orderBy: { scanned_at: "asc" },
            select: {
              checkpoint: true,
              scanned_at: true,
              location: true,
            },
          },
          containers_job: {
            where: { deleted_at: null },
            orderBy: { created_at: "asc" },
            select: {
              container_number: true,
              status: true,
              seal_number: true,
              gate_in_at: true,
              returned_at: true,
              container_kind: true,
            },
          },
          shipments: {
            where: { deleted_at: null },
            orderBy: { created_at: "desc" },
            take: 20,
            select: {
              id: true,
              shipment_number: true,
              status: true,
              hbl_number: true,
              mbl_number: true,
              container_numbers: true,
            },
          },
        },
      }),
    );

    if (!job) {
      throw new NotFoundException("Shipment not found.");
    }

    const qLower = q.toLowerCase();
    const matchedContainers = job.containers_job.filter(
      (c) => c.container_number?.toLowerCase() === qLower,
    );

    const [ports, airports, vessel] = await this.prisma.runWithTenant(
      tenant.id,
      async (tx) => {
        const portIds = [job.origin_port_id, job.dest_port_id].filter(
          Boolean,
        ) as string[];
        const airportIds = [
          job.air_details?.origin_airport_id,
          job.air_details?.dest_airport_id,
        ].filter(Boolean) as string[];
        const vesselId =
          job.sea_fcl_details?.vessel_id ?? job.sea_lcl_details?.vessel_id;

        return Promise.all([
          portIds.length
            ? tx.port.findMany({
                where: {
                  tenant_id: tenant.id,
                  id: { in: portIds },
                  deleted_at: null,
                },
                select: {
                  id: true,
                  name: true,
                  un_locode: true,
                  country_code: true,
                },
              })
            : [],
          airportIds.length
            ? tx.airport.findMany({
                where: {
                  tenant_id: tenant.id,
                  id: { in: airportIds },
                  deleted_at: null,
                },
                select: {
                  id: true,
                  name: true,
                  iata_code: true,
                  country_code: true,
                },
              })
            : [],
          vesselId
            ? tx.vessel.findFirst({
                where: {
                  tenant_id: tenant.id,
                  id: vesselId,
                  deleted_at: null,
                },
                select: { name: true, imo_number: true },
              })
            : null,
        ]);
      },
    );

    const portMap = new Map(ports.map((p) => [p.id, p]));
    const airportMap = new Map(airports.map((a) => [a.id, a]));

    const originPort = job.origin_port_id
      ? portMap.get(job.origin_port_id)
      : null;
    const destPort = job.dest_port_id ? portMap.get(job.dest_port_id) : null;
    const originAirport = job.air_details?.origin_airport_id
      ? airportMap.get(job.air_details.origin_airport_id)
      : null;
    const destAirport = job.air_details?.dest_airport_id
      ? airportMap.get(job.air_details.dest_airport_id)
      : null;

    const history = this.buildHistory(job, matchedContainers.length
      ? matchedContainers
      : job.containers_job);

    const milestones = job.milestones.map((m) => ({
      milestone: m.milestone,
      planned_date: m.planned_date,
      actual_date: m.actual_date,
      is_completed: Boolean(m.actual_date),
    }));

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
        matched_container:
          matchedContainers[0]?.container_number ??
          (job.containers_job.some(
            (c) => c.container_number?.toLowerCase() === qLower,
          )
            ? q
            : null),
        shipment: {
          job_number: job.job_number,
          job_type: job.job_type,
          status: job.status,
          etd:
            job.etd ??
            job.sea_fcl_details?.etd ??
            job.sea_lcl_details?.etd ??
            job.land_details?.etd ??
            null,
          eta:
            job.eta ??
            job.sea_fcl_details?.eta ??
            job.sea_lcl_details?.eta ??
            job.land_details?.eta ??
            null,
          commodity: job.commodity,
          pieces: job.pieces,
          gross_weight: job.gross_weight,
          origin: originPort
            ? {
                name: originPort.name,
                code: originPort.un_locode,
                country_code: originPort.country_code,
              }
            : originAirport
              ? {
                  name: originAirport.name,
                  code: originAirport.iata_code,
                  country_code: originAirport.country_code,
                }
              : job.land_details?.origin_city_country
                ? {
                    name: job.land_details.origin_city_country,
                    code: null,
                    country_code: null,
                  }
                : job.courier_details?.pickup_address
                  ? {
                      name: job.courier_details.pickup_address,
                      code: null,
                      country_code: null,
                    }
                  : null,
          destination: destPort
            ? {
                name: destPort.name,
                code: destPort.un_locode,
                country_code: destPort.country_code,
              }
            : destAirport
              ? {
                  name: destAirport.name,
                  code: destAirport.iata_code,
                  country_code: destAirport.country_code,
                }
              : job.land_details?.destination_city_country
                ? {
                    name: job.land_details.destination_city_country,
                    code: null,
                    country_code: null,
                  }
                : job.courier_details?.delivery_address
                  ? {
                      name: job.courier_details.delivery_address,
                      code: null,
                      country_code: null,
                    }
                  : null,
          references: {
            hawb_number: job.air_details?.hawb_number ?? null,
            mawb_number: job.air_details?.mawb_number ?? null,
            hawb_number_from_origin:
              job.air_details?.hawb_number_from_origin_agent ?? null,
            mawb_number_from_origin:
              job.air_details?.mawb_number_from_origin ?? null,
            hbl_number:
              job.sea_fcl_details?.hbl_number ??
              job.sea_lcl_details?.hbl_number ??
              job.nvocc_details?.hbl_number ??
              null,
            mbl_number:
              job.sea_fcl_details?.mbl_number ??
              job.sea_lcl_details?.mbl_number ??
              job.nvocc_details?.mbl_number ??
              null,
            booking_number:
              job.sea_fcl_details?.booking_number ??
              job.sea_lcl_details?.booking_number ??
              null,
            carrier_booking_ref:
              job.sea_fcl_details?.carrier_booking_ref ??
              job.sea_lcl_details?.carrier_booking_ref ??
              job.nvocc_details?.carrier_booking_ref ??
              null,
            consolidation_number:
              job.sea_lcl_details?.consolidation_number ?? null,
            shipment_numbers: job.shipments.map((s) => s.shipment_number),
            container_numbers: job.containers_job
              .map((c) => c.container_number)
              .filter(Boolean),
            flight_number:
              job.air_details?.flight_number ??
              job.air_details?.arrival_flight_number ??
              null,
            actual_eta: job.air_details?.actual_eta ?? null,
            voyage_number:
              job.sea_fcl_details?.voyage_number ??
              job.sea_lcl_details?.voyage_number ??
              null,
            vessel_name: vessel?.name ?? null,
            vehicle_number:
              job.land_details?.vehicle_number ??
              job.road_freight_details?.vehicle_number ??
              null,
            driver_name: job.land_details?.driver_name ?? null,
            tracking_number: job.courier_details?.tracking_number ?? null,
            courier_service_type: job.courier_details?.service_type ?? null,
          },
          containers: job.containers_job.map((c) => ({
            container_number: c.container_number,
            status: c.status,
            seal_number: c.seal_number,
            kind: c.container_kind,
            gate_in_at: c.gate_in_at,
            returned_at: c.returned_at,
          })),
          linked_shipments: job.shipments.map((s) => ({
            shipment_number: s.shipment_number,
            status: s.status,
            hbl_number: s.hbl_number,
            mbl_number: s.mbl_number,
          })),
          /** @deprecated Prefer `history` — kept for embed/widget compatibility. */
          milestones,
          history,
        },
        public_url: publicTrackUrl(
          job.tracking_token ?? job.job_number,
          tenant.slug,
        ),
      },
    };
  }

  private buildHistory(
    job: {
      milestones: Array<{
        milestone: string;
        planned_date: Date | null;
        actual_date: Date | null;
      }>;
      courier_checkpoints: Array<{
        checkpoint: string;
        scanned_at: Date;
        location: string | null;
      }>;
    },
    containers: Array<{
      container_number: string | null;
      status: string;
      gate_in_at: Date | null;
      returned_at: Date | null;
    }>,
  ): TrackHistoryEvent[] {
    const events: TrackHistoryEvent[] = [];

    for (const m of job.milestones) {
      events.push({
        type: "MILESTONE",
        code: m.milestone,
        label: m.milestone.replace(/_/g, " "),
        planned_at: m.planned_date,
        actual_at: m.actual_date,
        is_completed: Boolean(m.actual_date),
      });
    }

    for (const cp of job.courier_checkpoints) {
      events.push({
        type: "COURIER_CHECKPOINT",
        code: cp.checkpoint,
        label: cp.checkpoint.replace(/_/g, " "),
        planned_at: null,
        actual_at: cp.scanned_at,
        is_completed: true,
        location: cp.location,
      });
    }

    for (const c of containers) {
      if (!c.container_number) continue;
      if (c.gate_in_at) {
        events.push({
          type: "CONTAINER",
          code: "GATE_IN",
          label: `Container ${c.container_number} gate in`,
          planned_at: null,
          actual_at: c.gate_in_at,
          is_completed: true,
          container_number: c.container_number,
        });
      }
      if (c.returned_at) {
        events.push({
          type: "CONTAINER",
          code: "RETURNED",
          label: `Container ${c.container_number} returned`,
          planned_at: null,
          actual_at: c.returned_at,
          is_completed: true,
          container_number: c.container_number,
        });
      }
      if (!c.gate_in_at && !c.returned_at) {
        events.push({
          type: "CONTAINER",
          code: c.status,
          label: `Container ${c.container_number} · ${c.status}`,
          planned_at: null,
          actual_at: null,
          is_completed: false,
          container_number: c.container_number,
        });
      }
    }

    return sortTrackHistory(events);
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
        primary_color: tenant.primary_color ?? "#0B3D5C",
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

    const color = (tenant.primary_color ?? "#0B3D5C").replace(/'/g, "");
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
  box.style.cssText='font-family:system-ui,sans-serif;max-width:480px;border:1px solid #ddd;padding:16px;border-radius:8px;';
  box.innerHTML='<div style="font-weight:600;color:'+COLOR+';margin-bottom:8px;">'+NAME+' Track & Trace</div>'+
    '<input id="kf-track-ref" placeholder="Job / shipment / BL / AWB / container" style="width:100%;padding:8px;margin-bottom:8px;box-sizing:border-box;"/>'+
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
        var hist=s.history||s.milestones||[];
        out.textContent=s.job_number+' · '+s.status+'\\n'+
          (s.origin&&s.origin.code?s.origin.code:'?')+' → '+(s.destination&&s.destination.code?s.destination.code:'?')+'\\n'+
          hist.map(function(m){
            var done=m.is_completed;
            var label=m.label||m.milestone||m.code||'';
            return (done?'✓ ':'○ ')+label;
          }).join('\\n');
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
