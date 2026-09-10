import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { metadataService } from "../../services/metadataService";
import { useToast } from "../../components/ui/ToastProvider";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

const emptyForm = {
  tax_type_id: "",
  name: "",
  rate: "",
  year: new Date().getFullYear().toString(),
  effective_from: `${new Date().getFullYear()}-01-01`,
  description: "",
};

export const TaxManager = () => {
  const { toast } = useToast();
  const [taxTypes, setTaxTypes] = useState<any[]>([]);
  const [taxRates, setTaxRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [voidTarget, setVoidTarget] = useState<any | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [types, rates] = await Promise.all([
        metadataService.getTaxTypes(),
        metadataService.getTaxRates(),
      ]);
      setTaxTypes(types);
      setTaxRates(rates);
    } catch {
      toast({ variant: "error", message: "Failed to load tax data." });
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    if (!form.tax_type_id) {
      toast({ variant: "error", message: "Tax type is required." });
      return false;
    }
    if (!form.name.trim()) {
      toast({ variant: "error", message: "Name is required." });
      return false;
    }
    if (!form.rate || isNaN(parseFloat(form.rate))) {
      toast({ variant: "error", message: "A valid rate is required." });
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
      tax_type_id: form.tax_type_id,
      name: form.name.trim(),
      rate: parseFloat(form.rate),
      year: parseInt(form.year),
      effective_from: form.effective_from,
      description: form.description.trim() || null,
    };

    try {
      if (editingId) {
        await metadataService.updateTaxRate(editingId, payload);
        toast({ variant: "success", message: "Tax rate updated." });
      } else {
        await metadataService.createTaxRate(payload);
        toast({ variant: "success", message: "Tax rate created." });
      }
      setShowForm(false);
      setEditingId(null);
      setShowUpdateConfirm(false);
      setForm({ ...emptyForm });
      load();
    } catch {
      toast({ variant: "error", message: "Failed to save tax rate." });
    }
    setIsSaving(false);
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setForm({
      tax_type_id: r.tax_type_id,
      name: r.name,
      rate: r.rate.toString(),
      year: r.year.toString(),
      effective_from: r.effective_from,
      description: r.description || "",
    });
    setShowForm(true);
  };

  const handleVoidConfirm = async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    try {
      await metadataService.voidTaxRate(voidTarget.id);
      toast({ variant: "success", message: "Tax rate voided." });
      setVoidTarget(null);
      load();
    } catch {
      toast({ variant: "error", message: "Failed to void tax rate." });
    }
    setIsVoiding(false);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">Tax Configuration</h3>
          <p className="text-xs text-muted-foreground">Step tariff architecture — rates are year-bound.</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ ...emptyForm });
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary-strong"
        >
          <Plus size={14} /> Add Rate
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={form.tax_type_id}
              onChange={(e) => setForm({ ...form, tax_type_id: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Tax Type</option>
              {taxTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
            <input
              placeholder="Rate Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Rate % *"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              placeholder="Year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={form.effective_from}
              onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitClick}
              disabled={isSaving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-strong disabled:opacity-50"
            >
              {editingId ? "Update Rate" : "Save Rate"}
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
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Rate</th>
              <th className="px-3 py-2">Year</th>
              <th className="px-3 py-2">Effective From</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxRates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                  No tax rates found. Click "Add Rate" to create one.
                </td>
              </tr>
            ) : (
              taxRates.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground">{r.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.tax_type_name}</td>
                  <td className="px-3 py-2 font-mono text-foreground">{r.rate}%</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.year}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.effective_from}</td>
                  <td className="px-3 py-2">
                    {r.is_active
                      ? <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
                      : <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>}
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(r)} className="mr-2 text-muted-foreground hover:text-foreground" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setVoidTarget(r)} className="text-danger hover:text-danger/80" title="Void">
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
        title="Void Tax Rate"
        message={`Are you sure you want to void "${voidTarget?.name}" (${voidTarget?.rate}%)? This action cannot be undone.`}
        confirmLabel="Void"
        variant="danger"
        isLoading={isVoiding}
        onConfirm={handleVoidConfirm}
        onCancel={() => setVoidTarget(null)}
      />

      <ConfirmModal
        isOpen={showUpdateConfirm}
        title="Update Tax Rate"
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