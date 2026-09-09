import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Products", value: "0", icon: Package, color: "text-primary" },
          { label: "Today's Sales", value: "0", icon: ShoppingCart, color: "text-success" },
          { label: "Active Users", value: "1", icon: Users, color: "text-info" },
          { label: "Revenue (Month)", value: "MK 0", icon: TrendingUp, color: "text-warning" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon size={24} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">Welcome to Edge Store</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your store management system is ready. Start by adding products to your inventory,
          configuring user roles, and processing sales.
        </p>
      </div>
    </div>
  );
};