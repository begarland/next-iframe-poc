import { NextRequest, NextResponse } from "next/server";

const SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID!;
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN!;
const CMA = `https://api.contentful.com/spaces/${SPACE_ID}/environments/master`;

const LOCALES = ["en-US", "fr-CA"] as const;
type Locale = (typeof LOCALES)[number];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Collect per-locale files and alt text
    const files: Partial<Record<Locale, File>> = {};
    const titles: Partial<Record<Locale, string>> = {};
    const alts: Partial<Record<Locale, string>> = {};
    for (const locale of LOCALES) {
      const file = formData.get(`file-${locale}`) as File | null;
      if (file) {
        files[locale] = file;
        titles[locale] = (formData.get(`titleText-${locale}`) as string | null) || file.name;
        alts[locale] = (formData.get(`altText-${locale}`) as string | null) || file.name;
      }
    }

    const localesWithFiles = Object.keys(files) as Locale[];
    if (localesWithFiles.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Step 1 — upload each locale's binary and collect upload IDs
    const uploadIds: Partial<Record<Locale, string>> = {};
    for (const locale of localesWithFiles) {
      const buffer = Buffer.from(await files[locale]!.arrayBuffer());
      const uploadRes = await fetch(
        `https://upload.contentful.com/spaces/${SPACE_ID}/uploads`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/octet-stream",
          },
          body: buffer,
        },
      );
      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        console.error(`Upload binary failed for ${locale}:`, err);
        return NextResponse.json({ error: "Binary upload failed" }, { status: 502 });
      }
      const upload = await uploadRes.json();
      uploadIds[locale] = upload.sys.id;
    }

    // Step 2 — create ONE asset with locale-specific title + file fields
    const titleField: Partial<Record<Locale, string>> = {};
    const descField: Partial<Record<Locale, string>> = {};
    const fileField: Partial<Record<Locale, object>> = {};
    for (const locale of localesWithFiles) {
      titleField[locale] = titles[locale];
      descField[locale] = alts[locale];
      fileField[locale] = {
        contentType: files[locale]!.type,
        fileName: files[locale]!.name,
        uploadFrom: {
          sys: { type: "Link", linkType: "Upload", id: uploadIds[locale] },
        },
      };
    }

    const createRes = await fetch(`${CMA}/assets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/vnd.contentful.management.v1+json",
      },
      body: JSON.stringify({
        fields: { title: titleField, description: descField, file: fileField },
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      console.error("Create asset failed:", err);
      return NextResponse.json({ error: "Asset creation failed" }, { status: 502 });
    }
    const asset = await createRes.json();
    const assetId: string = asset.sys.id;
    let version: number = asset.sys.version;

    // Step 3 — trigger processing for each locale
    for (const locale of localesWithFiles) {
      await fetch(`${CMA}/assets/${assetId}/files/${locale}/process`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "X-Contentful-Version": String(version),
        },
      });
    }

    // Step 4 — poll until all locale URLs are ready (max 10s)
    let processedAsset = asset;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1_000));
      const pollRes = await fetch(`${CMA}/assets/${assetId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      processedAsset = await pollRes.json();
      const allReady = localesWithFiles.every(
        (locale) => processedAsset.fields?.file?.[locale]?.url,
      );
      if (allReady) break;
    }

    version = processedAsset.sys.version;

    // Step 5 — publish the asset
    const publishRes = await fetch(`${CMA}/assets/${assetId}/published`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "X-Contentful-Version": String(version),
      },
    });
    if (!publishRes.ok) {
      const err = await publishRes.text();
      console.error("Publish asset failed:", err);
      return NextResponse.json({ error: "Asset publish failed" }, { status: 502 });
    }

    return NextResponse.json({ assetId });
  } catch (error) {
    console.error("upload-asset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
