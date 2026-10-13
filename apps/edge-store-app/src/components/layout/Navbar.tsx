import React, { useRef } from "react";
import { Menu, ArrowLeft, Sun, Moon, User, ChevronDown, Settings, LogOut } from "lucide-react";

interface NavbarProps {
  onMobileMenuOpen: () => void;
  parentPage: string | null;
  onBack: () => void;
  pageTitle: string;
  resolvedTheme: "light" | "dark";
  onToggleTheme: () => void;
  isProfileOpen: boolean;
  onToggleProfile: () => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Navbar = ({
  onMobileMenuOpen,
  parentPage,
  onBack,
  pageTitle,
  resolvedTheme,
  onToggleTheme,
  isProfileOpen,
  onToggleProfile,
  onNavigate,
  onLogout,
}: NavbarProps) => {
  const profileRef = useRef<HTMLDivElement>(null);

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <button onClick={onMobileMenuOpen} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden">
          <Menu size={20} />
        </button>

        {parentPage && (
          <button onClick={onBack} className="flex items-center gap-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Go back">
            <ArrowLeft size={18} />
          </button>
        )}

        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onToggleTheme} className="rounded-md border border-border bg-background p-2 text-foreground transition-colors hover:bg-muted" aria-label="Toggle theme">
          {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative" ref={profileRef}>
          <button onClick={onToggleProfile} className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-foreground transition-colors hover:bg-muted">
            <User size={16} />
            <ChevronDown size={14} className={`transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-card py-1 shadow-lg z-50">
              <button onClick={() => { onNavigate("profile"); onToggleProfile(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                <User size={14} /> Profile
              </button>
              <button onClick={() => { onNavigate("settings"); onToggleProfile(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                <Settings size={14} /> Settings
              </button>
              <div className="my-1 border-t border-border" />
              <button onClick={() => { onLogout(); onToggleProfile(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10">
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};