import type { Tool } from "@prisma/client";
import type { RankedTool } from "@/types";
import type { Message } from "@anthropic-ai/sdk/resources/messages";

export function buildRankingPrompt(
  query: string,
  allTools: Tool[],
  category?: string,
  environments?: string[]
): string {
  const envContext =
    environments && environments.length > 0
      ? `\nユーザーの現在の環境: ${environments.join(", ")}`
      : "";

  const toolsSummary = allTools.map((t) => ({
    id: t.id,
    name: t.name,
    company: t.company,
    categories: JSON.parse(t.categories),
    automationTags: JSON.parse(t.automationTags),
    compatibleEnvs: JSON.parse(t.compatibleEnvs),
    description: t.description,
    monthlyPriceLabel: t.monthlyPriceLabel,
    difficultyScore: t.difficultyScore,
    costReductionPct: t.costReductionPct,
    timeReductionPct: t.timeReductionPct,
  }));

  return `あなたはAI業務効率化ツールの専門アドバイザーです。
ユーザーのニーズに最も合ったツールをランキング形式で提案してください。

ユーザーのニーズ: "${query}"${envContext}

利用可能なツール一覧:
${JSON.stringify(toolsSummary, null, 2)}

以下のJSON形式で、上位5件のツールを返してください（該当するものが5件未満の場合はその数で）:
{
  "ranked": [
    {
      "toolId": "ツールのid",
      "rank": 1,
      "reasoning": "このツールを推薦する理由（2〜3文、具体的に）",
      "compatibilityNote": "ユーザーの環境との相性コメント（環境情報がある場合のみ、なければ空文字）",
      "matchScore": 95
    }
  ]
}

matchScoreは0〜100で、ユーザーニーズへの適合度を表します。
reasoningは経営者・管理職が読むことを想定し、コスト・効果・導入しやすさの観点を含めてください。
環境との相性が良い場合は加点、悪い場合は減点・注意点を書いてください。
JSONのみ返し、説明文は不要です。`;
}

export function parseRankedTools(response: Message, allTools: Tool[]): RankedTool[] {
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  const parsed = JSON.parse(jsonMatch[0]) as {
    ranked: Array<{
      toolId: string;
      rank: number;
      reasoning: string;
      compatibilityNote: string;
      matchScore: number;
    }>;
  };

  return parsed.ranked
    .flatMap((r): RankedTool[] => {
      const tool = allTools.find((t) => t.id === r.toolId);
      if (!tool) return [];
      return [{
        rank: r.rank,
        tool,
        reasoning: r.reasoning,
        compatibilityNote: r.compatibilityNote || undefined,
        matchScore: r.matchScore,
      }];
    })
    .sort((a, b) => a.rank - b.rank);
}
