"use client";

import { useEffect, useState } from "react";
import type { RankedTool, UserProfile } from "@/types";
import { StarRating } from "./StarRating";
import { RoiSimulator } from "./RoiSimulator";

const RANK_BADGE: Record<number, { emoji: string; bg: string; text: string }> = {
  1: { emoji: "🥇", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700" },
  2: { emoji: "🥈", bg: "bg-gray-50 border-gray-200", text: "text-gray-600" },
  3: { emoji: "🥉", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
};

interface ToolCardProps {
  ranked: RankedTool;
}

export function ToolCard({ ranked }: ToolCardProps) {
  const { rank, tool, reasoning, compatibilityNote, matchScore } = ranked;
  const badge = RANK_BADGE[rank] ?? { emoji: `${rank}位`, bg: "bg-white border-gray-200", text: "text-gray-500" };
  const features: string[] = JSON.parse(tool.features);

  const [setupPref, setSetupPref] = useState<UserProfile["setupPreference"]>(undefined);
  const [maintenancePref, setMaintenancePref] = useState<UserProfile["maintenancePreference"]>(undefined);
  const [userEnvs, setUserEnvs] = useState<string[]>([]);

  const ENV_LABELS: Record<string, string> = {
    google: "Google Workspace",
    microsoft: "Microsoft 365",
    slack: "Slack",
    notion: "Notion",
    salesforce: "Salesforce",
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile;
        setSetupPref(profile.setupPreference);
        setMaintenancePref(profile.maintenancePreference);
        setUserEnvs(profile.environments ?? []);
      }
    } catch {}
  }, []);

  const isSystemCostFree = !!(tool.isIncludedInEnv && userEnvs.includes(tool.isIncludedInEnv));
  const relatedEnvLabel = tool.relatedBaseEnv && userEnvs.includes(tool.relatedBaseEnv)
    ? ENV_LABELS[tool.relatedBaseEnv] ?? tool.relatedBaseEnv
    : null;

  return (
    <div className={`border-2 rounded-2xl p-4 sm:p-6 bg-white ${badge.bg} shadow-sm`}>
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{badge.emoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tool.logoEmoji}</span>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{tool.name}</h3>
                <p className="text-sm text-gray-400">{tool.company}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text} border`}>
            適合度 {matchScore}%
          </div>
          {tool.websiteUrl && (
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
            >
              公式サイトを見る →
            </a>
          )}
        </div>
      </div>

      {/* ツール概要 */}
      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

      {/* AIの推薦理由 */}
      <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-3">
        <p className="text-xs text-indigo-500 font-medium mb-1">🤖 AI推薦理由</p>
        <p className="text-sm text-indigo-900">{reasoning}</p>
        {compatibilityNote && (
          <p className="text-xs text-indigo-600 mt-1 pt-1 border-t border-indigo-100">
            🏢 {compatibilityNote}
          </p>
        )}
      </div>

      {/* 効果の目安 */}
      <div className="bg-green-50 rounded-xl px-4 py-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-600 font-medium mb-1">📊 効果の目安</p>
            <p className="text-xs text-green-800">{tool.effectDescription}</p>
            {tool.effectBaseline && (
              <p className="text-xs text-green-600 mt-1 pt-1 border-t border-green-100">
                ※ {tool.effectBaseline}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            {tool.timeReductionPct && (
              <div className="bg-white rounded-lg px-3 py-2 text-center border border-green-100 min-w-[72px]">
                <p className="text-lg font-bold text-green-600">{tool.timeReductionPct}%</p>
                <p className="text-xs text-gray-500 leading-tight">時間削減<br/>目安</p>
              </div>
            )}
            {tool.costReductionPct && (
              <div className="bg-white rounded-lg px-3 py-2 text-center border border-blue-100 min-w-[72px]">
                <p className="text-lg font-bold text-blue-600">{tool.costReductionPct}%</p>
                <p className="text-xs text-gray-500 leading-tight">コスト削減<br/>目安</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 導入・運用 */}
      <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">導入・運用</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <StarRating score={tool.difficultyScore} label="導入難易度" />
          <StarRating score={tool.maintenanceScore} label="運用負荷" />
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">必要スキル</p>
          <p className="text-xs text-gray-700">{tool.requiredSkills}</p>
        </div>
      </div>

      {/* コスト情報 */}
      <div className="mb-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">コスト</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* 導入費用 */}
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-1">導入費用</p>
              <div>
                <p className="text-xs text-gray-400">システム使用料</p>
                <p className="text-sm font-medium text-gray-800">{tool.setupCost}</p>
              </div>
              {(tool.selfSetupNote || tool.fullDelegationNote) && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">初期設定費用</p>
                  {tool.selfSetupNote && (
                    <div className={`rounded-lg px-2.5 py-1.5 border ${
                      setupPref === "inhouse" ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200"
                    }`}>
                      <p className={`text-xs font-medium mb-0.5 ${setupPref === "inhouse" ? "text-indigo-600" : "text-gray-400"}`}>
                        {setupPref === "inhouse" && "★ "}自分で設定する場合
                      </p>
                      <p className={`text-xs ${setupPref === "inhouse" ? "text-indigo-900 font-medium" : "text-gray-600"}`}>
                        {tool.selfSetupNote}
                      </p>
                    </div>
                  )}
                  {tool.fullDelegationNote && (
                    <div className={`rounded-lg px-2.5 py-1.5 border ${
                      setupPref === "outsource" ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200"
                    }`}>
                      <p className={`text-xs font-medium mb-0.5 ${setupPref === "outsource" ? "text-indigo-600" : "text-gray-400"}`}>
                        {setupPref === "outsource" && "★ "}外部委託の場合
                      </p>
                      <p className={`text-xs ${setupPref === "outsource" ? "text-indigo-900 font-medium" : "text-gray-600"}`}>
                        {tool.fullDelegationNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 月額費用 */}
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-1">月額費用</p>
              <div>
                <p className="text-xs text-gray-400">システム使用料</p>
                {isSystemCostFree ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-block text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">既存プランに含まれる</span>
                    <p className="text-xs text-gray-400 line-through">{tool.monthlyPriceLabel}</p>
                  </div>
                ) : (
                  <div>
                    {relatedEnvLabel && (
                      <p className="text-xs text-indigo-500 mb-0.5">既存{relatedEnvLabel}への追加費用</p>
                    )}
                    <p className="text-sm font-medium text-gray-800">{tool.monthlyPriceLabel}</p>
                  </div>
                )}
              </div>
              {(tool.adminUserNote || tool.endUserNote) && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">ユーザー別費用</p>
                  {tool.adminUserNote && (
                    <div className="rounded-lg px-2.5 py-1.5 bg-amber-50 border border-amber-200">
                      <p className="text-xs font-medium text-amber-700 mb-0.5">🔧 管理・設定担当者</p>
                      <p className="text-xs text-amber-900">{tool.adminUserNote}</p>
                    </div>
                  )}
                  {tool.endUserNote && (
                    <div className="rounded-lg px-2.5 py-1.5 bg-sky-50 border border-sky-200">
                      <p className="text-xs font-medium text-sky-700 mb-0.5">💬 利用者</p>
                      <p className="text-xs text-sky-900">{tool.endUserNote}</p>
                    </div>
                  )}
                </div>
              )}
              {(tool.selfMaintenanceNote || tool.fullMaintenanceNote) && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">社内ナレッジの更新他メンテナンス費用</p>
                  {tool.selfMaintenanceNote && (
                    <div className={`rounded-lg px-2.5 py-1.5 border ${
                      maintenancePref === "inhouse" ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200"
                    }`}>
                      <p className={`text-xs font-medium mb-0.5 ${maintenancePref === "inhouse" ? "text-indigo-600" : "text-gray-400"}`}>
                        {maintenancePref === "inhouse" && "★ "}社内で行う場合
                      </p>
                      <p className={`text-xs ${maintenancePref === "inhouse" ? "text-indigo-900 font-medium" : "text-gray-600"}`}>
                        {tool.selfMaintenanceNote}
                      </p>
                    </div>
                  )}
                  {tool.fullMaintenanceNote && (
                    <div className={`rounded-lg px-2.5 py-1.5 border ${
                      maintenancePref === "outsource" ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200"
                    }`}>
                      <p className={`text-xs font-medium mb-0.5 ${maintenancePref === "outsource" ? "text-indigo-600" : "text-gray-400"}`}>
                        {maintenancePref === "outsource" && "★ "}外部委託の場合
                      </p>
                      <p className={`text-xs ${maintenancePref === "outsource" ? "text-indigo-900 font-medium" : "text-gray-600"}`}>
                        {tool.fullMaintenanceNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ROIシミュレーター */}
      <RoiSimulator
        toolId={tool.id}
        toolName={tool.name}
        timeReductionPct={tool.timeReductionPct}
        costReductionPct={tool.costReductionPct}
      />

    </div>
  );
}
