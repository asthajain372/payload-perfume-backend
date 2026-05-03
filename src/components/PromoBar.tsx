import { useEffect, useState } from "react";
import { X } from "lucide-react";

const MESSAGES = [
  "✦  Free shipping on orders over AED 150",
  "✦  Premium Arabian & international fragrances",
  "✦  WhatsApp support · +971 55 581 9416",
  "✦  Visit us in Meena Bazar, Bur Dubai",
];

export function PromoBar() {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("promo-dismissed") === "1") {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % MESSAGES.length);
        setFading(false);
      }, 350);
    }, 4000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center px-10 py-2.5 text-center" style={{ background: "var(--gradient-luxe)" }}>
      <p
        className={`text-xs font-medium tracking-widest text-primary-foreground/90 transition-opacity duration-300 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        {MESSAGES[idx]}
      </p>
      <button
        onClick={() => {
          setVisible(false);
          if (typeof window !== "undefined") sessionStorage.setItem("promo-dismissed", "1");
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-primary-foreground/80 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
