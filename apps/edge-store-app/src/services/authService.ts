import { apiClient } from "../lib/apiClient";
import { getCacheSection } from "../lib/cache";
import { encryptOfflineData } from "../lib/crypto";
import { getMachineFingerprint } from "../lib/fingerprint";
import type { IAuthSessionCache, IOfflineAuthCache } from "@edge-store/shared";

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  user: any;
  company: any;
  branch: any;
  device: any;
  permissions: string[];
  roles: any[];
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export const authService = {
  checkHealth: async (): Promise<boolean> => {
    const server = getCacheSection("server");
    if (!server) return false;

    try {
      const response = await apiClient.get("/health", { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  loginOnline: async (credentials: ILoginRequest): Promise<ILoginResponse> => {
    const machineCode = await getMachineFingerprint();

    const response = await apiClient.post("/auth/login", {
      username: credentials.username,
      password: credentials.password,
      machineCode,
    });

    return response.data.data as ILoginResponse;
  },

  buildSessionCache: (data: ILoginResponse, mode: "online" | "offline"): IAuthSessionCache => {
    return {
      userId: data.user.id,
      username: data.user.username,
      person: data.user.person,
      companyId: data.user.companyId,
      branchId: data.branch?.id,
      mode,
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
      permissions: data.permissions,
      roles: data.roles,
      loggedInAt: new Date().toISOString(),
    };
  },

  buildOfflineCache: async (data: ILoginResponse, password: string): Promise<IOfflineAuthCache> => {
    const encrypted = await encryptOfflineData(data, password);

    return {
      username: data.user.username,
      encryptedPayload: encrypted,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },
};