class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private instanceUrl: string | null = null;

  // Salesforce configuration - read from .env file
  private readonly CLIENT_ID = import.meta.env.VITE_SALESFORCE_CLIENT_ID;
  private readonly CLIENT_SECRET = import.meta.env.VITE_SALESFORCE_CLIENT_SECRET;
  private readonly USERNAME = import.meta.env.VITE_SALESFORCE_USERNAME;
  private readonly PASSWORD = import.meta.env.VITE_SALESFORCE_PASSWORD;
  private readonly SECURITY_TOKEN = import.meta.env.VITE_SALESFORCE_SECURITY_TOKEN;
  private readonly INSTANCE_URL = import.meta.env.VITE_SALESFORCE_INSTANCE_URL;

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
      console.log('🔧 Salesforce not configured');
      console.log('📋 Environment check:', {
        hasClientId: !!this.CLIENT_ID,
        hasClientSecret: !!this.CLIENT_SECRET,
        hasUsername: !!this.USERNAME,
        hasPassword: !!this.PASSWORD,
        hasSecurityToken: !!this.SECURITY_TOKEN,
        hasInstanceUrl: !!this.INSTANCE_URL
      });
      throw new Error('Salesforce configuration missing. Please check environment variables.');
    }

    // Try to authenticate with Salesforce
    try {
      await this.authenticateWithCredentials();
      if (this.accessToken) {
        return this.accessToken;
      }
    } catch (error) {
      console.log('⚠️ Salesforce authentication failed:', error);
      throw new Error('Unable to connect to Salesforce. Please try again later.');
    }

    throw new Error('Authentication failed. Please try again later.');
  }

  /**
   * Authenticate using username/password flow (for service accounts)
   */
  private async authenticateWithCredentials(): Promise<void> {
    try {
      console.log('🔐 Authenticating with Salesforce...');
      console.log('🌐 Using instance URL:', this.INSTANCE_URL);
      console.log('👤 Using username:', this.USERNAME);
      
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

        console.log('⚠️ Salesforce authentication failed:', errorData);
        throw new Error(`Authentication failed: ${response.status} - ${errorData.error || errorText}`);
      }

      const responseData = await response.json();
      
      this.accessToken = responseData.access_token;
      this.instanceUrl = responseData.instance_url || this.INSTANCE_URL;
      this.tokenExpiry = Date.now() + (3600 * 1000); // 1 hour default

      console.log('✅ Salesforce authentication successful');
      console.log('🏢 Instance URL:', this.instanceUrl);
    } catch (error) {
      console.log('❌ Credential authentication failed:', error);
      throw error;
    }
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
    return this.instanceUrl || this.INSTANCE_URL || 'https://localhost';
  }

  /**
   * Make authenticated API calls to Salesforce
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    try {
      const token = await this.getAccessToken();
      const instanceUrl = this.getInstanceUrl();

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

      const response = await fetch(fullUrl, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token might be expired, clear it and retry once
        this.clearTokens();
        const newToken = await this.getAccessToken();
        
        // Retry with new token
        const retryHeaders = { ...headers, 'Authorization': `Bearer ${newToken}` };
        return fetch(fullUrl, { ...options, headers: retryHeaders });
      }

      return response;
    } catch (error) {
      console.log('⚠️ Salesforce API request failed:', error);
      throw new Error('Unable to connect to Salesforce. Please try again later.');
    }
  }

  /**
   * Check if Salesforce integration is properly configured
   */
  isConfigured(): boolean {
    const configured = !!(
      this.CLIENT_ID && 
      this.CLIENT_SECRET && 
      this.USERNAME && 
      this.PASSWORD && 
      this.SECURITY_TOKEN && 
      this.INSTANCE_URL
    );
    
    if (!configured) {
      console.log('🔧 Salesforce configuration missing. Required environment variables:');
      console.log('   - VITE_SALESFORCE_CLIENT_ID:', !!this.CLIENT_ID);
      console.log('   - VITE_SALESFORCE_CLIENT_SECRET:', !!this.CLIENT_SECRET);
      console.log('   - VITE_SALESFORCE_USERNAME:', !!this.USERNAME);
      console.log('   - VITE_SALESFORCE_PASSWORD:', !!this.PASSWORD);
      console.log('   - VITE_SALESFORCE_SECURITY_TOKEN:', !!this.SECURITY_TOKEN);
      console.log('   - VITE_SALESFORCE_INSTANCE_URL:', !!this.INSTANCE_URL);
    }
    
    return configured;
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): { configured: boolean; mode: 'production' | 'error' } {
    const configured = this.isConfigured();
    return {
      configured,
      mode: configured ? 'production' : 'error'
    };
  }

  /**
   * Debug method to check environment variables
   */
  debugEnvironment(): void {
    console.log('🔍 Environment Variables Debug:');
    console.log('CLIENT_ID:', this.CLIENT_ID ? `${this.CLIENT_ID.substring(0, 10)}...` : 'NOT SET');
    console.log('CLIENT_SECRET:', this.CLIENT_SECRET ? 'SET' : 'NOT SET');
    console.log('USERNAME:', this.USERNAME || 'NOT SET');
    console.log('PASSWORD:', this.PASSWORD ? 'SET' : 'NOT SET');
    console.log('SECURITY_TOKEN:', this.SECURITY_TOKEN ? 'SET' : 'NOT SET');
    console.log('INSTANCE_URL:', this.INSTANCE_URL || 'NOT SET');
    console.log('Is Configured:', this.isConfigured());
  }
}

export default AuthService;