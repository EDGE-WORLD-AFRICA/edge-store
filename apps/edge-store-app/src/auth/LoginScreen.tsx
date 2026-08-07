import { useEffect, useState } from "react";
import {
  Building2,
  Lock,
  User,
  Loader2,
  AlertTriangle,
  Sun,
  Moon,
  Store,
  WifiOff,
} from "lucide-react";
import { loadCache, getCacheSection, getApiBaseUrl } from "../lib/cache";
import { useTheme } from "../theme/ThemeProvider";
import { ConnectivityIndicator } from "../components/ui/ConnectivityIndicator";

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
      const server = getCacheSection("server");
      if (!server) {
        setIsApiReachable(false);
        return;
      }

      try {
        const baseUrl = getApiBaseUrl(server);
        const response = await fetch(`${baseUrl}/health`, {
          method: "GET",
          cache: "no-store",
        });
        setIsApiReachable(response.ok);
      } catch {
        setIsApiReachable(false);
      }
    };

    checkApi();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    // Login logic will be implemented in the next step
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background Gradient / Image */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
      {/* 
        To use a background image, replace the div above with:
        <div 
          className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: "url('/path/to/your/background.jpg')" }} 
        />
      */}

      {/* Theme Toggle */}
      <button
        onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
        className="absolute right-4 top-2 rounded-md border border-border bg-card p-2 text-foreground shadow-sm transition-colors hover:bg-muted"
        aria-label="Toggle theme"
      >
        {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-sm">
          {/* Logo and Company Info */}
          <div className="mb-4 text-center">
            {logo ? (
              <img
                src={logo}
                alt="Company Logo"
                className="mx-auto h-24 w-24 rounded-xl border border-border bg-card object-contain p-2 shadow-md"
              />
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

        {/* Login Card */}
        
          {isApiReachable === false && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-warning/10 p-3 text-sm text-warning">
              <WifiOff size={16} />
              Server unreachable. You will login offline.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
            >
              {isLoading && <Loader2 size={16} className="mr-2 animate-spin" />}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </div>

        {/* Connectivity Indicator */}
        <div className="mt-6 flex justify-center">
          <ConnectivityIndicator showNetworkSpeed={false} showApiLatency={false} />
        </div>
      </div>
    </div>
  );
};