import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Router as RouteIcon, Settings, Car, ExternalLink } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/trips', label: 'All Trips', icon: RouteIcon },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  VoltRide
                </h1>
                <p className="text-xs text-gray-500">Smart Driving Analytics</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:scale-105'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bolt.new Attribution */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
          
          {/* Main attribution button */}
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center space-x-3 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            {/* Bolt.new logo */}
            <div className="relative">
              <img 
                src="/black_circle_360x360.png" 
                alt="Bolt.new" 
                className="w-8 h-8 rounded-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
            
            {/* Text content */}
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  Built with Bolt.new
                </div>
                <div className="text-xs text-gray-600 group-hover:text-purple-600 transition-colors">
                  AI-powered development
                </div>
              </div>
              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </a>
          
          {/* Enhanced tooltip */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
              <div className="font-semibold">🚀 Create your own with AI</div>
              <div className="text-gray-300 mt-1">Click to visit Bolt.new</div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;