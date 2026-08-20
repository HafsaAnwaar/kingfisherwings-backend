-- Week 16 — HR Module (Ch.21)

-- CreateEnum
CREATE TYPE "HrEmployeeStatus" AS ENUM ('ACTIVE', 'PROBATION', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "HrEmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');

-- CreateEnum
CREATE TYPE "HrContractType" AS ENUM ('LIMITED', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "HrGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "HrMaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "HrStaffGrade" AS ENUM ('JUNIOR', 'STAFF', 'SUPERVISOR', 'MANAGER', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "HrDocumentType" AS ENUM ('PASSPORT', 'VISA', 'LABOR_CARD', 'EMIRATES_ID', 'MEDICAL_INSURANCE', 'DRIVING_LICENSE', 'PROFESSIONAL_CERT', 'CONTRACT', 'DEPENDENT_PASSPORT', 'DEPENDENT_VISA');

-- CreateEnum
CREATE TYPE "HrLeaveType" AS ENUM ('ANNUAL', 'SICK', 'UNPAID', 'MATERNITY_PATERNITY', 'EMERGENCY', 'HAJJ');

-- CreateEnum
CREATE TYPE "HrLeaveRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HrPayrollRunStatus" AS ENUM ('DRAFT', 'FINALIZED', 'GL_POSTED');

-- CreateEnum
CREATE TYPE "HrLoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "HrAdvanceStatus" AS ENUM ('OPEN', 'ADJUSTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "HrTimesheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HrEvaluationStatus" AS ENUM ('DRAFT', 'SELF_SUBMITTED', 'MANAGER_SUBMITTED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "HrLetterType" AS ENUM ('APPOINTMENT', 'CONFIRMATION', 'SALARY_REVISION', 'WARNING', 'EXPERIENCE', 'EMPLOYMENT_CERT', 'NOC', 'RESIGNATION_ACCEPTANCE', 'END_OF_SERVICE', 'REFERENCE');

-- CreateEnum
CREATE TYPE "HrLetterStatus" AS ENUM ('DRAFT', 'GENERATED');

-- CreateEnum
CREATE TYPE "HrDependentRelation" AS ENUM ('SPOUSE', 'CHILD', 'OTHER');

-- CreateEnum
CREATE TYPE "HrSalaryComponentCode" AS ENUM ('BASIC', 'HOUSING', 'TRANSPORT', 'MOBILE', 'OVERTIME', 'OTHER');

-- AlterEnum
ALTER TYPE "DocumentNumberType" ADD VALUE IF NOT EXISTS 'EMPLOYEE_CODE';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TIMESHEET_MISSING';


-- AlterTable
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "wps_agent_routing_code" VARCHAR(20);
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "wps_employer_mol_id" VARCHAR(30);

-- AlterTable
ALTER TABLE "vouchers" ADD COLUMN IF NOT EXISTS "payroll_run_id" UUID;
-- CreateTable
CREATE TABLE "hr_employees" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "employee_code" VARCHAR(40) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "date_of_birth" DATE,
    "nationality" VARCHAR(80),
    "gender" "HrGender",
    "marital_status" "HrMaritalStatus",
    "photo_url" TEXT,
    "mobile" VARCHAR(30),
    "email" VARCHAR(255),
    "emergency_name" VARCHAR(200),
    "emergency_phone" VARCHAR(30),
    "joining_date" DATE NOT NULL,
    "exit_date" DATE,
    "department_id" UUID,
    "designation_id" UUID,
    "branch_id" UUID,
    "employment_type" "HrEmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "status" "HrEmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "staff_grade" "HrStaffGrade" NOT NULL DEFAULT 'STAFF',
    "reporting_manager_id" UUID,
    "department_head_id" UUID,
    "skip_level_id" UUID,
    "user_id" UUID,
    "basic_salary" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "housing_allowance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "transport_allowance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "mobile_allowance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "overtime_rate" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "other_allowance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "social_security_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "mol_employee_id" VARCHAR(30),
    "iban" VARCHAR(50),
    "bank_routing_code" VARCHAR(20),
    "bank_name" VARCHAR(200),
    "contract_type" "HrContractType" NOT NULL DEFAULT 'UNLIMITED',
    "contract_start" DATE,
    "contract_end" DATE,
    "notice_period_days" INTEGER NOT NULL DEFAULT 30,
    "probation_end" DATE,
    "performance_evaluation_score" DECIMAL(7,2),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "document_type" "HrDocumentType" NOT NULL,
    "document_no" VARCHAR(80),
    "issued_at" DATE,
    "expires_at" DATE,
    "file_path" VARCHAR(500),
    "last_alert_band" VARCHAR(10),
    "last_alerted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_dependents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "relation" "HrDependentRelation" NOT NULL,
    "date_of_birth" DATE,
    "passport_no" VARCHAR(50),
    "passport_expires_at" DATE,
    "visa_no" VARCHAR(50),
    "visa_expires_at" DATE,
    "last_alert_band" VARCHAR(10),
    "last_alerted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_employee_dependents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_skills" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "level" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_employee_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_qualifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "institution" VARCHAR(200),
    "year_awarded" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_employee_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employment_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "employer_name" VARCHAR(200) NOT NULL,
    "job_title" VARCHAR(200),
    "start_date" DATE,
    "end_date" DATE,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_employment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_payroll_gl_settings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "salary_expense_account_id" UUID NOT NULL,
    "payroll_payable_account_id" UUID NOT NULL,
    "deduction_account_id" UUID,
    "bonus_percent_per_score_point" DECIMAL(8,4) NOT NULL DEFAULT 0.1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "hr_payroll_gl_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_salary_components" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "code" "HrSalaryComponentCode" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_earning" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_policies" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "leave_type" "HrLeaveType" NOT NULL,
    "staff_grade" "HrStaffGrade" NOT NULL,
    "entitlement_days" DECIMAL(8,2) NOT NULL,
    "carry_forward_max" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "encashment_allowed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_leave_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_entitlements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" "HrLeaveType" NOT NULL,
    "year" INTEGER NOT NULL,
    "entitled" DECIMAL(8,2) NOT NULL,
    "carried" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_leave_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_balances" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" "HrLeaveType" NOT NULL,
    "year" INTEGER NOT NULL,
    "used" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "remaining" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_requests" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" "HrLeaveType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "days" DECIMAL(8,2) NOT NULL,
    "reason" TEXT,
    "attachment_path" VARCHAR(500),
    "status" "HrLeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewer_id" UUID,
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_payroll_runs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID,
    "payroll_year" INTEGER NOT NULL,
    "payroll_month" INTEGER NOT NULL,
    "status" "HrPayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'AED',
    "generated_at" TIMESTAMPTZ,
    "finalized_at" TIMESTAMPTZ,
    "posted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_payroll_lines" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "basic" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "housing" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "transport" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "mobile" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "overtime" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "overtime_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "other_allowance" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "bonus" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "loan_deduction" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "advance_deduction" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "social_security" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "gross_pay" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "net_pay" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "payslip_path" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_payroll_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_loans" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "principal" DECIMAL(18,4) NOT NULL,
    "interest_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "tenure_months" INTEGER NOT NULL,
    "emi_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "outstanding" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" "HrLoanStatus" NOT NULL DEFAULT 'PENDING',
    "purpose" VARCHAR(300),
    "reviewer_id" UUID,
    "review_notes" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "start_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_loan_repayments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "installment_no" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "paid_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "payroll_run_id" UUID,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_loan_repayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_advances" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "outstanding" DECIMAL(18,4) NOT NULL,
    "reason" VARCHAR(300),
    "status" "HrAdvanceStatus" NOT NULL DEFAULT 'OPEN',
    "payroll_run_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_advances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_timesheets" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "overtime_hours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "job_id" UUID,
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" "HrTimesheetStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewer_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_attendance_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "clock_in_at" TIMESTAMPTZ,
    "clock_out_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_evaluation_templates" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "kpis" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_evaluation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_evaluation_cycles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_evaluation_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_evaluations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "self_scores" JSONB,
    "manager_scores" JSONB,
    "peer_scores" JSONB,
    "self_comments" TEXT,
    "manager_comments" TEXT,
    "final_score" DECIMAL(7,2),
    "promotion_recommended" BOOLEAN NOT NULL DEFAULT false,
    "status" "HrEvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_letters" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "letter_type" "HrLetterType" NOT NULL,
    "status" "HrLetterStatus" NOT NULL DEFAULT 'DRAFT',
    "payload" JSONB,
    "pdf_path" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "hr_letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hr_employees_tenant_id_status_idx" ON "hr_employees"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "hr_employees_tenant_id_department_id_idx" ON "hr_employees"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "hr_employees_tenant_id_branch_id_idx" ON "hr_employees"("tenant_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_tenant_id_employee_code_key" ON "hr_employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_tenant_id_user_id_key" ON "hr_employees"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "hr_employee_documents_tenant_id_employee_id_idx" ON "hr_employee_documents"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "hr_employee_documents_tenant_id_expires_at_idx" ON "hr_employee_documents"("tenant_id", "expires_at");

-- CreateIndex
CREATE INDEX "hr_employee_dependents_tenant_id_employee_id_idx" ON "hr_employee_dependents"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "hr_employee_skills_tenant_id_employee_id_idx" ON "hr_employee_skills"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "hr_employee_qualifications_tenant_id_employee_id_idx" ON "hr_employee_qualifications"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "hr_employment_history_tenant_id_employee_id_idx" ON "hr_employment_history"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "hr_payroll_gl_settings_tenant_id_idx" ON "hr_payroll_gl_settings"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_payroll_gl_settings_tenant_id_company_id_key" ON "hr_payroll_gl_settings"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "hr_salary_components_tenant_id_idx" ON "hr_salary_components"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_salary_components_tenant_id_code_key" ON "hr_salary_components"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "hr_leave_policies_tenant_id_idx" ON "hr_leave_policies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_policies_tenant_id_leave_type_staff_grade_key" ON "hr_leave_policies"("tenant_id", "leave_type", "staff_grade");

-- CreateIndex
CREATE INDEX "hr_leave_entitlements_tenant_id_employee_id_idx" ON "hr_leave_entitlements"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_entitlements_tenant_id_employee_id_leave_type_year_key" ON "hr_leave_entitlements"("tenant_id", "employee_id", "leave_type", "year");

-- CreateIndex
CREATE INDEX "hr_leave_balances_tenant_id_employee_id_idx" ON "hr_leave_balances"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_balances_tenant_id_employee_id_leave_type_year_key" ON "hr_leave_balances"("tenant_id", "employee_id", "leave_type", "year");

-- CreateIndex
CREATE INDEX "hr_leave_requests_tenant_id_employee_id_status_idx" ON "hr_leave_requests"("tenant_id", "employee_id", "status");

-- CreateIndex
CREATE INDEX "hr_leave_requests_tenant_id_start_date_end_date_idx" ON "hr_leave_requests"("tenant_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "hr_payroll_runs_tenant_id_status_idx" ON "hr_payroll_runs"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "hr_payroll_runs_tenant_id_payroll_year_payroll_month_key" ON "hr_payroll_runs"("tenant_id", "payroll_year", "payroll_month");

-- CreateIndex
CREATE INDEX "hr_payroll_lines_tenant_id_payroll_run_id_idx" ON "hr_payroll_lines"("tenant_id", "payroll_run_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_payroll_lines_payroll_run_id_employee_id_key" ON "hr_payroll_lines"("payroll_run_id", "employee_id");

-- CreateIndex
CREATE INDEX "hr_loans_tenant_id_employee_id_status_idx" ON "hr_loans"("tenant_id", "employee_id", "status");

-- CreateIndex
CREATE INDEX "hr_loan_repayments_tenant_id_loan_id_idx" ON "hr_loan_repayments"("tenant_id", "loan_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_loan_repayments_loan_id_installment_no_key" ON "hr_loan_repayments"("loan_id", "installment_no");

-- CreateIndex
CREATE INDEX "hr_advances_tenant_id_employee_id_status_idx" ON "hr_advances"("tenant_id", "employee_id", "status");

-- CreateIndex
CREATE INDEX "hr_timesheets_tenant_id_employee_id_work_date_idx" ON "hr_timesheets"("tenant_id", "employee_id", "work_date");

-- CreateIndex
CREATE INDEX "hr_attendance_logs_tenant_id_work_date_idx" ON "hr_attendance_logs"("tenant_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "hr_attendance_logs_tenant_id_employee_id_work_date_key" ON "hr_attendance_logs"("tenant_id", "employee_id", "work_date");

-- CreateIndex
CREATE INDEX "hr_evaluation_templates_tenant_id_idx" ON "hr_evaluation_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "hr_evaluation_cycles_tenant_id_year_idx" ON "hr_evaluation_cycles"("tenant_id", "year");

-- CreateIndex
CREATE INDEX "hr_evaluations_tenant_id_employee_id_idx" ON "hr_evaluations"("tenant_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_evaluations_cycle_id_employee_id_key" ON "hr_evaluations"("cycle_id", "employee_id");

-- CreateIndex
CREATE INDEX "hr_letters_tenant_id_employee_id_letter_type_idx" ON "hr_letters"("tenant_id", "employee_id", "letter_type");

-- CreateIndex
CREATE INDEX "job_customs_examinations_tenant_id_job_id_idx" ON "job_customs_examinations"("tenant_id", "job_id");

-- CreateIndex
CREATE INDEX "vouchers_tenant_id_payroll_run_id_idx" ON "vouchers"("tenant_id", "payroll_run_id");

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "hr_payroll_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_department_head_id_fkey" FOREIGN KEY ("department_head_id") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_skip_level_id_fkey" FOREIGN KEY ("skip_level_id") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_documents" ADD CONSTRAINT "hr_employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_dependents" ADD CONSTRAINT "hr_employee_dependents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_skills" ADD CONSTRAINT "hr_employee_skills_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_qualifications" ADD CONSTRAINT "hr_employee_qualifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employment_history" ADD CONSTRAINT "hr_employment_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_gl_settings" ADD CONSTRAINT "hr_payroll_gl_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_gl_settings" ADD CONSTRAINT "hr_payroll_gl_settings_salary_expense_account_id_fkey" FOREIGN KEY ("salary_expense_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_gl_settings" ADD CONSTRAINT "hr_payroll_gl_settings_payroll_payable_account_id_fkey" FOREIGN KEY ("payroll_payable_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_gl_settings" ADD CONSTRAINT "hr_payroll_gl_settings_deduction_account_id_fkey" FOREIGN KEY ("deduction_account_id") REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_entitlements" ADD CONSTRAINT "hr_leave_entitlements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_lines" ADD CONSTRAINT "hr_payroll_lines_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "hr_payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_lines" ADD CONSTRAINT "hr_payroll_lines_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_loans" ADD CONSTRAINT "hr_loans_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_loan_repayments" ADD CONSTRAINT "hr_loan_repayments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "hr_loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_advances" ADD CONSTRAINT "hr_advances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_timesheets" ADD CONSTRAINT "hr_timesheets_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_timesheets" ADD CONSTRAINT "hr_timesheets_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_attendance_logs" ADD CONSTRAINT "hr_attendance_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_evaluation_cycles" ADD CONSTRAINT "hr_evaluation_cycles_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "hr_evaluation_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_evaluations" ADD CONSTRAINT "hr_evaluations_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "hr_evaluation_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_evaluations" ADD CONSTRAINT "hr_evaluations_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_letters" ADD CONSTRAINT "hr_letters_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_jobs_tracking_token" RENAME TO "jobs_tracking_token_key";

SELECT enable_rls_for_table('hr_employees');
SELECT enable_rls_for_table('hr_employee_documents');
SELECT enable_rls_for_table('hr_employee_dependents');
SELECT enable_rls_for_table('hr_employee_skills');
SELECT enable_rls_for_table('hr_employee_qualifications');
SELECT enable_rls_for_table('hr_employment_history');
SELECT enable_rls_for_table('hr_payroll_gl_settings');
SELECT enable_rls_for_table('hr_salary_components');
SELECT enable_rls_for_table('hr_leave_policies');
SELECT enable_rls_for_table('hr_leave_entitlements');
SELECT enable_rls_for_table('hr_leave_balances');
SELECT enable_rls_for_table('hr_leave_requests');
SELECT enable_rls_for_table('hr_payroll_runs');
SELECT enable_rls_for_table('hr_payroll_lines');
SELECT enable_rls_for_table('hr_loans');
SELECT enable_rls_for_table('hr_loan_repayments');
SELECT enable_rls_for_table('hr_advances');
SELECT enable_rls_for_table('hr_timesheets');
SELECT enable_rls_for_table('hr_attendance_logs');
SELECT enable_rls_for_table('hr_evaluation_templates');
SELECT enable_rls_for_table('hr_evaluation_cycles');
SELECT enable_rls_for_table('hr_evaluations');
SELECT enable_rls_for_table('hr_letters');
