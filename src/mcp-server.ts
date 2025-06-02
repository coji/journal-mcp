import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import {
  addEntry,
  searchEntries,
  getRecentEntries,
  listTags,
  getEntryByDate,
  getStats,
} from './journal/manager.js';
import type { AddEntryOptions } from './journal/types.js';

export class JournalMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'journal-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'add_entry',
            description:
              'Add a new journal entry. If an entry for today already exists, it will append to the same file.',
            inputSchema: {
              type: 'object',
              properties: {
                content: {
                  type: 'string',
                  description: 'The content of the journal entry',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description:
                    'Optional tags for the entry (will also extract from content)',
                },
                timestamp: {
                  type: 'string',
                  description:
                    'Optional ISO timestamp (defaults to current time)',
                },
              },
              required: ['content'],
            },
          },
          {
            name: 'search_entries',
            description:
              'Search journal entries by date range, tags, or keywords',
            inputSchema: {
              type: 'object',
              properties: {
                dateFrom: {
                  type: 'string',
                  description: 'Start date in YYYY-MM-DD format',
                },
                dateTo: {
                  type: 'string',
                  description: 'End date in YYYY-MM-DD format',
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Tags to filter by (all must match)',
                },
                keywords: {
                  type: 'string',
                  description: 'Keywords to search in content',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default 50)',
                },
                offset: {
                  type: 'number',
                  description: 'Offset for pagination (default 0)',
                },
              },
              required: [],
            },
          },
          {
            name: 'get_recent_entries',
            description: 'Get the most recent journal entries',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description:
                    'Number of recent entries to retrieve (default 10)',
                },
              },
              required: [],
            },
          },
          {
            name: 'list_tags',
            description:
              'List all tags used in journal entries with their usage counts',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'get_entry_by_date',
            description: 'Get journal entry for a specific date',
            inputSchema: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'Date in YYYY-MM-DD format',
                },
              },
              required: ['date'],
            },
          },
          {
            name: 'get_daily_summary',
            description: 'Get summary statistics for journal entries',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'add_entry': {
            const options: AddEntryOptions = {
              content: args?.content as string,
              tags: args?.tags as string[] | undefined,
              timestamp: args?.timestamp as string | undefined,
            };

            const entry = await addEntry(options);

            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Journal entry added successfully!\n\n**Entry Details:**\n- ID: ${
                    entry.id
                  }\n- Title: ${entry.title}\n- Tags: ${
                    entry.tags.join(', ') || 'None'
                  }\n- Time: ${entry.timestamp}\n\n**Content:**\n${
                    entry.content
                  }`,
                },
              ],
            };
          }

          case 'search_entries': {
            const searchOptions = {
              dateFrom: args?.dateFrom as string | undefined,
              dateTo: args?.dateTo as string | undefined,
              tags: args?.tags as string[] | undefined,
              keywords: args?.keywords as string | undefined,
              limit: args?.limit as number | undefined,
              offset: args?.offset as number | undefined,
            };

            const result = await searchEntries(searchOptions);

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

          case 'get_recent_entries': {
            const limit = args?.limit as number | undefined;
            const entries = await getRecentEntries(limit);

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
            };
          }

          case 'list_tags': {
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
            };
          }

          case 'get_entry_by_date': {
            const date = args?.date as string;
            const entry = await getEntryByDate(date);

            if (!entry) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `📅 No journal entry found for ${date}`,
                  },
                ],
              };
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
            };
          }

          case 'get_daily_summary': {
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
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${errorMessage}`
        );
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('📖 Journal MCP Server started');
  }
}
