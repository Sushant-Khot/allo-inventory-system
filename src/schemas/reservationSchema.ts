import { z } from "zod";

export const reservationSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().min(1, "Warehouse is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Enter a valid email address"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
