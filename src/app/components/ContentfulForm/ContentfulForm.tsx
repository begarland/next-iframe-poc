"use client";

import { useProduct } from "@/app/contexts/ProductContext";
import { uploadEntryToContentful } from "@/app/fetches/uploadEntryToContentful";
import { ChangeEvent, FormEvent, useState } from "react";
// import UploadToContentfulButton from "../UploadToContentfulButton";

type LocalizedField = {
  "en-US": string;
  "fr-CA": string;
};

type FormData = {
  title: LocalizedField;
  description: LocalizedField;
};


type Locale = "en-US" | "fr-CA";

const LOCALES: {
  id: Locale;
  label: string;
  flag: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  imageTitlePlaceholder: string;
  altPlaceholder: string;
}[] = [
  {
    id: "en-US",
    label: "English",
    flag: "🇺🇸",
    titlePlaceholder: "Enter English title",
    descriptionPlaceholder: "Enter English description",
    imageTitlePlaceholder: "Enter image title",
    altPlaceholder: "Describe the image",
  },
  {
    id: "fr-CA",
    label: "Français",
    flag: "🇨🇦",
    titlePlaceholder: "Entrez le titre français",
    descriptionPlaceholder: "Entrez la description française",
    imageTitlePlaceholder: "Entrez le titre de l'image",
    altPlaceholder: "Décrivez l'image",
  },
];

