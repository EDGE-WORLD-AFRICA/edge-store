import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Store,
  RefreshCw,
  FolderSync,
  User,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { loadCache, clearCacheSection } from "../lib/cache";
import { useTheme } from "../theme/ThemeProvider";
import { ConnectivityIndicator } from "../components/elements/ConnectivityIndicator";

interface IMainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const APP_VERSION = "1.0.0";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export const MainLayout = ({ children, currentPage, onNavigate }: IMainLayoutProps) => {
  const { resolved, setMode } = useTheme();
  const cache = loadCache();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarMinified, setIsSidebarMinified] = useState(
    () => localStorage.getItem("edge-store-sidebar-minified") === "true"
  );
  const profileRef = useRef<HTMLDivElement>(null);

  const companyName = cache.company?.company?.name || "Edge Store";
  const logo = cache.company?.company?.logo;
  const person = cache.auth?.person;
  const fullName = person
    ? `${person.firstName} ${person.otherNames ? person.otherNames + " " : ""}${person.lastName}`
    : cache.auth?.username || "User";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarMinified;
    setIsSidebarMinified(newState);
    localStorage.setItem("edge-store-sidebar-minified", String(newState));
  };

  const handleLogout = () => {
    clearCacheSection("auth");
    window.location.reload();
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
    localStorage.setItem("edge-store-current-page", page);
  };

  const SidebarContent = ({ minified }: { minified: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Company Section */}
      <div className={`mb-4 flex items-center ${minified ? "justify-center" : "gap-3"}`}>
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            className="h-9 w-9 shrink-0 rounded-lg border border-border bg-card object-contain p-1"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
            <Store size={18} className="text-primary" />
          </div>
        )}
        {!minified && (
          <h2 className="truncate text-sm font-bold text-foreground">{companyName}</h2>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              title={minified ? item.label : undefined}
              className={`flex w-full items-center rounded-lg text-sm font-medium transition-colors ${
                minified ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {!minified && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="border-t border-border pt-2 pb-1">
        <div className={`flex items-center ${minified ? "flex-col gap-1" : "justify-evenly"}`}>
          <button
            onClick={() => window.location.reload()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => console.log("Sync triggered")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Sync"
          >
            <FolderSync size={15} />
          </button>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger/10"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Sidebar Toggle */}
      <div className="border-t border-border pt-1 pb-1">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={minified ? "Expand sidebar" : "Collapse sidebar"}
        >
          {minified ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden flex-col border-r border-border bg-card transition-all duration-300 lg:flex ${
          isSidebarMinified ? "w-16 p-2" : "w-64 p-4"
        }`}
      >
        <SidebarContent minified={isSidebarMinified} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative flex w-64 flex-col border-r border-border bg-card p-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <SidebarContent minified={false} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {navItems.find((i) => i.id === currentPage)?.label ||
                (currentPage === "profile" ? "Profile" : "Dashboard")}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
              className="rounded-md border border-border bg-background p-2 text-foreground transition-colors hover:bg-muted"
              aria-label="Toggle theme"
            >
              {resolved === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-foreground transition-colors hover:bg-muted"
              >
                <User size={16} />
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card py-1 shadow-lg">
                  <button
                    onClick={() => handleNavigate("profile")}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <User size={14} />
                    Profile
                  </button>
                  <button
                    onClick={() => handleNavigate("settings")}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Settings size={14} />
                    Settings
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>

        {/* Footer - only spans main content area */}
        <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 truncate">
            <span className="truncate font-medium text-foreground">{fullName}</span>
            <span>|</span>
            <span>v{APP_VERSION}</span>
          </div>
          <div className="shrink-0">
            <ConnectivityIndicator showNetworkSpeed={false} showApiLatency={false} isApiClickable={true} />
          </div>
        </footer>
      </div>
    </div>
  );
};