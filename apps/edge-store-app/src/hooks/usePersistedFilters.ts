import { useState, useEffect } from "react";

interface FilterState {
  [key: string]: any;
}

export const usePersistedFilters = (key: string, defaultFilters: FilterState) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem(`filters_${key}`);
    return saved ? JSON.parse(saved) : defaultFilters;
  });

  useEffect(() => {
    localStorage.setItem(`filters_${key}`, JSON.stringify(filters));
  }, [filters, key]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return { filters, setFilters, resetFilters };
};