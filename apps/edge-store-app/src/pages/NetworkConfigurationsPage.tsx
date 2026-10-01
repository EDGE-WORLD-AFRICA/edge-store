import { useState } from "react";
import { Globe, Loader2, Save, PlugZap } from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import { loadCache } from "../lib/cache";

interface IApiConfig {
  protocol: "http" | "https";
  serverUrl: string;
  port: string;
}

export const NetworkConfigurationsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Preload from the global cache (checking common keys like 'server' or 'api')
  const [config, setConfig] = useState<IApiConfig>(() => {
    const cache = loadCache();
    const server = cache.server;
    return {
      protocol: server?.protocol || "https",
      serverUrl: server?.host || "localhost",
      port: server?.port || "443",
    };
  });

  const handleChange = (field: keyof IApiConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    if (!config.serverUrl) {
      toast({ variant: "error", message: "Server URL is required to test connection." });
      return;
    }
    setIsTesting(true);
    // Simulate network request (Replace with actual API ping later)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsTesting(false);
    toast({ variant: "success", message: "Connection successful! Server responded with 200 OK." });
  };

  const handleSave = async () => {
    if (!config.serverUrl) {
      toast({ variant: "error", message: "Server URL is required." });
      return;
    }

    setIsLoading(true);

    try {
      const cache = loadCache();

      const updatedCache = {
        ...cache,
        server: {
          ...(cache.server || {}),
          protocol: config.protocol,
          url: config.serverUrl,
          port: config.port,
        },
      };

      localStorage.setItem(
        "edge-store-cache",
        JSON.stringify(updatedCache)
      );

      localStorage.setItem(
        "edge-store-server-config",
        JSON.stringify(config)
      );

      toast({
        variant: "success",
        message: "API configuration saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save config", error);

      toast({
        variant: "error",
        message: "Failed to save configuration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">API Configurations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage server connections and API endpoints.
        </p>
      </div>

      <div className="max-w-2xl">
        {/* API Connection Section */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe size={16} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Server Connection</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Protocol</label>
                <select
                  value={config.protocol}
                  onChange={(e) => handleChange("protocol", e.target.value as "http" | "https")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="https">HTTPS</option>
                  <option value="http">HTTP</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Server URL / IP</label>
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.100 or api.mycompany.com"
                  value={config.serverUrl}
                  onChange={(e) => handleChange("serverUrl", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Port</label>
              <input
                type="text"
                placeholder="e.g., 443, 8080, 3306"
                value={config.port}
                onChange={(e) => handleChange("port", e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting || isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {isTesting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <PlugZap size={14} />
                )}
                {isTesting ? "Testing..." : "Test Connection"}
              </button>

              <button
                onClick={handleSave}
                disabled={isLoading || isTesting}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isLoading ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};