"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { CATEGORIES } from "@/types";
import type { RankedTool, Tool } from "@/types";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? undefined;

  const [rankedTools, setRankedTools] = useState<RankedTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!query) return;
    setIsLoading(true);
    setError(null);

    let environments: string[] = [];
    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        const profile = JSON.parse(stored) as { environments?: string[] };
        environments = profile.environments ?? [];
      }
    } catch {}

    // Claudeが生成したランキング情報のみキャッシュ（ツールデータは含めない）
    type CachedRanking = { toolId: string; rank: number; reasoning: string; compatibilityNote?: string; matchScore: number };
    const rankingKey = `ranking:${query}:${category ?? ""}:${[...environments].sort().join(",")}`;

    try {
      const cachedRanking = sessionStorage.getItem(rankingKey);
      if (cachedRanking) {
        // ランキングキャッシュあり → DBから最新ツールデータを取得してマージ（トークン消費なし）
        const rankings = JSON.parse(cachedRanking) as CachedRanking[];
        const toolsRes = await fetch("/api/tools", { cache: "no-store" });
        const { tools } = await toolsRes.json() as { tools: Tool[] };
        const merged: RankedTool[] = rankings.flatMap((r) => {
          const tool = tools.find((t) => t.id === r.toolId);
          if (!tool) return [];
          return [{ rank: r.rank, tool, reasoning: r.reasoning, compatibilityNote: r.compatibilityNote, matchScore: r.matchScore }];
        });
        // マージ結果が空（キャッシュのIDが現在のDBのIDと不一致）はキャッシュ破棄して再検索
        if (merged.length === 0) {
          sessionStorage.removeItem(rankingKey);
        } else {
          setRankedTools(merged);
          setIsLoading(false);
          return;
        }
      }
    } catch {}

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category, environments }),
      });
      if (!res.ok) throw new Error("検索に失敗しました");
      const data = await res.json() as { rankedTools: RankedTool[] };
      setRankedTools(data.rankedTools);
      // Claudeのランキング情報のみ保存（ツールデータは保存しない）
      try {
        const rankings: CachedRanking[] = data.rankedTools.map((r) => ({
          toolId: r.tool.id,
          rank: r.rank,
          reasoning: r.reasoning,
          compatibilityNote: r.compatibilityNote,
          matchScore: r.matchScore,
        }));
        sessionStorage.setItem(rankingKey, JSON.stringify(rankings));
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [query, category]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2"
            >
              ← 検索に戻る
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
              「<span className="text-indigo-600">{query}</span>」への提案
            </h2>
            {!isLoading && rankedTools.length > 0 && (() => {
              const latest = rankedTools.reduce((d, r) => {
                const t = new Date(r.tool.lastUpdated);
                return t > d ? t : d;
              }, new Date(0));
              const formatted = `${latest.getFullYear()}/${String(latest.getMonth() + 1).padStart(2, "0")}/${String(latest.getDate()).padStart(2, "0")}`;
              return (
                <p className="text-sm text-gray-400 mt-1">
                  {rankedTools.length}件のツールをランキング形式で提案
                  <span className="ml-2 text-xs">データ最終更新: {formatted}</span>
                </p>
              );
            })()}
          </div>
        </div>
        {!isLoading && rankedTools.length > 0 && (() => {
          const categorySummary = CATEGORIES.find((c) => c.id === category)?.summary;
          return categorySummary ? (
            <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 leading-relaxed">
              {categorySummary}
            </p>
          ) : null;
        })()}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500">AIが最適なツールを分析中...</p>
          <p className="text-xs text-gray-400">ツールの特性・コスト・相性を総合判断しています</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchResults}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            再試行する
          </button>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            <strong>APIキーが未設定の場合：</strong> <code>.env.local</code> の <code>ANTHROPIC_API_KEY</code> を設定してください
          </p>
        </div>
      )}

      {!isLoading && !error && rankedTools.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">該当するツールが見つかりませんでした</p>
          <p className="text-sm mt-2">別のキーワードで検索してみてください</p>
        </div>
      )}

      {!isLoading && rankedTools.length > 0 && (
        <div className="space-y-5">
          {rankedTools.map((r) => (
            <ToolCard key={r.tool.id} ranked={r} />
          ))}
        </div>
      )}

      {!isLoading && rankedTools.length > 0 && (
        <div className="space-y-4 pt-2">
          {/* 免責事項 */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            ※ 提案内容はAIによるものであり、誤りが含まれる場合があります。価格・仕様は変更になることがあります。
            最終的には各ツールの<span className="font-medium">公式サイト</span>にてご確認ください。
          </p>
          {/* 相談CTA */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-3">
            <p className="text-base font-semibold text-indigo-900">AI導入の進め方、どこから始めればいいか迷っていませんか？</p>
            <p className="text-sm text-indigo-700">ツール選定・社内展開・費用感など、ご相談ください。</p>
            <a
              href="/contact"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              AI導入について相談する（初回無料）→
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500">読み込み中...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
