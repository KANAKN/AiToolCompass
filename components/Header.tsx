"use client";

import { useEffect, useState } from "react";
import { hasProfile } from "@/lib/savedSearches";

export function Header() {
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    setProfileExists(hasProfile());
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-indigo-600 shrink-0">
          <span>🧭</span>
          <span>AI Tool Compass</span>
        </a>
        <nav className="flex items-center gap-3 sm:gap-4">
          {profileExists && (
            <a
              href="/saved"
              className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1"
            >
              <span>🔖</span>
              <span className="hidden sm:inline">保存済み</span>
            </a>
          )}
          <a
            href="/profile"
            className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1"
          >
            <span>🏢</span>
            <span className="hidden sm:inline">自社環境を設定</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
