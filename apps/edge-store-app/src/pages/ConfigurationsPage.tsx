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
    accent: "from-primary to-primary/40",
    iconBg: "bg-primary/10 text-primary",
    hoverBorder: "hover:border-primary/40",
  },
  {
    id: "configurations.application",
    title: "Application Configs",
    description: "Configure application preferences and system settings",
    icon: Settings,
    accent: "from-info to-info/40",
    iconBg: "bg-info/10 text-info",
    hoverBorder: "hover:border-info/40",
  },
  {
    id: "configurations.network",
    title: "Network Configs",
    description: "Manage server connections and API endpoints",
    icon: Wifi,
    accent: "from-success to-success/40",
    iconBg: "bg-success/10 text-success",
    hoverBorder: "hover:border-success/40",
  },
  {
    id: "configurations.printer",
    title: "Printer Configs",
    description: "Configure receipt printers and print settings",
    icon: Printer,
    accent: "from-warning to-warning/40",
    iconBg: "bg-warning/10 text-warning",
    hoverBorder: "hover:border-warning/40",
  },
];

export const ConfigurationsPage = ({ onNavigate }: IConfigurationsPageProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Configurations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage system settings, metadata, and application preferences.
        </p>
      </div>

      {/* Cards — 3 in a row on medium+ screens */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {configCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className={`group relative overflow-hidden rounded-xl border-2 border-border bg-card p-5 text-left shadow-sm transition-all duration-200 ${card.hoverBorder} hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
          >
            {/* Top accent stripe */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />

            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${card.iconBg}`}
              >
                <card.icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
              </div>

              <ChevronRight
                size={16}
                className="shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};