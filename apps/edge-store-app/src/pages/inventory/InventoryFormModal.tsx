import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { inventoryService } from "../../services/inventoryService";
import { getLocalMetadata } from "../../lib/localApiClient";
import { type LocalCategory, type LocalUnit, type LocalTaxRate, type InventoryItem, type InventoryBatch } from "@edge-store/shared";
import { Tooltip } from "../../components/ui/Tooltip";

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: InventoryItem | null;
  preselectedBatchId?: string | null;
}

export const InventoryFormModal = ({ isOpen, onClose, onSuccess, initialData, preselectedBatchId }: InventoryFormModalProps) => {
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSku, setIsCheckingSku] = useState(false);
  const [skuError, setSkuError] = useState("");
  
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [units, setUnits] = useState<LocalUnit[]>([]);
  const [taxRates, setTaxRates] = useState<LocalTaxRate[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);

  const [formData, setFormData] = useState<Partial<InventoryItem> & { batch_id?: string; batch_quantity?: number }>({
    name: "", sku: "", category_id: "", unit_id: "", unit_price: 0,
    tax_enabled: false, tax_rate_id: null,
    target_stock_level: 100, warning_level: 20, critical_low_level: 5,
    batch_id: preselectedBatchId || "",
    batch_quantity: 0,
    ...initialData,
  });

  useEffect(() => {
    if (isOpen) {
      loadMetadata();
      setFormData({
        name: "", sku: "", category_id: "", unit_id: "", unit_price: 0,
        tax_enabled: false, tax_rate_id: null,
        target_stock_level: 100, warning_level: 20, critical_low_level: 5,
        batch_id: preselectedBatchId || "",
        batch_quantity: 0,
        ...initialData,
      });
      setSkuError("");
    }
  }, [isOpen, initialData, preselectedBatchId]);

  const loadMetadata = async () => {
    try {
      const [cats, unts, taxes] = await Promise.all([
        getLocalMetadata<LocalCategory>("inventory_categories"),
        getLocalMetadata<LocalUnit>("units_of_measure"),
        getLocalMetadata<LocalTaxRate>("tax_rates"),
      ]);
      setCategories(cats);
      setUnits(unts);
      setTaxRates(taxes);

      // Load active batches
      const batchResponse = await inventoryService.getAllBatches({ page: 1, limit: 100, status: 'active' });
      setBatches(batchResponse.data);
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  };

  const handleSkuBlur = async () => {
    if (!formData.sku || (isEdit && formData.sku === initialData?.sku)) return;
    
    setIsCheckingSku(true);
    try {
      const exists = await inventoryService.checkSkuExists(formData.sku, initialData?.id);
      if (exists) {
        setSkuError("This SKU already exists. Please use a unique identifier.");
      } else {
        setSkuError("");
      }
    } catch (err) {
      console.error("SKU check failed", err);
    } finally {
      setIsCheckingSku(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skuError || !formData.name || !formData.sku || !formData.category_id || !formData.unit_id) return;
    if (formData.tax_enabled && !formData.tax_rate_id) {
      alert("Please select a tax rate when tax is enabled.");
      return;
    }

    setIsLoading(true);
    try {
      const { batch_id, batch_quantity, ...itemData } = formData;
      
      if (isEdit && initialData) {
        await inventoryService.update(initialData.id, itemData);
      } else {
        const newItem = await inventoryService.create(itemData);
        
        // If batch is selected, add to batch
        if (batch_id && batch_quantity && batch_quantity > 0) {
          await inventoryService.addBatchItem({
            inventory_id: newItem.id,
            batch_id: batch_id,
            quantity: batch_quantity,
            unit_cost: itemData.unit_price,
          });
        }
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save inventory", error);
      alert(error.response?.data?.message || "Failed to save item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-semibold text-foreground">{isEdit ? "Edit Inventory Item" : "Add New Inventory Item"}</h3>
          <Tooltip content="Close">
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </Tooltip>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-foreground">Item Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g., Paracetamol 500mg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">SKU / Code *</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={formData.sku}
                  onChange={(e) => { setFormData({ ...formData, sku: e.target.value }); setSkuError(""); }}
                  onBlur={handleSkuBlur}
                  className={`w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none ${
                    skuError ? "border-danger focus:border-danger" : "border-border focus:border-primary"
                  }`}
                  placeholder="e.g., MED-001"
                />
                {isCheckingSku && <Loader2 size={16} className="absolute right-3 top-2.5 animate-spin text-muted-foreground" />}
              </div>
              {skuError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-danger">
                  <AlertCircle size={12} /> {skuError}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Unit of Sale *</label>
              <select
                required
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Select Unit</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Unit Price *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="tax_enabled"
                  checked={formData.tax_enabled}
                  onChange={(e) => setFormData({ ...formData, tax_enabled: e.target.checked, tax_rate_id: e.target.checked ? formData.tax_rate_id : null })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="tax_enabled" className="text-sm font-medium text-foreground cursor-pointer">
                  Apply Tax to this item
                </label>
              </div>

              {formData.tax_enabled && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Tax Rate *</label>
                  <select
                    required={formData.tax_enabled}
                    value={formData.tax_rate_id || ""}
                    onChange={(e) => setFormData({ ...formData, tax_rate_id: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Select Tax Rate</option>
                    {taxRates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} - {t.rate}% ({t.year})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {!isEdit && (
              <div className="sm:col-span-2 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Batch Assignment (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Assign to Batch</label>
                    <select
                      value={formData.batch_id || ""}
                      onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="">No batch</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batch_number} - {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.batch_id && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Quantity in Batch</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.batch_quantity || 0}
                        onChange={(e) => setFormData({ ...formData, batch_quantity: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="sm:col-span-2 border-t border-border pt-4 mt-2">
              <h4 className="text-sm font-semibold text-foreground mb-3">Stock Alert Thresholds</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Target Stock</label>
                  <input
                    type="number"
                    value={formData.target_stock_level}
                    onChange={(e) => setFormData({ ...formData, target_stock_level: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Warning Level (Low)</label>
                  <input
                    type="number"
                    value={formData.warning_level}
                    onChange={(e) => setFormData({ ...formData, warning_level: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-danger">Critical Level</label>
                  <input
                    type="number"
                    value={formData.critical_low_level}
                    onChange={(e) => setFormData({ ...formData, critical_low_level: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-danger focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-2 border-t border-border p-4 bg-muted/30">
          <button type="button" onClick={onClose} disabled={isLoading} className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !!skuError || !formData.name || !formData.sku}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
};