import { useState, useEffect } from "react";
import { Loader2, Save, PlugZap, CheckCircle2 } from "lucide-react";
import type { IServerProtocol } from "@edge-store/shared";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/ToastProvider";
import { getCacheSection, setCacheSection, getApiBaseUrl } from "../../lib/cache";
import { dateToIsoString } from "../../lib/datetimes";

interface IApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiConfigModal = ({ isOpen, onClose }: IApiConfigModalProps) => {
  const { toast } = useToast();
  const currentConfig = getCacheSection("server");

  const [protocol, setProtocol] = useState<IServerProtocol>(currentConfig?.protocol || "https");
  const [host, setHost] = useState(currentConfig?.host || "");
  const [port, setPort] = useState(currentConfig?.port || "");
  const [basePath, setBasePath] = useState(currentConfig?.basePath || "api/v1");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

   useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setIsTesting(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!host.trim()) {
      toast({
        variant: "error",
        title: "Validation Error",
        message: "Host is required.",
      });
      return;
    }

    setIsSaving(true);

    const config = {
      protocol,
      host: host.trim(),
      port: port.trim() || undefined,
      basePath: basePath.trim(),
      savedAt: dateToIsoString(new Date()),
    };

    setCacheSection("server", config);
    setIsSaving(false);

    toast({
      variant: "success",
      title: "Configuration Saved",
      message: "Server configuration cached successfully.",
    });

    // Run connection test
    setIsTesting(true);
    const baseUrl = getApiBaseUrl(config);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        toast({
          variant: "success",
          title: "API Connection",
          message: `API is reachable at ${baseUrl}.`,
        });
        
        // Set closing state and dismiss after 2 seconds
        setIsClosing(true);
        setIsTesting(false);
        setTimeout(() => {
          setIsClosing(false);
          onClose();
        }, 2000);
      } else {
        toast({
          variant: "warning",
          title: "Unexpected Response",
          message: `Server error: ${response.status}`,
        });
        setIsTesting(false);
      }
    } catch {
      toast({
        variant: "error",
        title: "Connection Failed",
        message: "Could not reach the API. Please check the configuration.",
      });
      setIsTesting(false);
    }
  };

  // Determine button state and text
  const isDisabled = isSaving || isTesting || isClosing;
  const getButtonText = () => {
    if (isClosing) return "Connected! Closing...";
    if (isTesting) return "Testing...";
    if (isSaving) return "Saving...";
    return "Save & Test";
  };

  const getButtonIcon = () => {
    if (isClosing) return <CheckCircle2 size={16} className="text-success" />;
    if (isSaving || isTesting) return <Loader2 size={16} className="animate-spin" />;
    return <Save size={16} />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API Configuration" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Protocol
            </label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value as IServerProtocol)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isClosing}
            >
              <option value="https">HTTPS</option>
              <option value="http">HTTP</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Host / IP
            </label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="api.edgestore.mw"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isClosing}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Port (Optional)
            </label>
            <input
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="443"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isClosing}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Base Path
            </label>
            <input
              type="text"
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              placeholder="api/v1"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isClosing}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            disabled={isClosing}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isDisabled}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors disabled:opacity-80 ${
              isClosing ? "bg-success hover:bg-success" : "bg-primary hover:bg-primary-strong"
            }`}
          >
            {getButtonIcon()}
            {getButtonText()}
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <PlugZap size={14} className="shrink-0 text-primary" />
          <span>
            Changes are saved locally and applied immediately. The connection test
            verifies the <code className="font-mono">/health</code> endpoint.
          </span>
        </div>
      </div>
    </Modal>
  );
};