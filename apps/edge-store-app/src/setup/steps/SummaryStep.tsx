import { useState } from "react";
import {
  Server,
  KeyRound,
  Building2,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { loadCache, updateCache } from "../../lib/cache";
import { submitSetupData } from "../../lib/api";

interface ISummaryStepProps {
  onComplete: () => void;
}

export const SummaryStep = ({ onComplete }: ISummaryStepProps) => {
  const cache = loadCache();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFinishSetup = async () => {
    setError(null);
    setIsSubmitting(true);

    const result = await submitSetupData(cache);

    if (result.success) {
      setSuccess(true);

      updateCache((c) => {
        c.setup.setupCompleted = true;
        c.setup.lastBootstrapAt = new Date().toISOString();
      });

      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      setError(result.message || "Failed to save setup data to backend.");
      setIsSubmitting(false);
    }
  };

  const SummaryCard = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <Icon size={18} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );

  const Item = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right break-all">
        {value || "—"}
      </span>
    </div>
  );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-16 text-center">
        <div className="animate-success-pop rounded-full bg-success/10 p-6 ring-8 ring-success/5">
          <ShieldCheck size={72} className="text-success" />
        </div>
        <div className="space-y-2">
          <h2
            className="animate-fade-in-up text-2xl font-bold text-foreground"
            style={{ animationDelay: "0.2s" }}
          >
            Setup Saved Successfully
          </h2>
          <p
            className="animate-fade-in-up text-sm text-muted-foreground"
            style={{ animationDelay: "0.4s" }}
          >
            Configuration synced to backend. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review & Finish</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review your configuration. Clicking Finish will save this setup to the Edge Store backend.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <SummaryCard title="Company Details" icon={Building2}>
          {cache.company?.company?.logo && (
            <div className="mb-3 flex justify-center">
              <img
                src={cache.company.company.logo}
                alt="Company Logo"
                className="h-16 w-16 rounded-md border border-border bg-background object-contain p-1"
              />
            </div>
          )}
          <Item label="Company Name" value={cache.company?.company?.name} />
          <Item
            label="Business Types"
            value={cache.company?.company?.businessTypes.join(", ")}
          />
          <Item label="TPIN" value={cache.company?.company?.tpin} />
          <Item label="Reg No." value={cache.company?.company?.businessRegNo} />
        </SummaryCard>

        <SummaryCard title="Branch & Location" icon={MapPin}>
          <Item label="Branch Code" value={cache.company?.mainBranch?.code} />
          <Item label="Branch Name" value={cache.company?.mainBranch?.name} />
          <Item label="Branch Location" value={cache.company?.mainBranch?.location} />
          <Item label="Device Location" value={cache.company?.mainBranch?.deviceLocation} />
        </SummaryCard>

        <SummaryCard title="Device Profile" icon={MonitorSmartphone}>
          <Item label="Device Name" value={cache.device?.deviceName} />
          <Item label="Station Number" value={cache.device?.stationNumber} />
          <Item label="Location" value={cache.device?.location} />
        </SummaryCard>

        <SummaryCard title="License Status" icon={KeyRound}>
          <Item label="Status" value={cache.license?.status.toUpperCase()} />
          <Item label="Activation Code" value={cache.license?.activationCode} />
          <Item
            label="Machine Code"
            value={`${cache.license?.machineCode?.substring(0, 18)}...`}
          />
          <Item label="Access Mode" value={cache.license?.claims?.accessMode || "production"} />
        </SummaryCard>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleFinishSetup}
          disabled={isSubmitting}
          className="flex items-center justify-center rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {isSubmitting && <Loader2 size={16} className="mr-2 animate-spin" />}
          {isSubmitting ? "Saving to Backend..." : "Finish Setup"}
        </button>
      </div>
    </div>
  );
};