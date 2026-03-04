// app/api/contentful/route.ts
import * as contentful from "contentful";

const previewClient = contentful.createClient({
  space: `${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN}`,
  host: "preview.contentful.com",
});

export async function GET() {
  const entries = await previewClient.getEntries({ content_type: "item" });
  return Response.json(entries);
}
