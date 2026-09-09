import { useEffect, useState } from "react";
import { Building2, Lock, User, Loader2, AlertTriangle, Sun, Moon, Store, WifiOff } from "lucide-react";
import type { IAuthSessionCache } from "@edge-store/shared";
import { loadCache, setCacheSection } from "../lib/cache";
import { useTheme } from "../theme/ThemeProvider";
import { ConnectivityIndicator } from "../components/elements/ConnectivityIndicator";
import { authService } from "../services/authService";
import { decryptOfflineData } from "../lib/crypto";

export const LoginScreen = () => {
  const cache = loadCache();
  const { resolved, setMode } = useTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiReachable, setIsApiReachable] = useState<boolean | null>(null);

  const companyName = cache.company?.company?.name || "Edge Store";
  const branchName = cache.company?.mainBranch?.location || "Main Store";
  const logo = cache.company?.company?.logo;

  useEffect(() => {
    const checkApi = async () => {
      const reachable = await authService.checkHealth();
      setIsApiReachable(reachable);
    };
    checkApi();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    if (isApiReachable) {
      try {
        const data = await authService.loginOnline({ username, password });

        const session = authService.buildSessionCache(data, "online");
        setCacheSection("auth", session);

        const offlineCache = await authService.buildOfflineCache(data, password);
        setCacheSection("offlineAuth", [offlineCache]);

        window.location.reload();
      } catch (err: any) {
        setError(err.response?.data?.message || "Login failed. Please check your credentials or connection to the backend.");
      }
    } else {
      const offlineAuth = cache.offlineAuth?.find(o => o.username === username);

      if (!offlineAuth) {
        setError("No offline session found. Please connect to the internet and login once.");
        setIsLoading(false);
        return;
      }

      try {
        const decrypted = await decryptOfflineData(offlineAuth.encryptedPayload, password);
        const session = authService.buildSessionCache(decrypted, "offline");
        setCacheSection("auth", session);
        window.location.reload();
      } catch {
        setError("Invalid password or corrupted offline data.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />

      <button
        onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
        className="absolute right-4 top-2 rounded-md border border-border bg-card p-2 text-foreground shadow-sm transition-colors hover:bg-muted"
        aria-label="Toggle theme"
      >
        {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="mb-4 text-center">
            {logo ? (
              <img src={logo} alt="Company Logo" className="mx-auto h-24 w-24 rounded-xl border border-border bg-card object-contain p-2 shadow-md" />
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-card shadow-md">
                <div className="flex items-center gap-2">
                  <Store size={28} className="text-primary" />
                  <span className="text-xl font-bold text-primary">EDGE</span>
                </div>
              </div>
            )}
            <h1 className="mt-4 text-2xl font-bold text-foreground">{companyName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{branchName}</p>
          </div>

          {isApiReachable === false && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-warning/10 p-3 text-sm text-warning">
              <WifiOff size={16} />
              Server unreachable. You will login offline.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <button onClick={handleLogin} disabled={isLoading} className="flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50">
              {isLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <ConnectivityIndicator showNetworkSpeed={false} showApiLatency={false} isApiClickable={true} />
        </div>
      </div>
    </div>
  );
};