import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { metadataService } from "../../services/metadataService";
import { useToast } from "../../components/ui/ToastProvider";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const PriceTypeManager = () => {
  const { toast } = useToast();
  const [priceTypes, setPriceTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "", min_quantity: "1" });

  const [voidTarget, setVoidTarget] = useState<any | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      setPriceTypes(await metadataService.getPriceTypes());
    } catch {
      toast({ variant: "error", message: "Failed to load price types." });
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    if (!form.name.trim()) {
      toast({ variant: "error", message: "Name is required." });
      return false;
    }
    return true;
  };

  const handleSubmitClick = () => {
    if (!validate()) return;
    if (editingId) {
      setShowUpdateConfirm(true);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      min_quantity: parseInt(form.min_quantity) || 1,
    };

    try {
      if (editingId) {
        await metadataService.updatePriceType(editingId, payload);
        toast({ variant: "success", message: "Price type updated." });
      } else {
        await metadataService.createPriceType(payload);
        toast({ variant: "success", message: "Price type created." });
      }
      setShowForm(false);
      setEditingId(null);
      setShowUpdateConfirm(false);
      setForm({ name: "", code: "", description: "", min_quantity: "1" });
      load();
    } catch {
      toast({ variant: "error", message: "Failed to save price type." });
    }
    setIsSaving(false);
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      code: p.code,
      description: p.description || "",
      min_quantity: p.min_quantity.toString(),
    });
    setShowForm(true);
  };

  const handleVoidConfirm = async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    try {
      await metadataService.voidPriceType(voidTarget.id);
      toast({ variant: "success", message: "Price type voided." });
      setVoidTarget(null);
      load();
    } catch {
      toast({ variant: "error", message: "Failed to void price type." });
    }
    setIsVoiding(false);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Price Types</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", code: "", description: "", min_quantity: "1" });
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary-strong"
        >
          <Plus size={14} /> Add Price Type
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Code (e.g. RETAIL)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Min Quantity"
              value={form.min_quantity}
              onChange={(e) => setForm({ ...form, min_quantity: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmitClick}
              disabled={isSaving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-strong disabled:opacity-50"
            >
              {editingId ? "Update Price Type" : "Save Price Type"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Min Qty</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {priceTypes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  No price types found. Click "Add Price Type" to create one.
                </td>
              </tr>
            ) : (
              priceTypes.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground">{p.name}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{p.code}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.min_quantity}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.description || "—"}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(p)} className="mr-2 text-muted-foreground hover:text-foreground" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setVoidTarget(p)} className="text-danger hover:text-danger/80" title="Void">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!voidTarget}
        title="Void Price Type"
        message={`Are you sure you want to void "${voidTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Void"
        variant="danger"
        isLoading={isVoiding}
        onConfirm={handleVoidConfirm}
        onCancel={() => setVoidTarget(null)}
      />

      <ConfirmModal
        isOpen={showUpdateConfirm}
        title="Update Price Type"
        message={`Are you sure you want to update "${form.name}"?`}
        confirmLabel="Update"
        variant="default"
        isLoading={isSaving}
        onConfirm={handleSave}
        onCancel={() => setShowUpdateConfirm(false)}
      />
    </div>
  );
};