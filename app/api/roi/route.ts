import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RoiResult } from "@/types";

export async function POST(req: NextRequest) {
  const { toolId, teamSize, monthlyHours, hourlyRate, maintenancePreference, estimatedUsers, userEnvironments } = await req.json() as {
    toolId: string;
    teamSize: number;
    monthlyHours: number;
    hourlyRate: number;
    maintenancePreference?: "inhouse" | "outsource";
    estimatedUsers?: number;
    userEnvironments?: string[];
  };

  if (!toolId || !teamSize || !monthlyHours || !hourlyRate) {
    return NextResponse.json({ error: "必要なパラメータが不足しています" }, { status: 400 });
  }

  const tool = await prisma.tool.findUnique({ where: { id: toolId } });
  if (!tool) {
    return NextResponse.json({ error: "ツールが見つかりません" }, { status: 404 });
  }

  const envs = userEnvironments ?? [];
  const effectiveEstimatedUsers = estimatedUsers ?? 0;

  // 現在のコスト
  const currentMonthlyCost = teamSize * monthlyHours * hourlyRate;

  // 既存プランに含まれるか（例：Google WorkspaceでGeminiが無料）
  const isSystemCostFree = !!(tool.isIncludedInEnv && envs.includes(tool.isIncludedInEnv));

  // ツールシステム使用料（管理チーム分）
  let toolSystemCost = 0;
  if (!isSystemCostFree) {
    if (tool.monthlyPricePerUser) {
      toolSystemCost = tool.monthlyPricePerUser * teamSize;
    } else if (tool.monthlyPriceFlat) {
      toolSystemCost = tool.monthlyPriceFlat;
    }
  }

  // エンドユーザーライセンス費用
  const pricePerUser = tool.monthlyPricePerUser ?? null;
  let endUserCost = 0;
  if (!isSystemCostFree && tool.endUserRequiresLicense && effectiveEstimatedUsers > 0 && pricePerUser) {
    endUserCost = effectiveEstimatedUsers * pricePerUser;
  }

  // 両メンテナンスコストを計算（常に返す）
  const inhouseMaintenanceCost = tool.selfMaintenanceHoursPerMonth != null
    ? Math.round(tool.selfMaintenanceHoursPerMonth * hourlyRate)
    : null;
  const outsourceMaintenanceCost = tool.fullMaintenanceCostPerMonth ?? null;

  // 自社環境設定を参照した適用コスト
  let maintenanceCost = 0;
  if (maintenancePreference === "inhouse" && inhouseMaintenanceCost != null) {
    maintenanceCost = inhouseMaintenanceCost;
  } else if (maintenancePreference === "outsource" && outsourceMaintenanceCost != null) {
    maintenanceCost = outsourceMaintenanceCost;
  }

  // 担当者の稼働コスト（削減後）= 現在のコスト × (100% - 時間削減%)
  const timeReductionPct = tool.timeReductionPct ?? 0;
  const staffCostAfterReduction = Math.round(currentMonthlyCost * (100 - timeReductionPct) / 100);

  // 導入後コスト合計（削減後稼働コスト + ツール費用）
  const toolMonthlyCost = staffCostAfterReduction + toolSystemCost + endUserCost + maintenanceCost;
  const netMonthlySavings = currentMonthlyCost - toolMonthlyCost;
  const annualSavings = netMonthlySavings * 12;

  // 初期費用から回収期間を算出
  let paybackMonths: number | null = null;
  if (netMonthlySavings > 0 && tool.setupCost && tool.setupCost !== "無料" && tool.setupCost !== "要問合せ") {
    const setupMatch = tool.setupCost.match(/[\d,]+/);
    if (setupMatch) {
      const setupCostNum = parseInt(setupMatch[0].replace(/,/g, ""), 10);
      paybackMonths = Math.ceil(setupCostNum / netMonthlySavings);
    }
  }

  const result: RoiResult = {
    currentMonthlyCost,
    toolSystemCost,
    inhouseMaintenanceCost,
    outsourceMaintenanceCost,
    maintenanceCost,
    toolMonthlyCost,
    netMonthlySavings: Math.round(netMonthlySavings),
    annualSavings: Math.round(annualSavings),
    paybackMonths,
    isSystemCostFree,
    endUserCost,
    estimatedUsers: effectiveEstimatedUsers,
    pricePerUser,
    relatedBaseEnv: tool.relatedBaseEnv ?? null,
    staffCostAfterReduction,
    timeReductionPct: tool.timeReductionPct ?? null,
  };

  return NextResponse.json(result);
}
