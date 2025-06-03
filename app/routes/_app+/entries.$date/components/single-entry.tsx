import { Link } from 'react-router';
import type { JournalEntry } from '~/lib/journal-api.server';

interface SingleEntryProps {
  entry: JournalEntry;
  date: string;
}

export function SingleEntry({ entry, date }: SingleEntryProps) {
  return (
    <div className="p-4 outline rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-mono text-gray-600">
          {entry.timestamp}
        </span>
        <h4 className="font-medium text-gray-900">{entry.title}</h4>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 mb-3">
        {entry.content.split('\n').map((line, idx) => (
          <p key={idx} className="mb-1">
            {line}
          </p>
        ))}
      </div>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <Link
              key={tag}
              to={`/search?tags=${encodeURIComponent(tag)}`}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
