import { useMemo } from "react";
import {
  Coins,
  Tags,
  Ruler,
  Percent,
  BadgeDollarSign,
  Package,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { CurrencyManager } from "./configurations/CurrencyManager";
import { TaxManager } from "./configurations/TaxManager";
import { CategoryManager } from "./configurations/CategoryManager";
import { UnitManager } from "./configurations/UnitManager";
import { PriceTypeManager } from "./configurations/PriceTypeManager";
import { InventoryTypeManager } from "./configurations/InventoryTypeManager";

type ConfigTab =
  | "currencies"
  | "tax"
  | "categories"
  | "units"
  | "priceTypes"
  | "inventoryTypes";

interface ITabConfig {
  id: ConfigTab;
  label: string;
  icon: any;
}

const tabs: ITabConfig[] = [
  { id: "currencies", label: "Currencies", icon: Coins },
  { id: "tax", label: "Tax Configuration", icon: Percent },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "units", label: "Units of Measure", icon: Ruler },
  { id: "priceTypes", label: "Price Types", icon: BadgeDollarSign },
  { id: "inventoryTypes", label: "Item Types", icon: Package },
];

interface IMetadataConfigurationsPageProps {
  route: string;
  onNavigate: (page: string) => void;
}

export const MetadataConfigurationsPage = ({ route, onNavigate }: IMetadataConfigurationsPageProps) => {
  // Route format: configurations.metadata.<tab>
  const activeTab = useMemo<ConfigTab>(() => {
    const segments = route.split(".");
    const tab = segments[2];
    const match = tabs.find((t) => t.id === tab);
    return match ? match.id : "currencies";
  }, [route]);

  const activeTabConfig = tabs.find((t) => t.id === activeTab) || tabs[0];

  const handleTabChange = (tab: ConfigTab) => {
    onNavigate(`configurations.metadata.${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "currencies": return <CurrencyManager />;
      case "tax": return <TaxManager />;
      case "categories": return <CategoryManager />;
      case "units": return <UnitManager />;
      case "priceTypes": return <PriceTypeManager />;
      case "inventoryTypes": return <InventoryTypeManager />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={() => onNavigate("configurations")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Configurations
      </button>

      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card lg:flex-row">
        {/* Mobile: horizontal scrollable tab pills */}
        <div className="shrink-0 border-b border-border bg-muted/30 lg:hidden">
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto p-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: vertical sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-muted/30 lg:flex">
          <div className="p-4">
            <h2 className="mb-1 text-sm font-semibold text-foreground">Metadata</h2>
            <p className="mb-4 text-xs text-muted-foreground">System metadata & settings</p>
          </div>

          <nav className="space-y-0.5 px-2 pb-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground"
                    }`}
                  >
                    <tab.icon size={15} />
                  </div>
                  <span className={`min-w-0 flex-1 truncate text-xs font-medium ${isActive ? "text-primary" : ""}`}>
                    {tab.label}
                  </span>
                  <ChevronRight
                    size={13}
                    className={`shrink-0 transition-transform ${
                      isActive ? "text-primary" : "text-muted-foreground/40 group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-border bg-card px-3 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <activeTabConfig.icon size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {activeTabConfig.label}
                </h1>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};