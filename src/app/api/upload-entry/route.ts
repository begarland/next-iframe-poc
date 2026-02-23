import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const myHeaders = new Headers();
  myHeaders.append(
    "Content-Type",
    "application/vnd.contentful.management.v1+json",
  );
  myHeaders.append("X-Contentful-Content-Type", payload?.contentId); // this is where the content type id is being selected
  myHeaders.append(
    "Authorization",
    `Bearer ${process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN}`,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ fields: payload.fields }),
    redirect: "follow",
    cache: "no-store",
  };

  return fetch(
    `https://api.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/master/entries`,
    requestOptions,
  )
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      return NextResponse.json(result, { status: 200 });
    })
    .catch((error) => {
      console.error(error);
      return NextResponse.json(error, { status: 500 });
    });
}
