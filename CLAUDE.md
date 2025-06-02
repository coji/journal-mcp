# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Journal MCP Server

A React Router v7 web application that will serve as the web viewer component for a journal MCP (Model Context Protocol) server. Currently contains a basic React Router template that needs to be developed into a full-featured journal viewing interface.

## Development Commands

```bash
# Development server with HMR
pnpm dev

# TypeScript checking
pnpm typecheck

# Production build
pnpm build

# Production server
pnpm start
```

## Current Architecture

This is a React Router v7 application with:

- **Server-side rendering** with React Router
- **TypeScript** configuration
- **TailwindCSS** for styling  
- **Vite** as the build tool

### Project Structure

```text
journal-mcp/
├── app/
│   ├── root.tsx              # React Router root component
│   ├── routes.ts             # Route definitions
│   ├── routes/
│   │   └── home.tsx          # Home page component
│   └── welcome/              # Welcome component assets
├── public/                   # Static assets
├── react-router.config.ts    # React Router configuration
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Development Notes

- **MCP Server**: Implemented in `src/` directory with TypeScript
- **Web UI**: React Router v7 application in `app/` directory
- **Build Process**: `npm run build` builds both MCP server and web components
- **Testing**: Use `node dist/index.js --help` to test CLI functionality

## MCP Server Implementation

### Core Components

- **`src/journal/manager.ts`**: Journal file operations with file locking and backup
- **`src/mcp-server.ts`**: MCP protocol implementation with 6 tools
- **`src/setup.ts`**: Claude Desktop configuration automation
- **`src/index.ts`**: CLI entry point supporting various options

### Available MCP Tools

1. `add_entry` - Add journal entries (appends to daily files)
2. `search_entries` - Search by date range, tags, or keywords  
3. `get_recent_entries` - Get most recent entries
4. `list_tags` - List all tags with usage counts
5. `get_entry_by_date` - Get specific date entries
6. `get_daily_summary` - Get journal statistics

### File Storage Format

- **Location**: `~/.local/share/journal-mcp/entries/YYYY/MM/YYYY-MM-DD.md`
- **Format**: Markdown with YAML frontmatter
- **Features**: Tag extraction, time-based entries, automatic metadata

### Setup & Usage

```bash
# Build the project
pnpm build

# Setup Claude Desktop integration  
node dist/index.js --setup

# Start MCP server (for Claude Desktop)
node dist/index.js

# Test CLI functionality
node dist/index.js --help
node dist/index.js --verify-setup
```

The web viewer provides a basic interface showing the server is running, with plans for a full React-based journal browser.
