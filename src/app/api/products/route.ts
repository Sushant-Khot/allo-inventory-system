import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      inventory: {
        include: {
          warehouse: true,
        },
        orderBy: {
          warehouse: {
            code: "asc",
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price.toString(),
      stock: product.inventory.reduce((total, item) => total + item.quantity, 0),
      inventory: product.inventory.map((item) => ({
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse.name,
        warehouseCode: item.warehouse.code,
        quantity: item.quantity,
      })),
    })),
  );
}
