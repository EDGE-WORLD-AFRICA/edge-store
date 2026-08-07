import { useEffect, useRef, useState } from "react";
import {
  Wifi,
  EthernetPort,
  Unplug,
  Server,
  ServerCrash,
  Globe,
  Loader2,
  Activity,
} from "lucide-react";
import { getCacheSection, getApiBaseUrl } from "../../lib/cache";
import ConnectivityWorker from "../../workers/connectivity.worker?worker";

interface IConnectivityIndicatorProps {
  showNetwork?: boolean;
  showNetworkSpeed?: boolean;
  showInternet?: boolean;
  showServer?: boolean;
  showApiLatency?: boolean;
}

export const ConnectivityIndicator = ({
  showNetwork = true,
  showNetworkSpeed = true,
  showInternet = true,
  showServer = true,
  showApiLatency = true,
}: IConnectivityIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = useState<{
    type: string;
    downlink: number | null;
    rtt: number | null;
  }>({
    type: "unknown",
    downlink: null,
    rtt: null,
  });

  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline" | "slow">("checking");
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [internetStatus, setInternetStatus] = useState<"checking" | "online" | "offline">("checking");

  const workerRef = useRef<Worker | null>(null);
  const server = getCacheSection("server");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateNetworkInfo = () => {
      if (connection) {
        setNetworkInfo({
          type: connection.type || "unknown",
          downlink: connection.downlink || null,
          rtt: connection.rtt || null,
        });
      }
    };

    updateNetworkInfo();
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo);
    }

    return () => {
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, []);

  useEffect(() => {
    if (!server) {
      setApiStatus("offline");
      return;
    }

    const baseUrl = getApiBaseUrl(server);
    const apiUrl = `${baseUrl}/health`;
    const internetUrl = "https://www.google.com/generate_204";

    workerRef.current = new ConnectivityWorker();

    workerRef.current.onmessage = (event) => {
      const {
        apiStatus: wApiStatus,
        apiLatency: wApiLatency,
        internetStatus: wInternetStatus,
      } = event.data;

      setApiStatus(wApiStatus);
      setApiLatency(wApiLatency);
      setInternetStatus(wInternetStatus);
    };

    workerRef.current.postMessage({
      action: "start",
      apiUrl,
      internetUrl,
      intervalMs: 30000,
    });

    return () => {
      workerRef.current?.postMessage({ action: "stop" });
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [server]);

  const getNetworkIcon = () => {
    if (!isOnline) {
      return <Unplug size={14} className="text-danger" />;
    }
    if (networkInfo.type === "wifi" || networkInfo.type === "cellular") {
      return <Wifi size={14} className="text-success" />;
    }
    if (networkInfo.type === "ethernet") {
      return <EthernetPort size={14} className="text-success" />;
    }
    return <Wifi size={14} className="text-success" />;
  };

  const getNetworkLabel = () => {
    if (!isOnline) return "No Network";
    if (networkInfo.type === "wifi" || networkInfo.type === "cellular") return "Wireless";
    if (networkInfo.type === "ethernet") return "Wired";
    return "Network";
  };

  const getApiIcon = () => {
    if (apiStatus === "offline") return <ServerCrash size={14} className="text-danger" />;
    if (apiStatus === "checking") return <Loader2 size={14} className="animate-spin text-muted-foreground" />;
    if (apiStatus === "slow") return <Server size={14} className="text-warning" />;
    return <Server size={14} className="text-success" />;
  };

  const getInternetIcon = () => {
    if (internetStatus === "checking") return <Loader2 size={14} className="animate-spin text-muted-foreground" />;
    if (internetStatus === "offline") return <Globe size={14} className="text-danger" />;
    return <Globe size={14} className="text-success" />;
  };

  const apiHost = server ? `${server.host}${server.port ? `:${server.port}` : ""}` : "API";
  const apiTooltip =
    apiStatus === "offline"
      ? `API unreachable (${apiHost})`
      : `API reachable via ${apiHost}${internetStatus === "offline" ? " (local network)" : ""}`;

  return (
    <div className="flex items-center gap-4 text-xs font-medium">
      {showNetwork && (
        <div className="flex items-center gap-1.5" title="Local Network Connection">
          {getNetworkIcon()}
          <span className={isOnline ? "text-success" : "text-danger"}>
            {getNetworkLabel()}
          </span>

          {showNetworkSpeed && isOnline && (networkInfo.downlink !== null || networkInfo.rtt !== null) && (
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">
              {networkInfo.downlink !== null && `${networkInfo.downlink} Mbps`}
              {networkInfo.downlink !== null && networkInfo.rtt !== null && " · "}
              {networkInfo.rtt !== null && `${networkInfo.rtt} ms`}
            </span>
          )}
        </div>
      )}

      {showNetwork && (showInternet || showServer) && <div className="h-3 w-px bg-border" />}

      {showInternet && (
        <div className="flex items-center gap-1.5" title="Internet Reachability">
          {getInternetIcon()}
          <span
            className={
              internetStatus === "online"
                ? "text-success"
                : internetStatus === "offline"
                ? "text-danger"
                : "text-muted-foreground"
            }
          >
            Internet
          </span>
        </div>
      )}

      {showInternet && showServer && <div className="h-3 w-px bg-border" />}

      {showServer && (
        <div className="flex items-center gap-1.5" title={apiTooltip}>
          {getApiIcon()}
          <span
            className={
              apiStatus === "online" || apiStatus === "slow"
                ? "text-success"
                : apiStatus === "offline"
                ? "text-danger"
                : "text-muted-foreground"
            }
          >
            API
          </span>

          {showApiLatency && apiLatency !== null && apiStatus !== "offline" && (
            <span className="ml-1 flex items-center gap-1 text-[10px] font-normal text-muted-foreground tabular-nums">
              <Activity size={10} />
              {apiLatency}ms
            </span>
          )}
        </div>
      )}
    </div>
  );
};