// src/modules/auth/interfaces/login-meta.interface.ts

export interface LoginMeta {
  ip_address?: string;

  user_agent?: string;

  browser?: string;

  operating_system?: string;

  device_name?: string;

  /** Optional client-reported MAC for allow-list enforcement. */
  mac_address?: string;
}
