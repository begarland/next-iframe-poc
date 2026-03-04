"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";

const AUTO_REFRESH_INTERVAL_MS = 30_000;
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import { ContentfulDataProps } from "./types";
import { useProduct } from "@/app/contexts/ProductContext";

const ContentfulTable: React.FC<ContentfulDataProps> = ({ data }) => {
  const { productId } = useProduct();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition(() => {
        router.refresh();
      });
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [router]);

  const { previewData } = data;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const publishedIds = new Set(previewData.items.map((item) => item.sys.id));

    return previewData.items.map((item) => ({
      id: item.sys.id,
      title: item.fields.title,
      description: item.fields.description,
      productId: item.fields.productId,
      status: publishedIds.has(item.sys.id) ? "Published" : "Draft",
      createdAt: item.sys.createdAt,
      updatedAt: item.sys.updatedAt,
    }));
  }, [previewData]);

  const selectedItem = rows.find((row) => row.id === selectedId);

  const formatDate = (date: string) => new Date(date).toLocaleString();

  const statusBadge = (status: string) =>
    status === "Published"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="px-8 py-12">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden min-h-125">
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedItem ? "Entry Details" : "Content Entries"}
          </h1>
          <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Changes may take up to 5 mins to appear</span>
          <div className="relative group">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            aria-label={isPending ? "Refreshing data" : "Refresh data"}
            className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-5 w-5 ${isPending ? "animate-spin" : ""}`}
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-md border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              Refresh Content
            </span>
          </div>
          </div>
        </div>
        {selectedItem ? (
          <button
            onClick={() => setSelectedId(null)}
            className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
          >
            ← Back to table
          </button>
        ) : null}

        <div className="p-8">
          {/* =============================
              DETAIL VIEW
          ============================= */}
          {selectedItem ? (
            <div>
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
                  {rows
                    .filter((row) => row.productId === `${productId}`)
                    .map((row) => (
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
