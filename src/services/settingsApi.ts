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

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Settings saved to Salesforce successfully:', data);
      
      return {
        success: true,
        data,
        message: 'Settings saved to Salesforce successfully'
      };
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      
      // Fallback to localStorage (already done above)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save to Salesforce',
        data: settings,
        message: 'Settings saved locally (Salesforce unavailable)'
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
      const response = await this.authService.makeAuthenticatedRequest('/services/apexrest/voltride/settings', {
        method: 'GET'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to load settings: ${response.status} ${response.statusText}`);
      }
      
      if (data && data.settings) {
        // Save to localStorage for offline access
        localStorage.setItem('voltride_settings', JSON.stringify(data.settings));
        
        console.log('✅ Settings loaded from Salesforce successfully');
        return {
          success: true,
          data: data.settings,
          message: 'Settings loaded from Salesforce successfully'
        };
      } else {
        console.log('ℹ️ No settings found in Salesforce, using local fallback');
        return this.loadFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ Error loading settings from Salesforce:', error);
      
      // Fallback to localStorage
      const localResult = this.loadFromLocalStorage();
      if (localResult.success) {
        return {
          ...localResult,
          message: 'Loaded from local storage (Salesforce unavailable)'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load settings'
      };
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
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      return {
        success: true,
        data: blob,
        message: 'Data exported from Salesforce successfully'
      };
    } catch (error) {
      console.error('❌ Error exporting data from Salesforce:', error);
      
      // Fallback: export local data
      return this.exportLocalData();
    }
  }

  /**
   * Export local data as fallback
   */
  private exportLocalData(): ApiResponse<Blob> {
    const localSettings = this.getCurrentSettings();
    const exportData = {
      settings: localSettings,
      exportDate: new Date().toISOString(),
      source: 'local_storage',
      note: 'Exported from local storage (Salesforce unavailable)'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    
    return {
      success: true,
      data: blob,
      message: 'Local data exported successfully'
    };
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
        throw new Error(`Account deletion failed: ${response.status} ${response.statusText}`);
      }

      // Clear local data
      localStorage.removeItem('voltride_settings');
      this.authService.logout();
      
      console.log('✅ Account deleted from Salesforce successfully');
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
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete from Salesforce',
        message: 'Local account data cleared (Salesforce deletion failed)'
      };
    }
  }
}

export default SettingsApiService;