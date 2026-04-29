"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultLocale, localeLabels, locales, messages, type I18nMessages, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "bido-locale";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: I18nMessages;
  localeLabels: Record<Locale, string>;
  formatCurrency: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) => string;
  replace: (template: string, vars: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getPreferredLocale(): Locale {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved && locales.includes(saved as Locale)) return saved as Locale;

  const browser = window.navigator.language;
  return browser.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const preferredLocale = getPreferredLocale();
    setLocaleState((current) => (current === preferredLocale ? current : preferredLocale));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      messages: messages[locale],
      localeLabels,
      formatCurrency: (amount, options) =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: locale === "pt-BR" ? "BRL" : "USD",
          maximumFractionDigits: 2,
          ...options,
        }).format(amount),
      formatNumber: (amount, options) => new Intl.NumberFormat(locale, options).format(amount),
      formatDate: (value, options) => new Intl.DateTimeFormat(locale, options).format(new Date(value)),
      replace: (template, vars) =>
        Object.entries(vars).reduce(
          (acc, [key, current]) => acc.replaceAll(`{${key}}`, String(current)),
          template,
        ),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
