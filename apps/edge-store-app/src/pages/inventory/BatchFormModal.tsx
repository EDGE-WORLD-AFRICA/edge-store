import React, { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { inventoryService } from "../../services/inventoryService";
import { type InventoryBatch } from "@edge-store/shared";
import { Tooltip } from "../../components/ui/Tooltip";

interface BatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: InventoryBatch | null;
}

export const BatchFormModal = ({ isOpen, onClose, onSuccess, initialData }: BatchFormModalProps) => {
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingBatchNumber, setIsCheckingBatchNumber] = useState(false);
  const [batchNumberError, setBatchNumberError] = useState("");

  const [formData, setFormData] = useState<Partial<InventoryBatch>>({
    batch_number: "",
    name: "",
    description: "",
    supplier: "",
    manufacture_date: "",
    expiry_date: "",
    notes: "",
    ...initialData,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        batch_number: "",
        name: "",
        description: "",
        supplier: "",
        manufacture_date: "",
        expiry_date: "",
        notes: "",
        ...initialData,
      });
      setBatchNumberError("");
    }
  }, [isOpen, initialData]);

  const handleBatchNumberBlur = async () => {
    if (!formData.batch_number || (isEdit && formData.batch_number === initialData?.batch_number)) return;

    setIsCheckingBatchNumber(true);
    try {
      const exists = await inventoryService.checkBatchNumberExists(formData.batch_number, initialData?.id);
      if (exists) {
        setBatchNumberError("This batch number already exists. Please use a unique identifier.");
      } else {
        setBatchNumberError("");
      }
    } catch (err) {
      console.error("Batch number check failed", err);
    } finally {
      setIsCheckingBatchNumber(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchNumberError || !formData.batch_number || !formData.name) return;

    setIsLoading(true);
    try {
      if (isEdit && initialData) {
        await inventoryService.updateBatch(initialData.id, formData);
      } else {
        await inventoryService.createBatch(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save batch", error);
      alert(error.response?.data?.message || "Failed to save batch. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Batch" : "Add New Batch"}
          </h3>
          <Tooltip content="Close">
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X size={18} />
            </button>
          </Tooltip>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Batch Number *</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => {
                    setFormData({ ...formData, batch_number: e.target.value });
                    setBatchNumberError("");
                  }}
                  onBlur={handleBatchNumberBlur}
                  className={`w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none ${
                    batchNumberError ? "border-danger focus:border-danger" : "border-border focus:border-primary"
                  }`}
                  placeholder="e.g., BATCH-2026-001"
                />
                {isCheckingBatchNumber && (
                  <Loader2 size={16} className="absolute right-3 top-2.5 animate-spin text-muted-foreground" />
                )}
              </div>
              {batchNumberError && (
                <div className="mt-1 flex items-center gap-1 text-xs text-danger">
                  <AlertCircle size={12} /> {batchNumberError}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Batch Name *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g., Q1 2026 Medical Supplies"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Supplier</label>
              <input
                type="text"
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="e.g., MedSupply Co."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <input
                type="text"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Brief description of the batch"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Manufacture Date</label>
              <input
                type="date"
                value={formData.manufacture_date || ""}
                onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Expiry Date</label>
              <input
                type="date"
                value={formData.expiry_date || ""}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
                placeholder="Additional notes about this batch..."
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-2 border-t border-border p-4 bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !!batchNumberError || !formData.batch_number || !formData.name}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Update Batch" : "Add Batch"}
          </button>
        </div>
      </div>
    </div>
  );
};