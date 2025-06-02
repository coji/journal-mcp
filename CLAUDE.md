# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Journal MCP Server

A React Router v7 web application that will serve as the web viewer component for a journal MCP (Model Context Protocol) server. Currently contains a basic React Router template that needs to be developed into a full-featured journal viewing interface.

## Development Commands

```bash
# Development server with HMR
npm run dev

# TypeScript checking
npm run typecheck

# Production build
npm run build

# Production server
npm run start
```

## Current Architecture

This is a React Router v7 application with:

- **Server-side rendering** with React Router
- **TypeScript** configuration
- **TailwindCSS** for styling  
- **Vite** as the build tool

### Project Structure

```
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

- Uses React Router v7's file-based routing system
- Routes are defined in `app/routes.ts` and implemented in `app/routes/`
- Components use TailwindCSS for styling
- TypeScript is configured for strict type checking

## Planned MCP Integration

This web application is intended to be the web viewer component of a larger MCP server system that will:

- Provide journal entry management via MCP protocol
- Store entries as Markdown files with frontmatter
- Support search and filtering capabilities
- Integrate with Claude Desktop via MCP configuration

The web viewer should display journal entries, provide search functionality, and offer a clean interface for viewing chronological journal data.
