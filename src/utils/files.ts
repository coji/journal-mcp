import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Ensure directory exists, creating it if necessary
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file with error handling
 */
export async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Write file with directory creation
 */
export async function writeFileWithDir(filePath: string, content: string): Promise<void> {
  await ensureDir(dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Create backup of existing file
 */
export async function backupFile(filePath: string): Promise<string | null> {
  if (!(await fileExists(filePath))) {
    return null;
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${filePath}.backup.${timestamp}`;
  
  const content = await fs.readFile(filePath, 'utf-8');
  await fs.writeFile(backupPath, content, 'utf-8');
  
  return backupPath;
}