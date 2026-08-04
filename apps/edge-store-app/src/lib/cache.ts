/**
 * Edge Store Central cache
 */
import { dateToIsoString } from "./datetimes";

export const EDGE_CACHE_KEY = "EDGE_STORE_CACHE";
export const EDGE_CACHE_VERSION = "1.0.0";

export type IServerProtocol = "http" | "https";

export interface IServerConfigCache {
  protocol: IServerProtocol;
  host: string;
  port?: string;
  basePath?: string;
  licenseUrl?: string; 
  savedAt: string;
}

export type ILicenseDurationType = "trial" | "finite" | "infinite";

export interface ILicenseLimits {
  maxDevices?: number; 
  maxBranches?: number; 
  maxUsers?: number;
}

export interface ILicenseClaims{
  licenseId: string;
  activationCode?: string;
  companyId?: string | number;
  companyName?: string;
  product: string;
  edition?: string;
  machineCode: string;
  deviceId?: string;
  deviceName?: string;
  issuedAt: string; /** Unix seconds */
  expiresAt: number | null; /** Unix seconds - null == infinite/perpetual license */
  notificationAt: number | null; /** Date Notification should begin */
  durationType: ILicenseDurationType;
  features: string[];
  limits: ILicenseLimits;
}

export interface ISignedLicenseToken {
  alg: "Ed25519";
  payload: string;
  signature: string;
}

export type ILicenseStatus = "missing" | "active" | "expired" | "invalid" | "machine_mismatch" | "suspended" | "grace_period";

export interface ILicenseCache {
  status: ILicenseStatus;
  activationCode?: string;
  machineCode: string;
  token?: ISignedLicenseToken;
  claims?: ILicenseClaims;
  lastCheckedAt?: string;
  lastError?: string;
}

export interface ISetupStateCache{
  companyDetected: boolean;
  companyName?: string;
  superAdminExists: boolean;
  lastBootstrapAt?: string;
}

export interface IAuthSessionCache{
  userId: string | number;
  name: string; 
  email: string;
  companyId?: string | number;
  branchId?: string | number;
  mode: "online" | "offline";
  accessToken?: string;
  refreshToken?: string;
  loggedInAt: string;
  expiresAt: string;
  roles: any[];
  privileges: any[];
}

export interface IOfflineAuthCache{
  userId: string | number;
  name: string;
  email: string;
  companyId?: string | number;
  branchIds?: (string | number)[];
  permissions: any[];
  passwordVerifier: string;
  cachedAt: string;
  expiresAt: string;
  version: string | number;
  signature?: string;
}

export interface IPermissionCache{
  userId: string | number;
  branchId?: string | number;
  permissions: any[];
  cachedAt: string;
  expiresAt?: string;
  signature?: string;
}

export interface IMetadataSyncCache{
  lastCursor?: string; 
  lastSyncedAt?: string;
  status: "idle" | "syncing" | "error" | "success";
  errorMessage?: string;
}

export interface IConnectivityCache{
  browserOnline?: boolean; 
  backendReachable?: boolean;
  licenseServerReachable?: boolean;
  lastCheckedAt?: string;
}

export interface ICacheMeta{
  version: string | number; 
  createdAt: string;
  updatedAt: string;
  deviceId?: string;
  machineCode?: string;
}

/**                                                            
 * ******************* MAIN UMBRELLA OBJECT *******************
 */
export interface IEdgeStoreCache {
  meta: ICacheMeta;
  server: IServerConfigCache | null;
  license: ILicenseCache | null;
  setup: ISetupStateCache;
  auth: IAuthSessionCache | null;
  offlineAuth: IOfflineAuthCache[];
  permissions: IPermissionCache | null;
  metadataSync: IMetadataSyncCache;
  connectivity: IConnectivityCache;
}

/**
 * FUNCTIONS
 */
