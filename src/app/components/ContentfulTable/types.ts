type LocalizedString = Record<string, string>;

type Entry = {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string | LocalizedString;
    description: string | LocalizedString;
    productId: string | LocalizedString;
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
