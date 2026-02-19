import * as dotenv from "dotenv";
import * as contentful from "contentful";
import Markdown from "react-markdown";

dotenv.config();

const client = contentful.createClient({
  space: `${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
});

async function getData() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;

  const locale = "en-US";

  await client
    .getEntries({
      content_type: "title",
      locale: locale,
    })
    .then(function (entries) {
      data = entries;
    });

  return data?.items[0].fields;
}

const ContentfulPullContent = async () => {
  const data = await getData();

  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <h1>{data.title}</h1>
      <Markdown>{data.description}</Markdown>
    </div>
  );
};

export default ContentfulPullContent;
