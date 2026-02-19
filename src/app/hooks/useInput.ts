import { useState } from "react";

export const useInput = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changeValue = (event: any) => {
    setValue(event.target.value);
  };

  return {
    value,
    changeValue,
  };
};
