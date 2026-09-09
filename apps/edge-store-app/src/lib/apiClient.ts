import axios from "axios";
import { getCacheSection, getApiBaseUrl } from "./cache";

export const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const server = getCacheSection("server");
  const auth = getCacheSection("auth");
  const company = getCacheSection("company");
  const device = getCacheSection("device");

  if (server) {
    config.baseURL = getApiBaseUrl(server);
  }

  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  if (company?.company?.id) {
    config.headers["X-Company-Id"] = String(company.company.id);
  }

  const branchId = company?.selectedBranchId || device?.branchId;
  if (branchId) {
    config.headers["X-Branch-Id"] = String(branchId);
  }

  if (device?.id) {
    config.headers["X-Device-Id"] = String(device.id);
  }

  if (auth?.userId) {
    config.headers["X-User-Id"] = String(auth.userId);
  }

  if (device?.deviceName) {
    config.headers["X-Device-Name"] = device.deviceName;
  }

  return config;
});