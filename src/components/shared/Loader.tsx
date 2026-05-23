export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-8" style={{ color: "var(--muted-foreground)" }}>
      <div
        className="size-4 rounded-full border-2 border-t-transparent spin"
        style={{ borderColor: "var(--amber)", borderTopColor: "transparent" }}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
