import { useState } from "react";
import { Loader2, AlertTriangle, PlugZap } from "lucide-react";
import type { IServerConfigCache, IServerProtocol } from "@edge-store/shared";
import { setCacheSection, getApiBaseUrl } from "../../lib/cache";
import { dateToIsoString } from "../../lib/datetimes";

interface IServerConfigStepProps {
  onComplete: () => void;
}

export const ServerConfigStep = ({ onComplete }: IServerConfigStepProps) => {
  const [protocol, setProtocol] = useState<IServerProtocol>("https");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [basePath, setBasePath] = useState("api/v1");
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestAndSave = async () => {
    setError(null);

    if (!host.trim()) {
      setError("Host is required.");
      return;
    }

    setIsTesting(true);

    const config: IServerConfigCache = {
      protocol,
      host: host.trim(),
      port: port.trim() || undefined,
      basePath: basePath.trim(),
      savedAt: dateToIsoString(new Date()),
    };

    const baseUrl = getApiBaseUrl(config);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        setError(`Server responded with status ${response.status}. Please check the configuration.`);
        setIsTesting(false);
        return;
      }

      setCacheSection("server", config);
      setIsTesting(false);
      onComplete();
    } catch {
      setError(`Could not reach the API at ${baseUrl}. Please verify the server is running and the configuration is correct.`);
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Server Configuration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect Edge Store to your backend API server. The connection will be verified before proceeding.
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
              placeholder="443 or 3000"
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

        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <PlugZap size={14} className="shrink-0 text-primary" />
          <span>
            The connection will be tested against the <code className="font-mono">/health</code> endpoint.
            Setup cannot proceed without a successful connection.
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleTestAndSave}
          disabled={isTesting}
          className="flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {isTesting && <Loader2 size={16} className="mr-2 animate-spin" />}
          {isTesting ? "Testing Connection..." : "Test & Continue"}
        </button>
      </div>
    </div>
  );
};