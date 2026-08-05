import { useState } from 'react';
import type { ReactNode } from "react";
import type { IBootstrapStage } from "@edge-store/shared";
import { useTheme } from "../../theme/ThemeProvider";
import { Sun, Moon, X, Copy, Check, Menu } from 'lucide-react';

interface ISetupLayoutProps {
  currentStage: IBootstrapStage;
  machineCode: string;
  children: ReactNode;
}

const steps: { id: IBootstrapStage; label: string }[] = [
  { id: "SERVER_CONFIG", label: "Server Configuration" },
  { id: "LICENSE", label: "License Activation" },
  { id: "COMPANY_SETUP", label: "Company Details" },
  { id: "SUPER_ADMIN_SETUP",  label: "Super Admin" }
];


export const SetupLayout = ({ currentStage, machineCode, children }: ISetupLayoutProps) => {
  const { resolved, setMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const currentIndex = steps.findIndex((s) => s.id === currentStage);

  const handleCopy = () => {
    if(machineCode){
      navigator.clipboard.writeText(machineCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <h2 className='text-xl font-bold text-primary'>Edge Store</h2>
        <p className="text-xs text-muted-foreground">Powered bny Edge World</p>
      </div>

      <nav className="flex-1 space-y-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStage;
          const isCompleted = index < currentIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-primary-soft font-semibold text-primary"
                  : isCompleted
                  ? "text-success"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                    ? "border-success bg-success text-success-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <span>{step.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 border-t border-border pt-4">
        <div className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Device Fingerprint</p>
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2 border border-border">
            <p className="flex-1 break-all font-mono text-[10px] text-primary leading-tight">
              {machineCode || "Generating..."}
            </p>
            <button
              onClick={handleCopy}
              disabled={!machineCode}
              className="shrink-0 rounded p-1 text-muted-foreground hover:text-primary hover:bg-background transition-colors disabled:opacity-50"
              title="Copy to clipboard"
            >
              {isCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  
  
  return (
    <>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Desktop Sidebar */}
        <aside className="hidden w-80 flex-col border-r border-border bg-card p-6 lg:flex">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div 
              className="absolute inset-0 bg-black/50 transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <aside className="relative w-80 max-w-[80vw] flex flex-col border-r border-border bg-card p-6 animate-in slide-in-from-left duration-300">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6 lg:py-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex-1 lg:hidden text-center font-semibold text-primary">
              Edge Store Setup
            </div>

            <button
              onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
              className="rounded-md border border-border bg-background p-2 text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </header>

          <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 lg:p-6">
            <div className="w-full max-w-2xl">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
}