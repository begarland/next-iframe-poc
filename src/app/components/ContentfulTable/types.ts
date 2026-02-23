type Entry = {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    description: string;
    productId: string;
  };
};

export type ContentfulDataProps = {
  data: {
    publishedData: {
      items: Entry[];
    };
    previewData: {
      items: Entry[];
    };
  };
};
