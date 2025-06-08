import { AppSettings, ApiResponse } from '../types/settings';
import AuthService from './authService';

class SettingsApiService {
  private static instance: SettingsApiService;
  private authService: AuthService;
  
  constructor() {
    this.authService = AuthService.getInstance();
  }
  
  public static getInstance(): SettingsApiService {
    if (!SettingsApiService.instance) {
      SettingsApiService.instance = new SettingsApiService();
    }
    return SettingsApiService.instance;
  }

  /**
   * Save ALL settings to Salesforce
   */
  async saveSettings(settings: AppSettings): Promise<ApiResponse> {
    try {
      // Always save to localStorage as backup
      localStorage.setItem('voltride_settings', JSON.stringify(settings));
      
      // Save to Salesforce
      const response = await this.authService.makeAuthenticatedRequest('/services/apexrest/voltride/settings', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: settings.profile.email,
          profile: settings.profile,
          notifications: settings.notifications,
          vehicle: settings.vehicle,
          privacy: settings.privacy,
          metadata: {
            lastUpdated: settings.lastUpdated,
            version: settings.version,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Salesforce API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Settings saved to Salesforce:', data);
      
      return {
        success: true,
        data,
        message: 'Settings saved to Salesforce successfully'
      };
    } catch (error) {
      console.error('❌ Error saving settings to Salesforce:', error);
      
      // Fallback to localStorage
      localStorage.setItem('voltride_settings', JSON.stringify(settings));
      
      return {
        success: true,
        data: settings,
        message: 'Settings saved locally (Salesforce unavailable)',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Individual save methods - all use the consolidated API
   */
  async saveProfile(profile: AppSettings['profile']): Promise<ApiResponse> {
    const currentSettings = this.getCurrentSettings();
    const updatedSettings = {
      ...currentSettings,
      profile,
      lastUpdated: new Date().toISOString()
    };
    
    return this.saveSettings(updatedSettings);
  }

  async saveNotifications(notifications: AppSettings['notifications']): Promise<ApiResponse> {
    const currentSettings = this.getCurrentSettings();
    const updatedSettings = {
      ...currentSettings,
      notifications,
      lastUpdated: new Date().toISOString()
    };
    
    return this.saveSettings(updatedSettings);
  }

  async saveVehicleSettings(vehicle: AppSettings['vehicle']): Promise<ApiResponse> {
    const currentSettings = this.getCurrentSettings();
    const updatedSettings = {
      ...currentSettings,
      vehicle,
      lastUpdated: new Date().toISOString()
    };
    
    return this.saveSettings(updatedSettings);
  }

  async savePrivacySettings(privacy: AppSettings['privacy']): Promise<ApiResponse> {
    const currentSettings = this.getCurrentSettings();
    const updatedSettings = {
      ...currentSettings,
      privacy,
      lastUpdated: new Date().toISOString()
    };
    
    return this.saveSettings(updatedSettings);
  }

  /**
   * Load ALL settings from Salesforce
   */
  async loadSettings(): Promise<ApiResponse<AppSettings>> {
    try {
      // Try to load from Salesforce first
      const response = await this.authService.makeAuthenticatedRequest('/services/apexrest/voltride/settings', {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Salesforce API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data && data.settings) {
        // Save to localStorage as cache
        localStorage.setItem('voltride_settings', JSON.stringify(data.settings));
        
        console.log('✅ Settings loaded from Salesforce');
        return {
          success: true,
          data: data.settings,
          message: 'Settings loaded from Salesforce successfully'
        };
      } else {
        console.log('ℹ️ No settings found in Salesforce, using local data');
        return this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ Error loading settings from Salesforce:', error);
      
      // If it's an authentication error, we should prompt for login
      if (error instanceof Error && error.message.includes('Authentication')) {
        return {
          success: false,
          error: 'Authentication required',
          message: 'Please login to Salesforce to sync your settings'
        };
      }
      
      // For other errors, fallback to localStorage
      return this.loadFromLocalStorage();
    }
  }

  /**
   * Load settings from localStorage as fallback
   */
  private loadFromLocalStorage(): ApiResponse<AppSettings> {
    const stored = localStorage.getItem('voltride_settings');
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        return {
          success: true,
          data: settings,
          message: 'Settings loaded from local storage'
        };
      } catch (error) {
        console.error('❌ Error parsing stored settings:', error);
      }
    }
    
    return {
      success: false,
      error: 'No settings found'
    };
  }

  /**
   * Helper method to get current settings from localStorage
   */
  private getCurrentSettings(): AppSettings {
    const stored = localStorage.getItem('voltride_settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('❌ Error parsing stored settings:', error);
      }
    }
    
    // Return default settings if nothing stored
    return {
      profile: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+91 98765 43210',
        address: '123 Main Street, Mumbai, Maharashtra 400001',
        dateOfBirth: '1990-05-15',
        licenseNumber: 'MH1234567890'
      },
      notifications: {
        tripSummary: true,
        safetyAlerts: true,
        fuelEfficiency: false,
        maintenance: true,
        weeklyReport: true
      },
      vehicle: {
        makeModel: 'Honda Accord 2021',
        fuelType: 'Petrol',
        engineSize: '2.4',
        coldStartThreshold: '15',
        tripCooldownTime: '5',
        aggressiveThrottleThreshold: '75',
        harshAccelThreshold: '3.5',
        harshBrakeThreshold: '4.0',
        averageMileage: '15.5',
        revThreshold: '3500',
        speedThreshold: '80'
      },
      privacy: {
        dataSharing: false,
        locationHistory: true
      },
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Export user data from Salesforce
   */
  async exportUserData(): Promise<ApiResponse<Blob>> {
    try {
      const response = await this.authService.makeAuthenticatedRequest('/services/apexrest/voltride/export', {
        method: 'POST',
        body: JSON.stringify({
          exportType: 'complete',
          format: 'json',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const exportData = await response.json();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      return {
        success: true,
        data: blob,
        message: 'Data exported from Salesforce successfully'
      };
    } catch (error) {
      console.error('❌ Error exporting data from Salesforce:', error);
      
      // Fallback: export local data
      const localSettings = this.getCurrentSettings();
      const exportData = {
        settings: localSettings,
        exportDate: new Date().toISOString(),
        source: 'local_storage',
        note: 'Exported from local storage due to Salesforce connection issue'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      return {
        success: true,
        data: blob,
        message: 'Local data exported (Salesforce unavailable)'
      };
    }
  }

  /**
   * Delete user account from Salesforce
   */
  async deleteAccount(): Promise<ApiResponse> {
    try {
      const response = await this.authService.makeAuthenticatedRequest('/services/apexrest/voltride/account', {
        method: 'DELETE',
        body: JSON.stringify({
          confirmDeletion: true,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Account deletion failed: ${response.status}`);
      }

      // Clear local data
      localStorage.removeItem('voltride_settings');
      this.authService.logout();
      
      console.log('✅ Account deleted from Salesforce');
      return {
        success: true,
        message: 'Account deleted from Salesforce successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting account from Salesforce:', error);
      
      // Clear local data as fallback
      localStorage.removeItem('voltride_settings');
      this.authService.logout();
      
      return {
        success: true,
        message: 'Local account data cleared (Salesforce deletion may have failed)',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if user needs to authenticate with Salesforce
   */
  needsAuthentication(): boolean {
    return !this.authService.isAuthenticated();
  }

  /**
   * Initiate Salesforce login
   */
  initiateLogin(): void {
    this.authService.initiateOAuthFlow();
  }
}

export default SettingsApiService;