import * as React from "react";
import { STRINGS, type Lang, type StringKey } from "@/i18n/strings";
import { loadHistory } from "@/data/store";
import type { PricePoint } from "@/data/generator";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StringKey) => string;
  history: PricePoint[];
  refreshHistory: () => void;
}

const AppCtx = React.createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");
  const [history, setHistory] = React.useState<PricePoint[]>([]);

  React.useEffect(() => {
    setHistory(loadHistory());
    try {
      const stored = localStorage.getItem("lumatrack:lang") as Lang | null;
      if (stored) setLangState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lumatrack:lang", l);
    } catch {
      /* ignore */
    }
  };

  const t = (k: StringKey) => STRINGS[lang][k] ?? STRINGS.en[k];
  const refreshHistory = () => setHistory(loadHistory());

  return (
    <AppCtx.Provider value={{ lang, setLang, t, history, refreshHistory }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = React.useContext(AppCtx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}
