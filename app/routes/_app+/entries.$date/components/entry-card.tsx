import { Link } from 'react-router';
import type { JournalFile, JournalEntry } from '~/lib/journal-api';

interface EntryCardProps {
  file: JournalFile;
}

interface SingleEntryProps {
  entry: JournalEntry;
  date: string;
}

function SingleEntry({ entry, date }: SingleEntryProps) {
  return (
    <div className="border-l-2 border-gray-200 pl-4 ml-2 pb-4">
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

export function EntryCard({ file }: EntryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/entries/${file.date}`}
          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
        >
          {file.date}
        </Link>
        <div className="text-sm text-gray-500">
          {file.entries_count} {file.entries_count === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {file.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {file.tags.map((tag) => (
            <Link
              key={tag}
              to={`/search?tags=${encodeURIComponent(tag)}`}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {file.entries.map((entry) => (
          <SingleEntry key={entry.id} entry={entry} date={file.date} />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
        Last updated: {new Date(file.updated).toLocaleDateString()}
      </div>
    </div>
  );
}
