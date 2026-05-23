"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { ProductCard } from "@/components/products/ProductCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader } from "@/components/shared/Loader";
import { ProductWithStock } from "@/types";

export function ProductList() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await axios.get<ProductWithStock[]>("/api/products");
        setProducts(response.data);
      } catch {
        setError("Connect DATABASE_URL, run Prisma setup, and seed the database.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (isLoading) {
    return <Loader label="Loading inventory" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Inventory unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
