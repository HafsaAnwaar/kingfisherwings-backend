import { OpsEntityType } from "@prisma/client";
import { entityFavouriteTargetKey } from "../favourites/dto/favourite.dto";

/**
 * Continuum side-panel + favourite path_hints for FE shell.
 * entityType: ENQUIRY | QUOTATION | SHIPMENT | JOB
 */
export function opsContinuumPathHints(
  entityType: OpsEntityType | string,
  entityId: string,
) {
  const type = String(entityType).toUpperCase();
  const kind = type.toLowerCase();
  const base = `/ops/${type}/${entityId}`;
  const targetKey = entityFavouriteTargetKey(kind, entityId);

  return {
    comments: `${base}/comments`,
    follow_ups: `${base}/follow-ups`,
    attachments: `${base}/attachments`,
    attachments_upload: `${base}/attachments/upload`,
    references: `${base}/references`,
    tags: `${base}/tags`,
    links: `${base}/links`,
    likes: `${base}/likes`,
    likes_toggle: `${base}/likes/toggle`,
    complaints: `${base}/complaints`,
    history: `${base}/history`,
    favourite_toggle: `/favourites/toggle`,
    favourite_check: `/favourites/check?kind=${encodeURIComponent(kind)}&target_key=${encodeURIComponent(targetKey)}`,
    favourite: {
      kind,
      target_key: targetKey,
    },
  };
}

export function opsContinuumActions() {
  return {
    can_comment: true,
    can_follow_up: true,
    can_attach: true,
    can_reference: true,
    can_tag: true,
    can_link: true,
    can_like: true,
    can_complaint: true,
    can_view_history: true,
    can_favourite: true,
  };
}
