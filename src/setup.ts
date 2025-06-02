import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { fileExists, ensureDir } from './utils/files.js';
import { detectNpxPath, getClaudeConfigPath } from './utils/system.js';

export interface SetupOptions {
  configPath?: string;
  force?: boolean;
}

export async function setupClaudeDesktop(
  options: SetupOptions = {}
): Promise<void> {
  const configPath = options.configPath || getClaudeConfigPath();

  console.log('🔧 Setting up Claude Desktop configuration...');
  console.log(`📍 Config path: ${configPath}`);

  // Ensure config directory exists
  await ensureDir(dirname(configPath));

  // Detect npx path
  const npxPath = await detectNpxPath();
  console.log(`🔍 Detected npx at: ${npxPath}`);

  // Read existing config or create empty one
  let config: any = {};

  if (await fileExists(configPath)) {
    console.log('📖 Reading existing configuration...');

    // Create backup
    const backupPath = `${configPath}.backup.${Date.now()}`;
    const existingContent = await fs.readFile(configPath, 'utf-8');
    await fs.writeFile(backupPath, existingContent, 'utf-8');
    console.log(`💾 Backup created: ${backupPath}`);

    try {
      config = JSON.parse(existingContent);
    } catch (error) {
      console.warn('⚠️ Failed to parse existing config, creating new one');
      config = {};
    }
  }

  // Initialize mcpServers if not exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Check if journal config already exists
  if (config.mcpServers.journal && !options.force) {
    console.log('✅ Journal MCP server already configured');
    console.log('💡 Use --force to overwrite existing configuration');
    return;
  }

  // Add journal MCP server configuration
  config.mcpServers.journal = {
    command: npxPath,
    args: ['@coji/journal-mcp'],
  };

  // Write updated config
  const configContent = JSON.stringify(config, null, 2);
  await fs.writeFile(configPath, configContent, 'utf-8');

  console.log('✅ Claude Desktop configuration updated!');
  console.log('\n📋 Configuration added:');
  console.log(JSON.stringify(config.mcpServers.journal, null, 2));

  console.log('\n🚀 Next steps:');
  console.log('1. Restart Claude Desktop');
  console.log('2. The journal MCP server will be available in Claude Desktop');
  console.log(
    '3. To start web viewer separately, run: npx @coji/journal-mcp --viewer'
  );
  console.log(
    '\n💡 Try asking Claude: "Add a journal entry about today\'s work"'
  );
}

export async function verifySetup(): Promise<boolean> {
  const configPath = getClaudeConfigPath();

  if (!(await fileExists(configPath))) {
    console.log('❌ Claude Desktop config not found');
    return false;
  }

  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(content);

    if (config.mcpServers?.journal) {
      console.log('✅ Journal MCP server is configured');
      return true;
    } else {
      console.log('❌ Journal MCP server not found in configuration');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to read Claude Desktop configuration');
    return false;
  }
}
