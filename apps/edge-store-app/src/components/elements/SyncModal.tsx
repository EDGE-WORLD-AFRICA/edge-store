import React, { useState, useEffect } from "react";
import type { SyncStatus } from "@edge-store/shared";
import { X, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "../../lib/apiClient";
import { getSyncStatus, updateSyncStatus, upsertLocalMetadata } from "../../lib/localApiClient";
import { Tooltip } from "../ui/Tooltip";

const ENTITIES = [
  { apiPath: "currencies", localTable: "currencies", label: "Currencies" },
  { apiPath: "categories", localTable: "inventory_categories", label: "Categories" },
  { apiPath: "inventory-types", localTable: "inventory_types", label: "Inventory Types" },
  { apiPath: "units", localTable: "units_of_measure", label: "Units of Measure" },
  { apiPath: "tax-types", localTable: "tax_types", label: "Tax Types" },
  { apiPath: "tax-rates", localTable: "tax_rates", label: "Tax Rates" },
  { apiPath: "price-types", localTable: "price_types", label: "Price Types" },
];

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal = ({ isOpen, onClose }: SyncModalProps) => {
  const [statuses, setStatuses] = useState<Record<string, SyncStatus>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    if (isOpen) loadStatuses();
  }, [isOpen]);

  const loadStatuses = async () => {
    const dbStatuses = await getSyncStatus();
    const statusMap: Record<string, SyncStatus> = {};
    dbStatuses.forEach((s) => {
      statusMap[s.entity] = s;
    });
    setStatuses(statusMap);
  };

  const syncEntity = async (apiPath: string, localTable: string) => {
    await updateSyncStatus(localTable, "syncing");
    await loadStatuses();

    try {
      const response = await apiClient.get(`/api/v1/metadata/${apiPath}`);
      const records = response.data.data || response.data;
      if (Array.isArray(records)) {
        await upsertLocalMetadata(localTable, records);
      }
      await updateSyncStatus(localTable, "synced");
    } catch (error) {
      console.error(`Failed to sync ${localTable}:`, error);
      await updateSyncStatus(localTable, "error");
    } finally {
      await loadStatuses();
    }
  };

  const syncAll = async () => {
    setIsSyncingAll(true);
    for (const entity of ENTITIES) {
      await syncEntity(entity.apiPath, entity.localTable);
    }
    setIsSyncingAll(false);
  };

  const getButtonState = (status: string) => {
    switch (status) {
      case "syncing":
        return {
          icon: <Loader2 size={16} className="animate-spin" />,
          tooltip: "Syncing...",
          disabled: true,
          className: "text-muted-foreground cursor-not-allowed",
        };
      case "synced":
        return {
          icon: <CheckCircle size={16} className="text-green-500" />,
          tooltip: "Synced — Click to re-sync",
          disabled: false,
          className: "text-green-500 hover:bg-green-500/10",
        };
      case "error":
        return {
          icon: <RefreshCw size={16} />,
          tooltip: "Sync failed — Click to retry",
          disabled: false,
          className: "text-muted-foreground hover:bg-muted hover:text-foreground",
        };
      default:
        return {
          icon: <RefreshCw size={16} />,
          tooltip: "Sync",
          disabled: false,
          className: "text-muted-foreground hover:bg-muted hover:text-foreground",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-semibold text-foreground">Sync Metadata</h3>
          <Tooltip content="Close">
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </Tooltip>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Warning: Syncing all metadata may take time depending on server reachability and data volume.
          </p>

          {ENTITIES.map((entity) => {
            const status = statuses[entity.localTable]?.status || "pending";
            const lastSynced = statuses[entity.localTable]?.last_synced_at;
            const btnState = getButtonState(status);

            return (
              <div key={entity.localTable} className="flex items-center justify-between rounded-md border border-border bg-background p-3">
                <div className="flex-1 pr-4">
                  <span className="text-sm font-medium text-foreground">{entity.label}</span>
                  {lastSynced && status === "synced" && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Last synced: {new Date(lastSynced).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {status === "error" && (
                    <Tooltip content="Sync failed" side="top">
                      <AlertCircle size={16} className="text-danger shrink-0" />
                    </Tooltip>
                  )}

                  <Tooltip content={btnState.tooltip} side="top">
                    <button
                      onClick={() => syncEntity(entity.apiPath, entity.localTable)}
                      disabled={btnState.disabled}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border transition-colors disabled:opacity-50 ${btnState.className}`}
                    >
                      {btnState.icon}
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border p-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
            Close
          </button>
          <Tooltip content={isSyncingAll ? "Syncing all metadata..." : "Sync all metadata"} side="top">
            <button
              onClick={syncAll}
              disabled={isSyncingAll}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncingAll ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {isSyncingAll ? "Syncing All..." : "Sync All"}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};