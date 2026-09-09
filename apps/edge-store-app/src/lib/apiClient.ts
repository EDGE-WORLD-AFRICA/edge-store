import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCacheSection, setCacheSection, getApiBaseUrl } from "./cache";

export const apiClient = axios.create();

let isRefreshing = false; 
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
      if(error) {
        prom.reject(error);
      } else{
       prom.resolve(token); 
      }
  });
  failedQueue = [];
};

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


apiClient.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

  if(error.response?.status === 401 && !originalRequest._retry){
    if(isRefreshing){
      return new Promise((resolve, reject) => {
        failedQueue.push({resolve, reject});
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }).catch((err) => { Promise.reject(err)});
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const auth = getCacheSection("auth");

    if(!auth?.refreshToken || !auth?.userId){
      setCacheSection("auth", null);
      window.location.reload();
      return Promise.reject(error);
    }

    try {
      const server = getCacheSection("server");
      const baseUrl = server ? `${getApiBaseUrl(server)}/api/v1` : ""; //server ? `${getApiBaseUrl(server)}/auth/refresh` : "/auth/refresh";
      
      const response = await axios.post(`${baseUrl}/auth/refresh`, {
        refreshToken: auth.refreshToken,
        userId: auth.userId,
      });

      const newTokens = response.data.data.tokens; 

      setCacheSection("auth", {
        ...auth,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      });

      processQueue(null, newTokens.accessToken);

      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return apiClient(originalRequest);
    }catch(refreshError) {
      processQueue(refreshError, null);
      setCacheSection("auth", null);
      window.location.reload();
      return Promise.reject(refreshError);
    }finally{
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
});