export type ILicenseDurationType = "trial" | "finite" | "infinite";

export type ILIcenseStatus = | "missing" | "active" | "expired" | "invalid" | "machine_mismatch" | "suspended" | " grace_period";

export interface ILicenseLimits {
  maxDevices?: number;
  maxBranches?: number;
  maxUsers?: number;
}

export interface ILicenseDeviceMeta {
  deviceId: string | number;
  deviceName?: string;
  platform?: string;
  appVersion?: string;
}

export interface ILicenseClaims {
  licenseId: string;
  activationCode?: string;
  companyId?: string;
  companyName?: string;
  product: string;
  edition?: string;
  machineCode: string;
  deviceId?: string;
  deviceName?: string;
  issuedAt: number;
  expiresAt: number | null;
  notificationAt: number | null; 
  durationType: ILicenseDurationType;
  features: string[];
  limits: ILicenseLimits;
}

export interface ISignedLicenseToken {
  alg: "Ed25519";
  payload: string;
  signature: string;
}

export interface ILicenseState {
  status: ILIcenseStatus;
  machineCode: string;
  activationCode?: string;
  token?: ISignedLicenseToken;
  claims?: ILicenseClaims;
  lastCheckedAt?: string;
  lastError?: string;
}

export interface ILicenseActivationRequest{
  activationCode: string;
  machineCode: string;
  device: ILicenseDeviceMeta;
}

export interface ILicenseActivationResponse {
  status: "activated" | "invalid" | "expired" | "suspended" | "device_limit_exceeded";
  license?: ISignedLicenseToken;
  message?: string;
}