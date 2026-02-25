import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/types";
import { buildRankingPrompt, parseRankedTools } from "@/lib/searchHelper";

const client = new Anthropic();

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allTools = await prisma.tool.findMany();
  let updatedCount = 0;
  const errors: string[] = [];

  // 1. ツールの料金情報を更新
  for (const tool of allTools) {
    try {
      const prompt = `以下のAIツールの最新の料金情報を調べて、JSON形式で返してください。
情報が変わっていない場合や不確かな場合は現在の値をそのまま返してください。

ツール名: ${tool.name}（${tool.company}）
現在の情報:
- 月額料金: ${tool.monthlyPriceLabel}
- 導入費用: ${tool.setupCost}
- エンタープライズ: ${tool.enterpriseNote ?? "なし"}

以下のJSON形式のみで返してください:
{
  "monthlyPriceLabel": "最新の月額料金表示",
  "setupCost": "最新の導入費用",
  "enterpriseNote": "エンタープライズ情報または null",
  "freePlanAvailable": true か false,
  "freePlanDescription": "無料プランの説明または null"
}`;

      const response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") continue;

      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const updated = JSON.parse(jsonMatch[0]) as {
        monthlyPriceLabel?: string;
        setupCost?: string;
        enterpriseNote?: string | null;
        freePlanAvailable?: boolean;
        freePlanDescription?: string | null;
      };

      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          ...(updated.monthlyPriceLabel && { monthlyPriceLabel: updated.monthlyPriceLabel }),
          ...(updated.setupCost && { setupCost: updated.setupCost }),
          enterpriseNote: updated.enterpriseNote ?? tool.enterpriseNote,
          ...(updated.freePlanAvailable !== undefined && { freePlanAvailable: updated.freePlanAvailable }),
          freePlanDescription: updated.freePlanDescription ?? tool.freePlanDescription,
          lastUpdated: new Date(),
        },
      });
      updatedCount++;
    } catch (e) {
      errors.push(`${tool.name}: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  // 2. 定番カテゴリのキャッシュを再生成
  const latestTools = await prisma.tool.findMany();
  for (const cat of CATEGORIES) {
    try {
      const prompt = buildRankingPrompt(cat.label, latestTools, cat.id);
      const stream = await client.messages.stream({
        model: "claude-opus-4-6",
        max_tokens: 2048,
        thinking: { type: "adaptive" },
        messages: [{ role: "user", content: prompt }],
      });
      const response = await stream.finalMessage();
      const rankedTools = parseRankedTools(response, latestTools);

      await prisma.categoryCache.upsert({
        where: { categoryId: cat.id },
        update: { query: cat.label, rankedTools: JSON.stringify(rankedTools) },
        create: { categoryId: cat.id, query: cat.label, rankedTools: JSON.stringify(rankedTools) },
      });
    } catch (e) {
      errors.push(`キャッシュ[${cat.id}]: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  await prisma.updateLog.create({
    data: {
      status: errors.length === 0 ? "success" : "partial",
      toolsUpdated: updatedCount,
      details: errors.length > 0 ? errors.join("; ") : null,
    },
  });

  return NextResponse.json({
    success: true,
    toolsUpdated: updatedCount,
    categoriesCached: CATEGORIES.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
