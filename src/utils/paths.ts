import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * Get XDG-compliant data directory for journal entries
 */
export function getJournalDataDir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME;
  if (xdgDataHome) {
    return join(xdgDataHome, 'journal-mcp');
  }

  // Default to ~/.local/share/journal-mcp
  return join(homedir(), '.local', 'share', 'journal-mcp');
}

/**
 * Get entries directory path
 */
export function getEntriesDir(): string {
  return join(getJournalDataDir(), 'entries');
}

/**
 * Get file path for a specific date
 */
export function getDateFilePath(date: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear().toString();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const filename = `${date}.md`;

  return join(getEntriesDir(), year, month, filename);
}

/**
 * Get config file path
 */
export function getConfigPath(): string {
  return join(getJournalDataDir(), 'config.json');
}

/**
 * Parse date from file path
 */
export function parseDateFromPath(filePath: string): string | null {
  const match = filePath.match(/(\d{4}-\d{2}-\d{2})\.md$/);
  return match ? match[1] : null;
}
