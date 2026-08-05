import { Children, type ReactNode } from "react";
import type { IBootstrapStage } from "@edge-store/shared";
import { useTheme } from "../../theme/ThemeProvider";

interface ISetupLayoutProps {
  currentStage: IBootstrapStage;
  machineCode: string;
  children: ReactNode;
}

const steps: { id: IBootstrapStage; label: string }[] = [
  { id: "SERVER_CONFIG", label: "Server Configuration" },
  { id: "LICENSE", label: "License Activation" },
  { id: "COMPANY_SETUP", label: "Company Details" },
  { id: "SUPER_ADMIN_SETUP",  label: "Super Admin" },
  { id: "LOGIN", label: "Login" }
];


export const SetupLayout = ({ currentStage, machineCode, children }: ISetupLayoutProps) => {
  const { mode, setMode } = useTheme();

  const currentIndex = steps.findIndex((s) => s.id === currentStage);

  return(
    <>
      <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-80 flex-col border-r border-border bg-card p-6 lg:flex">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Edge Store</h1>
          <p className="text-xs text-muted-foreground">Powered by Edge World</p>
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
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span>{step.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 border-t border-border pt-4">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Device Fingerprint</p>
            <p className="mt-1 break-all font-mono text-[10px] text-primary">
              {machineCode || "Generating..."}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-border bg-card px-6 py-4">
          <button
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            {mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
          <div className="w-full max-w-2xl">{children}</div>
        </div>
      </main>
    </div>
    </>
  );
}