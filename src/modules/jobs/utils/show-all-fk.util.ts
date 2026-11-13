/**
 * Prisma UncheckedUpdateInput rejects `null` on required scalar FKs
 * (e.g. Shipment.customer_id). FE show_all PATCH often echoes GET with
 * `*_id: null` for empty fields — never write those onto required columns.
 */

type ShowAllRefDto = Record<string, unknown>;

/**
 * FE often edits nested `{ id, name, code }` (from GET enrich) while flat
 * `*_name` / `*_id` stay as the previous echo. Sync nested → flat so edits
 * to filled lookup fields are applied.
 */
export function syncShowAllNestedRefs(dto: ShowAllRefDto): void {
  const sync = (
    nestedKeys: string[],
    flat: { id: string; name: string; code: string },
  ) => {
    let nested: Record<string, unknown> | null = null;
    for (const key of nestedKeys) {
      const v = dto[key];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        nested = v as Record<string, unknown>;
        break;
      }
    }
    if (!nested) return;
    if (typeof nested.name === "string" || nested.name === null) {
      dto[flat.name] = nested.name;
    }
    if (typeof nested.code === "string" || nested.code === null) {
      dto[flat.code] = nested.code;
    }
    if (dto[flat.id] === undefined) {
      if (typeof nested.id === "string" && nested.id.trim()) {
        dto[flat.id] = nested.id.trim();
      } else if (nested.id === null) {
        dto[flat.id] = null;
      }
    }
  };
  sync(["origin_port"], {
    id: "origin_port_id",
    name: "origin_port_name",
    code: "origin_port_code",
  });
  sync(["dest_port", "destination_port"], {
    id: "dest_port_id",
    name: "dest_port_name",
    code: "dest_port_code",
  });
  sync(["shipper"], {
    id: "shipper_id",
    name: "shipper_name",
    code: "shipper_code",
  });
  sync(["consignee"], {
    id: "consignee_id",
    name: "consignee_name",
    code: "consignee_code",
  });
  sync(["billing_party", "customer"], {
    id: "billing_party_id",
    name: "billing_party_name",
    code: "billing_party_code",
  });
  sync(["customer"], {
    id: "customer_id",
    name: "customer_name",
    code: "customer_code",
  });
  sync(["agent"], {
    id: "agent_id",
    name: "agent_name",
    code: "agent_code",
  });
  sync(["carrier"], {
    id: "carrier_id",
    name: "carrier_name",
    code: "carrier_code",
  });
}

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

export function meaningfulShowAllText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

type ShowAllFkRow = {
  name?: string | null;
  code?: string | null;
};

/**
 * Resolve a show_all port/party FK when FE echoes both `*_id` and `*_name`.
 *
 * Bug this fixes: filled fields did not update because the old `*_id` from GET
 * always won over an edited name. Empty→fill worked (no id → name resolve).
 *
 * Rules:
 * - Meaningful name and/or code → resolve by name/code, unless the echoed id
 *   still matches that name/code (then keep id — unchanged echo / dropdown).
 * - No name/code → honour id (`null` clears, string sets, `undefined` = skip).
 */
export async function resolveShowAllFk(opts: {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  findById: (id: string) => Promise<ShowAllFkRow | null>;
  resolveByNameCode: (
    name: string | null,
    code: string | null,
  ) => Promise<string | null | undefined>;
}): Promise<string | null | undefined> {
  const name = meaningfulShowAllText(opts.name);
  const code = meaningfulShowAllText(opts.code);

  if (name || code) {
    const id =
      typeof opts.id === "string" && opts.id.trim() ? opts.id.trim() : null;
    if (id) {
      const row = await opts.findById(id);
      if (row) {
        const nameOk =
          !name ||
          (typeof row.name === "string" &&
            row.name.trim().toLowerCase() === name.toLowerCase());
        const codeOk =
          !code ||
          (typeof row.code === "string" &&
            row.code.trim().toLowerCase() === code.toLowerCase());
        if (nameOk && codeOk) return id;
      }
    }
    return opts.resolveByNameCode(name, code);
  }

  if (opts.id !== undefined) {
    if (opts.id === null) return null;
    if (typeof opts.id === "string") {
      const t = opts.id.trim();
      return t.length > 0 ? t : null;
    }
    return null;
  }
  return undefined;
}
