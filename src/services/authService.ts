class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private instanceUrl: string | null = null;

  // Salesforce configuration - these will be set via environment variables
  private readonly CLIENT_ID = import.meta.env.VITE_SALESFORCE_CLIENT_ID || 'default_client_id';
  private readonly CLIENT_SECRET = import.meta.env.VITE_SALESFORCE_CLIENT_SECRET || 'default_client_secret';
  private readonly USERNAME = import.meta.env.VITE_SALESFORCE_USERNAME || 'default_username';
  private readonly PASSWORD = import.meta.env.VITE_SALESFORCE_PASSWORD || 'default_password';
  private readonly SECURITY_TOKEN = import.meta.env.VITE_SALESFORCE_SECURITY_TOKEN || 'default_token';
  private readonly INSTANCE_URL = import.meta.env.VITE_SALESFORCE_INSTANCE_URL || 'https://agno-dev-ed.develop.my.salesforce.com';

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopment(): boolean {
    return import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  /**
   * Get the appropriate base URL for API calls
   */
  private getApiBaseUrl(): string {
    if (this.isDevelopment()) {
      // In development, use Netlify Dev proxy
      return '';
    } else {
      // In production, use the deployed Netlify functions
      return '';
    }
  }

  /**
   * Get a valid access token, automatically authenticating if needed
   */
  async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && this.isTokenValid()) {
      return this.accessToken;
    }

    // Check if Salesforce is configured
    if (!this.isConfigured()) {
      console.log('🔧 Salesforce not configured, using local storage mode');
      return this.generateLocalToken();
    }

    // Try to authenticate with Salesforce
    try {
      await this.authenticateWithCredentials();
      if (this.accessToken) {
        return this.accessToken;
      }
    } catch (error) {
      console.log('⚠️ Salesforce authentication failed, using local storage mode:', error);
      return this.generateLocalToken();
    }

    // Fallback to local storage mode
    return this.generateLocalToken();
  }

  /**
   * Authenticate using username/password flow (for service accounts)
   */
  private async authenticateWithCredentials(): Promise<void> {
    try {
      console.log('🔐 Authenticating with Salesforce...');
      
      // Always use the Netlify function proxy for authentication
      const baseUrl = this.getApiBaseUrl();
      const authUrl = `${baseUrl}/salesforce-auth/services/oauth2/token`;
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          username: this.USERNAME,
          password: this.PASSWORD + this.SECURITY_TOKEN, // Password + Security Token
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        // Check if this is a demo mode response
        if (errorData.mode === 'demo') {
          console.log('🔄 Demo mode detected from auth response');
          throw new Error('Demo mode - Salesforce not configured');
        }

        console.log('⚠️ Salesforce authentication failed:', errorData);
        throw new Error(`Authentication failed: ${response.status} - ${errorData.error || errorText}`);
      }

      const responseData = await response.json();
      
      // Check if this is a demo mode response
      if (responseData.mode === 'demo') {
        console.log('🔄 Demo mode detected from auth response');
        throw new Error('Demo mode - Salesforce not configured');
      }
      
      this.accessToken = responseData.access_token;
      this.instanceUrl = responseData.instance_url || this.INSTANCE_URL;
      this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour default

      console.log('✅ Salesforce authentication successful');
    } catch (error) {
      console.log('❌ Credential authentication failed:', error);
      throw error;
    }
  }

  /**
   * Generate local token for local storage mode when Salesforce is unavailable
   */
  private generateLocalToken(): string {
    console.log('💾 Using local storage mode - Salesforce integration unavailable');
    this.accessToken = 'demo_token_' + Date.now();
    this.tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
    this.instanceUrl = this.INSTANCE_URL;
    return this.accessToken;
  }

  /**
   * Check if the current token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.tokenExpiry) return false;
    // Consider token invalid if it expires in the next 5 minutes
    return Date.now() < (this.tokenExpiry - 5 * 60 * 1000);
  }

  /**
   * Clear all stored tokens and session data
   */
  clearTokens(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.instanceUrl = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.isTokenValid();
  }

  /**
   * Logout and clear all authentication data
   */
  logout(): void {
    this.clearTokens();
    console.log('🔓 User logged out');
  }

  /**
   * Get the Salesforce instance URL
   */
  getInstanceUrl(): string {
    return this.instanceUrl || this.INSTANCE_URL;
  }

  /**
   * Make authenticated API calls to Salesforce
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    const instanceUrl = this.getInstanceUrl();

    // Check if we're in local storage mode
    if (token.startsWith('demo_token_')) {
      return this.makeLocalRequest(endpoint, options);
    }

    // Always use Netlify function proxy for API calls
    const baseUrl = this.getApiBaseUrl();
    const fullUrl = `${baseUrl}/salesforce-api${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Salesforce-Instance': instanceUrl,
      ...options.headers,
    };

    console.log(`🌐 Making Salesforce API request: ${fullUrl}`);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token might be expired, clear it and retry once
        this.clearTokens();
        const newToken = await this.getAccessToken();
        
        if (!newToken.startsWith('demo_token_')) {
          // Retry with new token
          const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
          return fetch(fullUrl, { ...options, headers: retryHeaders });
        }
      }

      return response;
    } catch (error) {
      console.log('⚠️ Salesforce API request failed, falling back to local storage mode:', error);
      return this.makeLocalRequest(endpoint, options);
    }
  }

  /**
   * Make local API requests when Salesforce is unavailable
   */
  private async makeLocalRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    console.log('💾 Local storage mode API request:', endpoint);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    let mockData: any = {
      success: true,
      message: 'Local storage mode - data saved locally',
      timestamp: new Date().toISOString()
    };

    if (endpoint.includes('/settings') && options.method === 'GET') {
      // Return stored settings from localStorage
      const storedSettings = localStorage.getItem('voltride_settings');
      if (storedSettings) {
        try {
          const settings = JSON.parse(storedSettings);
          mockData = {
            success: true,
            settings: settings,
            message: 'Settings loaded from local storage'
          };
        } catch (error) {
          console.error('Error parsing stored settings:', error);
        }
      } else {
        mockData = {
          success: true,
          settings: null,
          message: 'No settings found'
        };
      }
    }

    return new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check if Salesforce integration is properly configured
   */
  isConfigured(): boolean {
    return this.CLIENT_ID !== 'default_client_id' && 
           this.CLIENT_SECRET !== 'default_client_secret' &&
           this.USERNAME !== 'default_username' &&
           this.PASSWORD !== 'default_password';
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): { configured: boolean; mode: 'production' | 'demo' } {
    const configured = this.isConfigured();
    return {
      configured,
      mode: configured ? 'production' : 'demo'
    };
  }
}

export default AuthService;