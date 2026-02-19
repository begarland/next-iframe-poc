export const uploadEntryToContentful = (payload: object) => () => {
  const raw = JSON.stringify(payload);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestOptions: any = {
    method: "POST",
    body: raw,
    redirect: "follow",
  };

  fetch(`/api/upload-entry`, requestOptions);
};
