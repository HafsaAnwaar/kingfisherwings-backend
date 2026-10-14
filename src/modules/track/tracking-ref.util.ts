import { Prisma } from "@prisma/client";

/**
 * Public / portal track-and-trace ref matchers (exact, case-insensitive).
 * Intentionally excludes staff-only barcodes.
 */
export function jobTrackRefOrClauses(q: string): Prisma.JobWhereInput[] {
  const eq = { equals: q, mode: "insensitive" as const };
  const containerSome = {
    some: {
      deleted_at: null,
      container_number: eq,
    },
  };

  return [
    { tracking_token: q },
    { job_number: eq },
    { air_details: { hawb_number: eq } },
    { air_details: { mawb_number: eq } },
    {
      air_details: {
        hawb_number_from_origin_agent: eq,
      },
    },
    { air_details: { mawb_number_from_origin: eq } },
    { sea_fcl_details: { hbl_number: eq } },
    { sea_fcl_details: { mbl_number: eq } },
    { sea_fcl_details: { booking_number: eq } },
    { sea_fcl_details: { carrier_booking_ref: eq } },
    { sea_fcl_details: { mbl_number_from_line: eq } },
    { sea_fcl_details: { hbl_number_from_agent: eq } },
    { sea_lcl_details: { hbl_number: eq } },
    { sea_lcl_details: { mbl_number: eq } },
    { sea_lcl_details: { booking_number: eq } },
    { sea_lcl_details: { carrier_booking_ref: eq } },
    { sea_lcl_details: { mbl_number_from_line: eq } },
    { sea_lcl_details: { hbl_number_from_agent: eq } },
    { sea_lcl_details: { consolidation_number: eq } },
    { nvocc_details: { hbl_number: eq } },
    { nvocc_details: { mbl_number: eq } },
    { nvocc_details: { carrier_booking_ref: eq } },
    { land_details: { vehicle_number: eq } },
    { road_freight_details: { vehicle_number: eq } },
    { courier_details: { tracking_number: eq } },
    // All-mode job containers (preferred over sea_fcl nested only).
    { containers_job: containerSome },
    // Legacy sea FCL nested relation (same JobContainer rows when linked).
    { sea_fcl_details: { containers: containerSome } },
    {
      shipments: {
        some: {
          deleted_at: null,
          OR: [
            { shipment_number: eq },
            { hbl_number: eq },
            { mbl_number: eq },
            { container_numbers: { contains: q, mode: "insensitive" } },
            {
              container_actuals: {
                some: {
                  deleted_at: null,
                  container_number: eq,
                },
              },
            },
            {
              job_containers: {
                some: {
                  deleted_at: null,
                  container_number: eq,
                },
              },
            },
          ],
        },
      },
    },
  ];
}

/** Portal shipment lookup (ownership applied by caller). */
export function shipmentTrackRefOrClauses(q: string): Prisma.ShipmentWhereInput[] {
  const eq = { equals: q, mode: "insensitive" as const };
  return [
    { shipment_number: eq },
    { hbl_number: eq },
    { mbl_number: eq },
    { container_numbers: { contains: q, mode: "insensitive" } },
    {
      container_actuals: {
        some: { deleted_at: null, container_number: eq },
      },
    },
    {
      job_containers: {
        some: { deleted_at: null, container_number: eq },
      },
    },
    {
      job: {
        is: {
          deleted_at: null,
          OR: jobTrackRefOrClauses(q),
        },
      },
    },
  ];
}

/** Canonical public track URL (query form). Path `/track/:ref` is also accepted. */
export function publicTrackUrl(ref: string, tenantSlug?: string | null): string {
  const params = new URLSearchParams({ ref });
  if (tenantSlug) params.set("tenant_slug", tenantSlug);
  return `/track?${params.toString()}`;
}

export type TrackHistoryEvent = {
  type: "MILESTONE" | "COURIER_CHECKPOINT" | "CONTAINER";
  code: string;
  label: string;
  planned_at: Date | null;
  actual_at: Date | null;
  is_completed: boolean;
  location?: string | null;
  container_number?: string | null;
  notes?: string | null;
};

export function sortTrackHistory(
  events: TrackHistoryEvent[],
): TrackHistoryEvent[] {
  return [...events].sort((a, b) => {
    const ta = (a.actual_at ?? a.planned_at)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const tb = (b.actual_at ?? b.planned_at)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (ta !== tb) return ta - tb;
    return a.label.localeCompare(b.label);
  });
}
