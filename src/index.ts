#!/usr/bin/env node

import { JournalMCPServer } from './mcp-server.js';
import { startWebServer } from './web-server.js';
import { setupClaudeDesktop, verifySetup } from './setup.js';
import { parseArgs } from 'node:util';
import { exec } from 'node:child_process';

function openBrowser(url: string) {
  const command = process.platform === 'darwin' 
    ? `open "${url}"` 
    : process.platform === 'win32' 
    ? `start "${url}"` 
    : `xdg-open "${url}"`;
  
  exec(command, (error) => {
    if (error) {
      console.error('Could not open browser automatically');
    }
  });
}

async function main() {
  const { values: args } = parseArgs({
    options: {
      viewer: { type: 'boolean', default: false },
      setup: { type: 'boolean', default: false },
      port: { type: 'string', default: '8765' },
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
  --viewer             Start in web viewer mode
  --setup              Set up Claude Desktop configuration
  --port <port>        Port for web viewer (default: 8765)
  --config-path <path> Claude Desktop config file path
  --force              Force overwrite existing configuration
  --verify-setup       Check if setup is correct
  --help               Show this help message

Examples:
  journal-mcp                       # Start MCP server (default)
  journal-mcp --viewer              # Start web viewer mode
  journal-mcp --viewer --port 8080  # Start viewer on custom port
  journal-mcp --setup               # Configure Claude Desktop
  journal-mcp --verify-setup        # Check configuration

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
      configPath: args['config-path'],
      force: args.force,
    });
    return;
  }

  // Get port from environment or argument
  const port = parseInt(process.env.JOURNAL_PORT || args.port || '8765');

  if (args.viewer) {
    // Web viewer mode
    console.error('🌐 Starting Journal Web Viewer...');
    const webServer = await startWebServer(port);

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

    const url = `http://localhost:${port}`;
    console.error(`📖 Journal viewer running at ${url}`);
    
    // Open browser automatically
    setTimeout(() => {
      openBrowser(url);
    }, 1000);
  } else {
    // Default: MCP server mode
    console.error('🚀 Starting Journal MCP Server...');
    const mcpServer = new JournalMCPServer();
    await mcpServer.start();
  }
}

main().catch((error) => {
  console.error('❌ Failed to start journal MCP server:', error);
  process.exit(1);
});
