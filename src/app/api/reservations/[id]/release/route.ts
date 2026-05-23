import { NextResponse } from "next/server";

import { releaseReservation } from "@/lib/reservation";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const reservation = await releaseReservation(id);
    return NextResponse.json(reservation);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to release reservation.",
      },
      { status: 400 },
    );
  }
}
