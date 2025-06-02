import { Link, useLocation } from 'react-router';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'Tags', href: '/tags', icon: '🏷️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                📖 Journal
              </Link>
            </div>

            <div className="flex space-x-1">
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/' &&
                    location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Journal MCP Server - Web Viewer
          </p>
        </div>
      </footer>
    </div>
  );
}
