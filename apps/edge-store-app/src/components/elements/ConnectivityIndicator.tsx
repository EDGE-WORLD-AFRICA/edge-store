import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Wifi,
  EthernetPort,
  Cable,
  Unplug,
  Server,
  ServerCrash,
  Globe,
  Loader2,
  Activity,
} from "lucide-react";
import { getCacheSection, getApiBaseUrl } from "../../lib/cache";
import ConnectivityWorker from "../../workers/connectivity.worker?worker";
import { ApiConfigModal } from "../elements/ApiConfigModal";

type INetworkType = "wifi" | "ethernet" | "usb_tethering" | "unknown" | "none";

interface IConnectivityIndicatorProps {
  showNetwork?: boolean;
  showNetworkSpeed?: boolean;
  showInternet?: boolean;
  showServer?: boolean;
  showApiLatency?: boolean;
  isApiClickable?: boolean;
}

export const ConnectivityIndicator = ({
  showNetwork = true,
  showNetworkSpeed = true,
  showInternet = true,
  showServer = true,
  showApiLatency = true,
  isApiClickable = false,
}: IConnectivityIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<INetworkType>("unknown");
  const [networkInfo, setNetworkInfo] = useState<{
    downlink: number | null;
    rtt: number | null;
  }>({
    downlink: null,
    rtt: null,
  });

  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline" | "slow">("checking");
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [internetStatus, setInternetStatus] = useState<"checking" | "online" | "offline">("checking");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

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
    const detectNetwork = async () => {
      try {
        const type = await invoke<string>("get_network_type");
        setNetworkType(type as INetworkType);
      } catch {
        setNetworkType("unknown");
      }

      const nav = navigator as any;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (connection) {
        setNetworkInfo({
          downlink: connection.downlink || null,
          rtt: connection.rtt || null,
        });
      }
    };

    detectNetwork();
    const interval = setInterval(detectNetwork, 15000);

    return () => clearInterval(interval);
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

    const colorClass = "text-success";

    switch (networkType) {
      case "wifi":
        return <Wifi size={14} className={colorClass} />;
      case "ethernet":
        return <EthernetPort size={14} className={colorClass} />;
      case "usb_tethering":
        return <Cable size={14} className={colorClass} />;
      default:
        return <Wifi size={14} className={colorClass} />;
    }
  };

  const getNetworkLabel = () => {
    if (!isOnline) return "No Network";

    switch (networkType) {
      case "wifi":
        return "Wireless";
      case "ethernet":
        return "Wired";
      case "usb_tethering":
        return "USB Tethering";
      default:
        return "Network";
    }
  };

  const getNetworkTooltip = () => {
    if (!isOnline) return "No network connection detected";

    switch (networkType) {
      case "wifi":
        return "Connected via Wi-Fi";
      case "ethernet":
        return "Connected via Ethernet cable";
      case "usb_tethering":
        return "Connected via USB tethering";
      default:
        return "Connected to a network";
    }
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

  const handleApiClick = () => {
    console.log("API Clicked! isApiClickable:", isApiClickable);
    if (isApiClickable) {
      setIsConfigModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 text-xs font-medium">
        {showNetwork && (
          <div className="flex items-center gap-1.5" title={getNetworkTooltip()}>
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
          <div
            className={`flex items-center gap-1.5 ${
              isApiClickable
                ? "cursor-pointer rounded-md px-2 py-1 transition-colors hover:bg-muted active:bg-muted/70"
                : ""
            }`}
            title={isApiClickable ? `${apiTooltip} (Click to configure)` : apiTooltip}
            onClick={handleApiClick}
            role={isApiClickable ? "button" : undefined}
            tabIndex={isApiClickable ? 0 : undefined}
            onKeyDown={
              isApiClickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleApiClick();
                    }
                  }
                : undefined
            }
          >
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

      {/* API Config Modal - Rendered outside the main div to avoid z-index issues */}
      <ApiConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
};