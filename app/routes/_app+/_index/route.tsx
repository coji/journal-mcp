import type { Route } from './+types/route';
import { EntryCard } from '~/routes/_app+/entries.$date/components/entry-card';
import { getRecentEntries, getStats } from '~/lib/journal-api.server';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Journal - Home' },
    { name: 'description', content: 'Recent journal entries' },
  ];
}

export async function loader() {
  const recentEntries = await getRecentEntries(10);
  const stats = await getStats();

  return { recentEntries, stats };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { recentEntries, stats } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Recent Journal Entries
        </h1>
        <p className="text-gray-600">
          {stats.totalEntries} entries across {stats.totalFiles} days
        </p>
      </div>

      {recentEntries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No journal entries yet
          </h2>
          <p className="text-gray-600 mb-4">
            Start writing your first journal entry using Claude Desktop with the
            journal MCP server.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-sm text-gray-700 font-medium mb-2">
              Try asking Claude:
            </p>
            <p className="text-sm text-gray-600 italic">
              "Add a journal entry about what I learned today"
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recentEntries.map((file) => (
            <EntryCard key={file.date} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
