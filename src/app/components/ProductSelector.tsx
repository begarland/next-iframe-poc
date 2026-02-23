"use client";

import { useProduct } from "../contexts/ProductContext";

export const ProductSelector = () => {
  const { productId } = useProduct();

  return (
    <div className="flex justify-center items-center">
      <div className="mt-10">
        <p className="bold text-2xl">Selected product: {productId ?? "none"}</p>
      </div>
    </div>
  );
};
