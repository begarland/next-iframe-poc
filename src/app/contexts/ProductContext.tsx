// ProductContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type ProductContextType = {
  productId: string | null;
  setProductId: (id: string | null) => void;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [productId, setProductId] = useState<string | null>('2');

  return (
    <ProductContext.Provider value={{ productId, setProductId }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
};
