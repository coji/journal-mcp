import type { Route } from './+types/search';
import { SearchForm } from '~/components/SearchForm';
import { EntryCard } from '~/components/EntryCard';
import { JournalAPI } from '~/lib/journal-api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Journal - Search' },
    { name: 'description', content: 'Search journal entries' },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = {
    keywords: url.searchParams.get('keywords') || undefined,
    tags:
      url.searchParams
        .get('tags')
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean) || undefined,
    dateFrom: url.searchParams.get('dateFrom') || undefined,
    dateTo: url.searchParams.get('dateTo') || undefined,
    limit: 20,
  };

  const hasSearchParams =
    searchParams.keywords ||
    searchParams.tags ||
    searchParams.dateFrom ||
    searchParams.dateTo;

  if (!hasSearchParams) {
    return { results: null, searchParams: {} };
  }

  const results = await JournalAPI.searchEntries(searchParams);

  return { results, searchParams };
}

export default function Search({ loaderData }: Route.ComponentProps) {
  const { results, searchParams } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Journal Entries
        </h1>
        <p className="text-gray-600">
          Find entries by keywords, tags, or date range.
        </p>
      </div>

      <SearchForm />

      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results
            </h2>
            <p className="text-gray-600">
              {results.total} {results.total === 1 ? 'result' : 'results'} found
              {results.hasMore && ` (showing first ${results.entries.length})`}
            </p>
          </div>

          {results.entries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.entries.map((file) => (
                <EntryCard key={file.date} file={file} />
              ))}

              {results.hasMore && (
                <div className="text-center">
                  <p className="text-gray-600">
                    Showing {results.entries.length} of {results.total} results
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
