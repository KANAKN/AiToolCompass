"use client";

import { useState, useEffect } from "react";
import { saveSearch, isAlreadySaved, hasProfile } from "@/lib/savedSearches";
import type { RankedTool } from "@/types";

interface SaveButtonProps {
  query: string;
  rankedTools: RankedTool[];
  category?: string;
}

export function SaveButton({ query, rankedTools, category }: SaveButtonProps) {
  const [profileExists, setProfileExists] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    setProfileExists(hasProfile());
    setSaved(isAlreadySaved(query, rankedTools));
  }, [query, rankedTools]);

  const handleSave = () => {
    if (!profileExists) {
      setShowPrompt(true);
      return;
    }
    saveSearch(query, rankedTools, category);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
          ✅ 保存済み
        </span>
        <a href="/saved" className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
          保存一覧を見る
        </a>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg px-3 py-1.5 transition-all"
      >
        🔖 この結果を保存
      </button>

      {showPrompt && (
        <div className="absolute right-0 top-10 z-10 bg-white border border-indigo-200 rounded-xl shadow-lg p-4 w-64 text-sm">
          <p className="text-gray-700 mb-3">
            保存機能は<span className="font-semibold text-indigo-600">自社環境を設定した方</span>のみ利用できます
          </p>
          <div className="flex gap-2">
            <a
              href="/profile"
              className="flex-1 text-center bg-indigo-600 text-white rounded-lg py-1.5 font-medium hover:bg-indigo-700 transition-colors"
            >
              環境を設定する
            </a>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
