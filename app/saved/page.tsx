"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSavedSearches, deleteSavedSearch, hasProfile } from "@/lib/savedSearches";
import { ToolCard } from "@/components/ToolCard";
import type { SavedSearch } from "@/types/saved";

export default function SavedPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [profileExists, setProfileExists] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setProfileExists(hasProfile());
    setSearches(getSavedSearches());
  }, []);

  const handleDelete = (id: string) => {
    deleteSavedSearch(id);
    setSearches(getSavedSearches());
    if (expandedId === id) setExpandedId(null);
  };

  if (!profileExists) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-4">
        <p className="text-5xl">🔒</p>
        <h2 className="text-2xl font-bold text-gray-900">自社環境の設定が必要です</h2>
        <p className="text-gray-500">
          検索結果の保存機能は、自社環境を設定した方のみご利用いただけます
        </p>
        <a
          href="/profile"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          自社環境を設定する
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">🔖 保存した検索結果</h1>
        <p className="text-sm text-gray-400 mt-1">{searches.length}件保存済み</p>
      </div>

      {searches.length === 0 && (
        <div className="text-center py-20 space-y-3 text-gray-400">
          <p className="text-5xl">📭</p>
          <p className="text-lg">保存した結果はまだありません</p>
          <p className="text-sm">検索結果ページの「この結果を保存」から保存できます</p>
          <a
            href="/"
            className="inline-block mt-2 text-indigo-600 hover:text-indigo-800 underline underline-offset-2 text-sm"
          >
            検索ページへ
          </a>
        </div>
      )}

      <div className="space-y-4">
        {searches.map((search) => {
          const isExpanded = expandedId === search.id;
          const savedDate = new Date(search.savedAt).toLocaleDateString("ja-JP", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          });

          return (
            <div key={search.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* サマリー行 */}
              <div className="flex items-center justify-between px-5 py-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : search.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">{isExpanded ? "▼" : "▶"}</span>
                  <div>
                    <p className="font-semibold text-gray-900">「{search.query}」</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {savedDate} ・ {search.rankedTools.length}件提案
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={`/results?q=${encodeURIComponent(search.query)}${search.category ? `&category=${search.category}` : ""}`}
                    className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-2 py-1"
                  >
                    再検索
                  </a>
                  <button
                    onClick={() => handleDelete(search.id)}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-lg px-2 py-1 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>

              {/* ランキング（折りたたみ） */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-5 space-y-5 bg-gray-50">
                  {search.rankedTools.map((r) => (
                    <ToolCard key={r.tool.id} ranked={r} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
