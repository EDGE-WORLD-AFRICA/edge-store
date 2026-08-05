import { useState } from "react";
import { setCacheSection } from "../../lib/cache";
import { dateToIsoString } from "../../lib/datetimes";
import { Copy, Check, AlertTriangle, Loader2 } from "lucide-react";

interface ILicenseStepProps {
  onComplete: () => void;
  machineCode: string; 
}

export const LicenseStep = ({ machineCode, onComplete }: ILicenseStepProps) => {
  const [activationCode, setActivationCode] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [isActivatingDemo, setIsActivatingDemo] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(machineCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };


  const handleActivate = async () => {
    setError(null);
    if(!activationCode.trim()){
      setError("Please enter a valid activation code.");
      return;
    }

    setIsActivating(true);
    // mock api call delay
    await new Promise((r) => setTimeout(r, 2000));

    setCacheSection("license", {
      status: "active",
      machineCode,
      activationCode: activationCode.trim(),
      lastCheckedAt: dateToIsoString(new Date()),
      claims: {
        licenseId: "MOCK-LIC-001",
        product: 'edge-store',
        machineCode,
        issuedAt: dateToIsoString(new Date()),
        expiresAt: null,
        notificationAt: null,
        durationType: "infinite",
        features: ["core"],
        limits: {}
      }
    });

    setIsActivating(false);
    onComplete();
  };


  const handleDemoMode = async () => {
    setIsActivatingDemo(true);
    await new Promise((r) => setTimeout(r, 1000));

    const nowMs = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const expiresAtMs = nowMs + thirtyDaysInMs;
    const notificationAtMs = expiresAtMs - thirtyDaysInMs;

    setCacheSection("license", {
      status: "active",
      machineCode,
      activationCode: "DEMO-MODE",
      lastCheckedAt: dateToIsoString(new Date()),
      claims: {
        licenseId: "DEMO-LIC-001",
        product: "edge-store",
        machineCode,
        issuedAt: dateToIsoString(new Date()),
        expiresAt: expiresAtMs,
        notificationAt: notificationAtMs,
        durationType: "trial",
        accessMode: "demo",
        demo: true,
        features: ["core"],
        limits: {}
      }
    });

    setIsActivatingDemo(false);
    onComplete();
  };

  return(
    <>
      <div className="space-y-4">
        <div>
          <h2 className="flex items-baseline gap-2 item text-2xl font-bold text-foreground">
            <span>License Activation</span>
            {isActivating && <Loader2 size={22} className="mr-2 animate-spin" />}
          </h2>
          <p className="flex item-center mt-1 text-sm text-muted-foreground">
            Activate your Edge Store license or enter Demo Mode to explore the system.
          </p>
        </div>

        {/* Fingerprint Display */}
        <div className="rounded-lg border border-info bg-info-soft p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-info-foreground uppercase tracking-wide">
              Device Fingerprint
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-medium text-info-foreground hover:text-primary transition-colors"
            >
              {isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="break-all font-mono text-xs text-foreground leading-relaxed">
            {machineCode || "Generating..."}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Share this fingerprint with your administrator to generate an activation code.
          </p>
        </div>

        {/* Activation Form */}
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Activation Code
            </label>
            <input
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              placeholder="EDGE-XXXX-XXXX-XXXX"
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={isActivating}
            className="flex items-center justify-center place-items-center gap-2 w-full rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {isActivating ? "Activating..." : "Activate License"}
            {isActivating && <Loader2 size={16} className="mr-2 animate-spin" />}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <button
            onClick={handleDemoMode}
            disabled={isActivating}
            className="flex w-full items-center gap-2 justify-center rounded-md border border-secondary bg-secondary-soft px-6 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/20 disabled:opacity-50"
          >
            Enter Demo Mode
            {isActivatingDemo && <Loader2 size={16} className="mr-2 animate-spin" />}
          </button>
        </div>
      </div>
    </>
  );
};