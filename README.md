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

### Installation

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

### MCP Server Mode (Default)

For integration with Claude Desktop:

```bash
# Setup Claude Desktop configuration
node dist/index.js --setup

# Start MCP server
node dist/index.js
```

### Web Viewer Mode

For browsing journal entries in a web interface:

```bash
node dist/index.js --viewer
```

The web viewer will be available at `http://localhost:3000` (or your specified port).

### Available Commands

```bash
# Show help
node dist/index.js --help

# Verify Claude Desktop setup
node dist/index.js --verify-setup

# Setup with custom port
node dist/index.js --setup --port 3001

# Start web viewer on custom port
node dist/index.js --viewer --port 3001
```

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

```
├── package.json
├── pnpm-lock.yaml
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

---

Built with ❤️ using React Router and MCP.