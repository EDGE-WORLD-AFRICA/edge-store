import React, { useState, useEffect, useCallback } from "react";
import {
  Package2,
  Layers,
  RefreshCw,
  AlertTriangle,
  CalendarClock,
  Tag,
  Gauge,
  Ruler,
  Truck,
  ScanLine,
} from "lucide-react";
import { inventoryService } from "../services/inventoryService";
import { Tooltip } from "../components/ui/Tooltip";

interface InventoryPageProps {
  onNavigate: (page: string) => void;
}

interface OverviewStats {
  totalItems: number | null;
  lowStock: number | null;
  totalBatches: number | null;
  expiringSoon: number | null;
}

const EMPTY_STATS: OverviewStats = {
  totalItems: null,
  lowStock: null,
  totalBatches: null,
  expiringSoon: null,
};

const safeCount = async (
  request: () => Promise<{ meta: { total: number } }>
): Promise<number | null> => {
  try {
    const result = await request();
    return result.meta.total;
  } catch {
    return null;
  }
};

const formatCount = (value: number | null): string =>
  value === null ? "—" : value.toLocaleString();

export const InventoryPage = ({ onNavigate }: InventoryPageProps) => {
  const [stats, setStats] = useState<OverviewStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    const [totalItems, lowStock, totalBatches, expiringSoon] = await Promise.all([
      safeCount(() => inventoryService.getAll({ page: 1, limit: 1 })),
      safeCount(() => inventoryService.getAll({ page: 1, limit: 1, status: "low_stock" })),
      safeCount(() => inventoryService.getAllBatches({ page: 1, limit: 1 })),
      safeCount(() => inventoryService.getAllBatches({ page: 1, limit: 1, status: "expiring_soon" })),
    ]);
    setStats({ totalItems, lowStock, totalBatches, expiringSoon });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const openSection = (section: "items" | "batches") => {
    onNavigate(section === "items" ? "inventory.items" : "inventory.batches");
  };

  const Skeleton = () => <div className="h-6 w-12 animate-pulse rounded bg-muted" />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Choose a workspace</p>
        </div>
        <Tooltip content={isLoading ? "Refreshing..." : "Refresh"}>
          <button
            onClick={loadOverview}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </Tooltip>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ─── INVENTORY CARD (Primary / Blue) ─── */}
        <button
          onClick={() => openSection("items")}
          className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />

          {/* Icon + badge */}
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package2 size={20} />
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Stock
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-3 text-base font-semibold text-foreground">Inventory Items</h3>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border bg-background/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                {isLoading ? <Skeleton /> : formatCount(stats.totalItems)}
              </p>
            </div>
            <div
              className={`rounded-md border px-3 py-2 ${
                stats.lowStock && stats.lowStock > 0
                  ? "border-danger/40 bg-danger/5"
                  : "border-border bg-background/60"
              }`}
            >
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <AlertTriangle size={9} />
                Restock
              </p>
              <p
                className={`mt-0.5 text-lg font-bold tabular-nums ${
                  stats.lowStock && stats.lowStock > 0 ? "text-danger" : "text-foreground"
                }`}
              >
                {isLoading ? <Skeleton /> : formatCount(stats.lowStock)}
              </p>
            </div>
          </div>

          {/* Chips */}
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
              <Tag size={9} /> Pricing
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <Gauge size={9} /> Alerts
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Ruler size={9} /> Units
            </span>
          </div>
        </button>

        {/* ─── BATCHES CARD (Orange) ─── */}
        <button
          onClick={() => openSection("batches")}
          className="group relative overflow-hidden rounded-xl border-2 border-border bg-card p-4 text-left transition-all hover:border-orange-500/60 hover:shadow-lg hover:shadow-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-orange-500/40" />

          {/* Icon + badge */}
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Layers size={20} />
            </div>
            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-500">
              Lots
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-3 text-base font-semibold text-foreground">Batches</h3>

          {/* Stats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-md border border-border bg-background/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">
                {isLoading ? <Skeleton /> : formatCount(stats.totalBatches)}
              </p>
            </div>
            <div
              className={`rounded-md border px-3 py-2 ${
                stats.expiringSoon && stats.expiringSoon > 0
                  ? "border-orange-500/40 bg-orange-500/5"
                  : "border-border bg-background/60"
              }`}
            >
              <p className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <CalendarClock size={9} />
                Expiring
              </p>
              <p
                className={`mt-0.5 text-lg font-bold tabular-nums ${
                  stats.expiringSoon && stats.expiringSoon > 0
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-foreground"
                }`}
              >
                {isLoading ? <Skeleton /> : formatCount(stats.expiringSoon)}
              </p>
            </div>
          </div>

          {/* Chips */}
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="inline-flex items-center gap-1 rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-600 dark:text-orange-400">
              <Truck size={9} /> Supplier
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <CalendarClock size={9} /> Expiry
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
              <ScanLine size={9} /> Trace
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};