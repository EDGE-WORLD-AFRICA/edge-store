import { Settings, Users, Building2, Shield } from "lucide-react";
import { loadCache } from "../lib/cache";

export const SettingsPage = () => {
  const cache = loadCache();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Company Settings</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Manage company details, branches, and business information.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">User Management</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Add, edit, and manage user accounts, roles, and permissions.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Security</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Configure security settings, password policies, and access controls.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Application</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Manage application preferences, themes, and system configuration.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Current Session</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium text-foreground">{cache.auth?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Company</span>
            <span className="font-medium text-foreground">{cache.company?.company?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Login Mode</span>
            <span className="font-medium text-foreground">{cache.auth?.mode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};