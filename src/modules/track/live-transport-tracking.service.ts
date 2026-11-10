import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type LiveTrackKind = "flight" | "vessel";

export type LiveTrackLink = { label: string; url: string };

export type LiveTrackResult = {
  kind: LiveTrackKind;
  query: string;
  provider: string;
  status: "OK" | "NOT_FOUND" | "CONFIG_REQUIRED" | "ERROR";
  summary: string | null;
  /** Normalized live snapshot for UI cards / maps. */
  data: Record<string, unknown> | null;
  external_links: LiveTrackLink[];
  fetched_at: string;
};

/**
 * Live vessel + flight lookup (Google-style card data).
 *
 * Providers (optional env):
 * - Flights: AVIATIONSTACK_API_KEY (preferred) or OpenSky (no key, best-effort)
 * - Vessels: VESSELFINDER_API_KEY (optional). Without a key, returns rich
 *   external search links + structured stub from the query string.
 */
@Injectable()
export class LiveTransportTrackingService {
  private readonly logger = new Logger(LiveTransportTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async forJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_type: true,
          vessel_name: true,
          voyage_number: true,
          air_details: {
            select: {
              flight_number: true,
              arrival_flight_number: true,
            },
          },
          sea_fcl_details: {
            select: { vessel_id: true, voyage_number: true },
          },
          sea_lcl_details: {
            select: { vessel_id: true, voyage_number: true },
          },
        },
      }),
    );
    if (!job) throw new NotFoundException("Job not found.");

    const sea = job.sea_fcl_details ?? job.sea_lcl_details;
    const vesselId = sea?.vessel_id ?? null;
    let vesselImo: string | null = null;
    let vesselMasterName: string | null = null;
    if (vesselId) {
      const vessel = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.vessel.findFirst({
          where: { id: vesselId, tenant_id: tenantId, deleted_at: null },
          select: { imo_number: true, name: true },
        }),
      );
      vesselImo = vessel?.imo_number?.trim() || null;
      vesselMasterName = vessel?.name?.trim() || null;
    }

    const live = await this.lookupForJob({
      job_type: job.job_type,
      flight_number: job.air_details?.flight_number,
      arrival_flight_number: job.air_details?.arrival_flight_number,
      vessel_name: job.vessel_name ?? vesselMasterName,
      vessel_imo: vesselImo,
      voyage_number: job.voyage_number ?? sea?.voyage_number ?? null,
    });
    return {
      success: true,
      data: {
        job_id: job.id,
        job_type: job.job_type,
        ...live,
      },
    };
  }

  async forShipment(tenantId: string, shipmentId: string) {
    const shipment = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.shipment.findFirst({
        where: { id: shipmentId, tenant_id: tenantId, deleted_at: null },
        select: {
          id: true,
          job_type: true,
          vessel_name: true,
          voyage_number: true,
          flight_number: true,
          job_id: true,
        },
      }),
    );
    if (!shipment) throw new NotFoundException("Shipment not found.");
    let flight = shipment.flight_number;
    let arrival: string | null = null;
    if (shipment.job_id) {
      const air = await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.airJobDetail.findFirst({
          where: { job_id: shipment.job_id!, tenant_id: tenantId },
          select: { flight_number: true, arrival_flight_number: true },
        }),
      );
      flight = flight ?? air?.flight_number ?? null;
      arrival = air?.arrival_flight_number ?? null;
    }
    const live = await this.lookupForJob({
      job_type: shipment.job_type,
      flight_number: flight,
      arrival_flight_number: arrival,
      vessel_name: shipment.vessel_name,
      voyage_number: shipment.voyage_number,
    });
    return {
      success: true,
      data: {
        shipment_id: shipment.id,
        job_type: shipment.job_type,
        ...live,
      },
    };
  }

  async lookupFlight(query: string): Promise<LiveTrackResult> {
    const q = query.trim().toUpperCase().replace(/\s+/g, "");
    const links = this.flightLinks(q);
    if (!q) {
      return this.empty("flight", query, "CONFIG_REQUIRED", "Flight number required.", links);
    }

    const aviationKey = process.env.AVIATIONSTACK_API_KEY?.trim();
    if (aviationKey) {
      try {
        const data = await this.aviationStackFlight(q, aviationKey);
        if (data) {
          return {
            kind: "flight",
            query: q,
            provider: "aviationstack",
            status: "OK",
            summary: data.summary as string,
            data,
            external_links: links,
            fetched_at: new Date().toISOString(),
          };
        }
        return this.empty("flight", q, "NOT_FOUND", `No live data for ${q}.`, links, "aviationstack");
      } catch (err) {
        this.logger.warn(`AviationStack failed for ${q}: ${String(err)}`);
      }
    }

    try {
      const opensky = await this.openSkyFlight(q);
      if (opensky) {
        return {
          kind: "flight",
          query: q,
          provider: "opensky",
          status: "OK",
          summary: opensky.summary as string,
          data: opensky,
          external_links: links,
          fetched_at: new Date().toISOString(),
        };
      }
    } catch (err) {
      this.logger.warn(`OpenSky failed for ${q}: ${String(err)}`);
    }

    return {
      kind: "flight",
      query: q,
      provider: aviationKey ? "aviationstack" : "opensky",
      status: aviationKey ? "NOT_FOUND" : "CONFIG_REQUIRED",
      summary: aviationKey
        ? `No live position for ${q}.`
        : `Set AVIATIONSTACK_API_KEY for full flight cards, or open an external tracker.`,
      data: {
        flight_number: q,
        callsign: q,
      },
      external_links: links,
      fetched_at: new Date().toISOString(),
    };
  }

  async lookupVessel(query: string): Promise<LiveTrackResult> {
    const q = query.trim();
    const links = this.vesselLinks(q);
    if (!q) {
      return this.empty("vessel", query, "CONFIG_REQUIRED", "Vessel name or IMO required.", links);
    }

    const vfKey = process.env.VESSELFINDER_API_KEY?.trim();
    if (vfKey) {
      try {
        const data = await this.vesselFinder(q, vfKey);
        if (data) {
          return {
            kind: "vessel",
            query: q,
            provider: "vesselfinder",
            status: "OK",
            summary: data.summary as string,
            data,
            external_links: links,
            fetched_at: new Date().toISOString(),
          };
        }
        return this.empty("vessel", q, "NOT_FOUND", `No live AIS for ${q}.`, links, "vesselfinder");
      } catch (err) {
        this.logger.warn(`VesselFinder failed for ${q}: ${String(err)}`);
      }
    }

    const imo = /^\d{7}$/.test(q.replace(/\s/g, ""))
      ? q.replace(/\s/g, "")
      : null;

    return {
      kind: "vessel",
      query: q,
      provider: vfKey ? "vesselfinder" : "external",
      status: vfKey ? "NOT_FOUND" : "CONFIG_REQUIRED",
      summary: vfKey
        ? `No live AIS match for ${q}.`
        : `Set VESSELFINDER_API_KEY for live AIS positions, or open MarineTraffic / VesselFinder.`,
      data: {
        vessel_name: q,
        imo,
        mmsi: null,
        latitude: null,
        longitude: null,
        speed_knots: null,
        course_deg: null,
        destination: null,
        eta: null,
        status: null,
      },
      external_links: links,
      fetched_at: new Date().toISOString(),
    };
  }

  async lookupForJob(input: {
    job_type?: string | null;
    flight_number?: string | null;
    arrival_flight_number?: string | null;
    vessel_name?: string | null;
    /** Prefer IMO when linked from sea job vessel master. */
    vessel_imo?: string | null;
    voyage_number?: string | null;
  }): Promise<{
    flight: LiveTrackResult | null;
    vessel: LiveTrackResult | null;
    path_hints: Record<string, string>;
  }> {
    const isAir =
      input.job_type === "AIR_EXPORT" || input.job_type === "AIR_IMPORT";
    const flightQ =
      input.flight_number?.trim() ||
      input.arrival_flight_number?.trim() ||
      null;
    const vesselQ =
      input.vessel_imo?.trim() || input.vessel_name?.trim() || null;

    const [flight, vessel] = await Promise.all([
      isAir && flightQ ? this.lookupFlight(flightQ) : Promise.resolve(null),
      !isAir && vesselQ ? this.lookupVessel(vesselQ) : Promise.resolve(null),
    ]);

    return {
      flight,
      vessel,
      path_hints: {
        flight_lookup: "/track/live/flight?q=",
        vessel_lookup: "/track/live/vessel?q=",
      },
    };
  }

  private empty(
    kind: LiveTrackKind,
    query: string,
    status: LiveTrackResult["status"],
    summary: string,
    links: LiveTrackLink[],
    provider = "none",
  ): LiveTrackResult {
    return {
      kind,
      query,
      provider,
      status,
      summary,
      data: null,
      external_links: links,
      fetched_at: new Date().toISOString(),
    };
  }

  private flightLinks(q: string): LiveTrackLink[] {
    const enc = encodeURIComponent(q);
    return [
      {
        label: "Google",
        url: `https://www.google.com/search?q=${enc}+flight+status`,
      },
      {
        label: "FlightAware",
        url: `https://www.flightaware.com/live/flight/${enc}`,
      },
      {
        label: "Flightradar24",
        url: `https://www.flightradar24.com/data/flights/${enc.toLowerCase()}`,
      },
    ];
  }

  private vesselLinks(q: string): LiveTrackLink[] {
    const enc = encodeURIComponent(q);
    return [
      {
        label: "Google",
        url: `https://www.google.com/search?q=${enc}+vessel+tracking+AIS`,
      },
      {
        label: "MarineTraffic",
        url: `https://www.marinetraffic.com/en/ais/index/search/all?keyword=${enc}`,
      },
      {
        label: "VesselFinder",
        url: `https://www.vesselfinder.com/vessels?name=${enc}`,
      },
    ];
  }

  private async aviationStackFlight(
    flightIata: string,
    apiKey: string,
  ): Promise<Record<string, unknown> | null> {
    const url = new URL("http://api.aviationstack.com/v1/flights");
    url.searchParams.set("access_key", apiKey);
    url.searchParams.set("flight_iata", flightIata);
    url.searchParams.set("limit", "1");
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as {
      data?: Array<Record<string, any>>;
    };
    const row = json.data?.[0];
    if (!row) return null;
    const dep = row.departure ?? {};
    const arr = row.arrival ?? {};
    const live = row.live ?? {};
    const airline = row.airline?.name ?? null;
    const status = row.flight_status ?? null;
    return {
      flight_number: row.flight?.iata ?? flightIata,
      callsign: row.flight?.icao ?? null,
      airline_name: airline,
      status,
      departure_airport: dep.airport ?? dep.iata ?? null,
      departure_scheduled: dep.scheduled ?? null,
      departure_estimated: dep.estimated ?? null,
      departure_actual: dep.actual ?? null,
      arrival_airport: arr.airport ?? arr.iata ?? null,
      arrival_scheduled: arr.scheduled ?? null,
      arrival_estimated: arr.estimated ?? null,
      arrival_actual: arr.actual ?? null,
      latitude: live.latitude ?? null,
      longitude: live.longitude ?? null,
      altitude_m: live.altitude ?? null,
      speed_kph: live.speed_horizontal ?? null,
      direction_deg: live.direction ?? null,
      is_ground: live.is_ground ?? null,
      summary: [
        airline,
        row.flight?.iata ?? flightIata,
        status,
        dep.iata && arr.iata ? `${dep.iata} → ${arr.iata}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    };
  }

  private async openSkyFlight(
    callsign: string,
  ): Promise<Record<string, unknown> | null> {
    // OpenSky states: [icao24, callsign, origin_country, time_position, last_contact,
    // longitude, latitude, baro_altitude, on_ground, velocity, true_track, ...]
    const url = "https://opensky-network.org/api/states/all";
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { states?: unknown[][] };
    const needle = callsign.replace(/\s+/g, "").toUpperCase();
    const match = (json.states ?? []).find((s) => {
      const cs = String(s[1] ?? "")
        .replace(/\s+/g, "")
        .toUpperCase();
      return cs === needle || cs.startsWith(needle) || needle.startsWith(cs);
    });
    if (!match) return null;
    const lat = match[6] as number | null;
    const lon = match[5] as number | null;
    const alt = match[7] as number | null;
    const onGround = match[8] as boolean | null;
    const velocity = match[9] as number | null;
    const track = match[10] as number | null;
    const country = match[2] as string | null;
    return {
      flight_number: callsign,
      callsign: String(match[1] ?? callsign).trim(),
      icao24: match[0] ?? null,
      origin_country: country,
      latitude: lat,
      longitude: lon,
      altitude_m: alt,
      speed_mps: velocity,
      direction_deg: track,
      is_ground: onGround,
      summary: [
        callsign,
        country,
        onGround ? "On ground" : "Airborne",
        lat != null && lon != null ? `${lat.toFixed(3)}, ${lon.toFixed(3)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    };
  }

  private async vesselFinder(
    query: string,
    apiKey: string,
  ): Promise<Record<string, unknown> | null> {
    // VesselFinder user API — userkey + imo or name search.
    const imo = /^\d{7}$/.test(query.replace(/\s/g, ""))
      ? query.replace(/\s/g, "")
      : null;
    const url = new URL("https://api.vesselfinder.com/vessels");
    url.searchParams.set("userkey", apiKey);
    if (imo) url.searchParams.set("imo", imo);
    else url.searchParams.set("name", query);
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as unknown;
    const row = Array.isArray(json)
      ? (json[0] as Record<string, any> | undefined)
      : (json as Record<string, any>);
    if (!row || (!row.AIS && !row.name && !row.IMO)) return null;
    const ais = row.AIS ?? row;
    const name = ais.NAME ?? ais.name ?? row.name ?? query;
    const lat = ais.LATITUDE ?? ais.lat ?? null;
    const lon = ais.LONGITUDE ?? ais.lon ?? null;
    return {
      vessel_name: name,
      imo: ais.IMO ?? ais.imo ?? imo,
      mmsi: ais.MMSI ?? ais.mmsi ?? null,
      latitude: lat,
      longitude: lon,
      speed_knots: ais.SPEED ?? ais.speed ?? null,
      course_deg: ais.COURSE ?? ais.course ?? null,
      destination: ais.DESTINATION ?? ais.destination ?? null,
      eta: ais.ETA ?? ais.eta ?? null,
      status: ais.NAVSTAT_TEXT ?? ais.status ?? null,
      summary: [
        name,
        ais.IMO ? `IMO ${ais.IMO}` : null,
        ais.DESTINATION ? `→ ${ais.DESTINATION}` : null,
        lat != null && lon != null
          ? `${Number(lat).toFixed(3)}, ${Number(lon).toFixed(3)}`
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
    };
  }
}
