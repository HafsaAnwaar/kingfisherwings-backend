/**
 * Toolbar action for FE: put Favourite next to Edit / Delete / Generate
 * on reports, docs, jobs, shipments, etc. Toggle always hits /favourites.
 */

export function favouriteActions(
  kind: string,
  targetKey: string,
  label?: string | null,
) {
  const k = kind.toLowerCase();
  return {
    can_favourite: true,
    favourite: {
      kind: k,
      target_key: targetKey,
      label: label ?? null,
      href: favouriteHref(k, targetKey),
    },
    path_hints: {
      favourite_toggle: "/favourites/toggle",
      favourite_check: `/favourites/check?kind=${encodeURIComponent(k)}&target_key=${encodeURIComponent(targetKey)}`,
      favourite_add: "/favourites",
      favourites_list: "/favourites",
    },
  };
}

export function favouriteTarget(kind: string, idOrCode: string): string {
  return `${kind.toLowerCase()}:${idOrCode}`;
}

/** Deep-link so the Favourites page can open every starred item. */
export function favouriteHref(
  kind: string,
  targetKey: string,
): string | null {
  const k = kind.toLowerCase();
  const prefix = `${k}:`;
  const rest = targetKey.toLowerCase().startsWith(prefix)
    ? targetKey.slice(prefix.length)
    : targetKey;

  switch (k) {
    case "job":
      return `/jobs/${rest}/detail`;
    case "shipment":
      return `/shipments/${rest}/detail`;
    case "quotation":
      return `/quotations/${rest}/detail`;
    case "enquiry":
      return `/crm/enquiries/${rest}/detail`;
    case "party":
      return `/parties/${rest}`;
    case "report_template":
      return `/reports/templates/${rest}`;
    case "report":
      return rest.startsWith("/")
        ? rest
        : `/documentation/reports/${rest}`;
    case "document":
      return rest.startsWith("/") ? rest : `/documentation/reports/${rest}`;
    case "custom_report":
      return `/masters/custom-reports/${rest}`;
    case "saved_report":
      return `/gl/saved-reports/${rest}`;
    case "menu":
      return rest.startsWith("/") ? rest : `/${rest}`;
    default:
      return null;
  }
}
