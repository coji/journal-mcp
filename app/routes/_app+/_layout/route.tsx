import { Link, NavLink, Outlet, useLocation } from 'react-router';

export default function Layout() {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'Tags', href: '/tags', icon: '🏷️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 grid grid-rows-[auto_1fr_auto]">
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
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors aria-[current=page]:bg-blue-100 aria-[current=page]:text-blue-700 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Journal MCP Server - Web Viewer
          </p>
        </div>
      </footer>
    </div>
  );
}
