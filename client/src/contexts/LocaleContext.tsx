import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "fr" | "ar";

type LocaleContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
};

const STORAGE_KEY = "north-atelier-locale";
const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function normalizeLocale(value: string | null): Locale {
  return value === "ar" || value === "fr" ? value : "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const queryLocale = new URLSearchParams(window.location.search).get("lang");
    return normalizeLocale(queryLocale ?? localStorage.getItem(STORAGE_KEY));
  });
  const direction: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.documentElement.dataset.locale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [direction, locale]);

  const value = useMemo(() => ({ locale, direction, setLocale }), [direction, locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
