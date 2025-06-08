class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private instanceUrl: string | null = null;
  
  // Salesforce Connected App credentials
  private readonly clientId = '3MVG9fe4g9fhX0E6I0IL2LpTgkNMtShba51BMKMLsyvX.tOozarG7g0BMNFybKFFiDJWRUELWvJ7mh7BaTFE9';
  private readonly clientSecret = '65690DF080FF25DD1D763E478E4BDB0EF47FDA4D2B93B49E55C802BB919EA695';
  private readonly username = 'ayanghosh@agno.com';
  private readonly password = 'WatsonXAiRagChallenge123bfV1akLcTBqBnJsbWaM3u9svf';
  
  // Use Netlify Functions for both development and production
  private readonly loginUrl = '/salesforce-auth';
  private readonly apiBaseUrl = '/salesforce-api';

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get a valid access token
   */
  async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && this.isTokenValid()) {
      return this.accessToken;
    }

    // Otherwise, get a new token from Salesforce
    return this.refreshAccessToken();
  }

  /**
   * Authenticate with Salesforce using OAuth 2.0 Username-Password flow
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      console.log('🔐 Authenticating with Salesforce...');
      console.log('Using login URL:', this.loginUrl);
      console.log('Username:', this.username);
      
      const tokenUrl = `${this.loginUrl}/services/oauth2/token`;
      console.log('Token URL:', tokenUrl);
      
      const body = new URLSearchParams({
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: this.username,
        password: this.password,
      });

      console.log('Making authentication request...');
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: body,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Salesforce authentication failed:', response.status, responseText);
        
        // Try to parse error response
        try {
          const errorData = JSON.parse(responseText);
          console.error('Error details:', errorData);
          throw new Error(`Authentication failed: ${errorData.error_description || errorData.error || responseText}`);
        } catch (parseError) {
          throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${responseText}`);
        }
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse authentication response:', parseError);
        throw new Error('Invalid response format from Salesforce');
      }
      
      this.accessToken = data.access_token;
      // Always use the API base URL for consistency
      this.instanceUrl = this.apiBaseUrl;
      this.tokenExpiry = Date.now() + ((data.expires_in || 3600) * 1000); // Convert to milliseconds
      
      console.log('✅ Successfully authenticated with Salesforce');
      console.log('Instance URL:', this.instanceUrl);
      console.log('Token expires in:', data.expires_in, 'seconds');
      
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to authenticate with Salesforce:', error);
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
   * Make an authenticated request to Salesforce
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    
    if (!this.instanceUrl) {
      throw new Error('No Salesforce instance URL available. Please authenticate first.');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    const salesforceUrl = `${this.instanceUrl}${endpoint}`;
    
    console.log('🌐 Making Salesforce API request to:', salesforceUrl);
    
    const response = await fetch(salesforceUrl, {
      ...options,
      headers,
    });

    console.log('API Response status:', response.status);

    if (response.status === 401) {
      // Token might be expired, try to refresh and retry once
      console.log('🔄 Token expired, refreshing...');
      this.clearTokens();
      const newToken = await this.getAccessToken();
      
      return fetch(salesforceUrl, {
        ...options,
        headers: {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        },
      });
    }

    return response;
  }

  /**
   * Get Salesforce instance URL
   */
  getInstanceUrl(): string | null {
    return this.instanceUrl;
  }

  /**
   * Test the authentication by making a simple API call
   */
  async testAuthentication(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('/services/data/v58.0/');
      return response.ok;
    } catch (error) {
      console.error('❌ Authentication test failed:', error);
      return false;
    }
  }
}

export default AuthService;