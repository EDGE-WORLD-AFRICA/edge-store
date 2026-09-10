import { useState, useEffect, useCallback } from "react";

const DEFAULT_ROUTE = "dashboard";

const readHash = (): string => {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return raw.length > 0 ? raw : DEFAULT_ROUTE;
};

export const useHashRoute = () => {
  const [route, setRoute] = useState<string>(readHash);

  useEffect(() => {
    const onHashChange = () => setRoute(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
};