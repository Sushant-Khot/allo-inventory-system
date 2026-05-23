import { addMinutes } from "date-fns";

import { ReservationStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ReservationInput } from "@/schemas/reservationSchema";

export const RESERVATION_TTL_MINUTES = 15;

export async function createReservation(input: ReservationInput) {
  return prisma.$transaction(async (tx) => {
    const inventoryUpdate = await tx.inventory.updateMany({
      where: {
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: {
          gte: input.quantity,
        },
      },
      data: {
        quantity: {
          decrement: input.quantity,
        },
      },
    });

    if (inventoryUpdate.count !== 1) {
      throw new Error("Insufficient inventory for this warehouse.");
    }

    return tx.reservation.create({
      data: {
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: input.quantity,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        expiresAt: addMinutes(new Date(), RESERVATION_TTL_MINUTES),
      },
      include: {
        product: true,
        warehouse: true,
      },
    });
  });
}

export class ReservationExpiredError extends Error {
  constructor() {
    super("Reservation has expired.");
    this.name = "ReservationExpiredError";
  }
}

export async function confirmReservation(id: string) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({ where: { id } });

    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new Error(`Reservation is already ${reservation.status.toLowerCase()}.`);
    }

    if (reservation.expiresAt <= new Date()) {
      // Restore stock and mark EXPIRED atomically in the same transaction,
      // so units are never left in limbo while waiting for the cron job.
      await tx.inventory.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          quantity: {
            increment: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.EXPIRED,
          releasedAt: new Date(),
        },
      });

      throw new ReservationExpiredError();
    }

    return tx.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });
  });
}

export async function releaseReservation(
  id: string,
  status: ReservationStatus = ReservationStatus.RELEASED,
) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({ where: { id } });

    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      return reservation;
    }

    await tx.inventory.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      },
      data: {
        quantity: {
          increment: reservation.quantity,
        },
      },
    });

    return tx.reservation.update({
      where: { id },
      data: {
        status,
        releasedAt: new Date(),
      },
    });
  });
}

export async function releaseExpiredReservations() {
  const expired = await prisma.reservation.findMany({
    where: {
      status: ReservationStatus.PENDING,
      expiresAt: {
        lte: new Date(),
      },
    },
    select: {
      id: true,
    },
  });

  const results = await Promise.all(
    expired.map((reservation) =>
      releaseReservation(reservation.id, ReservationStatus.EXPIRED),
    ),
  );

  return {
    released: results.length,
    reservations: results,
  };
}
