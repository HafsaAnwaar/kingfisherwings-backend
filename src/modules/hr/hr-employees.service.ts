import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DocumentNumberType, HrEmployeeStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NumberGeneratorService } from "../organization/number-formats/number-generator.service";
import { CurrentUser } from "../users/interfaces/current-user.interface";
import {
  CreateDependentDto,
  CreateDocumentDto,
  CreateEmployeeDto,
  CreateEmploymentHistoryDto,
  CreateQualificationDto,
  CreateSkillDto,
  EmployeeQueryDto,
  LinkUserDto,
  UpdateEmployeeDto,
} from "./dto/hr-employee.dto";

@Injectable()
export class HrEmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberGenerator: NumberGeneratorService,
  ) {}

  async create(user: CurrentUser, dto: CreateEmployeeDto) {
    const employeeCode = await this.numberGenerator.generate(
      user.tenantId,
      DocumentNumberType.EMPLOYEE_CODE,
    );

    const employee = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.create({
        data: {
          tenant_id: user.tenantId,
          employee_code: employeeCode,
          first_name: dto.first_name.trim(),
          last_name: dto.last_name.trim(),
          joining_date: new Date(dto.joining_date),
          company_id: dto.company_id ?? null,
          date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
          nationality: dto.nationality?.trim() || null,
          gender: dto.gender ?? null,
          marital_status: dto.marital_status ?? null,
          photo_url: dto.photo_url ?? null,
          mobile: dto.mobile?.trim() || null,
          email: dto.email?.trim().toLowerCase() || null,
          emergency_name: dto.emergency_name?.trim() || null,
          emergency_phone: dto.emergency_phone?.trim() || null,
          exit_date: dto.exit_date ? new Date(dto.exit_date) : null,
          department_id: dto.department_id ?? null,
          designation_id: dto.designation_id ?? null,
          branch_id: dto.branch_id ?? null,
          employment_type: dto.employment_type ?? "FULL_TIME",
          status: dto.status ?? "ACTIVE",
          staff_grade: dto.staff_grade ?? "STAFF",
          reporting_manager_id: dto.reporting_manager_id ?? null,
          department_head_id: dto.department_head_id ?? null,
          skip_level_id: dto.skip_level_id ?? null,
          basic_salary: dto.basic_salary ?? 0,
          housing_allowance: dto.housing_allowance ?? 0,
          transport_allowance: dto.transport_allowance ?? 0,
          mobile_allowance: dto.mobile_allowance ?? 0,
          overtime_rate: dto.overtime_rate ?? 0,
          other_allowance: dto.other_allowance ?? 0,
          social_security_amount: dto.social_security_amount ?? 0,
          mol_employee_id: dto.mol_employee_id?.trim() || null,
          iban: dto.iban?.trim() || null,
          bank_routing_code: dto.bank_routing_code?.trim() || null,
          bank_name: dto.bank_name?.trim() || null,
          contract_type: dto.contract_type ?? "UNLIMITED",
          contract_start: dto.contract_start
            ? new Date(dto.contract_start)
            : null,
          contract_end: dto.contract_end ? new Date(dto.contract_end) : null,
          notice_period_days: dto.notice_period_days ?? 30,
          probation_end: dto.probation_end ? new Date(dto.probation_end) : null,
          created_by: user.id,
          updated_by: user.id,
        },
        include: this.defaultInclude(),
      }),
    );

    return { success: true, data: employee };
  }

  async findAll(user: CurrentUser, query: EmployeeQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.HrEmployeeWhereInput = {
      tenant_id: user.tenantId,
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.department_id ? { department_id: query.department_id } : {}),
      ...(query.branch_id ? { branch_id: query.branch_id } : {}),
      ...(query.search
        ? {
            OR: [
              {
                employee_code: { contains: query.search, mode: "insensitive" },
              },
              { first_name: { contains: query.search, mode: "insensitive" } },
              { last_name: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.runWithTenant(
      user.tenantId,
      async (tx) =>
        Promise.all([
          tx.hrEmployee.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{ last_name: "asc" }, { first_name: "asc" }],
            include: this.defaultInclude(),
          }),
          tx.hrEmployee.count({ where }),
        ]),
    );

    return {
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(user: CurrentUser, id: string) {
    const employee = await this.requireEmployee(user.tenantId, id);
    return { success: true, data: employee };
  }

  async update(user: CurrentUser, id: string, dto: UpdateEmployeeDto) {
    await this.requireEmployee(user.tenantId, id);

    const data: Prisma.HrEmployeeUpdateInput = { updated_by: user.id };
    if (dto.first_name !== undefined) data.first_name = dto.first_name.trim();
    if (dto.last_name !== undefined) data.last_name = dto.last_name.trim();
    if (dto.joining_date !== undefined)
      data.joining_date = new Date(dto.joining_date);
    if (dto.company_id !== undefined)
      data.company = dto.company_id
        ? { connect: { id: dto.company_id } }
        : { disconnect: true };
    if (dto.date_of_birth !== undefined)
      data.date_of_birth = dto.date_of_birth
        ? new Date(dto.date_of_birth)
        : null;
    if (dto.nationality !== undefined)
      data.nationality = dto.nationality?.trim() || null;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.marital_status !== undefined)
      data.marital_status = dto.marital_status;
    if (dto.photo_url !== undefined) data.photo_url = dto.photo_url;
    if (dto.mobile !== undefined) data.mobile = dto.mobile?.trim() || null;
    if (dto.email !== undefined)
      data.email = dto.email?.trim().toLowerCase() || null;
    if (dto.emergency_name !== undefined)
      data.emergency_name = dto.emergency_name?.trim() || null;
    if (dto.emergency_phone !== undefined)
      data.emergency_phone = dto.emergency_phone?.trim() || null;
    if (dto.exit_date !== undefined)
      data.exit_date = dto.exit_date ? new Date(dto.exit_date) : null;
    if (dto.department_id !== undefined)
      data.department = dto.department_id
        ? { connect: { id: dto.department_id } }
        : { disconnect: true };
    if (dto.designation_id !== undefined)
      data.designation = dto.designation_id
        ? { connect: { id: dto.designation_id } }
        : { disconnect: true };
    if (dto.branch_id !== undefined)
      data.branch = dto.branch_id
        ? { connect: { id: dto.branch_id } }
        : { disconnect: true };
    if (dto.employment_type !== undefined)
      data.employment_type = dto.employment_type;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.staff_grade !== undefined) data.staff_grade = dto.staff_grade;
    if (dto.reporting_manager_id !== undefined) {
      data.reporting_manager = dto.reporting_manager_id
        ? { connect: { id: dto.reporting_manager_id } }
        : { disconnect: true };
    }
    if (dto.department_head_id !== undefined) {
      data.department_head = dto.department_head_id
        ? { connect: { id: dto.department_head_id } }
        : { disconnect: true };
    }
    if (dto.skip_level_id !== undefined) {
      data.skip_level = dto.skip_level_id
        ? { connect: { id: dto.skip_level_id } }
        : { disconnect: true };
    }
    if (dto.basic_salary !== undefined) data.basic_salary = dto.basic_salary;
    if (dto.housing_allowance !== undefined)
      data.housing_allowance = dto.housing_allowance;
    if (dto.transport_allowance !== undefined)
      data.transport_allowance = dto.transport_allowance;
    if (dto.mobile_allowance !== undefined)
      data.mobile_allowance = dto.mobile_allowance;
    if (dto.overtime_rate !== undefined) data.overtime_rate = dto.overtime_rate;
    if (dto.other_allowance !== undefined)
      data.other_allowance = dto.other_allowance;
    if (dto.social_security_amount !== undefined)
      data.social_security_amount = dto.social_security_amount;
    if (dto.mol_employee_id !== undefined)
      data.mol_employee_id = dto.mol_employee_id?.trim() || null;
    if (dto.iban !== undefined) data.iban = dto.iban?.trim() || null;
    if (dto.bank_routing_code !== undefined)
      data.bank_routing_code = dto.bank_routing_code?.trim() || null;
    if (dto.bank_name !== undefined)
      data.bank_name = dto.bank_name?.trim() || null;
    if (dto.contract_type !== undefined) data.contract_type = dto.contract_type;
    if (dto.contract_start !== undefined)
      data.contract_start = dto.contract_start
        ? new Date(dto.contract_start)
        : null;
    if (dto.contract_end !== undefined)
      data.contract_end = dto.contract_end ? new Date(dto.contract_end) : null;
    if (dto.notice_period_days !== undefined)
      data.notice_period_days = dto.notice_period_days;
    if (dto.probation_end !== undefined)
      data.probation_end = dto.probation_end
        ? new Date(dto.probation_end)
        : null;

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.update({
        where: { id },
        data,
        include: this.defaultInclude(),
      }),
    );

    return { success: true, data: updated };
  }

  async remove(user: CurrentUser, id: string) {
    await this.requireEmployee(user.tenantId, id);
    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          updated_by: user.id,
          status: HrEmployeeStatus.TERMINATED,
        },
      }),
    );
    return { success: true, data: { id, deleted: true } };
  }

  async linkUser(user: CurrentUser, id: string, dto: LinkUserDto) {
    await this.requireEmployee(user.tenantId, id);

    const existing = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.findFirst({
        where: {
          tenant_id: user.tenantId,
          user_id: dto.user_id,
          deleted_at: null,
          NOT: { id },
        },
      }),
    );
    if (existing) {
      throw new ConflictException(
        "User is already linked to another employee.",
      );
    }

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployee.update({
        where: { id },
        data: { user_id: dto.user_id, updated_by: user.id },
        include: this.defaultInclude(),
      }),
    );

    return { success: true, data: updated };
  }

  async addDocument(
    user: CurrentUser,
    employeeId: string,
    dto: CreateDocumentDto,
  ) {
    await this.requireEmployee(user.tenantId, employeeId);
    const doc = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeDocument.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          document_type: dto.document_type,
          document_no: dto.document_no?.trim() || null,
          issued_at: dto.issued_at ? new Date(dto.issued_at) : null,
          expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
          file_path: dto.file_path ?? null,
          created_by: user.id,
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: doc };
  }

  async listDocuments(user: CurrentUser, employeeId: string) {
    await this.requireEmployee(user.tenantId, employeeId);
    const docs = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeDocument.findMany({
        where: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          deleted_at: null,
        },
        orderBy: { expires_at: "asc" },
      }),
    );
    return { success: true, data: docs };
  }

  async removeDocument(user: CurrentUser, employeeId: string, docId: string) {
    await this.requireEmployee(user.tenantId, employeeId);
    await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeDocument.updateMany({
        where: { id: docId, employee_id: employeeId, tenant_id: user.tenantId },
        data: { deleted_at: new Date(), updated_by: user.id },
      }),
    );
    return { success: true, data: { id: docId, deleted: true } };
  }

  async addDependent(
    user: CurrentUser,
    employeeId: string,
    dto: CreateDependentDto,
  ) {
    await this.requireEmployee(user.tenantId, employeeId);
    const dep = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeDependent.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          full_name: dto.full_name.trim(),
          relation: dto.relation,
          date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
          passport_no: dto.passport_no?.trim() || null,
          passport_expires_at: dto.passport_expires_at
            ? new Date(dto.passport_expires_at)
            : null,
          visa_no: dto.visa_no?.trim() || null,
          visa_expires_at: dto.visa_expires_at
            ? new Date(dto.visa_expires_at)
            : null,
          created_by: user.id,
          updated_by: user.id,
        },
      }),
    );
    return { success: true, data: dep };
  }

  async listDependents(user: CurrentUser, employeeId: string) {
    await this.requireEmployee(user.tenantId, employeeId);
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeDependent.findMany({
        where: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          deleted_at: null,
        },
      }),
    );
    return { success: true, data };
  }

  async addSkill(user: CurrentUser, employeeId: string, dto: CreateSkillDto) {
    await this.requireEmployee(user.tenantId, employeeId);
    const skill = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeSkill.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          name: dto.name.trim(),
          level: dto.level?.trim() || null,
          created_by: user.id,
        },
      }),
    );
    return { success: true, data: skill };
  }

  async listSkills(user: CurrentUser, employeeId: string) {
    await this.requireEmployee(user.tenantId, employeeId);
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeSkill.findMany({
        where: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          deleted_at: null,
        },
      }),
    );
    return { success: true, data };
  }

  async addQualification(
    user: CurrentUser,
    employeeId: string,
    dto: CreateQualificationDto,
  ) {
    await this.requireEmployee(user.tenantId, employeeId);
    const q = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeQualification.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          title: dto.title.trim(),
          institution: dto.institution?.trim() || null,
          year_awarded: dto.year_awarded ?? null,
          created_by: user.id,
        },
      }),
    );
    return { success: true, data: q };
  }

  async listQualifications(user: CurrentUser, employeeId: string) {
    await this.requireEmployee(user.tenantId, employeeId);
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmployeeQualification.findMany({
        where: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          deleted_at: null,
        },
      }),
    );
    return { success: true, data };
  }

  async addEmploymentHistory(
    user: CurrentUser,
    employeeId: string,
    dto: CreateEmploymentHistoryDto,
  ) {
    await this.requireEmployee(user.tenantId, employeeId);
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmploymentHistory.create({
        data: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          employer_name: dto.employer_name.trim(),
          job_title: dto.job_title?.trim() || null,
          start_date: dto.start_date ? new Date(dto.start_date) : null,
          end_date: dto.end_date ? new Date(dto.end_date) : null,
          remarks: dto.remarks ?? null,
          created_by: user.id,
        },
      }),
    );
    return { success: true, data: row };
  }

  async listEmploymentHistory(user: CurrentUser, employeeId: string) {
    await this.requireEmployee(user.tenantId, employeeId);
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEmploymentHistory.findMany({
        where: {
          tenant_id: user.tenantId,
          employee_id: employeeId,
          deleted_at: null,
        },
        orderBy: { start_date: "desc" },
      }),
    );
    return { success: true, data };
  }

  private defaultInclude(): Prisma.HrEmployeeInclude {
    return {
      department: { select: { id: true, name: true, code: true } },
      designation: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true, code: true } },
      reporting_manager: {
        select: {
          id: true,
          employee_code: true,
          first_name: true,
          last_name: true,
        },
      },
      user: {
        select: { id: true, email: true, first_name: true, last_name: true },
      },
    };
  }

  private async requireEmployee(tenantId: string, id: string) {
    const employee = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEmployee.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: this.defaultInclude(),
      }),
    );
    if (!employee) throw new NotFoundException("Employee not found.");
    return employee;
  }
}
