import { Injectable } from "@nestjs/common";
import { FavouritesService } from "../../favourites/favourites.service";
import { CreateUserFavoriteDto } from "../dto/user-favorite.dto";
import { MasterQueryDto } from "../dto/master-query.dto";
import { entityFavouriteTargetKey } from "../../favourites/dto/favourite.dto";

/**
 * Compat proxy → UserFavourite via /favourites.
 * Prefer /favourites for new FE work.
 */
@Injectable()
export class FavoritesService {
  constructor(private readonly favourites: FavouritesService) {}

  async list(tenantId: string, userId: string, query: MasterQueryDto) {
    const res = await this.favourites.list(tenantId, userId, {
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    // Shape closer to legacy UserFavorite list for old FE
    const data = (res.data ?? []).map((row: {
      id: string;
      kind: string;
      target_key: string;
      label: string | null;
      created_at: Date;
    }) => {
      const colon = row.target_key.indexOf(":");
      const entity_id =
        colon > 0 ? row.target_key.slice(colon + 1) : row.target_key;
      return {
        id: row.id,
        entity_type: row.kind,
        entity_id,
        label: row.label,
        created_at: row.created_at,
        target_key: row.target_key,
      };
    });
    return {
      data,
      meta: res.meta,
      deprecated: true,
      prefer: "/favourites",
    };
  }

  async create(
    tenantId: string,
    userId: string,
    dto: CreateUserFavoriteDto,
  ) {
    const created = await this.favourites.createFromEntity(
      tenantId,
      userId,
      dto.entity_type,
      dto.entity_id,
      dto.label,
    );
    return {
      ...created.data,
      entity_type: dto.entity_type.toLowerCase(),
      entity_id: dto.entity_id,
      target_key: entityFavouriteTargetKey(
        dto.entity_type,
        dto.entity_id,
      ),
      deprecated: true,
      prefer: "/favourites",
    };
  }

  async remove(tenantId: string, userId: string, id: string) {
    await this.favourites.remove(tenantId, userId, id);
  }
}
