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

type FinalFormData = FormData & { productId: LocalizedField };

type Locale = "en-US" | "fr-CA" ;

const LOCALES: { id: Locale; label: string; flag: string; titlePlaceholder: string; descriptionPlaceholder: string }[] = [
  { id: "en-US", label: "English", flag: "🇺🇸", titlePlaceholder: "Enter English title", descriptionPlaceholder: "Enter English description" },
  { id: "fr-CA", label: "Français", flag: "🇨🇦", titlePlaceholder: "Entrez le titre français", descriptionPlaceholder: "Entrez la description française" },
];

const ContentfulForm: React.FC = () => {
  const { productId } = useProduct();
  const [activeLocale, setActiveLocale] = useState<Locale>("en-US");

  const [form, setForm] = useState<FinalFormData>({
    title: { "en-US": "", "fr-CA": "" },
    description: { "en-US": "", "fr-CA": "" },
    productId: { "en-US": productId as string, "fr-CA": productId as string, },
  });

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form);

    // item - this is the id of the component I am allowing edit access to
    uploadEntryToContentful(form, "item")();

    // here, submit the call to contentful

    setForm({
      title: { "en-US": "", "fr-CA": "" },
      description: { "en-US": "", "fr-CA": "" },
      productId: { "en-US": productId as string, "fr-CA": productId as string,  },
    });
  };

  const inputStyles =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

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
              placeholder={LOCALES.find((l) => l.id === activeLocale)?.titlePlaceholder}
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
              placeholder={LOCALES.find((l) => l.id === activeLocale)?.descriptionPlaceholder}
              required
              className={inputStyles}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 pointer bg-[#c94f7c] hover:bg-pink-900 text-white! font-bold rounded-3xl transition active:scale-[0.98]"
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
