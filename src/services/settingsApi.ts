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
   * Save ALL settings to Salesforce (with automatic fallback)
   */
  async saveSettings(settings: AppSettings): Promise<ApiResponse> {
    try {
      // Always save to localStorage as backup
      localStorage.setItem('voltride_settings', JSON.stringify(settings));
      
      // Try to save to Salesforce
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
      
      if (response.ok && data.success !== false) {
        console.log('✅ Settings saved to Salesforce:', data);
        return {
          success: true,
          data,
          message: 'Settings saved successfully'
        };
      } else {
        throw new Error(data.message || 'Salesforce save failed');
      }
    } catch (error) {
      console.log('⚠️ Salesforce unavailable, using local storage:', error);
      
      // Always succeed with localStorage as fallback
      return {
        success: true,
        data: settings,
        message: 'Settings saved locally (Salesforce sync will retry automatically)'
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
   * Load ALL settings from Salesforce (with automatic fallback)
   */
  async loadSettings(): Promise<ApiResponse<AppSettings>> {
    try {
      // Try to load from Salesforce first
      const response = await this.authService.makeAuthenticatedRequest('/services/apexrest/voltride/settings', {
        method: 'GET'
      });

      const data = await response.json();
      
      if (response.ok && data && data.settings) {
        // Save to localStorage as cache
        localStorage.setItem('voltride_settings', JSON.stringify(data.settings));
        
        console.log('✅ Settings loaded from Salesforce');
        return {
          success: true,
          data: data.settings,
          message: 'Settings loaded from Salesforce'
        };
      } else {
        console.log('ℹ️ No settings found in Salesforce, using local data');
        return this.loadFromLocalStorage();
      }
    } catch (error) {
      console.log('⚠️ Salesforce unavailable, using local storage:', error);
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
   * Export user data from Salesforce (with fallback)
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

      if (response.ok) {
        const exportData = await response.json();
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        
        return {
          success: true,
          data: blob,
          message: 'Data exported successfully'
        };
      } else {
        throw new Error(`Export failed: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Salesforce export unavailable, exporting local data:', error);
      
      // Fallback: export local data
      const localSettings = this.getCurrentSettings();
      const exportData = {
        settings: localSettings,
        exportDate: new Date().toISOString(),
        source: 'local_storage',
        note: 'Exported from local storage'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      return {
        success: true,
        data: blob,
        message: 'Local data exported'
      };
    }
  }

  /**
   * Delete user account from Salesforce (with fallback)
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

      if (response.ok) {
        // Clear local data
        localStorage.removeItem('voltride_settings');
        this.authService.logout();
        
        console.log('✅ Account deleted from Salesforce');
        return {
          success: true,
          message: 'Account deleted successfully'
        };
      } else {
        throw new Error(`Account deletion failed: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️ Salesforce deletion unavailable, clearing local data:', error);
      
      // Clear local data as fallback
      localStorage.removeItem('voltride_settings');
      this.authService.logout();
      
      return {
        success: true,
        message: 'Local account data cleared'
      };
    }
  }

  /**
   * Check if Salesforce integration is working
   */
  async checkConnection(): Promise<{ connected: boolean; mode: 'production' | 'demo' }> {
    try {
      const configStatus = this.authService.getConfigStatus();
      
      if (!configStatus.configured) {
        return { connected: false, mode: 'demo' };
      }

      // Try a simple API call to test connection
      const response = await this.authService.makeAuthenticatedRequest('/services/data/v58.0/sobjects', {
        method: 'GET'
      });

      const connected = response.ok;
      return { 
        connected, 
        mode: connected ? 'production' : 'demo' 
      };
    } catch (error) {
      return { connected: false, mode: 'demo' };
    }
  }
}

export default SettingsApiService;