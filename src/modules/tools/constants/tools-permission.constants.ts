export const TOOLS_PERMISSION_CONSTANTS = {
  MODULE: "tools",
  ACTIONS: {
    USE: "use",
  },
} as const;

export const TOOLS_PERMISSIONS = {
  USE: `${TOOLS_PERMISSION_CONSTANTS.MODULE}.${TOOLS_PERMISSION_CONSTANTS.ACTIONS.USE}`,
} as const;
