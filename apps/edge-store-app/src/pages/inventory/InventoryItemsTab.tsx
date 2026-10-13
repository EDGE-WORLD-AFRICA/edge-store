import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, AlertTriangle, MoreVertical, Pencil, Ban, TrendingDown,
  Package2, Layers, ArrowRight,
} from "lucide-react";
import { inventoryService } from "../../services/inventoryService";
import { getLocalMetadata } from "../../lib/localApiClient";
import {
  type InventoryItem, type InventoryQueryParams,
  type LocalCategory, type InventoryBatch,
} from "@edge-store/shared";
import { Pagination } from "../../components/ui/Pagination";
import { InventoryFormModal } from "./InventoryFormModal";
import { Tooltip } from "../../components/ui/Tooltip";
import { usePersistedFilters } from "../../hooks/usePersistedFilters";

const getStockStatus = (stock: number, target: number, warning: number, critical: number) => {
  if (stock >= target) return "Full";
  if (stock >= target * 0.75) return "Average";
  if (stock >= target * 0.5) return "Half";
  if (stock > warning) return "Quarter";
  if (stock <= warning && stock > critical) return "Low";
  return "Critically Low";
};

const getStockBadgeClass = (status: string) => {
  switch (status) {
    case "Full": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Average": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Half": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Quarter": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "Low": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "Critically Low": return "bg-red-600 text-white dark:bg-red-700";
    default: return "bg-muted text-muted-foreground";
  }
};

const defaultFilters = {
  page: 1, limit: 25, search: "", category_id: "all", batch_id: "all",
  status: "all" as const, sort_by: "name" as const, sort_order: "asc" as const,
};

interface InventoryItemsTabProps {
  onNavigate: (page: string) => void;
}

export const InventoryItemsTab = ({ onNavigate }: InventoryItemsTabProps) => {
  const { filters, setFilters, resetFilters } = usePersistedFilters("inventory", defaultFilters);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: InventoryQueryParams = {
        page: filters.page, limit: filters.limit, search: filters.search || undefined,
        category_id: filters.category_id !== "all" ? filters.category_id : undefined,
        batch_id: filters.batch_id !== "all" ? filters.batch_id : undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        sort_by: filters.sort_by, sort_order: filters.sort_order,
      };
      const response = await inventoryService.getAll(params);
      setItems(response.data);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cats, batchResponse] = await Promise.all([
          getLocalMetadata<LocalCategory>("inventory_categories"),
          inventoryService.getAllBatches({ page: 1, limit: 100, status: "active" }),
        ]);
        setCategories(cats);
        setBatches(batchResponse.data);
      } catch (error) { console.error("Failed to load metadata", error); }
    };
    loadMetadata();
  }, []);

  const handleVoid = async (id: string) => {
    if (!window.confirm("Are you sure you want to void this item?")) return;
    try { await inventoryService.void(id); fetchData(); }
    catch (error) { console.error("Failed to void item", error); }
  };

  const handleSort = (field: InventoryQueryParams["sort_by"]) => {
    setFilters({
      ...filters,
      sort_by: field,
      sort_order: filters.sort_by === field && filters.sort_order === "asc" ? "desc" : "asc",
    });
  };

  const SortHeader = ({ field, label }: { field: InventoryQueryParams["sort_by"]; label: string }) => (
    <th className="px-4 py-3 font-medium">
      <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
        {label}
        {filters.sort_by === field && <span className="text-primary">{filters.sort_order === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );

  const lowStockCount = items.filter((i) => {
    const status = getStockStatus(i.current_stock, i.target_stock_level, i.warning_level, i.critical_low_level);
    return status === "Low" || status === "Critically Low";
  }).length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventory Items</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product catalogue, pricing, and stock levels.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {/* ─── Workspace Switcher ─── */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-1.5">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Package2 size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Inventory Items</p>
            <p className="text-[11px] text-muted-foreground">Stock control workspace</p>
          </div>
        </div>

        <Tooltip content="Switch to the Batches workspace">
          <button
            onClick={() => onNavigate("inventory.batches")}
            className="flex items-center gap-1.5 rounded-md border border-orange-500/30 bg-orange-500/5 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-500/10 dark:text-orange-400"
          >
            <Layers size={13} />
            Batches
            <ArrowRight size={12} />
          </button>
        </Tooltip>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="font-medium">{lowStockCount} item(s) on this page require immediate restocking.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" placeholder="Search by name or SKU..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full rounded-md border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value, page: 1 })}
          className="w-full sm:w-48 appearance-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="all">All Categories</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <select value={filters.batch_id} onChange={(e) => setFilters({ ...filters, batch_id: e.target.value, page: 1 })}
          className="w-full sm:w-48 appearance-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="all">All Batches</option>
          {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_number}</option>)}
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
                <SortHeader field="name" label="Item Details" />
                <th className="px-4 py-3 font-medium">Category</th>
                <SortHeader field="unit_price" label="Unit Price" />
                <SortHeader field="current_stock" label="Stock Level" />
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading inventory data...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No inventory items found.</td></tr>
              ) : (
                items.map((item) => {
                  const status = getStockStatus(item.current_stock, item.target_stock_level, item.warning_level, item.critical_low_level);
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.category_name}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">${item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium tabular-nums">{item.current_stock}</span>
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full ${status === "Critically Low" || status === "Low" ? "bg-danger" : status === "Quarter" ? "bg-orange-500" : status === "Half" ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min((item.current_stock / item.target_stock_level) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStockBadgeClass(status)}`}>
                          {(status === "Low" || status === "Critically Low") && <TrendingDown size={12} />}
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block text-left">
                          <button onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <MoreVertical size={16} />
                          </button>
                          {activeDropdown === item.id && (
                            <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-border bg-card py-1 shadow-lg">
                              <button onClick={() => { setEditingItem(item); setActiveDropdown(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                                <Pencil size={14} /> Edit
                              </button>
                              <button onClick={() => { handleVoid(item.id); setActiveDropdown(null); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10">
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

      <InventoryFormModal
        isOpen={isAddModalOpen || !!editingItem}
        onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }}
        onSuccess={fetchData}
        initialData={editingItem}
        preselectedBatchId={filters.batch_id !== "all" ? filters.batch_id : null}
      />
      {activeDropdown && <div className="fixed inset-0 z-0" onClick={() => setActiveDropdown(null)} />}
    </div>
  );
};