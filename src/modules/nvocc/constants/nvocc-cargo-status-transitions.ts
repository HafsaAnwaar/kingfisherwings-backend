import { NvoccLoadListCargoStatus } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";

const TRANSITIONS: Record<
  NvoccLoadListCargoStatus,
  NvoccLoadListCargoStatus[]
> = {
  PENDING: ["RECEIVED_AT_CFS"],
  RECEIVED_AT_CFS: ["STUFFED"],
  STUFFED: ["LOADED_ON_VESSEL"],
  LOADED_ON_VESSEL: ["MANIFESTED"],
  MANIFESTED: [],
};

export function assertCargoStatusTransition(
  current: NvoccLoadListCargoStatus,
  next: NvoccLoadListCargoStatus,
): void {
  if (current === next) return;
  const allowed = TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new BadRequestException(
      `Invalid cargo status transition from ${current} to ${next}.`,
    );
  }
}
