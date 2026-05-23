import { ProductList } from "@/components/products/ProductList";
import { Navbar } from "@/components/shared/Navbar";
import { Boxes, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-12">

        {/* Hero */}
        <section className="fade-up fade-up-1 mb-12">
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{
                background: "var(--amber-soft)",
                border: "1px solid var(--amber-border)",
                color: "var(--amber)",
              }}
            >
              <span className="size-1.5 rounded-full inline-block" style={{ background: "var(--amber)" }} />
              Multi-warehouse inventory platform
            </span>
            <h1
              className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-3"
              style={{ fontFamily: "var(--font-sans)", color: "var(--foreground)" }}
            >
              Reserve before
              <span style={{ color: "var(--amber)" }}> stock moves.</span>
            </h1>
            <p className="text-base max-w-lg" style={{ color: "var(--muted-foreground)", lineHeight: 1.65 }}>
              Timed inventory holds prevent overselling during payment. Confirm when payment clears, release if it falls through — stock returns instantly.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { icon: Zap, label: "15-min hold window", desc: "Auto-expires if unpaid" },
              { icon: ShieldCheck, label: "Race-condition safe", desc: "Atomic DB transactions" },
              { icon: Boxes, label: "3 warehouses", desc: "Per-location stock levels" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{
                  background: "var(--surf-1)",
                  border: "1px solid var(--divider)",
                }}
              >
                <div
                  className="flex items-center justify-center size-8 rounded-md flex-shrink-0"
                  style={{ background: "var(--surf-3)" }}
                >
                  <Icon size={15} style={{ color: "var(--amber)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Product grid */}
        <section className="fade-up fade-up-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              All Products
            </h2>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Select warehouse when reserving
            </p>
          </div>
          <ProductList />
        </section>

      </main>
    </>
  );
}
