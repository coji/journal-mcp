import {
  getRecentEntries as getRecentEntriesFromManager,
  searchEntries as searchEntriesFromManager,
  getEntryByDate as getEntryByDateFromManager,
  listTags as listTagsFromManager,
  getStats as getStatsFromManager,
} from 'src/journal/manager';

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
export const getRecentEntries = async (limit = 10): Promise<JournalFile[]> => {
  // TODO: Connect to actual journal manager
  const entries = await getRecentEntriesFromManager(limit);
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
};

export const searchEntries = async (
  options: JournalSearchOptions = {}
): Promise<JournalSearchResult> => {
  const { dateFrom, dateTo, tags, keywords, limit = 10, offset = 0 } = options;
  const searchResults = await searchEntriesFromManager({
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
};

export const getEntryByDate = async (
  date: string
): Promise<JournalFile | null> => {
  const entry = await getEntryByDateFromManager(date);

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
};

export const listTags = async (): Promise<
  Array<{ tag: string; count: number }>
> => {
  const tags = await listTagsFromManager();
  return tags.map((tag) => ({
    tag: tag.tag,
    count: tag.count,
  }));
};

export const getStats = async () => {
  const stats = await getStatsFromManager();
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
};
