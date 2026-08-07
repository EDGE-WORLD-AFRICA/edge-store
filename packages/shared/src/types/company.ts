export type ICompanySetupMode = "select" | "create";

export interface IRemoteBranch {
  id: string | number;
  code: string;
  name: string;
  location?: string;
}

export interface IRemoteCompany {
  id: string | number;
  name: string;
  businessTypes: string[];
  tpin?: string;
  businessRegNo?: string;
  logoUrl?: string;
  country?: string;
  province?: string;
  district?: string;
  branches: IRemoteBranch[];
}

export interface ICompanyProfile {
  id?: string | number;
  name: string;
  businessTypes: string[];
  tpin?: string;
  businessRegNo?: string;
  logo?: string;
  country?: string;
  province?: string;
  district?: string;
  location?: string;
  source?: "local" | "backend";
}

export interface IBranchProfile {
  id?: string | number;
  companyId?: string | number;
  code: string;
  name: string;
  location?: string;
  isMain?: boolean;
  deviceLocation?: string;
}

export interface ICompanySetupCache {
  mode: ICompanySetupMode;
  company: ICompanyProfile | null;
  mainBranch: IBranchProfile | null;
  selectedBranchId?: string | number;
  savedAt: string;
}

export interface IDeviceProfileCache {
  deviceName: string;
  stationNumber?: string;
  location?: string;
  branchId?: string | number;
  savedAt: string;
}