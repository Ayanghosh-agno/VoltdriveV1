import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import AuthService from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const authService = AuthService.getInstance();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if user has valid session
      const sessionToken = localStorage.getItem('voltride_session');
      const userData = localStorage.getItem('voltride_user');
      
      if (!sessionToken || !userData) {
        console.log('🔒 No session found, redirecting to login');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify session is still valid by making a test API call
      try {
        const response = await authService.makeAuthenticatedRequest('/services/data/v58.0/sobjects', {
          method: 'GET'
        });

        if (response.ok) {
          console.log('✅ Session is valid');
          setIsAuthenticated(true);
        } else {
          console.log('❌ Session expired, clearing storage');
          localStorage.removeItem('voltride_session');
          localStorage.removeItem('voltride_user');
          authService.logout();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log('⚠️ Session validation failed:', error);
        // If we can't validate, assume authenticated if we have tokens
        // This handles offline scenarios
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-white/20 text-center">
          <div className="mb-4">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Access</h3>
            <p className="text-gray-600 text-sm">Checking your authentication status...</p>
          </div>
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;