"use client";

import { useState, useEffect } from "react";
import type { RoiResult, RoiInput, UserProfile } from "@/types";

interface RoiSimulatorProps {
  toolId: string;
  toolName: string;
  timeReductionPct?: number | null;
  costReductionPct?: number | null;
}

const formatJpy = (n: number) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(n);

const ENV_LABELS: Record<string, string> = {
  google: "Google Workspace",
  microsoft: "Microsoft 365",
  slack: "Slack",
  notion: "Notion",
  salesforce: "Salesforce",
};

export function RoiSimulator({ toolId, toolName, timeReductionPct, costReductionPct }: RoiSimulatorProps) {
  const [input, setInput] = useState<RoiInput>({ teamSize: 5, monthlyHours: 20, hourlyRate: 3000 });
  const [maintenancePreference, setMaintenancePreference] = useState<UserProfile["maintenancePreference"]>(undefined);
  const [estimatedUsers, setEstimatedUsers] = useState<number>(0);
  const [userEnvironments, setUserEnvironments] = useState<string[]>([]);
  const [result, setResult] = useState<RoiResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile;
        setMaintenancePreference(profile.maintenancePreference);
        setEstimatedUsers(profile.estimatedUsers ?? 0);
        setUserEnvironments(profile.environments ?? []);
      }
    } catch {}
  }, []);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch("/api/roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId, ...input, maintenancePreference, estimatedUsers, userEnvironments }),
      });
      const data = await res.json() as RoiResult;
      setResult(data);
    } finally {
      setIsCalculating(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          自社の削減効果を試算 →
        </button>
      </div>
    );
  }

  // 年間削減額の計算（削減率を反映、preference未設定時は両パターン）
  const inhouseAnnual = result
    ? Math.round((result.currentMonthlyCost - result.staffCostAfterReduction - result.toolSystemCost - result.endUserCost - (result.inhouseMaintenanceCost ?? 0)) * 12)
    : null;
  const outsourceAnnual = result
    ? Math.round((result.currentMonthlyCost - result.staffCostAfterReduction - result.toolSystemCost - result.endUserCost - (result.outsourceMaintenanceCost ?? 0)) * 12)
    : null;

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="bg-indigo-50 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-indigo-900">💰 ROIシミュレーター</h4>
          <button onClick={() => setIsOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">閉じる</button>
        </div>
        <p className="text-xs text-indigo-700">現在の作業状況を入力して、{toolName}導入後の削減効果を試算します</p>
        {maintenancePreference && (
          <p className="text-xs text-indigo-600 bg-indigo-100 rounded-lg px-3 py-1.5">
            🏢 自社環境設定（メンテナンス：{maintenancePreference === "inhouse" ? "社内対応" : "外部委託"}）を反映します
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">担当者の人数</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                value={input.teamSize}
                onChange={(e) => setInput({ ...input, teamSize: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
              />
              <span className="text-xs text-gray-400 shrink-0">名</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              利用者見込数
              <span className="ml-1 text-gray-400 font-normal">（ツールを使うユーザー全員）</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                value={estimatedUsers}
                onChange={(e) => setEstimatedUsers(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
              />
              <span className="text-xs text-gray-400 shrink-0">名</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">現在の1人あたり月の作業時間</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                value={input.monthlyHours}
                onChange={(e) => setInput({ ...input, monthlyHours: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
              />
              <span className="text-xs text-gray-400 shrink-0">時間</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">時給換算単価</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1000}
                step={500}
                value={input.hourlyRate}
                onChange={(e) => setInput({ ...input, hourlyRate: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
              />
              <span className="text-xs text-gray-400 shrink-0">円</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isCalculating ? "計算中..." : "削減効果を計算する"}
        </button>

        {result && (
          <div className="bg-white rounded-lg p-4 space-y-3 border border-indigo-100">
            <h5 className="text-sm font-semibold text-gray-700">試算結果</h5>

            {/* 現在のコスト */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">現在のコスト（月間）</p>
              <p className="text-2xl font-bold text-gray-800">{formatJpy(result.currentMonthlyCost)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {input.teamSize}名 × {input.monthlyHours}時間 × {formatJpy(input.hourlyRate)}
              </p>
            </div>

            {/* 導入後のコスト */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
              <p className="text-xs text-gray-500">導入後のコスト（月間）</p>
              {/* システム使用料 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">システム使用料</span>
                {result.isSystemCostFree ? (
                  <span className="font-medium text-green-600 text-xs">既存プランに含まれる（追加費用なし）</span>
                ) : (
                  <div className="text-right">
                    {result.relatedBaseEnv && userEnvironments.includes(result.relatedBaseEnv) && (
                      <p className="text-xs text-indigo-500 mb-0.5">既存{ENV_LABELS[result.relatedBaseEnv] ?? result.relatedBaseEnv}への追加費用</p>
                    )}
                    <span className="font-medium text-gray-800">{formatJpy(result.toolSystemCost)}</span>
                  </div>
                )}
              </div>
              {/* エンドユーザーライセンス費用 */}
              {result.estimatedUsers > 0 && (
                <div className="flex justify-between items-start text-sm">
                  <div>
                    <span className="text-gray-600">利用者ライセンス費用</span>
                    <p className="text-xs text-gray-400">{result.estimatedUsers}名分</p>
                  </div>
                  {result.isSystemCostFree ? (
                    <span className="font-medium text-green-600 text-xs">既存プランに含まれる</span>
                  ) : result.endUserCost > 0 ? (
                    <div className="text-right">
                      <span className="font-medium text-gray-800">{formatJpy(result.endUserCost)}</span>
                      <p className="text-xs text-gray-400">{formatJpy(result.pricePerUser ?? 0)}/ユーザー</p>
                    </div>
                  ) : (
                    <span className="font-medium text-green-600 text-xs">追加費用なし</span>
                  )}
                </div>
              )}
              {/* 担当者の稼働コスト（削減後） */}
              {result.timeReductionPct != null && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700">担当者の稼働コスト（現在から{result.timeReductionPct}%削減）</span>
                  <span className="font-medium text-green-700">{formatJpy(result.staffCostAfterReduction)}</span>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-gray-400">社内ナレッジの更新他メンテナンス費用</p>
                {/* 社内対応 */}
                <div className={`flex justify-between items-center text-sm rounded-lg px-2.5 py-1.5 border ${
                  maintenancePreference === "inhouse"
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-white border-gray-200"
                }`}>
                  <span className={maintenancePreference === "inhouse" ? "text-indigo-700 font-medium" : "text-gray-500"}>
                    {maintenancePreference === "inhouse" && "★ "}社内で行う場合
                  </span>
                  <span className={`font-medium ${maintenancePreference === "inhouse" ? "text-indigo-800" : "text-gray-600"}`}>
                    {result.inhouseMaintenanceCost != null ? formatJpy(result.inhouseMaintenanceCost) : "—"}
                  </span>
                </div>
                {/* 外部委託 */}
                <div className={`flex justify-between items-center text-sm rounded-lg px-2.5 py-1.5 border ${
                  maintenancePreference === "outsource"
                    ? "bg-indigo-50 border-indigo-300"
                    : "bg-white border-gray-200"
                }`}>
                  <span className={maintenancePreference === "outsource" ? "text-indigo-700 font-medium" : "text-gray-500"}>
                    {maintenancePreference === "outsource" && "★ "}外部委託の場合
                  </span>
                  <span className={`font-medium ${maintenancePreference === "outsource" ? "text-indigo-800" : "text-gray-600"}`}>
                    {result.outsourceMaintenanceCost != null ? formatJpy(result.outsourceMaintenanceCost) : "—"}
                  </span>
                </div>
              </div>
              {/* 合計 */}
              <div className="border-t border-blue-200 pt-2 space-y-0.5">
                {maintenancePreference ? (
                  <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                    <span>合計</span>
                    <span>{formatJpy(result.toolMonthlyCost)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                      <span>合計（社内）</span>
                      <span>{formatJpy(result.toolSystemCost + result.endUserCost + (result.inhouseMaintenanceCost ?? 0) - result.reductionSavings)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                      <span>合計（外部委託）</span>
                      <span>{formatJpy(result.toolSystemCost + result.endUserCost + (result.outsourceMaintenanceCost ?? 0) - result.reductionSavings)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 年間削減額 */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              {maintenancePreference ? (
                <>
                  <p className="text-xs text-gray-500">
                    （{formatJpy(result.currentMonthlyCost)} − {formatJpy(result.toolMonthlyCost)} = {formatJpy(result.netMonthlySavings)}） × 12ヶ月
                  </p>
                  <p className="text-xs text-gray-500 mt-2 mb-0.5">年間削減額（導入費用別途）</p>
                  <p className={`text-2xl font-bold ${result.annualSavings > 0 ? "text-green-600" : "text-red-500"}`}>
                    {formatJpy(result.annualSavings)}
                  </p>
                  {result.annualSavings <= 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ 現在の設定ではコストメリットが出にくい状況です。チーム規模や作業時間を見直してください。
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">社内で行う場合</p>
                    <p className="text-xs text-gray-400">
                      （{formatJpy(result.currentMonthlyCost)} − {formatJpy(result.currentMonthlyCost - Math.round((inhouseAnnual ?? 0) / 12))} = {formatJpy(Math.round((inhouseAnnual ?? 0) / 12))}） × 12ヶ月
                    </p>
                    <p className={`text-xl font-bold ${(inhouseAnnual ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}>
                      {formatJpy(inhouseAnnual ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">外部委託の場合</p>
                    <p className="text-xs text-gray-400">
                      （{formatJpy(result.currentMonthlyCost)} − {formatJpy(result.currentMonthlyCost - Math.round((outsourceAnnual ?? 0) / 12))} = {formatJpy(Math.round((outsourceAnnual ?? 0) / 12))}） × 12ヶ月
                    </p>
                    <p className={`text-xl font-bold ${(outsourceAnnual ?? 0) > 0 ? "text-green-600" : "text-red-500"}`}>
                      {formatJpy(outsourceAnnual ?? 0)}
                    </p>
                  </div>
                  <p className="text-xs text-indigo-600">
                    💡 <a href="/profile" className="underline">自社環境設定</a>でメンテナンス方針を登録すると、いずれかの数値が★表示されます
                  </p>
                </div>
              )}
              {result.paybackMonths !== null && result.paybackMonths > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  ※ 初期費用の回収期間：約{result.paybackMonths}ヶ月
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
