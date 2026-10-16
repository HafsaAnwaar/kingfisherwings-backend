import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import {
  CreateFavouriteDto,
  FavouriteCheckQueryDto,
  FavouriteQueryDto,
  ToggleFavouriteDto,
} from "./dto/favourite.dto";
import { FavouritesService } from "./favourites.service";

@ApiTags("Favourites")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller("favourites")
export class FavouritesController {
  constructor(private readonly service: FavouritesService) {}

  @Get()
  @ApiOperation({
    summary: "List current user favourites (Favourites section)",
  })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Query() query: FavouriteQueryDto,
  ) {
    return this.service.list(tenantId, userId, query);
  }

  @Get("check")
  @ApiOperation({ summary: "Check if target is favourited (star UI)" })
  check(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Query() query: FavouriteCheckQueryDto,
  ) {
    return this.service.check(tenantId, userId, query);
  }

  @Post()
  @ApiOperation({ summary: "Add a favourite for the current user" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: CreateFavouriteDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Post("toggle")
  @ApiOperation({
    summary: "Toggle favourite — returns { favourited: boolean }",
  })
  toggle(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Body() dto: ToggleFavouriteDto,
  ) {
    return this.service.toggle(tenantId, userId, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove own favourite" })
  remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(tenantId, userId, id);
  }
}
