/**
 * Online payment (Stripe) permissions. Classic ERP receipts/payments stay
 * under gl.manage_payments; proof review stays under
 * invoices.review_payment_proofs — these cover only what is new.
 */
export const PAYMENTS_PERMISSION_CONSTANTS = {
  MODULE: "payments",
  ACTIONS: {
    VIEW: "view",
    /** Create checkout sessions / payment links for invoices. */
    COLLECT: "collect",
    REFUND: "refund",
    /** Configure the tenant's Stripe account. */
    MANAGE_GATEWAY: "manage_gateway",
  },
} as const;

export const PAYMENTS_PERMISSIONS = {
  VIEW: `${PAYMENTS_PERMISSION_CONSTANTS.MODULE}.${PAYMENTS_PERMISSION_CONSTANTS.ACTIONS.VIEW}`,
  COLLECT: `${PAYMENTS_PERMISSION_CONSTANTS.MODULE}.${PAYMENTS_PERMISSION_CONSTANTS.ACTIONS.COLLECT}`,
  REFUND: `${PAYMENTS_PERMISSION_CONSTANTS.MODULE}.${PAYMENTS_PERMISSION_CONSTANTS.ACTIONS.REFUND}`,
  MANAGE_GATEWAY: `${PAYMENTS_PERMISSION_CONSTANTS.MODULE}.${PAYMENTS_PERMISSION_CONSTANTS.ACTIONS.MANAGE_GATEWAY}`,
} as const;

/** Tenant-side view of Super Admin platform billing (fees owed to the platform). */
export const PLATFORM_BILLING_PERMISSION_CONSTANTS = {
  MODULE: "platform_billing",
  ACTIONS: {
    VIEW: "view",
    PAY: "pay",
  },
} as const;

export const PLATFORM_BILLING_PERMISSIONS = {
  VIEW: `${PLATFORM_BILLING_PERMISSION_CONSTANTS.MODULE}.${PLATFORM_BILLING_PERMISSION_CONSTANTS.ACTIONS.VIEW}`,
  PAY: `${PLATFORM_BILLING_PERMISSION_CONSTANTS.MODULE}.${PLATFORM_BILLING_PERMISSION_CONSTANTS.ACTIONS.PAY}`,
} as const;
