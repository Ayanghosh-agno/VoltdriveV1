import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Router as RouteIcon, Settings, Car } from 'lucide-react';
import { useModal } from '../context/ModalContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAnyModalOpen } = useModal();

  console.log('🔍 Layout render - isAnyModalOpen:', isAnyModalOpen);

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

            {/* Mobile Bolt Attribution - 50px x 50px */}
            <div className="md:hidden">
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img 
                  src="/black_circle_360x360.png" 
                  alt="Bolt.new" 
                  className="rounded-full hover:scale-110 transition-transform duration-200"
                  style={{ width: '50px', height: '50px', minWidth: '50px', minHeight: '50px' }}
                />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Desktop Bolt.new Attribution - 90px x 90px */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50">
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src="/black_circle_360x360.png" 
            alt="Bolt.new" 
            className="rounded-full hover:scale-110 transition-transform duration-200 shadow-lg"
            style={{ width: '90px', height: '90px', minWidth: '90px', minHeight: '90px' }}
          />
        </a>
      </div>

      {/* Mobile Navigation - Hidden when modal is open */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-white/20 z-50 transition-transform duration-300 ${
        isAnyModalOpen ? 'transform translate-y-full' : 'transform translate-y-0'
      }`}>
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