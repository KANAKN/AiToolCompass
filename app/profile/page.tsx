"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ENVIRONMENTS } from "@/types";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [selectedEnvs, setSelectedEnvs] = useState<string[]>([]);
  const [setupPreference, setSetupPreference] = useState<UserProfile["setupPreference"]>(undefined);
  const [maintenancePreference, setMaintenancePreference] = useState<UserProfile["maintenancePreference"]>(undefined);
  const [estimatedUsers, setEstimatedUsers] = useState<number | "">("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile;
        setSelectedEnvs(profile.environments ?? []);
        setSetupPreference(profile.setupPreference);
        setMaintenancePreference(profile.maintenancePreference);
        setEstimatedUsers(profile.estimatedUsers ?? "");
      }
    } catch {}
  }, []);

  const toggleEnv = (id: string) => {
    setSelectedEnvs((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const profile: UserProfile = {
      environments: selectedEnvs,
      setupPreference,
      maintenancePreference,
      estimatedUsers: estimatedUsers === "" ? undefined : estimatedUsers,
    };
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => router.push("/"), 1200);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-3">
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">🏢 自社環境の設定</h1>
        <p className="text-gray-500 text-sm mt-2">
          現在導入している環境を登録すると、各ツールとの連携しやすさ・相性を考慮した提案が受けられます
        </p>
      </div>

      {/* 環境選択 */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">導入済みのサービス（複数選択可）</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ENVIRONMENTS.map((env) => {
            const isSelected = selectedEnvs.includes(env.id);
            return (
              <button
                key={env.id}
                onClick={() => toggleEnv(env.id)}
                className={`flex items-center gap-2 border rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50"
                }`}
              >
                <span className="text-xl">{env.icon}</span>
                <span>{env.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 利用者見込数 */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-1">利用者見込数（任意）</h2>
        <p className="text-xs text-gray-400 mb-3">AIツールを実際に使う社員数。担当者以外にも展開する場合はその人数を入力してください。ROIシミュレーターでライセンス費用の試算に使用します。</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={estimatedUsers}
            onChange={(e) => setEstimatedUsers(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="例：50"
            className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">名</span>
        </div>
      </div>


      {/* 導入スタイル */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">導入スタイル</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500 mb-2">初期設定</p>
            <div className="grid grid-cols-2 gap-2">
              {(["inhouse", "outsource"] as const).map((val) => {
                const label = val === "inhouse" ? "社内で行う" : "外部に委託したい";
                const icon = val === "inhouse" ? "🏠" : "🤝";
                return (
                  <button
                    key={val}
                    onClick={() => setSetupPreference((prev) => prev === val ? undefined : val)}
                    className={`flex items-center gap-2 border rounded-xl px-3 py-3 text-sm font-medium transition-all text-left ${
                      setupPreference === val
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    <span className="text-xl shrink-0">{icon}</span>
                    <span className="break-words">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">メンテナンス</p>
            <div className="grid grid-cols-2 gap-2">
              {(["inhouse", "outsource"] as const).map((val) => {
                const label = val === "inhouse" ? "社内で行う" : "外部に委託したい";
                const icon = val === "inhouse" ? "🏠" : "🤝";
                return (
                  <button
                    key={val}
                    onClick={() => setMaintenancePreference((prev) => prev === val ? undefined : val)}
                    className={`flex items-center gap-2 border rounded-xl px-3 py-3 text-sm font-medium transition-all text-left ${
                      maintenancePreference === val
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50"
                    }`}
                  >
                    <span className="text-xl shrink-0">{icon}</span>
                    <span className="break-words">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 transition-colors"
      >
        {saved ? "✅ 保存しました！トップに戻ります..." : "設定を保存してトップへ"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        ※ 設定はブラウザのローカルストレージに保存されます。アカウント登録は不要です。
      </p>
    </div>
  );
}
