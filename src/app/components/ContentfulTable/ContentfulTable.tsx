"use client";

import React, { useMemo, useState } from "react";
import Markdown from "react-markdown";

type Entry = {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    description: string;
  };
};

export type ContentfulDataProps = {
  data: {
    publishedData: {
      items: Entry[];
    };
    previewData: {
      items: Entry[];
    };
  };
};

const ContentfulTable: React.FC<ContentfulDataProps> = ({ data }) => {
  const { publishedData, previewData } = data;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const publishedIds = new Set(
      publishedData.items.map((item) => item.sys.id),
    );

    return previewData.items.map((item) => ({
      id: item.sys.id,
      title: item.fields.title,
      description: item.fields.description,
      status: publishedIds.has(item.sys.id) ? "Published" : "Draft",
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
    }));
  }, [publishedData, previewData]);

  const selectedItem = rows.find((row) => row.id === selectedId);

  const formatDate = (date: string) => new Date(date).toLocaleString();

  const statusBadge = (status: string) =>
    status === "Published"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden min-h-[500px]">
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedItem ? "Entry Details" : "Content Entries"}
          </h1>
        </div>

        <div className="p-8">
          {/* =============================
              DETAIL VIEW
          ============================= */}
          {selectedItem ? (
            <div>
              <button
                onClick={() => setSelectedId(null)}
                className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
              >
                ← Back to table
              </button>

              <div className="flex items-center justify-between mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge(
                    selectedItem.status,
                  )}`}
                >
                  {selectedItem.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500 mb-8">
                <div>
                  <p className="uppercase tracking-wide text-xs text-gray-400">
                    Created
                  </p>
                  <p className="mt-1 text-gray-700">
                    {formatDate(selectedItem.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-wide text-xs text-gray-400">
                    Last Updated
                  </p>
                  <p className="mt-1 text-gray-700">
                    {formatDate(selectedItem.updatedAt)}
                  </p>
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900">
                {selectedItem.title}
              </h2>

              <Markdown>{selectedItem.description}</Markdown>
            </div>
          ) : (
            /* =============================
                TABLE VIEW
            ============================= */
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className="cursor-pointer hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-5 font-medium text-gray-900">
                        {row.title}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                            row.status,
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-500">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-gray-500">
                        {formatDate(row.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentfulTable;
