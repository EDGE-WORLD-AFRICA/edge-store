import { IThemeState } from "./theme";
import { IServerConfig, IServerConnectivityState } from "./server";
import { ILicenseState } from "./license";

export interface ICacheMeta {
  version: number;
  createdAt: string; 
  updatedAt: string;
  deviceId?: string;
  machineCode?: string;
}

export interface ISetupState {
  companyDetected: boolean;
  companyName?: string;
  superAdminExists: boolean;
  lastBootstrapAt?: string;
}

export type IAuthMode = "online" | "offline";

export interface IAuthSession {
  userId: string | number; 
  name: string; 
  email: string; 
  companyId?: string | number;
  branchId?: string | number;
  mode: IAuthMode;
  accessToken?: string;
  refreshToken?: string;
  loggedInAt: string;
  expiresAt?: string;
}

export interface IOfflineAuthCredential {
  userId: string | number;
  name: string;
  email: string;
  companyId?: string | number;
  branchIds?: (string | number)[];
  permissions: any[];
  passwordVerifier: string;
  cachedAt: string;
  expiresAt: string;
  version: number;
  signature?: string;
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

export interface IMetadataSyncState {
  lastCursor?: string;
  lastSyncedAt?: string;
  status: IMetadataSyncStatus;
  errorMessage?: string;
}

export interface IUiState {
  theme: IThemeState;
}

export interface IEdgeStoreCache {
  meta: ICacheMeta;
  server: IServerConfig | null;
  license: ILicenseState | null;
  setup: ISetupState;
  auth: IAuthSession | null;
  offlineAuth: IOfflineAuthCredential[];
  permissions: IPermissionCache | null;
  metadataSync: IMetadataSyncState;
  connectivity: IServerConnectivityState;
  ui: IUiState;
}