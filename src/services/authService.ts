class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Get a valid access token, using mock authentication for demo
   */
  async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && this.isTokenValid()) {
      return this.accessToken;
    }

    // Generate a new mock token
    return this.generateMockToken();
  }

  /**
   * Generate mock token for demo purposes
   */
  private generateMockToken(): string {
    console.log('🎭 Using mock authentication token for demo');
    this.accessToken = 'mock_token_' + Date.now();
    this.tokenExpiry = Date.now() + (2 * 60 * 60 * 1000); // 2 hours from now
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
   * Make a mock API call that simulates Salesforce responses
   */
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();

    console.log('🎭 Simulating API response for demo:', endpoint);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const mockData = {
      success: true,
      message: 'Demo mode - data saved locally',
      timestamp: new Date().toISOString()
    };

    if (endpoint.includes('/settings') && options.method === 'GET') {
      // Return stored settings from localStorage
      const storedSettings = localStorage.getItem('voltride_settings');
      if (storedSettings) {
        try {
          const settings = JSON.parse(storedSettings);
          return new Response(JSON.stringify({
            success: true,
            settings: settings,
            message: 'Settings loaded from local storage'
          }), {
            status: 200,
            statusText: 'OK',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          console.error('Error parsing stored settings:', error);
        }
      }
      
      // Return empty settings if nothing stored
      return new Response(JSON.stringify({
        success: true,
        settings: null,
        message: 'No settings found'
      }), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // For all other endpoints, return success
    return new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default AuthService;