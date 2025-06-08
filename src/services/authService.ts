class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private instanceUrl: string | null = null;

  // Salesforce OAuth configuration
  private readonly CLIENT_ID = '3MVG9pRzvMkjMb6lZlt3YjDQwe.hGWIN5_5yQIBB5O5zQoVOuG7h0mEOFbJKaQjF5H5qYjKkYjKkYjKkYjKkYj'; // Replace with your Connected App Consumer Key
  private readonly CLIENT_SECRET = 'your_client_secret_here'; // Replace with your Connected App Consumer Secret
  private readonly REDIRECT_URI = window.location.origin + '/auth/callback';
  private readonly SALESFORCE_LOGIN_URL = 'https://login.salesforce.com';

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && this.isTokenValid()) {
      return this.accessToken;
    }

    // Try to refresh the token
    const refreshToken = localStorage.getItem('salesforce_refresh_token');
    if (refreshToken) {
      try {
        await this.refreshAccessToken(refreshToken);
        if (this.accessToken) {
          return this.accessToken;
        }
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        // Clear invalid tokens
        this.clearTokens();
      }
    }

    // If no valid token, initiate OAuth flow
    throw new Error('Authentication required. Please login to Salesforce.');
  }

  /**
   * Initiate Salesforce OAuth flow
   */
  initiateOAuthFlow(): void {
    const state = this.generateRandomString(32);
    localStorage.setItem('oauth_state', state);

    const authUrl = new URL(`${this.SALESFORCE_LOGIN_URL}/services/oauth2/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', this.CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.set('scope', 'api refresh_token');
    authUrl.searchParams.set('state', state);

    console.log('🔐 Redirecting to Salesforce OAuth:', authUrl.toString());
    window.location.href = authUrl.toString();
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(code: string, state: string): Promise<boolean> {
    try {
      // Verify state parameter
      const storedState = localStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('/.netlify/functions/salesforce-auth/services/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          redirect_uri: this.REDIRECT_URI,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Store tokens
      this.accessToken = tokenData.access_token;
      this.instanceUrl = tokenData.instance_url;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

      localStorage.setItem('salesforce_refresh_token', tokenData.refresh_token);
      localStorage.setItem('salesforce_instance_url', tokenData.instance_url);

      console.log('✅ Salesforce authentication successful');
      return true;
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      this.clearTokens();
      return false;
    } finally {
      localStorage.removeItem('oauth_state');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(refreshToken: string): Promise<void> {
    const response = await fetch('/.netlify/functions/salesforce-auth/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
    }

    const tokenData = await response.json();
    
    this.accessToken = tokenData.access_token;
    this.instanceUrl = tokenData.instance_url || localStorage.getItem('salesforce_instance_url');
    this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

    if (tokenData.instance_url) {
      localStorage.setItem('salesforce_instance_url', tokenData.instance_url);
    }

    console.log('✅ Access token refreshed successfully');
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
    localStorage.removeItem('salesforce_refresh_token');
    localStorage.removeItem('salesforce_instance_url');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const refreshToken = localStorage.getItem('salesforce_refresh_token');
    return (this.accessToken !== null && this.isTokenValid()) || refreshToken !== null;
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
    return this.instanceUrl || localStorage.getItem('salesforce_instance_url') || 'https://agno-dev-ed.develop.my.salesforce.com';
  }

  /**
   * Make authenticated API calls to Salesforce
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    const instanceUrl = this.getInstanceUrl();

    // Construct full URL
    const fullUrl = endpoint.startsWith('http') 
      ? endpoint 
      : `/.netlify/functions/salesforce-api${endpoint}`;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    console.log('🌐 Making Salesforce API request:', fullUrl);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token might be expired, clear it and throw error
      this.clearTokens();
      throw new Error('Authentication expired. Please login again.');
    }

    return response;
  }

  /**
   * Generate random string for OAuth state
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default AuthService;