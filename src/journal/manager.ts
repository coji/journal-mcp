import matter from 'gray-matter';
import glob from 'fast-glob';
import type {
  JournalEntry,
  JournalFile,
  JournalSearchOptions,
  JournalSearchResult,
  JournalStats,
  AddEntryOptions,
} from './types.js';
import {
  getEntriesDir,
  getDateFilePath,
  parseDateFromPath,
} from '../utils/paths.js';
import {
  ensureDir,
  readFileIfExists,
  writeFileWithDir,
  backupFile,
  deleteFile,
} from '../utils/files.js';
import { now } from '../utils/dayjs.js';

// Global lock map for file operations
const lockMap = new Map<string, Promise<void>>();

/**
 * Acquire file lock to prevent concurrent writes
 */
async function acquireLock(filePath: string): Promise<void> {
  const existingLock = lockMap.get(filePath);
  if (existingLock) {
    await existingLock;
  }

  let resolveLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });

  lockMap.set(filePath, lockPromise);

  // Auto-release lock after 30 seconds
  setTimeout(() => {
    resolveLock();
    lockMap.delete(filePath);
  }, 30000);
}

/**
 * Release file lock
 */
function releaseLock(filePath: string): void {
  const lock = lockMap.get(filePath);
  if (lock) {
    lockMap.delete(filePath);
  }
}

/**
 * Extract title from content
 */
