import Link from "next/link";
import { Package } from "lucide-react";

export function Navbar() {
  return (
    <header className="relative z-10 border-b" style={{ borderColor: "var(--divider)", background: "oklch(0.09 0.004 250 / 0.85)", backdropFilter: "blur(12px)" }}>
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="flex items-center justify-center size-7 rounded-md"
            style={{ background: "var(--amber-soft)", border: "1px solid var(--amber-border)" }}
          >
            <Package size={14} style={{ color: "var(--amber)" }} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-sm font-semibold tracking-tight"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}
            >
              Allo
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Inventory
            </span>
          </div>
        </Link>

        {/* Right side status */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="size-1.5 rounded-full pulse-dot"
              style={{ background: "var(--green)", display: "inline-block" }}
            />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Live
            </span>
          </div>
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
            style={{
              background: "var(--surf-2)",
              border: "1px solid var(--divider)",
              color: "var(--muted-foreground)",
            }}
          >
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ background: "var(--amber)" }}
            />
            15-min holds
          </div>
        </div>
      </div>
    </header>
  );
}
