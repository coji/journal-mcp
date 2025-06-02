import { Link } from "react-router";

interface TagListProps {
  tags: Array<{ tag: string; count: number }>;
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
        <p className="text-gray-500">No tags found in journal entries.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Tags ({tags.length})
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            to={`/search?tags=${encodeURIComponent(tag)}`}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
          >
            <span>#{tag}</span>
            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}