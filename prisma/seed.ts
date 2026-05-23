import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString:
    process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://localhost:5432/allo_inventory_system",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  const [north, west, central] = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: "North Fulfillment Hub",
        code: "NORTH",
        city: "Delhi",
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "West Distribution Center",
        code: "WEST",
        city: "Mumbai",
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Central Stock Room",
        code: "CENTRAL",
        city: "Bengaluru",
      },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Allo Smart Scanner",
        sku: "ALLO-SCAN-100",
        description: "Compact barcode scanner for daily warehouse receiving.",
        imageUrl:
          "https://picsum.photos/seed/allo-scanner/900/600",
        price: "249.00",
      },
    }),
    prisma.product.create({
      data: {
        name: "Inventory Label Kit",
        sku: "ALLO-LABEL-240",
        description: "Durable label rolls and quick-swap ink for stock tagging.",
        imageUrl:
          "https://picsum.photos/seed/allo-label/900/600",
        price: "39.00",
      },
    }),
    prisma.product.create({
      data: {
        name: "Warehouse Tablet Mount",
        sku: "ALLO-MOUNT-45",
        description: "Adjustable workstation mount for packing and dispatch desks.",
        imageUrl:
          "https://picsum.photos/seed/allo-mount/900/600",
        price: "89.00",
      },
    }),
  ]);

  await prisma.inventory.createMany({
    data: [
      { productId: products[0].id, warehouseId: north.id, quantity: 14 },
      { productId: products[0].id, warehouseId: west.id, quantity: 6 },
      { productId: products[0].id, warehouseId: central.id, quantity: 9 },
      { productId: products[1].id, warehouseId: north.id, quantity: 120 },
      { productId: products[1].id, warehouseId: west.id, quantity: 75 },
      { productId: products[1].id, warehouseId: central.id, quantity: 88 },
      { productId: products[2].id, warehouseId: north.id, quantity: 8 },
      { productId: products[2].id, warehouseId: west.id, quantity: 4 },
      { productId: products[2].id, warehouseId: central.id, quantity: 13 },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
