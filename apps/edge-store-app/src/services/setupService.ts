import { apiClient } from "../lib/apiClient";
import { getCacheSection } from "../lib/cache";
import { getMachineFingerprint } from "../lib/fingerprint";

export interface ISetupResponse {
  companyId: string;
  branchId: string | null;
  deviceId: string | null;
  adminId: string | null;
  personId: string | null;
  message: string;
}

export const setupService = {
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get("/health", { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  finalizeSetup: async (): Promise<ISetupResponse> => {
    const cache = {
      meta: getCacheSection("meta"),
      license: getCacheSection("license"),
      company: getCacheSection("company"),
      device: getCacheSection("device"),
      admin: getCacheSection("admin"),
      setup: getCacheSection("setup"),
    };

    const machineCode = await getMachineFingerprint();

    const payload = {
      ...cache,
      meta: {
        ...cache.meta,
        machineCode,
      },
    };

    const response = await apiClient.post("/setup/complete", payload);
    return response.data.data as ISetupResponse;
  },
};