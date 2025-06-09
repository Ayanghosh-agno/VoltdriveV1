import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Attempting login with:', { username: formData.username });
      
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        console.log('✅ Login successful');
        setSuccess(true);
        
        // Redirect to the page they were trying to access, or home
        const from = location.state?.from?.pathname || '/';
        
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading if checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">VoltRide</h2>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to VoltRide!</h2>
            <p className="text-gray-600">Login successful. Redirecting to dashboard...</p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative">
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

      {/* Mobile Bolt.new Attribution - 60px x 60px */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
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
            style={{ width: '60px', height: '60px', minWidth: '60px', minHeight: '60px' }}
          />
        </a>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 lg:p-12 flex flex-col justify-center text-white">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">VoltRide</h1>
                  <p className="text-blue-100 text-sm">Smart Driving Analytics</p>
                </div>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Drive Smarter,
                <br />
                <span className="text-blue-200">Save More</span>
              </h2>
              
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Transform your driving experience with real-time analytics, 
                fuel efficiency insights, and personalized safety recommendations.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Real-time OBD-II monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">AI-powered driving insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-blue-100">Fuel efficiency optimization</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                <p className="text-gray-600">Sign in to access your driving dashboard</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Login Failed</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username / Email
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your username or email"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your password"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.username || !formData.password}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Additional Options */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;