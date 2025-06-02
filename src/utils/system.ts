import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { platform } from 'node:os';

const execAsync = promisify(exec);

/**
 * Detect npx command path
 */
export async function detectNpxPath(): Promise<string> {
  const isWindows = platform() === 'win32';
  const command = isWindows ? 'where npx' : 'which npx';
  
  try {
    const { stdout } = await execAsync(command);
    return stdout.trim().split('\n')[0];
  } catch {
    return isWindows ? 'npx' : '/usr/local/bin/npx';
  }
}

/**
 * Get Claude Desktop config path
 */
export function getClaudeConfigPath(): string {
  const isWindows = platform() === 'win32';
  
  if (isWindows) {
    return `${process.env.APPDATA}\\Claude\\claude_desktop_config.json`;
  } else {
    return `${process.env.HOME}/Library/Application Support/Claude/claude_desktop_config.json`;
  }
}