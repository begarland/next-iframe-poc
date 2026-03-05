"use client";
import { useProduct } from "../contexts/ProductContext";

export const Footer = () => {
  const { productId } = useProduct();

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-300 px-4 py-2 text-sm text-gray-600">
      Product ID: <span className="font-mono font-semibold">{productId ?? "none"}</span>
    </footer>
  );
};
