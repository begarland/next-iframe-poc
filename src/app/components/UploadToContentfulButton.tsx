"use client";

import { uploadEntryToContentful } from "../fetches/uploadEntryToContentful";

const UploadToContentfulButton = () => {
  const test = {
    fields: {
      title: {
        "en-US": "Hello, World!",
        "fr-CA": "Bonjour",
      },
      description: {
        "en-US": "this is working! woohoo!",
        "fr-CA": "Ça marche! Youpi!",
      },
    },
  };

  return (
    <>
      <button
        className="pointer bg-pink-800 hover:bg-pink-600 w-64 p-2 rounded mt-10"
        onClick={uploadEntryToContentful(test)}
      >
        test uploads
      </button>
    </>
  );
};

export default UploadToContentfulButton;
