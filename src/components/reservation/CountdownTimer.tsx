"use client";

import { useEffect, useMemo, useState } from "react";

export function CountdownTimer({ expiresAt }: { expiresAt: string | Date }) {
  const expiry = useMemo(() => new Date(expiresAt), [expiresAt]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const isExpired = expiry <= now;
  const totalMs = expiry.getTime() - now.getTime();
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const isUrgent = !isExpired && totalSec < 120;

  if (isExpired) {
    return (
      <span
        className="font-semibold tracking-wider"
        style={{ color: "oklch(0.60 0.22 25)" }}
      >
        EXPIRED
      </span>
    );
  }

  return (
    <span
      className={`font-semibold tabular-nums tracking-wider ${
        isUrgent ? "countdown-urgent" : ""
      }`}
      style={{ color: isUrgent ? "oklch(0.70 0.20 25)" : "var(--amber)" }}
    >
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}
