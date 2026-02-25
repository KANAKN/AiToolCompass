import type { Tool } from "@prisma/client";

export type { Tool };

export interface RankedTool {
  rank: number;
  tool: Tool;
  reasoning: string;
  compatibilityNote?: string;
  matchScore: number;
}

export interface SearchResult {
  query: string;
  category?: string;
  rankedTools: RankedTool[];
}

export interface UserProfile {
  environments: string[];
  setupPreference?: "inhouse" | "outsource";
  maintenancePreference?: "inhouse" | "outsource";
  estimatedUsers?: number;
}

export interface RoiInput {
  teamSize: number;
  monthlyHours: number;
  hourlyRate: number;
}

export interface RoiResult {
  currentMonthlyCost: number;
  toolSystemCost: number;
  inhouseMaintenanceCost: number | null;
  outsourceMaintenanceCost: number | null;
  maintenanceCost: number;
  toolMonthlyCost: number;
  netMonthlySavings: number;
  annualSavings: number;
  paybackMonths: number | null;
  isSystemCostFree: boolean;
  endUserCost: number;
  estimatedUsers: number;
  pricePerUser: number | null;
  relatedBaseEnv: string | null;
  staffCostAfterReduction: number;
  timeReductionPct: number | null;
}

export const CATEGORIES = [
  {
    id: "chatbot",
    label: "社内ナレッジチャットボットを設置したい",
    icon: "💬",
    description: "FAQや社内文書を学習させて自動応答するボットを構築",
    summary: "社内チャットボットは、Google Workspace・Microsoft 365・Slackなどすでに全社員が使用しているシステムへのアドオンが最もスムーズに導入できます。独自のナレッジベースを構築したい場合や既存システムへの依存を避けたい場合は、ユーザー数に関わらず定額で使えるDifyが費用対効果の高い選択肢です。",
  },
  {
    id: "email",
    label: "メールを自動作成・返信したい",
    icon: "📧",
    description: "営業メール・顧客対応メールの下書き・自動返信を自動化",
    summary: "メール自動化は、すでに使用しているGmail（Google Workspace）やOutlook（Microsoft 365）にAI機能を追加するのが、追加コストを抑えつつ即効性のある方法です。顧客管理（CRM）と連携した自動返信・リード育成まで行いたい場合は、HubSpotやSalesforce Einsteinの導入が効果的です。",
  },
  {
    id: "docs",
    label: "AIで資料・文書作成したい",
    icon: "📄",
    description: "報告書・プレゼン・議事録などの文書作成を効率化",
    summary: "文書・資料作成のAI化は、Google WorkspaceやMicrosoft 365のAI機能が既存環境をそのまま活用できるため費用対効果が高く、導入ハードルも低いです。社内文書を素早く検索・要約したい場合はNotebookLMが無料で使えます。最新情報を元にした調査レポートや提案資料の作成にはGensparkが特に威力を発揮します。",
  },
  {
    id: "sns",
    label: "SNS原稿を自動生成したい",
    icon: "📱",
    description: "Instagram・X・LinkedInなどの投稿文を自動生成",
    summary: "SNS投稿の自動生成・管理は、複数チャンネルの一元管理と投稿予約まで対応できるBufferが費用・導入ハードルともに低く始めやすいです。ブランドトーンを学習させた高品質なコンテンツ量産にはJasper AIが適しており、市場トレンドや競合情報を取り込んだ記事・投稿文の生成にはGensparkが有効です。",
  },
] as const;

export const ENVIRONMENTS = [
  { id: "google", label: "Google Workspace", icon: "🔵" },
  { id: "microsoft", label: "Microsoft 365", icon: "🪟" },
  { id: "slack", label: "Slack", icon: "💜" },
  { id: "notion", label: "Notion", icon: "📝" },
  { id: "salesforce", label: "Salesforce", icon: "☁️" },
] as const;
