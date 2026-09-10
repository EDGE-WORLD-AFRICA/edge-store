import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { metadataService } from "../../services/metadataService";
import { useToast } from "../../components/ui/ToastProvider";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const CurrencyManager = () => {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", name: "", symbol: "", decimal_places: 2, is_base: false });

  const [voidTarget, setVoidTarget] = useState<any | null>(null);
  const [isVoiding, setIsVoiding] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await metadataService.getCurrencies();
      setCurrencies(data);
    } catch { toast({ variant: "error", message: "Failed to load currencies." }); }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.symbol.trim()) {
      toast({ variant: "error", message: "Code, name and symbol are required." });
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await metadataService.updateCurrency(editingId, form);
        toast({ variant: "success", message: "Currency updated." });
      } else {
        await metadataService.createCurrency(form);
        toast({ variant: "success", message: "Currency created." });
      }
      setShowForm(false);
      setEditingId(null);
      setShowUpdateConfirm(false);
      setForm({ code: "", name: "", symbol: "", decimal_places: 2, is_base: false });
      load();
    } catch { toast({ variant: "error", message: "Failed to save currency." }); }
    setIsSaving(false);
  };

  const handleSubmitClick = () => {
    if (editingId) {
      setShowUpdateConfirm(true);
    } else {
      handleSave();
    }
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setForm({ code: c.code, name: c.name, symbol: c.symbol, decimal_places: c.decimal_places, is_base: c.is_base });
    setShowForm(true);
  };

  const handleVoidConfirm = async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    try {
      await metadataService.voidCurrency(voidTarget.id);
      toast({ variant: "success", message: "Currency voided." });
      setVoidTarget(null);
      load();
    } catch { toast({ variant: "error", message: "Failed to void currency." }); }
    setIsVoiding(false);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Currencies</h3>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ code: "", name: "", symbol: "", decimal_places: 2, is_base: false }); }}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary-strong">
          <Plus size={14} /> Add Currency
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-5">
            <input placeholder="Code (MWK)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().slice(0, 3) })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Symbol (MK)" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.is_base} onChange={(e) => setForm({ ...form, is_base: e.target.checked })} />
              Base
            </label>
            <button onClick={handleSubmitClick} className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary-strong">
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2">Base</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2 font-mono font-medium text-foreground">{c.code}</td>
                <td className="px-3 py-2 text-foreground">{c.name}</td>
                <td className="px-3 py-2 text-foreground">{c.symbol}</td>
                <td className="px-3 py-2">{c.is_base ? <span className="text-success font-medium">Base</span> : "—"}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => handleEdit(c)} className="mr-2 text-muted-foreground hover:text-foreground"><Pencil size={14} /></button>
                  <button onClick={() => setVoidTarget(c)} className="text-danger hover:text-danger/80"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Void Confirmation */}
      <ConfirmModal
        isOpen={!!voidTarget}
        title="Void Currency"
        message={`Are you sure you want to void "${voidTarget?.name}" (${voidTarget?.code})? This action cannot be undone.`}
        confirmLabel="Void"
        variant="danger"
        isLoading={isVoiding}
        onConfirm={handleVoidConfirm}
        onCancel={() => setVoidTarget(null)}
      />

      {/* Update Confirmation */}
      <ConfirmModal
        isOpen={showUpdateConfirm}
        title="Update Currency"
        message={`Are you sure you want to update "${form.name}" (${form.code})?`}
        confirmLabel="Update"
        variant="default"
        isLoading={isSaving}
        onConfirm={handleSave}
        onCancel={() => setShowUpdateConfirm(false)}
      />
    </div>
  );
};