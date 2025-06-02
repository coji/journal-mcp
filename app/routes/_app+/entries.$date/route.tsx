import type { Route } from './+types/route';
import { EntryCard } from '~/routes/_app+/entries.$date/components/entry-card';
import { getEntryByDate } from '~/lib/journal-api.server';
import { Link } from 'react-router';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Journal - ${params.date}` },
    { name: 'description', content: `Journal entry for ${params.date}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const entry = await getEntryByDate(params.date);

  if (!entry) {
    throw new Response('Journal entry not found', { status: 404 });
  }

  return { entry };
}

export default function EntryByDate({ loaderData }: Route.ComponentProps) {
  const { entry } = loaderData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {entry.date}
          </h1>
          <p className="text-gray-600">
            {entry.entries_count}{' '}
            {entry.entries_count === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        <Link
          to="/"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <EntryCard file={entry} />
    </div>
  );
}
