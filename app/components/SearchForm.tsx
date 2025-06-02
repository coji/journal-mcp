import { Form, useSearchParams } from 'react-router';
import { useState } from 'react';

export function SearchForm() {
  const [searchParams] = useSearchParams();
  const [keywords, setKeywords] = useState(searchParams.get('keywords') || '');
  const [tags, setTags] = useState(searchParams.get('tags') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Search Journal Entries
      </h2>

      <Form method="get" className="space-y-4">
        <div>
          <label
            htmlFor="keywords"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Keywords
          </label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Search in content..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., work, meeting, learning"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Comma-separated tags</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              From Date
            </label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              To Date
            </label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => {
              setKeywords('');
              setTags('');
              setDateFrom('');
              setDateTo('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Clear
          </button>
        </div>
      </Form>
    </div>
  );
}
