export const uploadEntryToContentful = async (
  payload: object,
  contentId: string,
): Promise<void> => {
  const res = await fetch("/api/upload-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { ...payload }, contentId }),
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }
};
