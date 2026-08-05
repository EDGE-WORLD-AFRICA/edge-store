import {  useState } from "react";
import type { IServerConfigCache, IServerProtocol } from "@edge-store/shared";
import { setCacheSection } from "../../lib/cache";
import { dateToIsoString } from "../../lib/datetimes";
import { Loader2 } from "lucide-react";

interface IServerConfigStepProps {
  onComplete: () => void;
}

export const ServerConfigStep = ({ onComplete }: IServerConfigStepProps) => {
  const [protocol, setProtocol] = useState<IServerProtocol>("http");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("3000");
  const [basePath, setBasePath] = useState("api/v1");
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestAndSave = async () => {
    setError(null);
    setIsTesting(true);

    //mock connction but will ping /health
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if(!host.trim()) {
      setError("Host is required.");
      setIsTesting(false);
      return;
    }

    const config: IServerConfigCache = {
      protocol,
      host: host.trim(),
      port: port.trim() || undefined,
      basePath: basePath.trim(),
      savedAt: dateToIsoString(new Date())
    };

    setCacheSection("server", config);
    setIsTesting(false);
    onComplete();
  };

  return(
    <>
      <div className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            Server Configuration 
            {isTesting && <Loader2 size={22} className="mr-2 animate-spin" />}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect Edge Store to your backend API server.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as IServerProtocol)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="https">HTTPS</option>
                <option value="http">HTTP</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Host / IP Address</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="api.edgestore.mw or 192.168.1.10"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Port (Optional)</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="443 or 8080"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Base Path</label>
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="api/v1"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleTestAndSave}
            disabled={isTesting}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {isTesting ? "Testing Connection..." : "Test & Continue"}
            {isTesting && <Loader2 size={16} className="mr-2 animate-spin" />}
          </button>
        </div>
      </div>
    </>
  );
};