"use client";

import { useProduct } from "../contexts/ProductContext";

export const ProductSelector = () => {
  const { productId, setProductId } = useProduct();

  return (
    <div>
      <p>Selected product: {productId ?? "none"}</p>
      <button onClick={() => setProductId("123")}>Select Product 123</button>
    </div>
  );
};
