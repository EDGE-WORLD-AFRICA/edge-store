import { loadCache } from "../lib/cache";
import { User, Mail, Shield } from "lucide-react";

export const ProfilePage = () => {
  const cache = loadCache();
  const person = cache.auth?.person;
  const username = cache.auth?.username;
  const email = cache.admin?.email || "N/A";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {person
                ? `${person.firstName} ${person.otherNames ? person.otherNames + " " : ""}${person.lastName}`
                : username}
            </h2>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail size={16} />
            <span className="text-sm">Email</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{email}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield size={16} />
            <span className="text-sm">Role</span>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">
            {cache.auth?.roles?.[0]?.name || "Super Admin"}
          </p>
        </div>
      </div>
    </div>
  );
};