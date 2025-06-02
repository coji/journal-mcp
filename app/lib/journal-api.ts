import { JournalManager } from 'src/journal/manager';

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
    const manager = new JournalManager();
    const entries = await manager.getRecentEntries(limit);
    return entries.map((entry) => ({
      title: entry.title,
      tags: entry.tags,
      created: entry.created,
      updated: entry.updated,
      entries_count: entry.entries.length,
      entries: entry.entries,
      filePath: entry.filePath,
      date: entry.date,
    }));
  }

  static async searchEntries(
    options: JournalSearchOptions = {}
  ): Promise<JournalSearchResult> {
    const manager = new JournalManager();
    const {
      dateFrom,
      dateTo,
      tags,
      keywords,
      limit = 10,
      offset = 0,
    } = options;
    const searchResults = await manager.searchEntries({
      dateFrom,
      dateTo,
      tags,
      keywords,
      limit,
      offset,
    });

    return {
      entries: searchResults.entries.map((entry) => ({
        title: entry.title,
        tags: entry.tags,
        created: entry.created,
        updated: entry.updated,
        entries_count: entry.entries.length,
        entries: entry.entries,
        filePath: entry.filePath,
        date: entry.date,
      })),
      total: searchResults.total,
      hasMore: searchResults.hasMore,
    };
  }

  static async getEntryByDate(date: string): Promise<JournalFile | null> {
    const manager = new JournalManager();
    const entry = await manager.getEntryByDate(date);

    if (entry) {
      return {
        title: entry.title,
        tags: entry.tags,
        created: entry.created,
        updated: entry.updated,
        entries_count: entry.entries.length,
        entries: entry.entries,
        filePath: entry.filePath,
        date: entry.date,
      };
    }
    return null;
  }

  static async listTags(): Promise<Array<{ tag: string; count: number }>> {
    const manager = new JournalManager();
    const tags = await manager.listTags();
    return tags.map((tag) => ({
      tag: tag.tag,
      count: tag.count,
    }));
  }

  static async getStats() {
    const manager = new JournalManager();
    const stats = await manager.getStats();
    if (stats) {
      return {
        totalEntries: stats.totalEntries,
        totalFiles: stats.totalFiles,
        dateRange: {
          earliest: stats.dateRange.earliest,
          latest: stats.dateRange.latest,
        },
        topTags: stats.topTags.map((tag) => ({
          tag: tag.tag,
          count: tag.count,
        })),
      };
    }
    return {
      totalEntries: 0,
      totalFiles: 0,
      dateRange: { earliest: '', latest: '' },
      topTags: [],
    };
  }
}
