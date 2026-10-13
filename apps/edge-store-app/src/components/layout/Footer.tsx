import React from "react";
import { ConnectivityIndicator } from "../elements/ConnectivityIndicator";

interface FooterProps {
  fullName: string;
  version: string;
}

export const Footer = ({ fullName, version }: FooterProps) => {
  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-2 truncate">
        <span className="truncate font-medium text-foreground">{fullName}</span>
        <span>|</span>
        <span>v{version}</span>
      </div>
      <div className="shrink-0">
        <ConnectivityIndicator showNetworkSpeed={false} showApiLatency={false} isApiClickable={true} />
      </div>
    </footer>
  );
};