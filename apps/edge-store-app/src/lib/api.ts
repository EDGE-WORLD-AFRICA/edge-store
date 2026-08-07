import type { IRemoteCompany, IEdgeStoreCache } from "@edge-store/shared";
import { getCacheSection, getApiBaseUrl } from "./cache";

export const fetchRemoteCompanies = async (): Promise<IRemoteCompany[]> => {
  const server = getCacheSection("server");
  if (!server) return [];

  try {
    const baseUrl = getApiBaseUrl(server);
    const response = await fetch(`${baseUrl}/setup/companies`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];
    const json = await response.json();

    if (Array.isArray(json)) return json as IRemoteCompany[];
    if (Array.isArray(json.data)) return json.data as IRemoteCompany[];
    return [];
  } catch {
    return [];
  }
};

export const checkAdminExists = async (): Promise<boolean> => {
  const server = getCacheSection("server");
  if (!server) return false;

  try {
    const baseUrl = getApiBaseUrl(server);
    const response = await fetch(`${baseUrl}/setup/admin-exists`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return false;
    const json = await response.json();

    return json.exists === true;
  } catch {
    return false;
  }
};

export const submitSetupData = async (
  cache: IEdgeStoreCache
): Promise<{ success: boolean; message?: string }> => {
  const server = cache.server;
  if (!server) {
    return { success: false, message: "Server configuration missing." };
  }
  
  try {
    const baseUrl = getApiBaseUrl(server);
    return { success: true, message: "False API Success" };

    const payload = {
      meta: cache.meta,
      license: cache.license,
      company: cache.company,
      device: cache.device,
      admin: cache.admin,
      setup: cache.setup,
    };

    const response = await fetch(`${baseUrl}/setup/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: errorText || `Backend error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to connect to edge-store-api.",
    };
  }
};