function extractTitle(content: string): string {
  const lines = content.split('\n');
  const firstLine = lines[0].trim();

  // Remove markdown formatting
  const title = firstLine.replace(/^#+\s*/, '').replace(/[*_`]/g, '');

  return title.slice(0, 50) || 'Entry';
}

/**
 * Extract tags from content
 */
function extractTags(content: string): string[] {
  const tagMatches = content.match(/#(\w+)/g) || [];
  const tags = tagMatches.map((tag) => tag.slice(1));
  return Array.from(new Set(tags)).sort();
}

/**
 * Parse individual entries from markdown content
 */
function parseEntriesFromMarkdown(
  content: string,
  date: string
): JournalEntry[] {
  const entries: JournalEntry[] = [];
  const lines = content.split('\n');
  let currentEntry: Partial<JournalEntry> | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    // Check for time-based entry headers (e.g., "## 09:30 - Title")
    const timeMatch = line.match(/^## (\d{2}:\d{2})\s*-?\s*(.*)$/);

    if (timeMatch) {
      // Save previous entry
      if (currentEntry) {
        currentEntry.content = contentLines.join('\n').trim();
        entries.push(currentEntry as JournalEntry);
      }

      // Start new entry
      const [, time, title] = timeMatch;
      const timestamp = `${date}T${time}:00`;

      currentEntry = {
        id: `${date}-${time.replace(':', '')}`,
        title: title.trim() || 'Entry',
        timestamp: time,
        created: timestamp,
        updated: timestamp,
        tags: [],
        content: '',
      };
      contentLines = [];
    } else if (currentEntry) {
      contentLines.push(line);

      // Extract tags from content
      const tagMatches = line.match(/#(\w+)/g);
      if (tagMatches) {
        const tags = tagMatches.map((tag) => tag.slice(1));
        currentEntry.tags = [...(currentEntry.tags || []), ...tags];
      }
    }
  }

  // Save last entry
  if (currentEntry) {
    currentEntry.content = contentLines.join('\n').trim();
    entries.push(currentEntry as JournalEntry);
  }

  // Remove duplicate tags and sort
  entries.forEach((entry) => {
    entry.tags = Array.from(new Set(entry.tags)).sort();
  });

  return entries;
}

/**
 * Parse journal file content
 */
async function parseJournalFile(
  filePath: string,
  content: string
): Promise<JournalFile> {
  const { data: frontmatter, content: body } = matter(content);
  const date = parseDateFromPath(filePath) || frontmatter.title || '';

  // Parse entries from markdown content
  const entries = parseEntriesFromMarkdown(body, date);

  return {
    title: frontmatter.title || date,
    tags: frontmatter.tags || [],
    created: frontmatter.created || now().toISOString(),
    updated: frontmatter.updated || now().toISOString(),
    entries_count: frontmatter.entries_count || entries.length,
    entries,
    filePath,
    date,
  };
}

/**
 * Format journal file for writing
 */
function formatJournalFile(file: JournalFile): string {
  const frontmatter = {
    title: file.title,
    tags: file.tags,
    created: file.created,
    updated: file.updated,
    entries_count: file.entries_count,
  };

  let content = `# ${file.title}\n\n`;

  for (const entry of file.entries) {
    content += `## ${entry.timestamp} - ${entry.title}\n`;
    content += `${entry.content}\n\n`;
  }

  content += `---\n*最終更新: ${now().format('YYYY-MM-DD')} | エントリ数: ${
    file.entries_count
  }*\n`;

  return matter.stringify(content, frontmatter);
}

/**
 * Filter journal files based on search options
 */
function filterJournalFiles(
  files: JournalFile[],
  options: JournalSearchOptions
): JournalFile[] {
  return files.filter((file) => {
    // Date range filter
    if (options.dateFrom && file.date < options.dateFrom) return false;
    if (options.dateTo && file.date > options.dateTo) return false;

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      const hasRequiredTags = options.tags.every((tag) =>
        file.tags.includes(tag)
      );
      if (!hasRequiredTags) return false;
    }

    // Keywords filter
    if (options.keywords) {
      const keyword = options.keywords.toLowerCase();
      const searchText = `${file.title} ${file.entries
        .map((e) => e.content)
        .join(' ')}`.toLowerCase();
      if (!searchText.includes(keyword)) return false;
    }

    return true;
  });
}

/**
 * Add a new journal entry
 */
export async function addEntry(
  options: AddEntryOptions
): Promise<JournalEntry> {
  const t = now();
  const date = t.format('YYYY-MM-DD');
  const timestamp = t.format();
  const filePath = getDateFilePath(date);

  // Acquire file lock
  await acquireLock(filePath);

  let backupPath: string | null = null;

  try {
    // Create entry
    const entry: JournalEntry = {
      id: `${date}-${timestamp}`,
      title: extractTitle(options.content),
      content: options.content,
      tags: options.tags || extractTags(options.content),
      created: timestamp,
      updated: timestamp,
      timestamp: t.format('HH:mm'), // HH:MM format
    };

    // Read existing file or create new one
    const existingContent = await readFileIfExists(filePath);
    let journalFile: JournalFile;

    if (existingContent) {
      // Backup existing file
      backupPath = await backupFile(filePath);

      // Parse existing file
      journalFile = await parseJournalFile(filePath, existingContent);

      // Add new entry
      journalFile.entries.push(entry);
      journalFile.updated = timestamp;
      journalFile.entries_count = journalFile.entries.length;

      // Merge tags
      const allTags = new Set([...journalFile.tags, ...entry.tags]);
      journalFile.tags = Array.from(allTags).sort();
    } else {
      // Create new file
      journalFile = {
        title: date,
        tags: entry.tags,
        created: timestamp,
        updated: timestamp,
        entries_count: 1,
        entries: [entry],
        filePath,
        date,
      };
    }

    // Write file
    const content = formatJournalFile(journalFile);
    await writeFileWithDir(filePath, content);

    // Clean up backup file after successful write
    if (backupPath) {
      await deleteFile(backupPath);
    }

    return entry;
  } catch (error) {
    // If write failed and we have a backup, we can keep it for recovery
    // Log the backup path for manual recovery if needed
    if (backupPath) {
      console.error(`Write failed, backup file preserved at: ${backupPath}`);
    }
    throw error;
  } finally {
    releaseLock(filePath);
  }
}

/**
 * Search journal entries
 */
export async function searchEntries(
  options: JournalSearchOptions = {}
): Promise<JournalSearchResult> {
  const entriesDir = getEntriesDir();
  await ensureDir(entriesDir);

  // Find all markdown files
  const pattern = `${entriesDir}/**/*.md`;
  const files = await glob(pattern, { onlyFiles: true });

  let journalFiles: JournalFile[] = [];

  // Parse all files
  for (const filePath of files) {
    const content = await readFileIfExists(filePath);
    if (!content) continue;

    try {
      const journalFile = await parseJournalFile(filePath, content);
      journalFiles.push(journalFile);
    } catch (error) {
      console.warn(`Failed to parse journal file ${filePath}:`, error);
    }
  }

  // Apply filters
  journalFiles = filterJournalFiles(journalFiles, options);

  // Sort by date (newest first)
  journalFiles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply pagination
  const offset = options.offset || 0;
  const limit = options.limit || 50;
  const total = journalFiles.length;
  const paginatedFiles = journalFiles.slice(offset, offset + limit);

  return {
    entries: paginatedFiles,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Get recent entries
 */
export async function getRecentEntries(limit = 10): Promise<JournalFile[]> {
  const result = await searchEntries({ limit });
  return result.entries;
}

/**
 * Get entry by date
 */
export async function getEntryByDate(
  date: string
): Promise<JournalFile | null> {
  const filePath = getDateFilePath(date);
  const content = await readFileIfExists(filePath);

  if (!content) return null;

  try {
    return await parseJournalFile(filePath, content);
  } catch {
    return null;
  }
}

/**
 * List all tags
 */
export async function listTags(): Promise<
  Array<{ tag: string; count: number }>
> {
  const result = await searchEntries();
  const tagCounts = new Map<string, number>();

  for (const file of result.entries) {
    for (const tag of file.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get journal statistics
 */
export async function getStats(): Promise<JournalStats> {
  const result = await searchEntries();
  const files = result.entries;

  if (files.length === 0) {
    return {
      totalEntries: 0,
      totalFiles: 0,
      dateRange: { earliest: '', latest: '' },
      topTags: [],
    };
  }

  const totalEntries = files.reduce((sum, file) => sum + file.entries_count, 0);
  const dates = files.map((f) => f.date).sort();
  const topTags = await listTags();

  return {
    totalEntries,
    totalFiles: files.length,
    dateRange: {
      earliest: dates[0],
      latest: dates[dates.length - 1],
    },
    topTags: topTags.slice(0, 10),
  };
}
