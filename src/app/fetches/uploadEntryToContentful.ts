export const uploadEntryToContentful = (payload: object) => () => {


  const formattedPayload = {
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

  const raw = JSON.stringify(formattedPayload);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestOptions: any = {
    method: "POST",
    body: raw,
    redirect: "follow",
  };

  fetch(`/api/upload-entry`, requestOptions);
};
