export const uploadEntryToContentful = (payload: object) => () => {
  const formattedPayload = {
    fields: {
      ...payload,
    },
  };

  const raw = JSON.stringify(formattedPayload);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestOptions: any = {
    method: "POST",
    body: raw,
    redirect: "follow",
  };

  fetch(`/api/upload-entry`, requestOptions);
};
