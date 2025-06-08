import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Router as RouteIcon, Settings, Car, Sparkles, ExternalLink } from 'lucide-react';

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

      {/* Floating Action Button - Bolt.new Sticker */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Pulsing background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl animate-pulse opacity-75 blur-xl scale-110"></div>
          
          {/* Main sticker container */}
          <div 
            className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-1 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group-hover:rotate-3 cursor-pointer"
            onClick={() => {
              window.open('https://bolt.new', '_blank');
            }}
          >
            {/* Inner content */}
            <div className="bg-white rounded-xl p-4 min-w-[200px]">
              {/* Bolt.new logo/icon */}
              <div className="flex items-center justify-center mb-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              
              {/* Main text */}
              <div className="text-center">
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  Built with Bolt.new
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  This entire website was created using AI-powered development
                </p>
                
                {/* Call to action */}
                <div className="flex items-center justify-center space-x-1 text-xs text-purple-600 font-medium">
                  <span>Create your own</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
                
                {/* URL */}
                <div className="text-xs text-gray-500 mt-1 font-mono">
                  bolt.new
                </div>
              </div>
            </div>
            
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-300 animate-bounce" />
            <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-pink-300 animate-pulse" />
          </div>
          
          {/* Enhanced tooltip */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl whitespace-nowrap shadow-xl max-w-xs">
              <div className="font-semibold mb-1">🚀 Built with Bolt.new!</div>
              <div className="text-xs text-gray-300">Click to create your own AI-powered website</div>
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
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