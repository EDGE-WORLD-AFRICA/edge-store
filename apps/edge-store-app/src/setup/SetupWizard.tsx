import { useEffect, useState } from "react";
import type { IBootstrapStage } from "@edge-store/shared";
import { loadCache } from "../lib/cache";
import { resolveBootstrapStage } from "../lib/bootstrap";
import { getMachineFingerprint } from "../lib/fingerprint";
import { SetupLayout } from "./components/SetupLayout";
import { ServerConfigStep } from "./steps/ServerConfigStep";

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
        return <div className="text-foreground">License Step (Coming Next)</div>;
      case "COMPANY_SETUP":
        return <div className="text-foreground">Company Details Step (Coming Next)</div>;
      case "SUPER_ADMIN_SETUP":  
        return <div className="text-foreground">Admin Details Step (Coming Next)</div>;
      case "LOGIN":
        return <div className="text-foreground">Login Step (Coming Next)</div>;
      case "APP": 
        return(
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary">Welcome to Edge Store</h1>
              <p className="mt-2 text-muted-foreground">Setup complete. Application is ready.</p>
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