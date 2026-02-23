import { useEffect } from "react";
import { useProduct } from "../contexts/ProductContext";

export const useWindowListener = () => {
  const { setProductId } = useProduct();

  console.log(';here')

  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log("message", JSON.stringify(event));

      // if (event.origin !== 'acceptedurl') {
      //     console.error('unauthorized')
      //     return
      // }

      const data = event.data;

      console.log("message:", JSON.stringify(event.data, null, 4));

      if (data) {
        console.log('changed payload id', data)
        if (data.payload?.productId) setProductId(data.payload.productId);
      }
    });

    return () => {};
  });
};
