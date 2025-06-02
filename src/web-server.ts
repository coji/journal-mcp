import { createServer } from 'node:http';

export async function startWebServer(port = 3000) {
  const server = createServer((_req, res) => {
    // Simple placeholder response
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Journal MCP Server</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            .emoji { font-size: 2em; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1><span class="emoji">📖</span> Journal MCP Server</h1>
            <p>The journal MCP server is running successfully!</p>
            <h2>Next Steps</h2>
            <ol>
              <li>Configure Claude Desktop with: <code>npx @coji/journal-mcp --setup</code></li>
              <li>Restart Claude Desktop</li>
              <li>Try asking Claude: "Add a journal entry about today's work"</li>
            </ol>
            <h2>Features</h2>
            <ul>
              <li>Add journal entries via Claude Desktop</li>
              <li>Search entries by date, tags, or keywords</li>
              <li>Automatic markdown file organization</li>
              <li>Tag-based categorization</li>
            </ul>
            <p><em>Web viewer UI coming soon...</em></p>
          </div>
        </body>
      </html>
    `);
  });

  server.listen(port, () => {
    console.error(`🌐 Web server started at http://localhost:${port}`);
  });

  return server;
}
