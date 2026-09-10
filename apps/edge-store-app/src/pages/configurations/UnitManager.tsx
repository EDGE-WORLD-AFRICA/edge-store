import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { metadataService } from "../../services/metadataService";
import { useToast } from "../../components/ui/ToastProvider";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export const UnitManager = () => {
  const { toast } = useToast();
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", abbreviation: "" });

  const [voidTarget, setVoidTarget] = useState<any | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      setUnits(await metadataService.getUnits());
    } catch {
      toast({ variant: "error", message: "Failed to load units." });
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    if (!form.name.trim()) {
      toast({ variant: "error", message: "Name is required." });
      return false;
    }
    if (!form.abbreviation.trim()) {
      toast({ variant: "error", message: "Abbreviation is required." });
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
    try {
      if (editingId) {
        await metadataService.updateUnit(editingId, form);
        toast({ variant: "success", message: "Unit updated." });
      } else {
        await metadataService.createUnit(form);
        toast({ variant: "success", message: "Unit created." });
      }
      setShowForm(false);
      setEditingId(null);
      setShowUpdateConfirm(false);
      setForm({ name: "", abbreviation: "" });
      load();
    } catch {
      toast({ variant: "error", message: "Failed to save unit." });
    }
    setIsSaving(false);
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setForm({ name: u.name, abbreviation: u.abbreviation });
    setShowForm(true);
  };

  const handleVoidConfirm = async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    try {
      await metadataService.voidUnit(voidTarget.id);
      toast({ variant: "success", message: "Unit voided." });
      setVoidTarget(null);
      load();
    } catch {
      toast({ variant: "error", message: "Failed to void unit." });
    }
    setIsVoiding(false);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Units of Measure</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", abbreviation: "" });
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary-strong"
        >
          <Plus size={14} /> Add Unit
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Name (e.g. Kilogram) *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Abbreviation (kg) *"
              value={form.abbreviation}
              onChange={(e) => setForm({ ...form, abbreviation: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitClick}
              disabled={isSaving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-strong disabled:opacity-50"
            >
              {editingId ? "Update Unit" : "Save Unit"}
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
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Abbreviation</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                  No units found. Click "Add Unit" to create one.
                </td>
              </tr>
            ) : (
              units.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium text-foreground">{u.name}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{u.abbreviation}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(u)} className="mr-2 text-muted-foreground hover:text-foreground" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setVoidTarget(u)} className="text-danger hover:text-danger/80" title="Void">
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
        title="Void Unit"
        message={`Are you sure you want to void "${voidTarget?.name}" (${voidTarget?.abbreviation})? This action cannot be undone.`}
        confirmLabel="Void"
        variant="danger"
        isLoading={isVoiding}
        onConfirm={handleVoidConfirm}
        onCancel={() => setVoidTarget(null)}
      />

      <ConfirmModal
        isOpen={showUpdateConfirm}
        title="Update Unit"
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