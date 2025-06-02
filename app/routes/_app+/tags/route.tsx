import type { Route } from './+types/route';
import { TagList } from '~/routes/_app+/tags/components/tag-list';
import { JournalAPI } from '~/lib/journal-api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Journal - Tags' },
    { name: 'description', content: 'Browse journal entries by tags' },
  ];
}

export async function loader() {
  const tags = await JournalAPI.listTags();

  return { tags };
}

export default function Tags({ loaderData }: Route.ComponentProps) {
  const { tags } = loaderData;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
        <p className="text-gray-600">
          Browse and search journal entries by tags.
        </p>
      </div>

      <TagList tags={tags} />

      {tags.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Tip</h3>
          <p className="text-blue-800 text-sm">
            Click on any tag to search for entries containing that tag. You can
            also combine multiple tags in the search page.
          </p>
        </div>
      )}
    </div>
  );
}
