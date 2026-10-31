/**
 * Prisma UncheckedUpdateInput rejects `null` on required scalar FKs
 * (e.g. Shipment.customer_id). FE show_all PATCH often echoes GET with
 * `*_id: null` for empty fields — never write those onto required columns.
 */

/** Apply only when a real UUID/string is present (required FK). */
export function requiredFk(
  id: string | null | undefined,
): string | undefined {
  if (typeof id !== "string") return undefined;
  const t = id.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * Optional FK: `undefined` = leave unchanged; `null` = clear; string = set.
 * Returns a partial for spreading into Prisma unchecked update data.
 */
export function optionalFkPatch<K extends string>(
  key: K,
  id: string | null | undefined,
): Partial<Record<K, string | null>> {
  if (id === undefined) return {};
  if (id === null) return { [key]: null } as Partial<Record<K, string | null>>;
  const t = id.trim();
  if (!t) return { [key]: null } as Partial<Record<K, string | null>>;
  return { [key]: t } as Partial<Record<K, string | null>>;
}
