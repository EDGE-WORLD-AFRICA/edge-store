/**
 * Edge Store Central cache
 */
import { dateToIsoString } from "./datetimes";
import type { 
  IEdgeStoreCache, 
  IServerConfigCache,
  IThemeMode,
  IThemeState,
  IUiState,
  IResolvedTheme,
  IServerProtocol,
  ILicenseDurationType,
  ILicenseLimits,
  ILicenseClaims,
  ILicenseStatus,
  ISignedLicenseToken,
  ILicenseCache,
  ISetupCache,
  IAuthSessionCache,
  IOfflineAuthCache,
  IPermissionCache,
  IMetadataSyncCache,
  IServerConnectivityState,
  IMetaCache
} from "@edge-store/shared";


export const EDGE_CACHE_KEY = "EDGE_STORE_CACHE";
export const EDGE_CACHE_VERSION = "1.0.0";

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
    connectivity: {
      status: "unknown"
    },
    ui: {
      theme: {
        mode: "system",
        resolved: "light"
      }
    }
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