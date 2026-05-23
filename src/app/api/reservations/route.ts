import { NextResponse } from "next/server";

import { createReservation } from "@/lib/reservation";
import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/schemas/reservationSchema";

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    include: {
      product: true,
      warehouse: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 25,
  });

  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = reservationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid reservation data", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const reservation = await createReservation(parsed.data);
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create reservation.",
      },
      { status: 409 },
    );
  }
}
