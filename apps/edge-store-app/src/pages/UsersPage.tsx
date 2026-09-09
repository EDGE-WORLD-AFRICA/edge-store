import { Users, Plus } from "lucide-react";

export const UsersPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">User Management</h2>
        <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <Users size={48} className="mx-auto text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          No users added yet. Click "Add User" to create a new user account.
        </p>
      </div>
    </div>
  );
};