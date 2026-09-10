import { Layers, Settings, Wifi, Printer, ChevronRight } from "lucide-react";

interface IConfigurationsPageProps {
  onNavigate: (page: string) => void;
}

const configCards = [
  {
    id: "configurations.metadata",
    title: "Metadata Configs",
    description: "Manage categories, units, tax rates, and price types",
    icon: Layers,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "configurations.application",
    title: "Application Configs",
    description: "Configure application preferences and system settings",
    icon: Settings,
    color: "bg-info/10 text-info",
  },
  {
    id: "configurations.network",
    title: "Network Configs",
    description: "Manage server connections and API endpoints",
    icon: Wifi,
    color: "bg-success/10 text-success",
  },
  {
    id: "configurations.printer",
    title: "Printer Configs",
    description: "Configure receipt printers and print settings",
    icon: Printer,
    color: "bg-warning/10 text-warning",
  },
];

export const ConfigurationsPage = ({ onNavigate }: IConfigurationsPageProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configurations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage system settings and metadata
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {configCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${card.color}`}
            >
              <card.icon size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
            </div>

            <ChevronRight
              size={16}
              className="shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </button>
        ))}
      </div>
    </div>
  );
};