export function createDefaultCache(): IEdgeStoreCache {
  const now = dateToIsoString(new Date());

  return {
    meta: {
      version: EDGE_CACHE_VERSION,
      createdAt: now,
      updatedAt: now,
    },
    server: null,
    license: null,
    setup: {
      companyDetected: false,
      superAdminExists: false
    },
    auth: null,
    offlineAuth: [],
    permissions: null,
    metadataSync: {
      status: "idle"
    },
    connectivity: {}
  };
}

/**
 * STORAGE ADAPTER
 * To use Tauri encrypted store later, sqlite or IndexDB
 */
const storageAdapter = {
  read(): string | null {
    try{
      return localStorage.getItem(EDGE_CACHE_KEY);
    } catch {
      return null;
    }
  },

  write(value: string): void {
    try{
      localStorage.setItem(EDGE_CACHE_KEY, value);
    } catch {
      // Ignore localStorage errors
    }
  },

  clear(): void {
    try{
      localStorage.removeItem(EDGE_CACHE_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }
}

/** Load full EdgeStoreCache */
export function loadCache(): IEdgeStoreCache {
  const raw = storageAdapter.read();

  if(!raw){
    const cache = createDefaultCache();
    storageAdapter.write(JSON.stringify(cache));
    return cache;
  }

  try{
    const parsed = JSON.parse(raw) as Partial<IEdgeStoreCache>;

    const cache: IEdgeStoreCache = {
      ...createDefaultCache(),
      ...parsed,
      meta: {
        ...createDefaultCache().meta,
        ...parsed.meta,
      },
      setup: {
        ...createDefaultCache().setup,
        ...parsed.setup,
      },
      metadataSync: {
        ...createDefaultCache().metadataSync,
        ...parsed.metadataSync,
      },
      connectivity: {
        ...createDefaultCache().connectivity,
        ...parsed.connectivity,
      }
    };

    if(cache.meta.version !== EDGE_CACHE_VERSION){
      /**later change to write migrations here */
      const fresh = createDefaultCache();
      storageAdapter.write(JSON.stringify(fresh));
      return fresh;
    }

    return cache;
  } catch {
    const cache = createDefaultCache();
    storageAdapter.write(JSON.stringify(cache));
    return cache;
  }
}

/** Save Full EdgeSoreCache */
export function saveCache(cache: IEdgeStoreCache): void {
  cache.meta.updatedAt = dateToIsoString(new Date());
  storageAdapter.write(JSON.stringify(cache));
}

/** Update Cache using mutator functions */
export function updateCache(mutator: (cache: IEdgeStoreCache) => void): IEdgeStoreCache {
  const cache = loadCache();
  mutator(cache);
  saveCache(cache);
  return cache;
}

/** Get on cache section */
export function getCacheSection<T extends keyof IEdgeStoreCache>(section: T): IEdgeStoreCache[T] {
  const cache = loadCache();
  return cache[section];
}

/** Replace cache section */
export function setCacheSection<K extends keyof IEdgeStoreCache>(section: K, value: IEdgeStoreCache[K]): IEdgeStoreCache {
  return updateCache((cache) => {
    cache[section] = value;
  });
}

/** Clear cache section */
export function clearCacheSection<T extends keyof IEdgeStoreCache>(section: T): IEdgeStoreCache {
  const defaults = createDefaultCache();
  return updateCache((cache) => {
    cache[section] = defaults[section];
  });
}

/** Completely reset cache */
export function resetCache(): IEdgeStoreCache {
  const cache = createDefaultCache();
  storageAdapter.clear();
  storageAdapter.write(JSON.stringify(cache));
  return cache;
}

/** build backed base URL from cached server config */
export function getApiBaseUrl(config: IServerConfigCache): string {
  const protocol = config.protocol;
  const host = config.host.trim();
  const port = config.port ? `:${config.port.trim()}` : "";
  const basePath = config.basePath ? `/${config.basePath.trim().replace(/^\/+|\/+$/g, "")}` : "";
  
  return `${protocol}://${host}${port}${basePath}`;
}