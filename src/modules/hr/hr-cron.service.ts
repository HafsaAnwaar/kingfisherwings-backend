import { Injectable, Logger } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationEmitterService } from "../notifications/notification-emitter.service";
import {
  alertBandForDays,
  formatDateOnly,
  isWeekend,
  toUtcDateOnly,
} from "./utils/hr-date.util";

type ExpiryTarget = {
  id: string;
  kind: "document" | "dependent_passport" | "dependent_visa";
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  label: string;
  expiresAt: Date;
  lastAlertBand: string | null;
};

@Injectable()
export class HrCronService {
  private readonly logger = new Logger(HrCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationEmitterService,
  ) {}

  async processDocumentExpiry(tenantId: string): Promise<number> {
    const today = toUtcDateOnly(new Date());
    const horizon = new Date(today);
    horizon.setUTCDate(horizon.getUTCDate() + 90);

    const targets: ExpiryTarget[] = [];

    const docs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEmployeeDocument.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          expires_at: { not: null, lte: horizon },
        },
        include: {
          employee: {
            select: {
              id: true,
              employee_code: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
    );

    for (const doc of docs) {
      if (!doc.expires_at) continue;
      targets.push({
        id: doc.id,
        kind: "document",
        employeeId: doc.employee_id,
        employeeName: `${doc.employee.first_name} ${doc.employee.last_name}`,
        employeeCode: doc.employee.employee_code,
        label: `${doc.document_type}${doc.document_no ? ` (${doc.document_no})` : ""}`,
        expiresAt: doc.expires_at,
        lastAlertBand: doc.last_alert_band,
      });
    }

    const deps = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEmployeeDependent.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { passport_expires_at: { not: null, lte: horizon } },
            { visa_expires_at: { not: null, lte: horizon } },
          ],
        },
        include: {
          employee: {
            select: {
              id: true,
              employee_code: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      }),
    );

    for (const dep of deps) {
      if (dep.passport_expires_at) {
        targets.push({
          id: dep.id,
          kind: "dependent_passport",
          employeeId: dep.employee_id,
          employeeName: `${dep.employee.first_name} ${dep.employee.last_name}`,
          employeeCode: dep.employee.employee_code,
          label: `Dependent passport — ${dep.full_name}`,
          expiresAt: dep.passport_expires_at,
          lastAlertBand: dep.last_alert_band,
        });
      }
      if (dep.visa_expires_at) {
        targets.push({
          id: dep.id,
          kind: "dependent_visa",
          employeeId: dep.employee_id,
          employeeName: `${dep.employee.first_name} ${dep.employee.last_name}`,
          employeeCode: dep.employee.employee_code,
          label: `Dependent visa — ${dep.full_name}`,
          expiresAt: dep.visa_expires_at,
          lastAlertBand: dep.last_alert_band,
        });
      }
    }

    let notified = 0;
    const roles: UserRole[] = ["TENANT_ADMIN", "HR_MANAGER"];

    for (const target of targets) {
      const days = Math.floor(
        (target.expiresAt.getTime() - today.getTime()) / 86_400_000,
      );
      const band = alertBandForDays(days);
      if (!band) continue;
      if (target.lastAlertBand === band) continue;

      await this.notifications.notifyStaffByRoles(tenantId, roles, {
        type: "DOCUMENT_EXPIRY",
        title: "Document expiry alert",
        message: `${target.label} for ${target.employeeName} (${target.employeeCode}) expires on ${formatDateOnly(target.expiresAt)} (${band}).`,
        entity_type: "hr_employee",
        entity_id: target.employeeId,
        link_path: `/hr/employees/${target.employeeId}`,
      });

      await this.markAlertBand(tenantId, target, band);
      notified += 1;
    }

    if (notified > 0) {
      this.logger.log(
        `Tenant ${tenantId}: ${notified} document expiry alert(s).`,
      );
    }

    return notified;
  }

  async processMissingTimesheets(tenantId: string): Promise<number> {
    const tenant = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.tenant.findFirst({
        where: { id: tenantId },
        select: { country_code: true },
      }),
    );
    const countryCode = tenant?.country_code ?? "AE";
    const workDate = this.previousWorkingDay(countryCode);

    const employees = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEmployee.findMany({
        where: { tenant_id: tenantId, deleted_at: null, status: "ACTIVE" },
        select: {
          id: true,
          employee_code: true,
          first_name: true,
          last_name: true,
          reporting_manager_id: true,
        },
      }),
    );

    const withTimesheet = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrTimesheet.findMany({
        where: { tenant_id: tenantId, deleted_at: null, work_date: workDate },
        select: { employee_id: true },
      }),
    );
    const tsSet = new Set(withTimesheet.map((t) => t.employee_id));
    const missing = employees.filter((e) => !tsSet.has(e.id));

    if (!missing.length) return 0;

    await this.notifications.notifyStaffByRoles(
      tenantId,
      ["HR_MANAGER", "BRANCH_MANAGER", "TENANT_ADMIN"],
      {
        type: "TIMESHEET_MISSING",
        title: "Missing timesheets",
        message: `${missing.length} active employee(s) have no timesheet for ${formatDateOnly(workDate)}.`,
        entity_type: "hr_timesheet",
        link_path: "/hr/timesheets/missing",
      },
    );

    this.logger.log(
      `Tenant ${tenantId}: TIMESHEET_MISSING for ${missing.length} employee(s) on ${formatDateOnly(workDate)}.`,
    );
    return missing.length;
  }

  private previousWorkingDay(countryCode: string): Date {
    const cursor = toUtcDateOnly(new Date());
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    for (let i = 0; i < 14; i += 1) {
      if (!isWeekend(cursor, countryCode)) return cursor;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return cursor;
  }

  private async markAlertBand(
    tenantId: string,
    target: ExpiryTarget,
    band: string,
  ) {
    const now = new Date();
    if (target.kind === "document") {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.hrEmployeeDocument.update({
          where: { id: target.id },
          data: { last_alert_band: band, last_alerted_at: now },
        }),
      );
      return;
    }

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEmployeeDependent.update({
        where: { id: target.id },
        data: { last_alert_band: band, last_alerted_at: now },
      }),
    );
  }
}
