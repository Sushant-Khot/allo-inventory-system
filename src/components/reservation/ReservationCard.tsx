"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Clock, MapPin, User, Mail, Hash, XCircle } from "lucide-react";

import { CountdownTimer } from "@/components/reservation/CountdownTimer";
import { ReservationDetails } from "@/types";

const STATUS = {
  PENDING:   { label: "Pending hold",  cls: "badge-pending",   dot: "var(--amber)" },
  CONFIRMED: { label: "Confirmed",     cls: "badge-confirmed", dot: "var(--green)" },
  RELEASED:  { label: "Released",      cls: "badge-released",  dot: "var(--muted-foreground)" },
  EXPIRED:   { label: "Expired",       cls: "badge-expired",   dot: "var(--red)" },
};

export function ReservationCard({ reservation }: { reservation: ReservationDetails }) {
  const router = useRouter();
  const isPending = reservation.status === "PENDING";
  const status = STATUS[reservation.status] ?? STATUS.RELEASED;

  async function updateReservation(action: "confirm" | "release") {
    try {
      await axios.post(`/api/reservations/${reservation.id}/${action}`);
      toast.success(action === "confirm" ? "Payment confirmed — stock secured." : "Hold released — units returned to stock.");
      router.refresh();
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.error ?? "Request failed"
          : "Request failed",
      );
    }
  }

  const detailItems = [
    { icon: MapPin,  label: "Warehouse", value: `${reservation.warehouse.code} · ${reservation.warehouse.name}, ${reservation.warehouse.city}` },
    { icon: Hash,    label: "Hold ID",   value: `#${reservation.id.slice(-10).toUpperCase()}` },
    { icon: User,    label: "Customer",  value: reservation.customerName },
    { icon: Mail,    label: "Email",     value: reservation.customerEmail },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Status + countdown card */}
      <div
        className="flex items-center justify-between px-5 py-4 rounded-xl"
        style={{
          background: "var(--surf-1)",
          border: `1px solid var(--divider)`,
        }}
      >
        <span className={`badge ${status.cls}`}>
          <span className="size-1.5 rounded-full inline-block" style={{ background: status.dot }} />
          {status.label}
        </span>

        {isPending && (
          <div className="flex items-center gap-2">
            <Clock size={13} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Expires in</span>
            <CountdownTimer expiresAt={reservation.expiresAt} />
          </div>
        )}
      </div>

      {/* Main card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surf-1)", border: "1px solid var(--divider)" }}
      >
        {/* Product header */}
        <div className="flex gap-4 p-5" style={{ borderBottom: "1px solid var(--divider)" }}>
          {reservation.product.imageUrl && (
            <div
              className="size-14 rounded-lg flex-shrink-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${reservation.product.imageUrl})`,
                border: "1px solid var(--divider)",
              }}
            />
          )}
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-xs font-medium mb-0.5" style={{ color: "var(--muted-foreground)" }}>
              {reservation.product.sku}
            </p>
            <h2 className="text-base font-semibold leading-tight truncate" style={{ color: "var(--foreground)" }}>
              {reservation.product.name}
            </h2>
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--amber)" }}>
              {reservation.quantity} unit{reservation.quantity !== 1 ? "s" : ""} on hold
            </p>
          </div>
        </div>

        {/* Detail rows */}
        <div>
          {detailItems.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-5 py-3.5"
              style={{
                borderBottom: i < detailItems.length - 1 ? "1px solid var(--divider)" : "none",
              }}
            >
              <item.icon size={13} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
              <span className="text-xs w-20 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                {item.label}
              </span>
              <span className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          className="flex flex-wrap items-center gap-3 px-5 py-4"
          style={{ borderTop: "1px solid var(--divider)", background: "var(--surf-2)" }}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{
              background: "var(--surf-3)",
              border: "1px solid var(--divider)",
              color: "var(--muted-foreground)",
            }}
          >
            <ArrowLeft size={13} />
            Back
          </Link>

          <button
            disabled={!isPending}
            onClick={() => updateReservation("confirm")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity"
            style={{
              background: isPending ? "var(--green)" : "var(--surf-3)",
              color: isPending ? "oklch(0.09 0 0)" : "var(--muted-foreground)",
              border: isPending ? "none" : "1px solid var(--divider)",
              cursor: isPending ? "pointer" : "not-allowed",
              opacity: isPending ? 1 : 0.5,
            }}
          >
            <CheckCircle size={13} />
            Confirm payment
          </button>

          <button
            disabled={!isPending}
            onClick={() => updateReservation("release")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-opacity"
            style={{
              background: "transparent",
              border: isPending ? "1px solid var(--red-border)" : "1px solid var(--divider)",
              color: isPending ? "var(--red)" : "var(--muted-foreground)",
              cursor: isPending ? "pointer" : "not-allowed",
              opacity: isPending ? 1 : 0.5,
            }}
          >
            <XCircle size={13} />
            Release hold
          </button>
        </div>
      </div>
    </div>
  );
}
