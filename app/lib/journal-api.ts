// Journal API client for the web interface
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

// This would typically connect to an API endpoint
// For now, we'll create mock data for the web interface
export class JournalAPI {
  static async getRecentEntries(limit = 10): Promise<JournalFile[]> {
    // TODO: Connect to actual journal manager
    return [];
  }

  static async searchEntries(options: JournalSearchOptions = {}): Promise<JournalSearchResult> {
    // TODO: Connect to actual journal manager
    return {
      entries: [],
      total: 0,
      hasMore: false
    };
  }

  static async getEntryByDate(date: string): Promise<JournalFile | null> {
    // TODO: Connect to actual journal manager
    return null;
  }

  static async listTags(): Promise<Array<{ tag: string; count: number }>> {
    // TODO: Connect to actual journal manager
    return [];
  }

  static async getStats() {
    // TODO: Connect to actual journal manager
    return {
      totalEntries: 0,
      totalFiles: 0,
      dateRange: { earliest: '', latest: '' },
      topTags: []
    };
  }
}