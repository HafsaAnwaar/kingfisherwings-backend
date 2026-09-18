import { UserRole } from "@prisma/client";
import type { WorkflowDept } from "../../../common/workflow/workflow-dept";
import { departmentsForRole } from "../../../common/workflow/workflow-dept";

export type NvoccWorkflowDept = WorkflowDept;

/** Ordered stages for NVOCC sea export workflow. */
export const NVOCC_WORKFLOW_STAGE_ORDER = [
  "QUOTE_REQUESTED",
  "CS_TRIAGED",
  "QUOTE_SENT",
  "CUSTOMER_ACCEPTED",
  "BOOKING_FORM_COMPLETE",
  "INVOICE_SENT",
  "CRO_ISSUED",
  "CONTAINER_ALLOCATED",
  "PICKED",
  "LOADING",
  "PORT_TOKEN",
  "DRAFT_BL_ISSUED",
  "PAYMENT_RECEIVED",
  "ORIGINAL_BL_ISSUED",
  "CLOSED",
] as const;

export type NvoccWorkflowStageCode = (typeof NVOCC_WORKFLOW_STAGE_ORDER)[number];

/** Which department owns entering each stage. */
export const NVOCC_STAGE_OWNER: Record<NvoccWorkflowStageCode, NvoccWorkflowDept> =
  {
    QUOTE_REQUESTED: "CUSTOMER",
    CS_TRIAGED: "CS",
    QUOTE_SENT: "SALES",
    CUSTOMER_ACCEPTED: "CUSTOMER",
    BOOKING_FORM_COMPLETE: "CUSTOMER",
    INVOICE_SENT: "SALES",
    CRO_ISSUED: "CS",
    CONTAINER_ALLOCATED: "OPS",
    PICKED: "CUSTOMER",
    LOADING: "OPS",
    PORT_TOKEN: "CUSTOMER",
    DRAFT_BL_ISSUED: "DOCS",
    PAYMENT_RECEIVED: "ACCOUNTS",
    ORIGINAL_BL_ISSUED: "DOCS",
    CLOSED: "MGMT",
  };

export { departmentsForRole };

export function stageIndex(stage: string): number {
  return NVOCC_WORKFLOW_STAGE_ORDER.indexOf(stage as NvoccWorkflowStageCode);
}

export function isNvoccParallel(current: string, target: string): boolean {
  const parallelAfterInvoice =
    current === "INVOICE_SENT" &&
    (target === "CRO_ISSUED" || target === "CONTAINER_ALLOCATED");
  const afterCroOrAlloc =
    (current === "CRO_ISSUED" || current === "CONTAINER_ALLOCATED") &&
    (target === "CRO_ISSUED" ||
      target === "CONTAINER_ALLOCATED" ||
      target === "PICKED");
  return parallelAfterInvoice || afterCroOrAlloc;
}

/** @deprecated kept for any external imports of ROLE map type */
export type { UserRole };
