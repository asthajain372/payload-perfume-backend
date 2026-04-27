import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type CurrencyCode = "AED" | "INR";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (aedPrice: number) => string;
  formatTotal: (aedTotal: number, itemCount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "AED",
  setCurrency: () => {},
  formatPrice: (p) => `AED ${Number(p).toFixed(2)}`,
  formatTotal: (p) => `AED ${Number(p).toFixed(2)}`,
  loading: false,
});

const CURRENCY_KEY = "maison-aria-currency";
const SETTINGS_CACHE_KEY = "maison-aria-inr-settings";
const SETTINGS_TTL = 3_600_000; // 1 hour
const IP_COUNTRY_KEY = "maison-aria-ip-country";
const IP_TS_KEY = "maison-aria-ip-ts";
const IP_TTL = 86_400_000; // 24 hours

function readSettingsCache(): { rate: number; courier: number } | null {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    const ts = Number(localStorage.getItem(`${SETTINGS_CACHE_KEY}-ts`) ?? "0");
    if (cached && Date.now() - ts < SETTINGS_TTL) return JSON.parse(cached);
  } catch {}
  return null;
}

function initCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "AED";
  const saved = localStorage.getItem(CURRENCY_KEY);
  if (saved === "INR" || saved === "AED") return saved as CurrencyCode;
  const cached = localStorage.getItem(IP_COUNTRY_KEY);
  return cached === "IN" ? "INR" : "AED";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Lazy initialisers read localStorage synchronously on first client render
  const [currency, setCurrencyState] = useState<CurrencyCode>(initCurrency);
  const [rate, setRate] = useState<number>(() => readSettingsCache()?.rate ?? 23);
  const [courier, setCourier] = useState<number>(() => readSettingsCache()?.courier ?? 250);
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return readSettingsCache() === null;
  });

  useEffect(() => {
    // IP detection only needed when no cache exists
    const saved = localStorage.getItem(CURRENCY_KEY);
    if (!saved) {
      const cachedCountry = localStorage.getItem(IP_COUNTRY_KEY);
      const cachedTs = Number(localStorage.getItem(IP_TS_KEY) ?? "0");
      const fresh = Date.now() - cachedTs < IP_TTL;

      if (!fresh || !cachedCountry) {
        // api.country.is — free, unlimited; ipapi.co as fallback
        const detect = () =>
          fetch("https://api.country.is/")
            .then((r) => r.json())
            .then((d: { country?: string }) => d?.country ?? "")
            .catch(() =>
              fetch("https://ipapi.co/json/")
                .then((r) => r.json())
                .then((d: { country_code?: string }) => d?.country_code ?? "")
                .catch(() => ""),
            );

        detect().then((code) => {
          if (!code) return;
          localStorage.setItem(IP_COUNTRY_KEY, code);
          localStorage.setItem(IP_TS_KEY, String(Date.now()));
          if (code === "IN") setCurrencyState("INR");
        });
      }
    }

    // Refresh settings from Supabase when cache is stale
    if (loading) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("settings")
        .select("key,value")
        .in("key", ["inr_exchange_rate", "inr_courier_charge"])
        .then(({ data }: { data: { key: string; value: string }[] | null }) => {
          if (data) {
            const r = Number(data.find((s) => s.key === "inr_exchange_rate")?.value ?? 23);
            const c = Number(data.find((s) => s.key === "inr_courier_charge")?.value ?? 250);
            setRate(r);
            setCourier(c);
            localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({ rate: r, courier: c }));
            localStorage.setItem(`${SETTINGS_CACHE_KEY}-ts`, String(Date.now()));
          }
          setLoading(false);
        });
    }
  }, []);

  function setCurrency(c: CurrencyCode) {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }

  function formatPrice(aedPrice: number): string {
    if (currency === "INR") {
      const inr = Math.ceil(aedPrice * rate) + courier;
      return `₹${inr.toLocaleString("en-IN")}`;
    }
    return `AED ${Number(aedPrice).toFixed(2)}`;
  }

  function formatTotal(aedTotal: number, itemCount: number): string {
    if (currency === "INR") {
      const inr = Math.ceil(aedTotal * rate) + courier * itemCount;
      return `₹${inr.toLocaleString("en-IN")}`;
    }
    return `AED ${Number(aedTotal).toFixed(2)}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatTotal, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
