/** UI / API access levels for module → submodule grants. */
export const MATRIX_ACCESS_VALUES = ["none", "read", "write"] as const;
export type MatrixAccess = (typeof MATRIX_ACCESS_VALUES)[number];

export interface MatrixGrantFlags {
  see: boolean;
  read: boolean;
  write: boolean;
}

export function expandMatrixAccess(access: MatrixAccess): MatrixGrantFlags {
  if (access === "write") {
    return { see: true, read: true, write: true };
  }
  if (access === "read") {
    return { see: true, read: true, write: false };
  }
  return { see: false, read: false, write: false };
}

/** Derive UI access from stored see/read/write flags. */
export function accessFromFlags(flags: MatrixGrantFlags): MatrixAccess {
  if (flags.write) return "write";
  if (flags.read || flags.see) return "read";
  return "none";
}

/**
 * Normalize a grant that may use `access` or legacy booleans.
 * `access` wins when present. Cascade: write ⇒ read+see, read ⇒ see.
 */
export function normalizeMatrixGrantFlags(input: {
  access?: MatrixAccess;
  see?: boolean;
  read?: boolean;
  write?: boolean;
}): MatrixGrantFlags & { access: MatrixAccess } {
  if (input.access !== undefined) {
    const flags = expandMatrixAccess(input.access);
    return { ...flags, access: input.access };
  }
  const write = !!input.write;
  const read = write || !!input.read;
  const see = write || read || !!input.see;
  const flags = { see, read, write };
  return { ...flags, access: accessFromFlags(flags) };
}
