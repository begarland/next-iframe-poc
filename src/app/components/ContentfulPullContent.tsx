import * as dotenv from "dotenv";
import * as contentful from "contentful";
import ContentfulTable from "./ContentfulTable/ContentfulTable";
import { unstable_noStore as noStore } from "next/cache";
// import Markdown from "react-markdown";

dotenv.config();

const publishedClient = contentful.createClient({
  space: `${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
});

// preview client has both draft and published; published client is only published
const previewClient = contentful.createClient({
  space: `${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN}`,
  host: "preview.contentful.com",
});

export const dynamic = "force-dynamic";

async function getData() {
  noStore();

  const [previewData, publishedData] = await Promise.all([
    previewClient.withAllLocales.getEntries({ content_type: "item" }),
    publishedClient.getEntries({ content_type: "item" }),
  ]);

  return { previewData, publishedData };
}
const ContentfulPullContent = async () => {
  const rawData = await getData();
  const data = JSON.parse(JSON.stringify(rawData));

  return (
    <div className="flex flex-col gap-5">
      {data ? <ContentfulTable data={data} /> : null}
    </div>
  );
};
export default ContentfulPullContent;
