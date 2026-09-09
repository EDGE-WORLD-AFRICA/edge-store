import { IUiState } from "./theme";
import { IServerConfigCache, IServerConnectivityState } from "./server";
import { ILicenseCache } from "./license";
import { ICompanySetupCache, IDeviceProfileCache } from "./company";
import { IEncryptedPayload } from "./crypto";
import { IPersonDetails } from "./person";
import { IUserRoleDetails } from "./user";

export interface IMetaCache {
  version: string | number;
  createdAt: string; 
  updatedAt: string;
  deviceId?: string;
  machineCode?: string;
}

export interface ISetupCache {
  companyDetected: boolean;
  companyName?: string;
  superAdminExists: boolean;
  lastBootstrapAt?: string;
  deviceConfigured?: string;
  setupCompleted?: boolean;
}

export type IAuthMode = "online" | "offline";

export interface IAuthSessionCache {
  userId: string | number;
  username: string;
  person: IPersonDetails;
  companyId: string | number;
  branchId?: string | number;
  mode: IAuthMode;
  accessToken: string;
  refreshToken?: string;
  permissions: string[];
  roles: IUserRoleDetails[];
  loggedInAt: string;
  expiresAt?: string;
}

export interface IOfflineAuthCache {
  username: string;
  encryptedPayload: IEncryptedPayload;
  cachedAt: string;
  expiresAt: string;
}

export interface IPermissionCache {
  userId: string | number;
  branchId?: string | number;
  permissions: any[];
  cachedAt: string;
  expiresAt?: string;
  signature?: string;
}

export type IMetadataSyncStatus = "idle" | "syncing" | "success" | "error";

export interface IMetadataSyncCache {
  lastCursor?: string;
  lastSyncedAt?: string;
  status: IMetadataSyncStatus;
  errorMessage?: string;
}

export interface IAdminSetupCache {
  firstName: string;
  otherNames?: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface IEdgeStoreCache {
  meta: IMetaCache;
  server: IServerConfigCache | null;
  license: ILicenseCache | null;
  company: ICompanySetupCache | null;
  device: IDeviceProfileCache | null;
  admin: IAdminSetupCache | null;
  setup: ISetupCache;
  auth: IAuthSessionCache | null;
  offlineAuth: IOfflineAuthCache[];
  permissions: IPermissionCache | null;
  metadataSync: IMetadataSyncCache;
  connectivity: IServerConnectivityState;
  ui: IUiState;
}