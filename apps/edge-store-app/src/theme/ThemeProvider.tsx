import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { loadCache, updateCache, IThemeMode, IResolvedTheme } from "../lib/cache";

interface IThemeContextValue {
  mode: IThemeMode;
  resolved: IResolvedTheme; 
  setMode: (mode: IThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<IThemeContextValue | null>(null);


const getSystemTheme = (): IResolvedTheme => {
  return window.matchMedia("prefers-color-scheme: dark").matches
  ? "dark" : "light";
}


const resolveTheme = (mode: IThemeMode): IResolvedTheme => {
  if(mode === "system") return getSystemTheme();

  return mode;
}


export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<IThemeMode>(() => loadCache().ui.theme.mode);
  const [resolved, setResolved] = useState<IResolvedTheme>(() => loadCache().ui.theme.resolved);


  useEffect(() => {
    const nextResolved = resolveTheme(mode);

    setResolved(nextResolved);

    document.documentElement.classList.toggle(
      "dark",
      nextResolved === "dark"
    );

    updateCache((cache) => {
      cache.ui.theme = {
        mode,
        resolved: nextResolved
      };
    });
  }, [mode]);

  
  useEffect(() => {
    if(mode !== "system") return; 

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      const nextResolved = getSystemTheme();

      setResolved(nextResolved);

      document.documentElement.classList.toggle(
        "dark",
        nextResolved === "dark"
      );

      updateCache((cache) => {
        cache.ui.theme.resolved = nextResolved;
      });
    };

    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
    }
  }, [mode]);


  const value = useMemo<IThemeContextValue>(() => {
    return {
      mode,
      resolved,
      setMode,
      toggle: () => {
        setMode(resolved === "dark" ? "light" : "dark");
      }
    };
  }, [mode, resolved]);

  return( 
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if(!context) throw new Error("useTHeme must be used within ThemeProvider");

  return context;
}