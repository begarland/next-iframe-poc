"use client";

import { useInput } from "../hooks/useInput";

const InputWithTitle = ({
  title,
  initialValue = "",
}: {
  title: string;
  initialValue?: string;
}) => {
  const { value, changeValue } = useInput(initialValue);

  return (
    <>
      <div>
        <p>{title}</p>
        <input value={value} onChange={changeValue} />
      </div>
    </>
  );
};

export default InputWithTitle;
