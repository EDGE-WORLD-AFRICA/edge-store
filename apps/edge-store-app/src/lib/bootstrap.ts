import { loadCache } from "./cache";
import type { IEdgeStoreCache, IBootstrapStage } from '@edge-store/shared';

export const isLicenseActive = (cache: IEdgeStoreCache): boolean => {
  if(!cache.license) return false;

  return cache.license.status === "active" || cache.license.status === "grace_period";
}


export const resolveBootstrapStage = (cache: IEdgeStoreCache = loadCache()): IBootstrapStage => {
  if(!cache.server) return "SERVER_CONFIG";

  if(!isLicenseActive(cache)) return "LICENSE";

  if(!cache.company || !cache.setup.companyDetected) return "COMPANY_SETUP";

  if(!cache.setup.superAdminExists) return "SUPER_ADMIN_SETUP";

  if(!cache.device) return "DEVICE_SETUP";

  if(!cache.setup.setupCompleted) return "SUMMARY";

  return "APP";
}
