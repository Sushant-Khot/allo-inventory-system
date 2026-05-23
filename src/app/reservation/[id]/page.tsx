import { notFound } from "next/navigation";

import { ReservationCard } from "@/components/reservation/ReservationCard";
import { Navbar } from "@/components/shared/Navbar";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationPage({ params }: PageProps) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { product: true, warehouse: true },
  });

  if (!reservation) notFound();

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-6 py-12">

        {/* Page header */}
        <div className="fade-up fade-up-1 mb-8">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
            Reservation
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
              Hold #{reservation.id.slice(-8).toUpperCase()}
            </h1>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Created {new Date(reservation.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="fade-up fade-up-2">
          <ReservationCard
            reservation={{
              id: reservation.id,
              quantity: reservation.quantity,
              status: reservation.status as "PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED",
              expiresAt: reservation.expiresAt.toISOString(),
              createdAt: reservation.createdAt.toISOString(),
              customerName: reservation.customerName,
              customerEmail: reservation.customerEmail,
              product: {
                id: reservation.product.id,
                name: reservation.product.name,
                sku: reservation.product.sku,
                imageUrl: reservation.product.imageUrl,
              },
              warehouse: {
                id: reservation.warehouse.id,
                name: reservation.warehouse.name,
                code: reservation.warehouse.code,
                city: reservation.warehouse.city,
              },
            }}
          />
        </div>
      </main>
    </>
  );
}
