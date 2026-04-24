import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "maison-aria-wishlist";

interface WishlistContextValue {
  ids: Set<string>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => ids.has(id), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, count: ids.size }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
