import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ChevronRight } from "lucide-react";
import { metadataService } from "../../services/metadataService";
import { useToast } from "../../components/ui/ToastProvider";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

interface ICategoryNodeProps {
  node: any;
  level: number;
  onEdit: (node: any) => void;
  onVoid: (node: any) => void;
}

const CategoryNode = ({ node, level, onEdit, onVoid }: ICategoryNodeProps) => (
  <>
    <tr className="border-b border-border/50 hover:bg-muted/30">
      <td className="px-3 py-2 text-foreground" style={{ paddingLeft: `${level * 24 + 12}px` }}>
        <span className="flex items-center gap-1">
          {level > 0 && <ChevronRight size={12} className="text-muted-foreground" />}
          <span className="font-medium">{node.name}</span>
        </span>
      </td>
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{node.code || "—"}</td>
      <td className="px-3 py-2 text-muted-foreground">{node.sort_order}</td>
      <td className="px-3 py-2">
        {node.is_active
          ? <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
          : <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>}
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button onClick={() => onEdit(node)} className="mr-2 text-muted-foreground hover:text-foreground" title="Edit">
          <Pencil size={14} />
        </button>
        <button onClick={() => onVoid(node)} className="text-danger hover:text-danger/80" title="Void">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
    {node.children?.map((child: any) => (
      <CategoryNode key={child.id} node={child} level={level + 1} onEdit={onEdit} onVoid={onVoid} />
    ))}
  </>
);

const flattenCategories = (nodes: any[], level = 0): any[] => {
  let result: any[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, level });
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenCategories(node.children, level + 1));
    }
  }
  return result;
};

export const CategoryManager = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", parent_id: "", sort_order: "0" });

  const [voidTarget, setVoidTarget] = useState<any | null>(null);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      setCategories(await metadataService.getCategories());
    } catch {
      toast({ variant: "error", message: "Failed to load categories." });
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
      code: form.code.trim() || null,
      parent_id: form.parent_id || null,
      sort_order: parseInt(form.sort_order) || 0,
    };

    try {
      if (editingId) {
        await metadataService.updateCategory(editingId, payload);
        toast({ variant: "success", message: "Category updated." });
      } else {
        await metadataService.createCategory(payload);
        toast({ variant: "success", message: "Category created." });
      }
      setShowForm(false);
      setEditingId(null);
      setShowUpdateConfirm(false);
      setForm({ name: "", code: "", parent_id: "", sort_order: "0" });
      load();
    } catch {
      toast({ variant: "error", message: "Failed to save category." });
    }
    setIsSaving(false);
  };

  const handleEdit = (node: any) => {
    setEditingId(node.id);
    setForm({
      name: node.name,
      code: node.code || "",
      parent_id: node.parent_id || "",
      sort_order: node.sort_order.toString(),
    });
    setShowForm(true);
  };

  const handleVoidConfirm = async () => {
    if (!voidTarget) return;
    setIsVoiding(true);
    try {
      await metadataService.voidCategory(voidTarget.id);
      toast({ variant: "success", message: "Category voided." });
      setVoidTarget(null);
      load();
    } catch {
      toast({ variant: "error", message: "Failed to void category." });
    }
    setIsVoiding(false);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;

  const flatCategories = flattenCategories(categories);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">Inventory Categories</h3>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", code: "", parent_id: "", sort_order: "0" });
          }}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary-strong"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Category Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Short Code (e.g. MED)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- None (Root / Parent Category) --</option>
              {flatCategories
                .filter((cat) => cat.id !== editingId)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {"—".repeat(cat.level)} {cat.name}
                  </option>
                ))}
            </select>
            <input
              type="number"
              placeholder="Sort Order"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitClick}
              disabled={isSaving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-strong disabled:opacity-50"
            >
              {editingId ? "Update Category" : "Save Category"}
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
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  No categories found. Click "Add Category" to create one.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <CategoryNode key={c.id} node={c} level={0} onEdit={handleEdit} onVoid={setVoidTarget} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!voidTarget}
        title="Void Category"
        message={`Are you sure you want to void "${voidTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Void"
        variant="danger"
        isLoading={isVoiding}
        onConfirm={handleVoidConfirm}
        onCancel={() => setVoidTarget(null)}
      />

      <ConfirmModal
        isOpen={showUpdateConfirm}
        title="Update Category"
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