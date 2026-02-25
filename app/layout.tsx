import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Tool Compass - AI業務効率化ツール比較",
  description: "チャットボット・メール自動化・資料作成・SNS生成など、AI業務効率化ツールの導入コスト・削減効果を比較検討できるサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-400">
          <p>AI Tool Compass</p>
        </footer>
      </body>
    </html>
  );
}
