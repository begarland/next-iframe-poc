"use client";

import { uploadEntryToContentful } from "../fetches/uploadEntryToContentful";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UploadToContentfulButton = ({ form }: { form: any }) => {
  return (
    <>
      <button
        className="pointer bg-pink-800 hover:bg-pink-600 w-64 p-2 rounded mt-10"
        onClick={uploadEntryToContentful(form)}
      >
        save entry
      </button>
    </>
  );
};

export default UploadToContentfulButton;
