import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, MoreVertical, Pencil, Ban, Package, AlertTriangle,
  Calendar, Layers, ArrowRight,
} from "lucide-react";
import { inventoryService } from "../../services/inventoryService";
import { type InventoryBatch, type BatchQueryParams } from "@edge-store/shared";
import { Pagination } from "../../components/ui/Pagination";
import { BatchFormModal } from "./BatchFormModal";
import { Tooltip } from "../../components/ui/Tooltip";
import { usePersistedFilters } from "../../hooks/usePersistedFilters";

const getBatchStatus = (expiryDate: string | null | undefined) => {
  if (!expiryDate) return { label: "Active", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return { label: "Expired", class: "bg-red-600 text-white dark:bg-red-700" };
  if (daysUntilExpiry <= 30) return { label: "Expiring Soon", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  return { label: "Active", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
};

const defaultFilters = {
  page: 1, limit: 25, search: "", status: "all" as const,
  sort_by: "created_at" as const, sort_order: "desc" as const,
};

interface BatchesTabProps {
  onNavigate: (page: string) => void;
}

export const BatchesTab = ({ onNavigate }: BatchesTabProps) => {
  const { filters, setFilters, resetFilters } = usePersistedFilters("batches", defaultFilters);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<InventoryBatch | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: BatchQueryParams = {
        page: filters.page, limit: filters.limit, search: filters.search || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        sort_by: filters.sort_by, sort_order: filters.sort_order,
      };
      const response = await inventoryService.getAllBatches(params);
      setBatches(response.data);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) { console.error("Failed to fetch batches", error); }
    finally { setIsLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVoid = async (id: string) => {
    if (!window.confirm("Are you sure you want to void this batch?")) return;
    try { await inventoryService.voidBatch(id); fetchData(); }
    catch (error) { console.error("Failed to void batch", error); }
  };

  const handleSort = (field: BatchQueryParams["sort_by"]) => {
    setFilters({
      ...filters,
      sort_by: field,
      sort_order: filters.sort_by === field && filters.sort_order === "asc" ? "desc" : "asc",
    });
  };

  const SortHeader = ({ field, label }: { field: BatchQueryParams["sort_by"]; label: string }) => (
    <th className="px-4 py-3 font-medium">
      <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
        {label}
        {filters.sort_by === field && <span className="text-orange-500">{filters.sort_order === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );

  const expiringSoonCount = batches.filter((b) => {
    const status = getBatchStatus(b.expiry_date);
    return status.label === "Expiring Soon" || status.label === "Expired";
  }).length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Batches</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Group receipts into lots. Track suppliers and expiry dates.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus size={16} /> Add New Batch
        </button>
      </div>

      {/* ─── Workspace Switcher ─── */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-1.5">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-500">
            <Layers size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Batches</p>
            <p className="text-[11px] text-muted-foreground">Lot & expiry workspace</p>
          </div>
        </div>

        <Tooltip content="Switch to the Inventory workspace">
          <button
            onClick={() => onNavigate("inventory.items")}
            className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <Package size={13} />
            Inventory
            <ArrowRight size={12} />
          </button>
        </Tooltip>
      </div>

      {expiringSoonCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="font-medium">{expiringSoonCount} batch(es) are expiring soon or have expired. Review immediately.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" placeholder="Search by batch number or name..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any, page: 1 })}
          className="w-full sm:w-48 appearance-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
        <button onClick={resetFilters} className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <SortHeader field="batch_number" label="Batch Number" />
                <SortHeader field="name" label="Name" />
                <th className="px-4 py-3 font-medium">Supplier</th>
                <SortHeader field="expiry_date" label="Expiry Date" />
                <th className="px-4 py-3 font-medium text-center">Items</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading batches...</td></tr>
              ) : batches.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No batches found.</td></tr>
              ) : (
                batches.map((batch) => {
                  const status = getBatchStatus(batch.expiry_date);
                  return (
                    <tr key={batch.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{batch.batch_number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{batch.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{batch.supplier || "—"}</td>
                      <td className="px-4 py-3">
                        {batch.expiry_date ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-muted-foreground" />
                            <span className="tabular-nums">{new Date(batch.expiry_date).toLocaleDateString()}</span>
                          </div>
                        ) : <span className="text-muted-foreground">No expiry</span>}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">{batch.total_items || 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.class}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block text-left">
                          <button onClick={() => setActiveDropdown(activeDropdown === batch.id ? null : batch.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <MoreVertical size={16} />
                          </button>
                          {activeDropdown === batch.id && (
                            <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-border bg-card py-1 shadow-lg">
                              <button onClick={() => { setEditingBatch(batch); setActiveDropdown(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                                <Pencil size={14} /> Edit
                              </button>
                              <button onClick={() => { handleVoid(batch.id); setActiveDropdown(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10">
                                <Ban size={14} /> Void
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={filters.page} totalPages={totalPages} totalItems={totalItems} pageSize={filters.limit}
          isLoading={isLoading} onPageChange={(page) => setFilters({ ...filters, page })}
          onPageSizeChange={(size) => setFilters({ ...filters, limit: size, page: 1 })} onRefresh={fetchData}
        />
      </div>

      <BatchFormModal
        isOpen={isAddModalOpen || !!editingBatch}
        onClose={() => { setIsAddModalOpen(false); setEditingBatch(null); }}
        onSuccess={fetchData}
        initialData={editingBatch}
      />
      {activeDropdown && <div className="fixed inset-0 z-0" onClick={() => setActiveDropdown(null)} />}
    </div>
  );
};