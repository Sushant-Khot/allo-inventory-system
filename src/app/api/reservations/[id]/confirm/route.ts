import { NextResponse } from "next/server";

import { confirmReservation, ReservationExpiredError } from "@/lib/reservation";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const reservation = await confirmReservation(id);
    return NextResponse.json(reservation);
  } catch (error) {
    if (error instanceof ReservationExpiredError) {
      return NextResponse.json({ error: error.message }, { status: 410 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to confirm reservation.",
      },
      { status: 400 },
    );
  }
}
