#!/usr/bin/env node

import { JournalMCPServer } from './mcp-server.js';
import { startWebServer } from './web-server.js';
import { setupClaudeDesktop, verifySetup } from './setup.js';
import { parseArgs } from 'node:util';

async function main() {
  const { values: args } = parseArgs({
    options: {
      setup: { type: 'boolean', default: false },
      port: { type: 'string', default: '3000' },
      'config-path': { type: 'string' },
      force: { type: 'boolean', default: false },
      'verify-setup': { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });

  if (args.help) {
    console.log(`
📖 Journal MCP Server

A Model Context Protocol server for journal entries with web viewer.

Usage:
  journal-mcp [options]

Options:
  --setup              Set up Claude Desktop configuration
  --port <port>        Web server port (default: 3000)
  --config-path <path> Claude Desktop config file path
  --force              Force overwrite existing configuration
  --verify-setup       Check if setup is correct
  --help               Show this help message

Examples:
  journal-mcp                    # Start MCP server + web viewer
  journal-mcp --setup           # Configure Claude Desktop
  journal-mcp --setup --port 3001  # Setup with custom port
  journal-mcp --verify-setup    # Check configuration

📚 Documentation: https://github.com/coji/journal-mcp
    `);
    return;
  }

  if (args['verify-setup']) {
    await verifySetup();
    return;
  }

  if (args.setup) {
    await setupClaudeDesktop({
      port: parseInt(args.port || '3000'),
      configPath: args['config-path'],
      force: args.force,
    });
    return;
  }

  // Get port from environment or argument
  const port = parseInt(process.env.JOURNAL_PORT || args.port || '3000');

  console.log('🚀 Starting Journal MCP Server...');

  // Start web server
  const webServer = await startWebServer(port);

  // Start MCP server
  const mcpServer = new JournalMCPServer();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    webServer.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    webServer.close();
    process.exit(0);
  });

  // Start MCP server (this will block)
  await mcpServer.start();
}

main().catch((error) => {
  console.error('❌ Failed to start journal MCP server:', error);
  process.exit(1);
});