const ContentfulForm: React.FC = () => {
  const { productId } = useProduct();
  const [activeLocale, setActiveLocale] = useState<Locale>("en-US");

  const [form, setForm] = useState<FormData>({
    title: { "en-US": "", "fr-CA": "" },
    description: { "en-US": "", "fr-CA": "" },
  });

  const [imageFiles, setImageFiles] = useState<Record<Locale, File | null>>({
    "en-US": null,
    "fr-CA": null,
  });
  const [imagePreviews, setImagePreviews] = useState<Record<Locale, string | null>>({
    "en-US": null,
    "fr-CA": null,
  });
  const [imageAlts, setImageAlts] = useState<Record<Locale, string>>({
    "en-US": "",
    "fr-CA": "",
  });
  const [imageTitles, setImageTitles] = useState<Record<Locale, string>>({
    "en-US": "",
    "fr-CA": "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, dataset } = e.target;
    const locale = dataset.locale as Locale;

    setForm((prev) => ({
      ...prev,
      [name]: {
        ...prev[name as keyof FormData],
        [locale]: value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const localesWithImages = (["en-US", "fr-CA"] as Locale[]).filter((l) => imageFiles[l]);
    let sharedAssetId: string | null = null;

    if (localesWithImages.length > 0) {
      setIsUploading(true);
      try {
        const fd = new FormData();
        for (const locale of localesWithImages) {
          const file = imageFiles[locale]!;
          fd.append(`file-${locale}`, file);
          fd.append(`titleText-${locale}`, imageTitles[locale] || file.name);
          fd.append(`altText-${locale}`, imageAlts[locale] || file.name);
        }
        const res = await fetch("/api/upload-asset", { method: "POST", body: fd });
        const data = await res.json();
        sharedAssetId = data.assetId ?? null;
      } catch (err) {
        console.error("Image upload failed", err);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const imagesField: Record<string, { sys: { type: string; linkType: string; id: string } }> = {};
    if (sharedAssetId) {
      for (const locale of localesWithImages) {
        imagesField[locale] = { sys: { type: "Link", linkType: "Asset", id: sharedAssetId } };
      }
    }

    const payload = {
      ...form,
      productId: { "en-US": productId as string, "fr-CA": productId as string },
      ...(Object.keys(imagesField).length > 0 ? { images: imagesField } : {}),
    };

    console.log(payload);
    uploadEntryToContentful(payload, "item")();

    for (const locale of ["en-US", "fr-CA"] as Locale[]) {
      const preview = imagePreviews[locale];
      if (preview) URL.revokeObjectURL(preview);
    }

    setForm({
      title: { "en-US": "", "fr-CA": "" },
      description: { "en-US": "", "fr-CA": "" },
    });
    setImageFiles({ "en-US": null, "fr-CA": null });
    setImagePreviews({ "en-US": null, "fr-CA": null });
    setImageAlts({ "en-US": "", "fr-CA": "" });
    setImageTitles({ "en-US": "", "fr-CA": "" });
    setActiveLocale("en-US");
  };

  const inputStyles =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

  const activeLocaleConfig = LOCALES.find((l) => l.id === activeLocale)!;

  return (
    <div className="py-12 px-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Content Entry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Provide localized content for English and French.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex border-b border-gray-100">
          {LOCALES.map((locale) => (
            <button
              key={locale.id}
              type="button"
              onClick={() => setActiveLocale(locale.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeLocale === locale.id
                  ? "border-[#c94f7c] text-[#c94f7c]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {locale.flag} {locale.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor={`title-${activeLocale}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              key={`title-${activeLocale}`}
              id={`title-${activeLocale}`}
              name="title"
              data-locale={activeLocale}
              value={form.title[activeLocale]}
              onChange={handleChange}
              placeholder={activeLocaleConfig.titlePlaceholder}
              required
              className={inputStyles}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor={`description-${activeLocale}`}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              key={`description-${activeLocale}`}
              id={`description-${activeLocale}`}
              name="description"
              data-locale={activeLocale}
              value={form.description[activeLocale]}
              onChange={handleChange}
              rows={4}
              placeholder={activeLocaleConfig.descriptionPlaceholder}
              required
              className={inputStyles}
            />
          </div>

          {/* Image upload — locale-specific */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer w-fit rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 hover:border-[#c94f7c] hover:text-[#c94f7c] transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {imageFiles[activeLocale] ? imageFiles[activeLocale]!.name : "Choose image…"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  const prev = imagePreviews[activeLocale];
                  if (prev) URL.revokeObjectURL(prev);
                  setImageFiles((s) => ({ ...s, [activeLocale]: file }));
                  setImagePreviews((s) => ({
                    ...s,
                    [activeLocale]: file ? URL.createObjectURL(file) : null,
                  }));
                }}
              />
            </label>

            {imagePreviews[activeLocale] && (
              <div className="relative mt-3 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreviews[activeLocale]!}
                  alt="Preview"
                  className="h-[50%] w-[50%] object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(imagePreviews[activeLocale]!);
                    setImageFiles((s) => ({ ...s, [activeLocale]: null }));
                    setImagePreviews((s) => ({ ...s, [activeLocale]: null }));
                  }}
                  className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-black/50 text-white text-xs hover:bg-black/70 transition"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Image title + alt text — shown when an image is selected for this locale */}
          {imageFiles[activeLocale] && (
            <>
              <div>
                <label
                  htmlFor={`imageTitle-${activeLocale}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Image title
                </label>
                <input
                  key={`imageTitle-${activeLocale}`}
                  id={`imageTitle-${activeLocale}`}
                  value={imageTitles[activeLocale]}
                  onChange={(e) =>
                    setImageTitles((s) => ({ ...s, [activeLocale]: e.target.value }))
                  }
                  placeholder={activeLocaleConfig.imageTitlePlaceholder}
                  className={inputStyles}
                />
              </div>
              <div>
                <label
                  htmlFor={`imageAlt-${activeLocale}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alt text
                </label>
                <input
                  key={`imageAlt-${activeLocale}`}
                  id={`imageAlt-${activeLocale}`}
                  value={imageAlts[activeLocale]}
                  onChange={(e) =>
                    setImageAlts((s) => ({ ...s, [activeLocale]: e.target.value }))
                  }
                  placeholder={activeLocaleConfig.altPlaceholder}
                  className={inputStyles}
                />
              </div>
            </>
          )}

          {isUploading && (
            <p className="text-xs text-gray-400">Uploading image…</p>
          )}

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 pointer bg-[#c94f7c] hover:bg-pink-900 text-white! font-bold rounded-3xl transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentfulForm;
