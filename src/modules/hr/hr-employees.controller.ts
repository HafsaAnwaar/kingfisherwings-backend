import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { CurrentUser as CurrentUserType } from "../users/interfaces/current-user.interface";
import { HR_PERMISSIONS } from "./constants/hr-permission.constants";
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
import { HrEmployeesService } from "./hr-employees.service";

@ApiTags("HR Employees")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("hr/employees")
export class HrEmployeesController {
  constructor(private readonly employees: HrEmployeesService) {}

  @Get()
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List employees" })
  list(@CurrentUser() user: CurrentUserType, @Query() query: EmployeeQueryDto) {
    return this.employees.findAll(user, query);
  }

  @Post()
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateEmployeeDto) {
    return this.employees.create(user, dto);
  }

  @Get(":id")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  detail(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.employees.findOne(user, id);
  }

  @Patch(":id")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  update(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employees.update(user, id, dto);
  }

  @Delete(":id")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  remove(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.employees.remove(user, id);
  }

  @Post(":id/link-user")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  linkUser(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkUserDto,
  ) {
    return this.employees.linkUser(user, id, dto);
  }

  @Get(":id/documents")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listDocuments(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.employees.listDocuments(user, id);
  }

  @Post(":id/documents")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  addDocument(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.employees.addDocument(user, id, dto);
  }

  @Delete(":id/documents/:docId")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  removeDocument(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("docId", ParseUUIDPipe) docId: string,
  ) {
    return this.employees.removeDocument(user, id, docId);
  }

  @Get(":id/dependents")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listDependents(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.employees.listDependents(user, id);
  }

  @Post(":id/dependents")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  addDependent(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateDependentDto,
  ) {
    return this.employees.addDependent(user, id, dto);
  }

  @Get(":id/skills")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listSkills(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.employees.listSkills(user, id);
  }

  @Post(":id/skills")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  addSkill(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateSkillDto,
  ) {
    return this.employees.addSkill(user, id, dto);
  }

  @Get(":id/qualifications")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listQualifications(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.employees.listQualifications(user, id);
  }

  @Post(":id/qualifications")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  addQualification(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateQualificationDto,
  ) {
    return this.employees.addQualification(user, id, dto);
  }

  @Get(":id/employment-history")
  @RequirePermissions(HR_PERMISSIONS.VIEW)
  listHistory(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.employees.listEmploymentHistory(user, id);
  }

  @Post(":id/employment-history")
  @RequirePermissions(HR_PERMISSIONS.MANAGE_EMPLOYEES)
  addHistory(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEmploymentHistoryDto,
  ) {
    return this.employees.addEmploymentHistory(user, id, dto);
  }
}
