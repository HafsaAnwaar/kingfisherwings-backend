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
import { CreateFavouriteDto, FavouriteQueryDto } from "./dto/favourite.dto";
import { FavouritesService } from "./favourites.service";

@ApiTags("Favourites")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller("favourites")
export class FavouritesController {
  constructor(private readonly service: FavouritesService) {}

  @Get()
  @ApiOperation({ summary: "List current user favourites (UserFavourite)" })
  list(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") userId: string,
    @Query() query: FavouriteQueryDto,
  ) {
    return this.service.list(tenantId, userId, query);
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
