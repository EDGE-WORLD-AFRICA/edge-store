import { useEffect, useState } from "react";
import type { IBootstrapStage } from "@edge-store/shared";
import { loadCache } from "../lib/cache";
import { resolveBootstrapStage } from "../lib/bootstrap";
import { getMachineFingerprint } from "../lib/fingerprint";
import { useHashRoute } from "../lib/useHashRoute";
import { SetupLayout } from "./components/SetupLayout";
import { ServerConfigStep } from "./steps/ServerConfigStep";
import { LicenseStep } from "./steps/LicenseStep";
import { CompanySetupStep } from "./steps/CompanySetupStep";
import { SuperAdminSetupStep } from "./steps/SuperAdminSetupStep";
import { DeviceSetupStep } from "./steps/DeviceSetupStep";
import { SummaryStep } from "./steps/SummaryStep";
import { LoginScreen } from "../auth/LoginScreen";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { SalesPage } from "../pages/SalesPage";
import { UsersPage } from "../pages/UsersPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ConfigurationsPage } from "../pages/ConfigurationsPage";
import { MetadataConfigurationsPage } from "../pages/MetadataConfigurationsPage";
import { NetworkConfigurationsPage } from "../pages/NetworkConfigurationsPage";

export const SetupWizard = () => {
  const [currentStage, setCurrentStage] = useState<IBootstrapStage>("SERVER_CONFIG");
  const [machineCode, setMachineCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { route, navigate } = useHashRoute();

  useEffect(() => {
    const init = async () => {
      const code = await getMachineFingerprint();
      setMachineCode(code);
      const cache = loadCache();
      const stage = resolveBootstrapStage(cache);
      setCurrentStage(stage);
      setIsLoading(false);
    };
    init();
  }, []);

  const goToNextStage = () => {
    const cache = loadCache();
    const nextStage = resolveBootstrapStage(cache);
    setCurrentStage(nextStage);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-muted-foreground">Initializing Edge Store...</div>
      </div>
    );
  }

  if (currentStage === "APP") {
    const cache = loadCache();

        if (cache.auth) {
      const renderPage = () => {
        // Configurations section (cards + nested sub-pages)
        if (route === "configurations" || route.startsWith("configurations.")) {
          
          // 1. Metadata Sub-pages
          if (route === "configurations.metadata" || route.startsWith("configurations.metadata.")) {
            return <MetadataConfigurationsPage route={route} onNavigate={navigate} />;
          }
          
          // 2. Network Sub-page (ADD THIS)
          if (route === "configurations.network") {
            return <NetworkConfigurationsPage />;
          }

          // 3. Fallback to main Configurations cards page
          return <ConfigurationsPage onNavigate={navigate} />;
        }

        // Top-level pages
        switch (route) {
          case "inventory": return <InventoryPage />;
          case "sales": return <SalesPage />;
          case "users": return <UsersPage />;
          case "profile": return <ProfilePage />;
          case "dashboard":
          default:
            return <DashboardPage />;
        }
      };

      return (
        <MainLayout currentPage={route} onNavigate={navigate}>
          {renderPage()}
        </MainLayout>
      );
    }

    return <LoginScreen />;
  }

  const renderStep = () => {
    switch (currentStage) {
      case "SERVER_CONFIG":
        return <ServerConfigStep onComplete={goToNextStage} />;
      case "LICENSE":
        return <LicenseStep machineCode={machineCode} onComplete={goToNextStage} />;
      case "COMPANY_SETUP":
        return <CompanySetupStep onComplete={goToNextStage} />;
      case "SUPER_ADMIN_SETUP":
        return <SuperAdminSetupStep onComplete={goToNextStage} />;
      case "DEVICE_SETUP":
        return <DeviceSetupStep onComplete={goToNextStage} />;
      case "SUMMARY":
        return <SummaryStep onComplete={goToNextStage} />;
      default:
        return null;
    }
  };

  return (
    <SetupLayout currentStage={currentStage} machineCode={machineCode}>
      {renderStep()}
    </SetupLayout>
  );
};