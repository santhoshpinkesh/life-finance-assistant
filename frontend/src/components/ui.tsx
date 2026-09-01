import { type ReactNode, useEffect } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {children}
    </div>
  );
}

export function ProgressBar({ pct, tone = "mint" }: { pct: number; tone?: "mint" | "amber" | "rose" }) {
  const color =
    tone === "rose" ? "var(--rose)" : tone === "amber" ? "var(--amber)" : "var(--mint)";
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${clamped}%`, background: color }}
      />
    </div>
  );
}

export function Badge({ children, tone = "mint" }: { children: ReactNode; tone?: "mint" | "amber" | "rose" | "muted" }) {
  const styles: Record<string, { bg: string; fg: string }> = {
    mint: { bg: "rgba(52,211,153,0.12)", fg: "var(--mint)" },
    amber: { bg: "rgba(245,165,36,0.12)", fg: "var(--amber)" },
    rose: { bg: "rgba(251,113,133,0.12)", fg: "var(--rose)" },
    muted: { bg: "var(--surface-2)", fg: "var(--text-dim)" },
  };
  const s = styles[tone];
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full font-mono"
      style={{ background: s.bg, color: s.fg }}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
}) {
  const base = "text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-85";
  const variants: Record<string, string> = {
    primary: "",
    ghost: "",
    danger: "",
  };
  const style =
    variant === "primary"
      ? { background: "var(--mint)", color: "#06251A" }
      : variant === "danger"
      ? { background: "rgba(251,113,133,0.12)", color: "var(--rose)" }
      : { background: "transparent", color: "var(--text-dim)", border: "1px solid var(--border)" };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${className}`} style={style}>
      {children}
    </button>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(6,9,16,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg">{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--text-dim)" }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-3">
      <span className="text-xs mb-1 block" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block mb-3">
      <span className="text-xs mb-1 block" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
      <select
        {...props}
        className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
      >
        {children}
      </select>
    </label>
  );
}
