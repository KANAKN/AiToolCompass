import type { SavedSearch } from "@/types/saved";
import type { RankedTool } from "@/types";

const STORAGE_KEY = "savedSearches";

export function getSavedSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
  } catch {
    return [];
  }
}

export function saveSearch(query: string, rankedTools: RankedTool[], category?: string): SavedSearch {
  const searches = getSavedSearches();
  const newEntry: SavedSearch = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    query,
    category,
    savedAt: new Date().toISOString(),
    rankedTools,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...searches]));
  return newEntry;
}

export function deleteSavedSearch(id: string): void {
  const searches = getSavedSearches().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

export function isAlreadySaved(query: string, rankedTools: RankedTool[]): boolean {
  const searches = getSavedSearches();
  return searches.some(
    (s) => s.query === query && s.rankedTools[0]?.tool.id === rankedTools[0]?.tool.id
  );
}

export function hasProfile(): boolean {
  try {
    const raw = localStorage.getItem("userProfile");
    if (!raw) return false;
    const profile = JSON.parse(raw) as { environments?: string[] };
    return Array.isArray(profile.environments) && profile.environments.length > 0;
  } catch {
    return false;
  }
}
