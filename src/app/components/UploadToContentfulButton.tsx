"use client";

import { uploadEntryToContentful } from "../fetches/uploadEntryToContentful";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UploadToContentfulButton = ({
  form,
  contentId,
}: {
  form: object;
  contentId: string;
}) => {
  return (
    <>
      <button
        className="pointer bg-[#c94f7c] hover:bg-pink-900 text-white! font-bold w-64 p-2 rounded-3xl mt-10"
        onClick={uploadEntryToContentful(form, contentId)}
      >
        save entry
      </button>
    </>
  );
};

export default UploadToContentfulButton;
