import * as contentful from "contentful";
import { NextRequest } from "next/server";

const previewClient = contentful.createClient({
  space: `${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN}`,
  host: "preview.contentful.com",
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const entry = await previewClient.withAllLocales.getEntry(id);
  return Response.json(entry);
}
