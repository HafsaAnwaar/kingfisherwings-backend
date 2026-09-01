import { Injectable, NotFoundException } from "@nestjs/common";
import { HrLetterType, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PdfService } from "../../shared/pdf/pdf.service";
import { StorageService } from "../../shared/storage/storage.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import { GenerateLetterDto } from "./dto/hr-letter.dto";
import { formatDateOnly } from "./utils/hr-date.util";

const LETTER_TITLES: Record<HrLetterType, string> = {
  APPOINTMENT: "Appointment Letter",
  CONFIRMATION: "Confirmation Letter",
  SALARY_REVISION: "Salary Revision Letter",
  WARNING: "Warning Letter",
  EXPERIENCE: "Experience Certificate",
  EMPLOYMENT_CERT: "Employment Certificate",
  NOC: "No Objection Certificate",
  RESIGNATION_ACCEPTANCE: "Resignation Acceptance Letter",
  END_OF_SERVICE: "End of Service Letter",
  REFERENCE: "Reference Letter",
};

@Injectable()
export class HrLettersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: PdfService,
    private readonly storage: StorageService,
  ) {}

  async list(user: CurrentUser, employeeId?: string) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLetter.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(employeeId ? { employee_id: employeeId } : {}),
        },
        orderBy: { created_at: "desc" },
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
    return { success: true, data };
  }

  async findOne(user: CurrentUser, id: string) {
    const letter = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLetter.findFirst({
        where: { id, tenant_id: user.tenantId, deleted_at: null },
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
    if (!letter) throw new NotFoundException("HR letter not found.");
    return { success: true, data: letter };
  }

  async generate(user: CurrentUser, dto: GenerateLetterDto) {
    const employee = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findFirst({
        where: {
          id: dto.employee_id,
          tenant_id: user.tenantId,
          deleted_at: null,
        },
        include: {
          department: { select: { name: true } },
          designation: { select: { name: true } },
          company: { select: { name: true, legal_name: true } },
        },
      }),
    );
    if (!employee) throw new NotFoundException("Employee not found.");

    const payload = {
      ...(dto.payload ?? {}),
      generated_at: new Date().toISOString(),
      employee_code: employee.employee_code,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      department: employee.department?.name,
      designation: employee.designation?.name,
      company: employee.company?.legal_name ?? employee.company?.name,
      joining_date: formatDateOnly(employee.joining_date),
    };

    const html = this.buildLetterHtml(dto.letter_type, employee, payload);
    const buffer = await this.pdf.renderHtmlToPdf(html);
    const stored = await this.storage.saveBuffer(
      user.tenantId,
      buffer,
      `letter-${dto.letter_type.toLowerCase()}-${employee.employee_code}-${Date.now()}.pdf`,
    );

    const letter = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrLetter.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: dto.employee_id,
          letter_type: dto.letter_type,
          status: "GENERATED",
          payload: payload as Prisma.InputJsonValue,
          pdf_path: stored.s3Key,
          created_by: user.id,
        },
      }),
    );

    return {
      success: true,
      data: { ...letter, pdf_url: stored.fileUrl },
    };
  }

  private buildLetterHtml(
    type: HrLetterType,
    employee: {
      first_name: string;
      last_name: string;
      employee_code: string;
      joining_date: Date;
      basic_salary: Prisma.Decimal;
      company?: { name: string; legal_name: string | null } | null;
      department?: { name: string } | null;
      designation?: { name: string } | null;
    },
    payload: Record<string, unknown>,
  ): string {
    const title = LETTER_TITLES[type];
    const companyName =
      employee.company?.legal_name ?? employee.company?.name ?? "Company";
    const body = this.letterBody(type, employee, payload);

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:Georgia,serif;padding:48px;line-height:1.6;color:#222}
.header{text-align:center;margin-bottom:32px}h1{font-size:22px;margin:0}
.meta{margin:24px 0}.signature{margin-top:48px}</style></head><body>
<div class="header"><h1>${companyName}</h1><p>${title}</p></div>
<div class="meta">
<p>Date: ${formatDateOnly(new Date())}</p>
<p>To: ${employee.first_name} ${employee.last_name} (${employee.employee_code})</p>
${employee.designation?.name ? `<p>Designation: ${employee.designation.name}</p>` : ""}
${employee.department?.name ? `<p>Department: ${employee.department.name}</p>` : ""}
</div>
<div class="content">${body}</div>
<div class="signature"><p>Authorized Signatory<br/>Human Resources</p></div>
</body></html>`;
  }

  private letterBody(
    type: HrLetterType,
    employee: {
      first_name: string;
      last_name: string;
      joining_date: Date;
      basic_salary: Prisma.Decimal;
    },
    payload: Record<string, unknown>,
  ): string {
    const name = `${employee.first_name} ${employee.last_name}`;
    const join = formatDateOnly(employee.joining_date);
    const salary = Number(employee.basic_salary).toFixed(2);
    const extra = payload.remarks ? `<p>${String(payload.remarks)}</p>` : "";

    switch (type) {
      case "APPOINTMENT":
        return `<p>Dear ${name},</p><p>We are pleased to appoint you effective ${join}. Your basic salary will be AED ${salary} per month, subject to company policies.</p>${extra}`;
      case "CONFIRMATION":
        return `<p>Dear ${name},</p><p>Following successful completion of your probation period, we confirm your employment with effect from ${payload.effective_date ?? formatDateOnly(new Date())}.</p>${extra}`;
      case "SALARY_REVISION":
        return `<p>Dear ${name},</p><p>Your salary has been revised to AED ${payload.new_salary ?? salary} effective ${payload.effective_date ?? formatDateOnly(new Date())}.</p>${extra}`;
      case "WARNING":
        return `<p>Dear ${name},</p><p>This letter serves as a formal warning regarding: ${payload.reason ?? "conduct/performance concerns"}. You are required to take corrective action immediately.</p>${extra}`;
      case "EXPERIENCE":
        return `<p>To Whom It May Concern,</p><p>This is to certify that ${name} was employed with us from ${join} to ${payload.end_date ?? "present"}. During this period, they performed their duties satisfactorily.</p>${extra}`;
      case "EMPLOYMENT_CERT":
        return `<p>To Whom It May Concern,</p><p>This certifies that ${name} is currently employed with us since ${join} in the capacity of ${payload.designation ?? "staff member"}.</p>${extra}`;
      case "NOC":
        return `<p>To Whom It May Concern,</p><p>We have no objection to ${name} ${payload.purpose ?? "undertaking the stated activity"} during their employment with us.</p>${extra}`;
      case "RESIGNATION_ACCEPTANCE":
        return `<p>Dear ${name},</p><p>We acknowledge receipt of your resignation dated ${payload.resignation_date ?? formatDateOnly(new Date())}. Your last working day will be ${payload.last_working_day ?? "as agreed"}.</p>${extra}`;
      case "END_OF_SERVICE":
        return `<p>Dear ${name},</p><p>Your end-of-service settlement has been calculated as AED ${payload.eos_amount ?? "0.00"}. Service period from ${join} to ${payload.exit_date ?? formatDateOnly(new Date())}.</p>${extra}`;
      case "REFERENCE":
        return `<p>To Whom It May Concern,</p><p>We recommend ${name}, who was employed with us from ${join}. They demonstrated professionalism and competence in their role.</p>${extra}`;
      default:
        return `<p>Dear ${name},</p><p>Please refer to the attached HR letter.</p>${extra}`;
    }
  }
}
