import { useEffect, useState } from "react";
import type { IBootstrapStage } from "@edge-store/shared";
import { loadCache } from "../lib/cache";
import { resolveBootstrapStage } from "../lib/bootstrap";
import { getMachineFingerprint } from "../lib/fingerprint";
import { SetupLayout } from "./components/SetupLayout";

import { ServerConfigStep } from "./steps/ServerConfigStep";
import { LicenseStep } from "./steps/LicenseStep";
import { CompanySetupStep } from "./steps/CompanySetupStep";
import { SuperAdminSetupStep } from "./steps/SuperAdminSetupStep";
import { DeviceSetupStep } from "./steps/DeviceSetupStep";
import { SummaryStep } from "./steps/SummaryStep";


export const SetupWizard = () => {
  const [currentStage, setCurrentStage] = useState<IBootstrapStage>("SERVER_CONFIG");
  const [machineCode, setMachineCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

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

  if(isLoading){
    return(
      <>
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="text-muted-foreground">Initializing App ...</div>
        </div>
      </>
    );
  }

  const renderStep = () => {
    switch(currentStage) {
      case "SERVER_CONFIG":
        return <ServerConfigStep onComplete={goToNextStage} />;
      case "LICENSE":
        return <LicenseStep onComplete={goToNextStage} machineCode={machineCode} />;
      case "COMPANY_SETUP":
        return <CompanySetupStep onComplete={goToNextStage} />;
      case "SUPER_ADMIN_SETUP":  
        return <SuperAdminSetupStep onComplete={goToNextStage} />;
      case "DEVICE_SETUP":
        return <DeviceSetupStep onComplete={goToNextStage} />;
      case "SUMMARY":
        return <SummaryStep onComplete={goToNextStage} />;
      case "APP": 
        return(
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary">Setup Complete</h1>
              <p className="mt-2 text-muted-foreground">Provisioning finished. Loading Application shell...</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return(<>
    <SetupLayout currentStage={currentStage} machineCode={machineCode}>
      {renderStep()}
    </SetupLayout>
  </>);
};