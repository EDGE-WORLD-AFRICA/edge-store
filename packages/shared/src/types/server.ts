export type IServerProtocol = "http" | "https";

export interface IServerConfig {
  protocol: IServerProtocol;
  host: string; 
  port?: string | number;
  basePath?: string;
  licenseUrl?: string;
  savedAt: string;
}

export interface IServerConfigInput {
  protocol: IServerProtocol;
  host: string;
  port?: string;
  basePath?: string;
  licenseUrl?: string;
}

export type IServerConnectionStatus = | "unknown" | "checking" | "connected" | "error";

export interface IServerConnectivityState {
  status: IServerConnectionStatus;
  message?: string;
  checkedAt?: string;
}

export interface IServerHealthResponse {
  status: string;
  app?: string;
  version?: string;
  time?: string;
}