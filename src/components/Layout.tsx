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

  const BoltAttribution = ({ isMobile = false }: { isMobile?: boolean }) => {
    if (isMobile) {
      // Mobile version - compact in header
      return (
        <div className="relative group">
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center space-x-2 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-3 py-2"
          >
            <div className="relative">
              <img 
                src="/black_circle_360x360.png" 
                alt="Bolt.new" 
                className="w-6 h-6 rounded-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </div>
            <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </a>
          
          {/* Mobile tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
              <div className="font-semibold">🚀 Create your own with AI</div>
              <div className="text-gray-300 mt-1">Click to visit Bolt.new</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      );
    }

    // Desktop version - hover to expand
    return (
      <div className="relative group">
        {/* Pulsing background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl animate-pulse opacity-75 blur-xl scale-110 group-hover:opacity-90 transition-opacity duration-500"></div>
        
        {/* Main container with hover expansion */}
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-1 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 group-hover:rotate-3 cursor-pointer block overflow-hidden"
        >
          {/* Inner content container */}
          <div className="bg-white rounded-xl transition-all duration-500 ease-out group-hover:min-w-[240px] min-w-[60px] h-[60px] group-hover:h-auto">
            {/* Always visible: Bolt.new logo */}
            <div className="flex items-center p-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg flex-shrink-0">
                <img 
                  src="/black_circle_360x360.png" 
                  alt="Bolt.new" 
                  className="h-6 w-6 rounded-full"
                />
              </div>
              
              {/* Expandable content - slides in from right */}
              <div className="ml-3 overflow-hidden transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[200px]">
                <div className="whitespace-nowrap">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">
                    Built with Bolt.new
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    AI-powered development platform
                  </p>
                  
                  {/* Call to action with icon */}
                  <div className="flex items-center space-x-1 text-xs text-purple-600 font-medium">
                    <span>Create your own</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional expandable content */}
            <div className="px-3 pb-3 overflow-hidden transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-[50px]">
              <div className="text-xs text-gray-500 font-mono border-t border-gray-100 pt-2">
                bolt.new
              </div>
            </div>
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-2 -right-2 h-5 w-5 text-yellow-300 animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
            ✨
          </div>
          <div className="absolute -bottom-1 -left-1 h-3 w-3 text-pink-300 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-400">
            ✨
          </div>
        </a>
        
        {/* Enhanced tooltip that appears above */}
        <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-500 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
          <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl whitespace-nowrap shadow-xl max-w-xs">
            <div className="font-semibold mb-1">🚀 Built with Bolt.new!</div>
            <div className="text-xs text-gray-300">Click to create your own AI-powered website</div>
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    );
  };

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
            
            {/* Desktop Navigation */}
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

            {/* Mobile Bolt Attribution - Right side of header */}
            <div className="md:hidden">
              <BoltAttribution isMobile={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Desktop Bolt.new Attribution - Bottom right with hover expansion */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <BoltAttribution isMobile={false} />
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