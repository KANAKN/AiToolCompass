"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/types";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    router.push(`/results?q=${encodeURIComponent(q.trim())}`);
  };

  const handleCategorySelect = (categoryId: string, label: string) => {
    setIsLoading(true);
    router.push(`/results?category=${categoryId}&q=${encodeURIComponent(label)}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-10">
      {/* Hero */}
      <div className="text-center space-y-3 max-w-2xl">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
          どんな業務を<span className="text-indigo-600">AI化</span>したいですか？
        </h1>
        <p className="text-base sm:text-lg text-gray-500">
          自動化したい業務を入力するか、カテゴリから選ぶと<br className="hidden sm:block" />
          最適なAIツールをランキング形式で提案します
        </p>
      </div>

      {/* テキスト入力 */}
      <div className="w-full max-w-2xl">
        <div className="flex gap-2 bg-white border-2 border-indigo-200 rounded-2xl p-2 shadow-sm focus-within:border-indigo-500 transition-colors">
          <span className="text-2xl self-center pl-2">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSearch(query)}
            placeholder="例：メールの返信を自動化したい、社内FAQボットを作りたい..."
            className="flex-1 outline-none text-base bg-transparent placeholder-gray-400 py-2"
          />
          <button
            onClick={() => handleSearch(query)}
            disabled={!query.trim() || isLoading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "検索中..." : "提案を見る"}
          </button>
        </div>
      </div>

      {/* カテゴリ選択 */}
      <div className="w-full max-w-2xl">
        <p className="text-sm text-gray-400 text-center mb-4">または、よくある用途から選ぶ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id, cat.label)}
              disabled={isLoading}
              className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="font-medium text-gray-900 group-hover:text-indigo-700 text-sm">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 免責事項 */}
      <p className="text-xs text-gray-400 text-center max-w-xl leading-relaxed">
        ※ 提案内容はAIによるものであり、誤りが含まれる場合があります。価格・仕様は変更になることがあります。
        最終的には各ツールの<span className="font-medium">公式サイト</span>にてご確認ください。
      </p>

      {/* 自社環境設定CTA */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-4 text-center max-w-xl">
        <p className="text-sm text-indigo-700">
          <span className="font-semibold">🏢 自社環境を登録</span>すると、
          Google Workspace・Microsoft 365などとの相性を加味したより精度の高い提案が受けられます
        </p>
        <a
          href="/profile"
          className="inline-block mt-2 text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
        >
          環境を設定する →
        </a>
      </div>
    </div>
  );
}
