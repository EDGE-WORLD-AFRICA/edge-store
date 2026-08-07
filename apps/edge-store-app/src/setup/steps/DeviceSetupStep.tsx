import { useState } from 'react';
import { AlertTriangle, Loader2, MonitorSmartphone } from "lucide-react";
import type { IDeviceProfileCache } from '@edge-store/shared';
import { getCacheSection, setCacheSection } from '../../lib/cache';
import { dateToIsoString } from '../../lib/datetimes';

interface IDeviceSetupStepProps {
  onComplete: () => void;
}

export const DeviceSetupStep = ({ onComplete }: IDeviceSetupStepProps) => {
  const company = getCacheSection("company");

  const [deviceName, setDeviceName] = useState("");
  const [stationNumber, setStationNumber] = useState("");
  const [location, setLocation] = useState(company?.mainBranch?.deviceLocation || company?.mainBranch?.location || "");

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    setError(null);

    if(!deviceName.trim()){
      setError("Device name is required.");
      return;
    }

    setIsSaving(true);

    await new Promise((r) => setTimeout(r, 900));

    const deviceProfile: IDeviceProfileCache = {
      deviceName: deviceName.trim(),
      stationNumber: stationNumber.trim() || undefined,
      location: location.trim() || undefined,
      branchId: company?.selectedBranchId,
      savedAt: dateToIsoString(new Date())
    };

    setCacheSection("device", deviceProfile);
    setIsSaving(false);
    onComplete();
  };


  return(
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Device Setup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Name this device so it can be identified within the company branch.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 rounded-md border border-info/20 bg-info-soft p-3">
            <MonitorSmartphone size={18} className="shrink-0 text-info-foreground" />
            <div className="text-xs text-info-foreground">
              <p className="font-semibold">
                Company: {company?.company?.name || "Unknown Company"}
              </p>
              <p className="mt-0.5 text-info-foreground/80">
                Branch: {company?.mainBranch?.name || "Unknown Branch"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Device Name
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="POS-01"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Station / Machine Number
              </label>
              <input
                type="text"
                value={stationNumber}
                onChange={(e) => setStationNumber(e.target.value)}
                placeholder="01"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Device Location / Shop
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Front Desk, Store 2, Machine 5"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
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
            onClick={handleContinue}
            disabled={isSaving}
            className="flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
            {isSaving ? "Saving Device..." : "Finish Setup"}
          </button>
        </div>
      </div>
    </>
  );
}