export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created: string;
  updated: string;
  timestamp: string;
}

export interface JournalFile {
  title: string;
  tags: string[];
  created: string;
  updated: string;
  entries_count: number;
  entries: JournalEntry[];
  filePath: string;
  date: string;
}

export interface JournalSearchOptions {
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  keywords?: string;
  limit?: number;
  offset?: number;
}

export interface JournalSearchResult {
  entries: JournalFile[];
  total: number;
  hasMore: boolean;
}

export interface JournalStats {
  totalEntries: number;
  totalFiles: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

export interface AddEntryOptions {
  content: string;
  tags?: string[];
}

export interface JournalConfig {
  dataDir: string;
  webPort: number;
}
