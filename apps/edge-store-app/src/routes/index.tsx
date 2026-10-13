import React from "react";
import { DashboardPage } from "../pages/DashboardPage";
import { InventoryPage } from "../pages/InventoryPage";
import { InventoryItemsTab } from "../pages/inventory/InventoryItemsTab";
import { BatchesTab } from "../pages/inventory/BatchesTab";
import { SalesPage } from "../pages/SalesPage";
import { UsersPage } from "../pages/UsersPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ConfigurationsPage } from "../pages/ConfigurationsPage";
import { MetadataConfigurationsPage } from "../pages/MetadataConfigurationsPage";
import { NetworkConfigurationsPage } from "../pages/NetworkConfigurationsPage";

export const getRouteComponent = (route: string, navigate: (r: string) => void) => {
  // ─── Configurations Section ───
  if (route === "configurations" || route.startsWith("configurations.")) {
    if (route === "configurations.metadata" || route.startsWith("configurations.metadata.")) {
      // Accepts: route, onNavigate
      return <MetadataConfigurationsPage route={route} onNavigate={navigate} />;
    }
    if (route === "configurations.network") {
      // Accepts: NO props (based on your original SetupWizard.tsx)
      return <NetworkConfigurationsPage />;
    }
    // Accepts: onNavigate
    return <ConfigurationsPage onNavigate={navigate} />;
  }

  // ─── Inventory Section ───
  if (route === "inventory" || route.startsWith("inventory.")) {
    if (route === "inventory.items") {
      return <InventoryItemsTab onNavigate={navigate} />;
    }
    if (route === "inventory.batches") {
      return <BatchesTab onNavigate={navigate} />;
    }
    // Fallback to the hub
    return <InventoryPage onNavigate={navigate} />;
  }

  // ─── Top-Level Pages ───
  switch (route) {
    case "sales":
      return <SalesPage />;
    case "users":
      return <UsersPage />;
    case "profile":
      return <ProfilePage />;
    case "dashboard":
    default:
      return <DashboardPage />;
  }
};