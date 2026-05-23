export type ProductWithStock = {
  id: string;
  name: string;
  sku: string;
  description: string;
  imageUrl: string;
  price: string;
  stock: number;
  inventory: {
    warehouseId: string;
    warehouseName: string;
    warehouseCode: string;
    quantity: number;
  }[];
};

export type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED" | "EXPIRED";

export type ReservationDetails = {
  id: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  product: {
    id: string;
    name: string;
    sku: string;
    imageUrl: string;
  };
  warehouse: {
    id: string;
    name: string;
    code: string;
    city: string;
  };
};
