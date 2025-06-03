import packagejson from '../package.json' with { type: 'json' };
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  addEntry,
  searchEntries,
  getRecentEntries,
  listTags,
  getEntryByDate,
  getStats,
} from './journal/manager.js';
import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export class JournalMCPServer {
  private server = new McpServer(
    {
      name: 'journal-mcp',
      version: packagejson.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  constructor() {
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.tool(
      'add_entry',
      'Add a new journal entry. If an entry for today already exists, it will append to the same file.',
      {
        content: z.string().describe('The content of the journal entry'),
        tags: z
          .array(z.string())
          .optional()
          .describe(
            'Optional tags for the entry (will also extract from content)'
          ),
      },
      async (args) => {
        const entry = await addEntry(args);
        return {
          content: [
            {
              type: 'text',
              text: `✅ Journal entry added successfully!\n\n**Entry Details:**\n- ID: ${
                entry.id
              }\n- Title: ${entry.title}\n- Tags: ${
                entry.tags.join(', ') || 'None'
              }\n- Time: ${entry.timestamp}\n\n**Content:**\n${entry.content}`,
            },
          ],
        };
      }
    );

    this.server.tool(
      'search_entries',
      'Search journal entries by date range, tags, or keywords',
      {
        dateFrom: z
          .string()
          .optional()
          .describe('Start date in YYYY-MM-DD format'),
        dateTo: z.string().optional().describe('End date in YYYY-MM-DD format'),
        tags: z
          .array(z.string())
          .optional()
          .describe('Tags to filter by (all must match)'),
        keywords: z
          .string()
          .optional()
          .describe('Keywords to search in content'),
        limit: z
          .number()
          .optional()
          .describe('Maximum number of results (default 50)'),
        offset: z
          .number()
          .optional()
          .describe('Offset for pagination (default 0)'),
      },
      async (args): Promise<CallToolResult> => {
        const result = await searchEntries(args);

        let response = `📖 Found ${result.total} journal entries`;
        if (result.hasMore) {
          response += ` (showing ${result.entries.length})`;
        }
        response += '\n\n';

        for (const file of result.entries) {
          response += `**${file.date}** - ${file.entries_count} entries\n`;
          response += `Tags: ${file.tags.join(', ') || 'None'}\n`;

          for (const entry of file.entries) {
            response += `\n📝 ${entry.timestamp} - ${entry.title}\n`;
            response += `${entry.content.slice(0, 200)}${
              entry.content.length > 200 ? '...' : ''
            }\n`;
          }
          response += '\n---\n\n';
        }

        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        };
      }
    );

    this.server.tool(
      'get_recent_entries',
      'Get the most recent journal entries',
      {
        limit: z
          .number()
          .optional()
          .describe('Number of recent entries to retrieve (default 10)'),
      },
      async (args) => {
        const entries = await getRecentEntries(args.limit);

        let response = `📅 Recent Journal Entries (${entries.length})\n\n`;

        for (const file of entries) {
          response += `**${file.date}** - ${file.entries_count} entries\n`;
          response += `Tags: ${file.tags.join(', ') || 'None'}\n`;

          for (const entry of file.entries) {
            response += `\n📝 ${entry.timestamp} - ${entry.title}\n`;
            response += `${entry.content}\n`;
          }
          response += '\n---\n\n';
        }

        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        } satisfies CallToolResult;
      }
    );

    this.server.tool(
      'list_tags',
      'List all tags used in journal entries with their usage counts',
      async () => {
        const tags = await listTags();

        let response = `🏷️ Journal Tags (${tags.length})\n\n`;

        if (tags.length === 0) {
          response += 'No tags found in journal entries.';
        } else {
          for (const { tag, count } of tags) {
            response += `• ${tag} (${count})\n`;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        } satisfies CallToolResult;
      }
    );

    this.server.tool(
      'get_entry_by_date',
      'Get journal entry for a specific date',
      {
        date: z.string().describe('Date in YYYY-MM-DD format'),
      },
      async ({ date }) => {
        const entry = await getEntryByDate(date);

        if (!entry) {
          return {
            content: [
              {
                type: 'text',
                text: `📅 No journal entry found for ${date}`,
              },
            ],
          } satisfies CallToolResult;
        }

        let response = `📅 Journal Entry for ${entry.date}\n\n`;
        response += `**Tags:** ${entry.tags.join(', ') || 'None'}\n`;
        response += `**Entries:** ${entry.entries_count}\n`;
        response += `**Created:** ${new Date(
          entry.created
        ).toLocaleString()}\n`;
        response += `**Updated:** ${new Date(
          entry.updated
        ).toLocaleString()}\n\n`;

        for (const entryItem of entry.entries) {
          response += `## ${entryItem.timestamp} - ${entryItem.title}\n`;
          response += `${entryItem.content}\n\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        } satisfies CallToolResult;
      }
    );

    this.server.tool(
      'get_daily_summary',
      'Get summary statistics for journal entries',
      async () => {
        const stats = await getStats();

        let response = `📊 Journal Summary\n\n`;
        response += `**Total Entries:** ${stats.totalEntries}\n`;
        response += `**Total Days:** ${stats.totalFiles}\n`;

        if (stats.dateRange.earliest && stats.dateRange.latest) {
          response += `**Date Range:** ${stats.dateRange.earliest} to ${stats.dateRange.latest}\n`;
        }

        response += `\n**Top Tags:**\n`;
        if (stats.topTags.length === 0) {
          response += 'No tags found.\n';
        } else {
          for (const { tag, count } of stats.topTags) {
            response += `• ${tag} (${count})\n`;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        } satisfies CallToolResult;
      }
    );
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('📖 Journal MCP Server started');
  }
}
