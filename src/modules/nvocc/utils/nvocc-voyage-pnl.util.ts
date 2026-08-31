import { Prisma } from '@prisma/client';

type BookingWithCharges = {
  id: string;
  booking_number: string;
  nvocc_hbl_number: string | null;
  converted_job_id: string | null;
  cargo_type: string;
  container_count: number | null;
  cbm_allocated: Prisma.Decimal | null;
  charges: Array<{
    amount: Prisma.Decimal;
    is_cost: boolean;
    currency_code: string;
  }>;
};

type JobWithCharges = {
  id: string;
  job_number: string;
  revenue_total: Prisma.Decimal;
  cost_total: Prisma.Decimal;
  gp_amount: Prisma.Decimal;
  gp_percent: Prisma.Decimal;
  charges: Array<{
    description: string;
    amount_base_currency: Prisma.Decimal;
    is_cost: boolean;
    is_provisional: boolean;
  }>;
};

export function sumBookingCharges(bookings: BookingWithCharges[]) {
  let revenue = 0;
  let cost = 0;
  for (const b of bookings) {
    for (const c of b.charges) {
      const amt = Number(c.amount);
      if (c.is_cost) cost += amt;
      else revenue += amt;
    }
  }
  return { revenue, cost };
}

export function sumJobCharges(jobs: JobWithCharges[]) {
  let revenue = 0;
  let cost = 0;
  for (const j of jobs) {
    for (const c of j.charges) {
      if (c.is_provisional) continue;
      const amt = Number(c.amount_base_currency);
      if (c.is_cost) cost += amt;
      else revenue += amt;
    }
  }
  return { revenue, cost };
}

export function buildVoyagePnlResponse(
  voyage: {
    id: string;
    voyage_number: string;
    voyage_status: string;
    slot_allocation_containers: number;
    fcl_booked_containers: number;
    lcl_capacity_cbm: Prisma.Decimal | null;
    lcl_booked_cbm: Prisma.Decimal;
    carrier_cost: Prisma.Decimal | null;
    etd: Date | null;
    eta: Date | null;
  },
  bookings: BookingWithCharges[],
  jobs: JobWithCharges[],
) {
  const bookingTotals = sumBookingCharges(bookings);
  const jobTotals = sumJobCharges(jobs);
  const carrierCost = voyage.carrier_cost ? Number(voyage.carrier_cost) : 0;

  const revenue = bookingTotals.revenue + jobTotals.revenue;
  const cost = bookingTotals.cost + jobTotals.cost + carrierCost;
  const gp = revenue - cost;
  const gpPercent = revenue > 0 ? (gp / revenue) * 100 : 0;

  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const bookingRows = bookings.map((b) => {
    const job = b.converted_job_id ? jobMap.get(b.converted_job_id) : undefined;
    const bRev = b.charges.filter((c) => !c.is_cost).reduce((s, c) => s + Number(c.amount), 0);
    const bCost = b.charges.filter((c) => c.is_cost).reduce((s, c) => s + Number(c.amount), 0);
    const jRev = job
      ? job.charges.filter((c) => !c.is_cost && !c.is_provisional).reduce((s, c) => s + Number(c.amount_base_currency), 0)
      : 0;
    const jCost = job
      ? job.charges.filter((c) => c.is_cost && !c.is_provisional).reduce((s, c) => s + Number(c.amount_base_currency), 0)
      : 0;
    const rowRev = bRev + jRev;
    const rowCost = bCost + jCost;
    return {
      booking_id: b.id,
      booking_number: b.booking_number,
      hbl_number: b.nvocc_hbl_number,
      job_id: job?.id,
      job_number: job?.job_number,
      cargo_type: b.cargo_type,
      container_count: b.container_count,
      cbm_allocated: b.cbm_allocated ? Number(b.cbm_allocated) : null,
      revenue: Number(rowRev.toFixed(4)),
      cost: Number(rowCost.toFixed(4)),
      gp: Number((rowRev - rowCost).toFixed(4)),
    };
  });

  const lclCapacity = voyage.lcl_capacity_cbm ? Number(voyage.lcl_capacity_cbm) : null;
  const lclBooked = Number(voyage.lcl_booked_cbm);
  const fclSlots = voyage.slot_allocation_containers;
  const fclBooked = voyage.fcl_booked_containers;

  return {
    voyage_id: voyage.id,
    voyage_number: voyage.voyage_number,
    voyage_status: voyage.voyage_status,
    etd: voyage.etd,
    eta: voyage.eta,
    totals: {
      revenue: Number(revenue.toFixed(4)),
      cost: Number(cost.toFixed(4)),
      carrier_cost: carrierCost,
      gp: Number(gp.toFixed(4)),
      gp_percent: Number(gpPercent.toFixed(2)),
    },
    capacity: {
      fcl_slots_allocated: fclSlots,
      fcl_slots_booked: fclBooked,
      fcl_utilization_percent: fclSlots > 0 ? Number(((fclBooked / fclSlots) * 100).toFixed(1)) : null,
      lcl_capacity_cbm: lclCapacity,
      lcl_booked_cbm: lclBooked,
      lcl_utilization_percent:
        lclCapacity && lclCapacity > 0 ? Number(((lclBooked / lclCapacity) * 100).toFixed(1)) : null,
    },
    bookings: bookingRows,
    booking_count: bookings.length,
    job_count: jobs.length,
  };
}
