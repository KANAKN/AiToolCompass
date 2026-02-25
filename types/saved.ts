import type { RankedTool } from "./index";

export interface SavedSearch {
  id: string;
  query: string;
  category?: string;
  savedAt: string;
  rankedTools: RankedTool[];
}
