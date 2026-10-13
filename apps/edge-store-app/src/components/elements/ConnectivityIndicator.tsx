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
import { Tooltip } from "../ui/Tooltip"; // Adjust path if your Tooltip is elsewhere

type INetworkType = "wifi" | "ethernet" | "usb_tethering" | "unknown" | "none";

interface IConnectivityIndicatorProps {
  showNetwork?: boolean;
  showNetworkSpeed?: boolean;
  showInternet?: boolean;
  showServer?: boolean;
  showApiLatency?: boolean;
  isApiClickable?: boolean;
  showLabels?: boolean;
  showNetworkLabel?: boolean;
  showInternetLabel?: boolean;
  showServerLabel?: boolean;
  networkLabel?: string;
  internetLabel?: string;
  serverLabel?: string;
}

export const ConnectivityIndicator = ({
  showNetwork = true,
  showNetworkSpeed = true,
  showInternet = true,
  showServer = true,
  showApiLatency = true,
  isApiClickable = false,
  showLabels = false,
  showNetworkLabel,
  showInternetLabel,
  showServerLabel,
  networkLabel,
  internetLabel,
  serverLabel,
}: IConnectivityIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<INetworkType>("unknown");
  const [networkInfo, setNetworkInfo] = useState<{ downlink: number | null; rtt: number | null }>({
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
      const { apiStatus: wApiStatus, apiLatency: wApiLatency, internetStatus: wInternetStatus } = event.data;
      setApiStatus(wApiStatus);
      setApiLatency(wApiLatency);
      setInternetStatus(wInternetStatus);
    };
    workerRef.current.postMessage({ action: "start", apiUrl, internetUrl, intervalMs: 30000 });

    return () => {
      workerRef.current?.postMessage({ action: "stop" });
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [server]);

  const getNetworkIcon = () => {
    const tooltip = !isOnline
      ? "No network connection detected"
      : networkType === "wifi"
      ? "Connected via Wi-Fi"
      : networkType === "ethernet"
      ? "Connected via Ethernet cable"
      : networkType === "usb_tethering"
      ? "Connected via USB tethering"
      : "Connected to a network";

    const colorClass = isOnline ? "text-success" : "text-danger";
    let Icon = Wifi;
    if (!isOnline) Icon = Unplug;
    else if (networkType === "ethernet") Icon = EthernetPort;
    else if (networkType === "usb_tethering") Icon = Cable;

    return (
      <Tooltip content={tooltip} side="top">
        <Icon size={14} className={colorClass} />
      </Tooltip>
    );
  };

  const getInternetIcon = () => {
    const tooltip =
      internetStatus === "checking"
        ? "Checking internet connectivity..."
        : internetStatus === "online"
        ? "Internet is reachable"
        : "Internet is unreachable";

    let Icon = Globe;
    let colorClass = "text-success";
    let isSpinning = false;

    if (internetStatus === "checking") {
      colorClass = "text-muted-foreground";
      isSpinning = true;
    } else if (internetStatus === "offline") {
      colorClass = "text-danger";
    }

    return (
      <Tooltip content={tooltip} side="top">
        <Icon size={14} className={`${colorClass} ${isSpinning ? "animate-spin" : ""}`} />
      </Tooltip>
    );
  };

  const getApiIcon = () => {
    const apiHost = server ? `${server.host}${server.port ? `:${server.port}` : ""}` : "API";
    let tooltip = `Checking API connectivity (${apiHost})...`;
    let Icon = Server;
    let colorClass = "text-success";
    let isSpinning = false;

    if (apiStatus === "offline") {
      tooltip = `API unreachable (${apiHost})`;
      Icon = ServerCrash;
      colorClass = "text-danger";
    } else if (apiStatus === "checking") {
      tooltip = `Checking API connectivity (${apiHost})...`;
      colorClass = "text-muted-foreground";
      isSpinning = true;
    } else if (apiStatus === "slow") {
      tooltip = `API reachable, but high latency (${apiHost})`;
      colorClass = "text-warning";
    } else if (apiStatus === "online") {
      tooltip = `API reachable via ${apiHost}`;
      if (internetStatus === "offline") tooltip += " (local network only)";
    }

    return (
      <Tooltip content={tooltip} side="top">
        <Icon size={14} className={`${colorClass} ${isSpinning ? "animate-spin" : ""}`} />
      </Tooltip>
    );
  };

  const effShowNetworkLabel = showNetworkLabel ?? showLabels;
  const effShowInternetLabel = showInternetLabel ?? showLabels;
  const effShowServerLabel = showServerLabel ?? showLabels;

  const defaultNetworkLabel = !isOnline
    ? "No Network"
    : networkType === "wifi"
    ? "Wireless"
    : networkType === "ethernet"
    ? "Wired"
    : networkType === "usb_tethering"
    ? "USB Tethering"
    : "Network";

  const finalNetworkLabel = networkLabel ?? defaultNetworkLabel;
  const finalInternetLabel = internetLabel ?? "Internet";
  const finalServerLabel = serverLabel ?? "API";

  const handleApiClick = () => {
    if (isApiClickable) setIsConfigModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-4 text-xs font-medium">
        {showNetwork && (
          <div className="flex items-center gap-1.5">
            {getNetworkIcon()}
            {effShowNetworkLabel && (
              <span className={isOnline ? "text-success" : "text-danger"}>{finalNetworkLabel}</span>
            )}
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
          <div className="flex items-center gap-1.5">
            {getInternetIcon()}
            {effShowInternetLabel && (
              <span className={internetStatus === "online" ? "text-success" : internetStatus === "offline" ? "text-danger" : "text-muted-foreground"}>
                {finalInternetLabel}
              </span>
            )}
          </div>
        )}

        {showInternet && showServer && <div className="h-3 w-px bg-border" />}

        {showServer && (
          <div
            className={`flex items-center gap-1.5 ${isApiClickable ? "cursor-pointer rounded-md px-2 py-1 transition-colors hover:bg-muted active:bg-muted/70" : ""}`}
            onClick={handleApiClick}
            role={isApiClickable ? "button" : undefined}
            tabIndex={isApiClickable ? 0 : undefined}
            onKeyDown={isApiClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleApiClick(); } } : undefined}
          >
            {getApiIcon()}
            {effShowServerLabel && (
              <span className={apiStatus === "online" || apiStatus === "slow" ? "text-success" : apiStatus === "offline" ? "text-danger" : "text-muted-foreground"}>
                {finalServerLabel}
              </span>
            )}
            {showApiLatency && apiLatency !== null && apiStatus !== "offline" && (
              <span className="ml-1 flex items-center gap-1 text-[10px] font-normal text-muted-foreground tabular-nums">
                <Activity size={10} />
                {apiLatency}ms
              </span>
            )}
          </div>
        )}
      </div>

      <ApiConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
    </>
  );
};