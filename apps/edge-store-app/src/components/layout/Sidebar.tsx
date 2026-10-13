import React from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Store,
  RefreshCw,
  FolderSync,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory & Batches", icon: Package },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "configurations", label: "Configurations", icon: SlidersHorizontal },
];

interface SidebarProps {
  isMinified: boolean;
  onToggleMinify: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onSync: () => void;
  companyName: string;
  logo?: string;
}

export const Sidebar = ({
  isMinified,
  onToggleMinify,
  currentPage,
  onNavigate,
  onLogout,
  onSync,
  companyName,
  logo,
}: SidebarProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* Company Section */}
      <div className={`mb-4 flex items-center ${isMinified ? "justify-center" : "gap-3"}`}>
        {logo ? (
          <img src={logo} alt="Logo" className="h-9 w-9 shrink-0 rounded-lg border border-border bg-card object-contain p-1" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
            <Store size={18} className="text-primary" />
          </div>
        )}
        {!isMinified && <h2 className="truncate text-sm font-bold text-foreground">{companyName}</h2>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPage === item.id || currentPage.startsWith(item.id + ".");
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={isMinified ? item.label : undefined}
              className={`flex w-full items-center rounded-lg text-sm font-medium transition-colors ${
                isMinified ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {!isMinified && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Full-width Logout Button (Above Footer) */}
      <div className="px-2 pb-2 pt-1">
        <button
          onClick={onLogout}
          title={isMinified ? "Logout" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger/10 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
        >
          <LogOut size={16} />
          {!isMinified && <span>Logout</span>}
        </button>
      </div>

      {/* Sidebar Footer Actions (Refresh & Sync sharing space equally) */}
      <div className="border-t border-border pt-2 pb-1 px-2">
        <div className={`flex items-center ${isMinified ? "flex-col gap-1" : "w-full gap-2"}`}>
          <button
            onClick={() => window.location.reload()}
            className={`flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
              isMinified ? "h-8 w-full" : "flex-1 h-9 gap-2"
            }`}
            title="Refresh"
          >
            <RefreshCw size={15} />
            {!isMinified && <span className="text-sm font-medium">Refresh</span>}
          </button>
          <button
            onClick={onSync}
            className={`flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
              isMinified ? "h-8 w-full" : "flex-1 h-9 gap-2"
            }`}
            title="Sync Metadata"
          >
            <FolderSync size={15} />
            {!isMinified && <span className="text-sm font-medium">Sync</span>}
          </button>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <div className="border-t border-border pt-1 pb-1 px-2">
        <button
          onClick={onToggleMinify}
          className="flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={isMinified ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isMinified ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </div>
  );
};