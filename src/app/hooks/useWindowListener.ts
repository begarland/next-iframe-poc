import { useEffect } from "react";

export const useWindowListener = () => {
  useEffect(() => {
    window.addEventListener("message", (event) => {
      console.log("message", JSON.stringify(event));

      // if (event.origin !== 'acceptedurl') {
      //     console.error('unauthorized')
      //     return
      // }

      console.log("message:", JSON.stringify(event.data, null, 4));
    });

    return () => {};
  });
};
