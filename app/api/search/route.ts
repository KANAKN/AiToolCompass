import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/types";
import { buildRankingPrompt, parseRankedTools } from "@/lib/searchHelper";
import type { RankedTool } from "@/types";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { query, category, environments } = await req.json() as {
    query: string;
    category?: string;
    environments?: string[];
  };

  if (!query?.trim()) {
    return NextResponse.json({ error: "クエリが必要です" }, { status: 400 });
  }

  // 定番カテゴリ → 環境設定の有無に関わらずキャッシュを返す（環境別表示はクライアント側で処理）
  const isPredefinedCategory = category && CATEGORIES.some((c) => c.id === category);
  const hasEnvFilter = environments && environments.length > 0;

  if (isPredefinedCategory) {
    const cached = await prisma.categoryCache.findUnique({
      where: { categoryId: category },
    });
    if (cached) {
      const rankedTools = JSON.parse(cached.rankedTools) as RankedTool[];
      return NextResponse.json({ rankedTools, query, fromCache: true });
    }
    // キャッシュ未生成の場合はフォールスルーしてClaudeで生成 & 保存
  }

  const allTools = await prisma.tool.findMany({ orderBy: { name: "asc" } });
  if (allTools.length === 0) {
    return NextResponse.json({ error: "ツールデータがありません" }, { status: 500 });
  }

  try {
    const prompt = buildRankingPrompt(query, allTools, category, environments);
    const stream = await client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    const response = await stream.finalMessage();
    const rankedTools = parseRankedTools(response, allTools);

    // 定番カテゴリの場合はキャッシュに保存
    if (isPredefinedCategory) {
      await prisma.categoryCache.upsert({
        where: { categoryId: category! },
        update: { query, rankedTools: JSON.stringify(rankedTools) },
        create: { categoryId: category!, query, rankedTools: JSON.stringify(rankedTools) },
      });
    }

    return NextResponse.json({ rankedTools, query, fromCache: false });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "検索中にエラーが発生しました。しばらくしてから再試行してください。" },
      { status: 500 }
    );
  }
}
