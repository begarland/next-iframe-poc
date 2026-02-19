"use client";

import { useInput } from "../hooks/useInput";

const TextareaWithTitle = ({
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
        <textarea rows={5} value={value} onChange={changeValue} />
      </div>
    </>
  );
};

export default TextareaWithTitle;
