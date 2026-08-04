import { useState, useEffect } from "react";
import { loadCache } from "./lib/cache";
import { IBootstrapStage, resolveBootstrapStage } from "./lib/bootstrap";
import { getMachineFingerprint } from "./lib/fingerprint";

import "./main.css";

function App() {
  const [stage, setStage] = useState<IBootstrapStage>("SERVER_CONFIG");
  const [machineCode, setMachineCode] = useState<string>("");

  useEffect(() => {
    async function init() {
      const code = await getMachineFingerprint();
      setMachineCode(code);

      const cache = loadCache();
      const currentStage = resolveBootstrapStage(cache);
      setStage(currentStage);
    }

    init();
  }, []);

  return(
    <>
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Edge Store</h1>
        <p className="text-sm text-slate-400">Powered by Edge World</p>

        <div className="mt-6 space-y-3">
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-4">
            <p className="text-xs uppercase text-slate-500">
              Current setup stage
            </p>
            <p className="mt-1 font-mono text-amber-300">{stage}</p>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 break-all">
            <p className="text-xs uppercase text-slate-500">
              Machine fingerprint
            </p>
            <p className="mt-1 font-mono text-xs text-emerald-300">
              {machineCode || "Generating..."}
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;