import type { CSSProperties } from "react";

export function JD09LogoMark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 112 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* ── Gothic J ── */}

      {/* J — horizontal crossbar with pointed right terminal */}
      <path d="M 4 7 L 50 7 L 55 11 L 50 15 L 4 15 Z" />

      {/* J — vertical stem (descends below the crossbar) */}
      <path d="M 16 7 L 24 7 L 24 63 L 16 63 Z" />

      {/* J — bottom swash: outer curl left → down → up, then inner return */}
      <path d="
        M 16 63
        C  8 67  2 73  2 81
        C  2 91 10 95 18 91
        C 24 87 26 81 24 73
        L 20 75
        C 22 81 20 87 16 89
        C 12 91  6 89  6 81
        C  6 73 12 69 18 65 Z
      " />

      {/* ── Gothic D ── */}

      {/* D — left vertical bar */}
      <path d="M 46 7 L 46 89 L 54 89 L 54 7 Z" />

      {/* D — top pointed cusp (where bar meets bowl) */}
      <path d="M 38 7 L 58 7 L 46 0 Z" />

      {/* D — bottom pointed cusp */}
      <path d="M 38 89 L 58 89 L 46 97 Z" />

      {/* D — bowl ring: outer arc right then inner arc back */}
      <path d="
        M 54 7
        C 82  3 110 21 110 48
        C 110 75  82 95  54 89
        L 54 77
        C 76 81  98 67  98 48
        C 98 29  76 19  54 23 Z
      " />
    </svg>
  );
}
