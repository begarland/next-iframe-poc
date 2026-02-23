import * as dotenv from "dotenv";
import * as contentful from "contentful";
import ContentfulTable from "./ContentfulTable/ContentfulTable";
// import Markdown from "react-markdown";

dotenv.config();

const publishedClient = contentful.createClient({
  space: `${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
});

const previewClient = contentful.createClient({
  space: `${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN}`,
  host: "preview.contentful.com",
});

async function getData() {
  let publishedData, previewData;

  // const locale = "en-US";

  await publishedClient
    .getEntries({
      content_type: "title",
      // locale: locale,
    })
    .then(function (entries) {
      publishedData = entries;
    });

  await previewClient
    .getEntries({
      content_type: "title",
      // locale: locale,
    })
    .then(function (entries) {
      previewData = entries;
    });

  return {
    publishedData,
    previewData,
  };
}

const ContentfulPullContent = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData: any = await getData();

  console.log(rawData);

  const data = JSON.parse(JSON.stringify(rawData));

  return (
    <div className="flex flex-col justify-center items-center gap-5">
      {data ? <ContentfulTable data={data} /> : null}
      {/* <h1>{data.title}</h1> */}
      {/* <Markdown>{data.description}</Markdown> */}
    </div>
  );
};

export default ContentfulPullContent;
