import { UserRole } from "@prisma/client";

export type WorkflowDept =
  | "CS"
  | "SALES"
  | "OPS"
  | "DOCS"
  | "ACCOUNTS"
  | "MGMT"
  | "CUSTOMER"
  | "ADMIN";

const ROLE_DEPTS: Partial<Record<UserRole, WorkflowDept[]>> = {
  TENANT_ADMIN: ["ADMIN", "CS", "SALES", "OPS", "DOCS", "ACCOUNTS", "MGMT"],
  BRANCH_MANAGER: ["ADMIN", "CS", "SALES", "OPS", "DOCS", "ACCOUNTS", "MGMT"],
  CUSTOMER_SUPPORT: ["CS"],
  SALES_MANAGER: ["SALES"],
  SALES_EXECUTIVE: ["SALES"],
  OPERATIONS_MANAGER: ["OPS"],
  OPERATIONS_EXECUTIVE: ["OPS"],
  DOCUMENTATION: ["DOCS"],
  FINANCE_MANAGER: ["ACCOUNTS", "MGMT"],
  ACCOUNTANT: ["ACCOUNTS"],
};

export function departmentsForRole(role: UserRole): WorkflowDept[] {
  return ROLE_DEPTS[role] ?? [];
}
