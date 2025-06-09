import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('voltride_session');
      const userData = localStorage.getItem('voltride_user');

      if (sessionToken && userData) {
        const user = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('❌ Auth status check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const response = await authService.makeAuthenticatedRequest('/services/apexrest/voltride/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        // Store session data
        if (data.userId) {
          localStorage.setItem('voltride_session', data.userId);
        }
        
        const user = data.user || {
          id: data.userId || '1',
          username,
          email: username,
          name: data.name || username.split('@')[0]
        };
        
        localStorage.setItem('voltride_user', JSON.stringify(user));

        setAuthState({
          isAuthenticated: true,
          user,
          loading: false
        });

        return { success: true };
      } else {
        throw new Error(data.message || data.error || 'Login failed');
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: errorMessage };
    }
  }, [authService]);

  const logout = useCallback(async () => {
    try {
      // Clear local storage
      localStorage.removeItem('voltride_session');
      localStorage.removeItem('voltride_user');
      
      // Clear auth service tokens
      authService.logout();

      // Update state
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });

      // Redirect to login
      navigate('/login');
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }, [authService, navigate]);

  const refreshAuth = useCallback(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    refreshAuth
  };
};