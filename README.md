# Journal MCP Server

A Model Context Protocol (MCP) server for journal entries with a React Router v7 web viewer.

## Features

- 📖 **MCP Server**: Integration with Claude Desktop for journal management
- 🌐 **Web Viewer**: React-based interface for browsing journal entries
- 🚀 **Server-side rendering** with React Router
- ⚡️ **Hot Module Replacement** (HMR) for development
- 🔒 **TypeScript** by default
- 🎉 **TailwindCSS** for styling
- 📁 **File-based storage** with automatic organization

## Getting Started

### Quick Start with npx

Run directly without installation:

```bash
# Start web viewer
npx @coji/journal-mcp --viewer

# Setup Claude Desktop integration
npx @coji/journal-mcp --setup

# Start MCP server for Claude Desktop
npx @coji/journal-mcp
```

### Local Development

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your web viewer will be available at `http://localhost:5173`.

### Building for Production

Create a production build:

```bash
pnpm build
```

## Usage

### Using npx (Recommended)

```bash
# Show help
npx @coji/journal-mcp --help

# Setup Claude Desktop integration
npx @coji/journal-mcp --setup

# Verify Claude Desktop setup
npx @coji/journal-mcp --verify-setup

# Start MCP server for Claude Desktop
npx @coji/journal-mcp

# Start web viewer
npx @coji/journal-mcp --viewer

# Custom port examples
npx @coji/journal-mcp --setup --port 3001
npx @coji/journal-mcp --viewer --port 3001
```

### Local Development Commands

For development after local installation:

```bash
# Show help
node dist/index.js --help

# Setup Claude Desktop configuration
node dist/index.js --setup

# Start MCP server
node dist/index.js

# Start web viewer
node dist/index.js --viewer
```

The web viewer will be available at `http://localhost:3000` (or your specified port).

## MCP Tools

The server provides these tools for Claude Desktop:

1. **add_entry** - Add new journal entries
2. **search_entries** - Search by date range, tags, or keywords
3. **get_recent_entries** - Get most recent entries
4. **list_tags** - List all tags with usage counts
5. **get_entry_by_date** - Get entries for a specific date
6. **get_daily_summary** - Get journal statistics

## File Storage

Journal entries are stored in:
- **Location**: `~/.local/share/journal-mcp/entries/YYYY/MM/YYYY-MM-DD.md`
- **Format**: Markdown with YAML frontmatter
- **Features**: Automatic tag extraction, time-based organization

## Deployment

### Docker Deployment

```bash
docker build -t journal-mcp .
docker run -p 3000:3000 journal-mcp
```

### Manual Deployment

Deploy the output of `pnpm build`:

```text
├── package.json
├── pnpm-lock.yaml
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

---

Built with ❤️ using React Router and MCP.