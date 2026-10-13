import React, { useState, useEffect } from "react";
import { loadCache, clearCacheSection } from "../lib/cache";
import { useTheme } from "../theme/ThemeProvider";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { SyncModal } from "../components/elements/SyncModal";

interface IMainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const APP_VERSION = "1.0.0";

export const MainLayout = ({ children, currentPage, onNavigate }: IMainLayoutProps) => {
  const { resolved, setMode } = useTheme();
  const cache = loadCache();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarMinified, setIsSidebarMinified] = useState(() => localStorage.getItem("edge-store-sidebar-minified") === "true");
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const companyName = cache.company?.company?.name || "Edge Store";
  const logo = cache.company?.company?.logo;
  const person = cache.auth?.person;
  const fullName = person
    ? `${person.firstName} ${person.otherNames ? person.otherNames + " " : ""}${person.lastName}`
    : cache.auth?.username || "User";

  const isSubPage = currentPage.includes(".");
  const parentPage = isSubPage
    ? currentPage.split(".").slice(0, -1).join(".")
    : currentPage === "profile"
    ? "dashboard"
    : null;

  const getPageTitle = () => {
    // Inventory sub-pages (must come before the general "inventory" check)
    if (currentPage === "inventory.items") return "Inventory Items";
    if (currentPage === "inventory.batches") return "Batches";
    
    // Configurations sub-pages
    if (currentPage === "configurations.metadata") return "Metadata Configurations";
    if (currentPage === "configurations.application") return "Application Configurations";
    if (currentPage === "configurations.network") return "Network Configurations";
    if (currentPage === "configurations.printer") return "Printer Configurations";
    if (currentPage.startsWith("configurations.")) return "Configurations";
    
    // Top-level pages
    if (currentPage === "profile") return "Profile";
    if (currentPage === "settings") return "Settings";
    
    const navLabels: Record<string, string> = {
      dashboard: "Dashboard",
      inventory: "Inventory",
      sales: "Sales",
      users: "Users",
      configurations: "Configurations",
    };
    return navLabels[currentPage] || "--";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const profileDropdown = document.querySelector(".relative .absolute"); 
      if (isProfileOpen && profileDropdown && !profileDropdown.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

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

  const handleBack = () => {
    if (parentPage) handleNavigate(parentPage);
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className={`hidden flex-col border-r border-border bg-card transition-all duration-300 lg:flex ${isSidebarMinified ? "w-16 p-2" : "w-64 p-4"}`}>
        <Sidebar
          isMinified={isSidebarMinified}
          onToggleMinify={toggleSidebar}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onSync={() => setIsSyncModalOpen(true)}
          companyName={companyName}
          logo={logo}
        />
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative flex w-64 flex-col border-r border-border bg-card p-4 z-50">
            <Sidebar
              isMinified={false}
              onToggleMinify={toggleSidebar}
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onLogout={() => { handleLogout(); setIsSidebarOpen(false); }}
              onSync={() => { setIsSyncModalOpen(true); setIsSidebarOpen(false); }}
              companyName={companyName}
              logo={logo}
            />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onMobileMenuOpen={() => setIsSidebarOpen(true)}
          parentPage={parentPage}
          onBack={handleBack}
          pageTitle={getPageTitle()}
          resolvedTheme={resolved}
          onToggleTheme={() => setMode(resolved === "dark" ? "light" : "dark")}
          isProfileOpen={isProfileOpen}
          onToggleProfile={() => setIsProfileOpen(!isProfileOpen)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>

        <Footer fullName={fullName} version={APP_VERSION} />
      </div>

      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
    </div>
  );
};