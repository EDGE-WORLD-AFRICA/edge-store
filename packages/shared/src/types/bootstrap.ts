export type IBootstrapStage = "SERVER_CONFIG" | "LICENSE" | "COMPANY_SETUP" | "SUPER_ADMIN_SETUP" | "DEVICE_SETUP" | "SUMMARY" | "APP";

export interface ISetupFlags {
  serverConfigured: boolean;
  licenseActive: boolean;
  companyDetected: boolean;
  superAdminExists: boolean;
  authenticated: boolean;
}

export interface IBootstrapStatus {
  stage: IBootstrapStage;
  title: string;
  description: string;
}