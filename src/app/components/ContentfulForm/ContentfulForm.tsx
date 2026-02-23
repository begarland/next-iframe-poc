"use client";

import { uploadEntryToContentful } from "@/app/fetches/uploadEntryToContentful";
import { ChangeEvent, FormEvent, useState } from "react";
import UploadToContentfulButton from "../UploadToContentfulButton";

type LocalizedField = {
  "en-US": string;
  "fr-CA": string;
};

type FormData = {
  title: LocalizedField;
  description: LocalizedField;
};

const ContentfulForm: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    title: { "en-US": "", "fr-CA": "" },
    description: { "en-US": "", "fr-CA": "" },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, dataset } = e.target;
    const locale = dataset.locale as "en-US" | "fr-CA";

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

    uploadEntryToContentful(form);

    // here, submit the call to contentful

    setForm({
      title: { "en-US": "", "fr-CA": "" },
      description: { "en-US": "", "fr-CA": "" },
    });
  };

  const inputStyles =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Content Entry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Provide localized content for English and French.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Titles Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Titles</h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* English */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                    🇺🇸 English
                  </span>
                </div>
                <input
                  id="title-en-US"
                  name="title"
                  data-locale="en-US"
                  value={form.title["en-US"]}
                  onChange={handleChange}
                  placeholder="Enter English title"
                  required
                  className={inputStyles}
                />
              </div>

              {/* French */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                    🇨🇦 Français
                  </span>
                </div>
                <input
                  id="title-fr-CA"
                  name="title"
                  data-locale="fr-CA"
                  value={form.title["fr-CA"]}
                  onChange={handleChange}
                  placeholder="Entrez le titre français"
                  required
                  className={inputStyles}
                />
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Descriptions
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {/* English */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                    🇺🇸 English
                  </span>
                </div>
                <textarea
                  id="description-en-US"
                  name="description"
                  data-locale="en-US"
                  value={form.description["en-US"]}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter English description"
                  required
                  className={inputStyles}
                />
              </div>

              {/* French */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                    🇨🇦 Français
                  </span>
                </div>
                <textarea
                  id="description-fr-CA"
                  name="description"
                  data-locale="fr-CA"
                  value={form.description["fr-CA"]}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Entrez la description française"
                  required
                  className={inputStyles}
                />
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            {/* <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition active:scale-[0.98]"
            >
              Save Entry
            </button> */}

            <UploadToContentfulButton form={form} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentfulForm;
