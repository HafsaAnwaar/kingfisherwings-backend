import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../../users/guards/roles.guard";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { MasterQueryDto } from "../dto/master-query.dto";
import { CreateUserFavoriteDto } from "../dto/user-favorite.dto";
import { FavoritesService } from "./favorites.service";

@ApiTags("Masters — Favorites")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller("masters/favorites")
export class FavoritesController {
  constructor(private readonly service: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: "List current user favorites" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Query() query: MasterQueryDto,
  ) {
    return this.service.list(tenantId, userId, query);
  }

  @Post()
  @ApiOperation({
    summary: "Add a favorite for the current user (auth only)",
  })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: CreateUserFavoriteDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove own favorite" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.remove(tenantId, userId, id);
  }
}
