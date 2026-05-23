"use server";

import { revalidatePath } from "next/cache";

import { confirmReservation, releaseReservation } from "@/lib/reservation";

export async function confirmReservationAction(id: string) {
  const reservation = await confirmReservation(id);
  revalidatePath("/");
  revalidatePath(`/reservation/${id}`);
  return reservation;
}

export async function releaseReservationAction(id: string) {
  const reservation = await releaseReservation(id);
  revalidatePath("/");
  revalidatePath(`/reservation/${id}`);
  return reservation;
}
