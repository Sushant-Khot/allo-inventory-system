"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, MapPin, Package } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ReservationInput,
  reservationSchema,
} from "@/schemas/reservationSchema";
import { ProductWithStock } from "@/types";

export function ProductCard({ product }: { product: ProductWithStock }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const defaultWarehouseId = product.inventory.find((item) => item.quantity > 0)?.warehouseId;

  const form = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      productId: product.id,
      warehouseId: defaultWarehouseId ?? "",
      quantity: 1,
      customerName: "",
      customerEmail: "",
    },
  });

  const selectedWarehouse = useWatch({ control: form.control, name: "warehouseId" });
  const maxQuantity = useMemo(
    () => product.inventory.find((item) => item.warehouseId === selectedWarehouse)?.quantity ?? 0,
    [product.inventory, selectedWarehouse],
  );

  async function onSubmit(values: ReservationInput) {
    if (values.quantity > maxQuantity) {
      form.setError("quantity", { message: `Only ${maxQuantity} unit(s) available` });
      return;
    }
    try {
      const response = await axios.post("/api/reservations", values);
      toast.success("Hold created — 15 minutes on the clock.");
      setOpen(false);
      router.push(`/reservation/${response.data.id}`);
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.error ?? "Could not reserve stock"
          : "Could not reserve stock",
      );
    }
  }

  const inStock = product.stock > 0;

  return (
    <article
      className="card-interactive flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "var(--surf-1)",
        border: "1px solid var(--divider)",
      }}
    >
      {/* Product image */}
      <div className="relative overflow-hidden" style={{ height: "180px" }}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
          style={{
            backgroundImage: `url(${product.imageUrl})`,
            filter: inStock ? "none" : "grayscale(0.8) brightness(0.6)",
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, oklch(0.12 0.006 250) 0%, oklch(0.12 0.006 250 / 0.2) 60%, transparent 100%)",
          }}
        />
        {/* Stock badge */}
        <div className="absolute top-3 left-3">
          <span
            className="badge"
            style={
              inStock
                ? { background: "var(--green-soft)", color: "var(--green)", borderColor: "var(--green-border)" }
                : { background: "var(--surf-2)", color: "var(--muted-foreground)", borderColor: "var(--divider)" }
            }
          >
            <span
              className="size-1.5 rounded-full inline-block"
              style={{ background: inStock ? "var(--green)" : "var(--muted-foreground)" }}
            />
            {inStock ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)", textShadow: "0 1px 4px oklch(0 0 0 / 0.6)" }}
          >
            ${product.price}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Name & SKU */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
            {product.sku}
          </p>
          <h3 className="text-base font-semibold leading-snug mb-1.5" style={{ color: "var(--foreground)" }}>
            {product.name}
          </h3>
          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {product.description}
          </p>
        </div>

        {/* Warehouse stock breakdown */}
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--divider)" }}>
          <div className="px-3 py-2 flex items-center gap-1.5" style={{ background: "var(--surf-2)", borderBottom: "1px solid var(--divider)" }}>
            <MapPin size={11} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
              Warehouse stock
            </span>
          </div>
          {product.inventory.map((item) => (
            <div
              key={item.warehouseId}
              className="flex items-center justify-between px-3 py-2 text-xs"
              style={{ borderTop: "1px solid var(--divider)" }}
            >
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                {item.warehouseCode}
              </span>
              <span
                className="tabular-nums font-medium"
                style={{ color: item.quantity > 0 ? "var(--foreground)" : "var(--muted-foreground)" }}
              >
                {item.quantity > 0 ? `${item.quantity} units` : "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Reserve button */}
        <div className="mt-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              disabled={!inStock}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-semibold transition-all duration-150"
              style={
                inStock
                  ? {
                      background: "var(--amber)",
                      color: "var(--primary-foreground)",
                      cursor: "pointer",
                    }
                  : {
                      background: "var(--surf-3)",
                      color: "var(--muted-foreground)",
                      cursor: "not-allowed",
                      border: "1px solid var(--divider)",
                    }
              }
            >
              {inStock ? (
                <>Reserve <ArrowRight size={13} /></>
              ) : (
                "Out of stock"
              )}
            </DialogTrigger>

            <DialogContent
              className="p-0 gap-0 overflow-hidden rounded-xl"
              style={{
                background: "var(--surf-1)",
                border: "1px solid var(--divider)",
                maxWidth: "420px",
              }}
            >
              {/* Dialog header */}
              <div className="px-6 pt-6 pb-5" style={{ borderBottom: "1px solid var(--divider)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="size-10 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${product.imageUrl})` }}
                  />
                  <div>
                    <DialogHeader>
                      <DialogTitle className="text-sm font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                        {product.name}
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {product.sku}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-xs"
                  style={{ background: "var(--amber-soft)", border: "1px solid var(--amber-border)", color: "var(--amber)" }}
                >
                  <Package size={12} />
                  Hold lasts 15 minutes — confirm after payment succeeds.
                </div>
              </div>

              {/* Form */}
              <div className="px-6 py-5">
                <Form {...form}>
                  <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>

                    {/* Warehouse */}
                    <FormField
                      control={form.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                            Warehouse
                          </FormLabel>
                          <FormControl>
                            <select
                              className="w-full h-9 rounded-md px-3 text-sm"
                              style={{
                                background: "var(--surf-2)",
                                border: "1px solid var(--divider)",
                                color: "var(--foreground)",
                                outline: "none",
                              }}
                              {...field}
                            >
                              {product.inventory.map((item) => (
                                <option
                                  disabled={item.quantity === 0}
                                  key={item.warehouseId}
                                  value={item.warehouseId}
                                  style={{ background: "var(--surf-2)", color: item.quantity === 0 ? "var(--muted-foreground)" : "var(--foreground)" }}
                                >
                                  {item.warehouseCode} — {item.warehouseName} ({item.quantity} available)
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                              Quantity
                            </FormLabel>
                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                              Max {maxQuantity}
                            </span>
                          </div>
                          <FormControl>
                            <Input
                              min={1} max={maxQuantity} type="number"
                              className="h-9 text-sm rounded-md"
                              style={{ background: "var(--surf-2)", border: "1px solid var(--divider)", color: "var(--foreground)" }}
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Customer info */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Jane Smith"
                                className="h-9 text-sm rounded-md"
                                style={{ background: "var(--surf-2)", border: "1px solid var(--divider)", color: "var(--foreground)" }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="jane@co.com"
                                type="email"
                                className="h-9 text-sm rounded-md"
                                style={{ background: "var(--surf-2)", border: "1px solid var(--divider)", color: "var(--foreground)" }}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="w-full h-9 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold mt-1 transition-opacity hover:opacity-90 active:scale-[0.98]"
                      style={{ background: "var(--amber)", color: "var(--primary-foreground)" }}
                    >
                      Confirm Hold
                      <ArrowRight size={14} />
                    </button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </article>
  );
}
