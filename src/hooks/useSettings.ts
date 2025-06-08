import { useState, useEffect, useCallback } from 'react';
import { AppSettings, ProfileData, NotificationSettings, VehicleSettings, PrivacySettings } from '../types/settings';
import SettingsApiService from '../services/settingsApi';
import AuthService from '../services/authService';

const defaultSettings: AppSettings = {
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

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const apiService = SettingsApiService.getInstance();
  const authService = AuthService.getInstance();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load from localStorage first (offline support)
      const localSettings = localStorage.getItem('voltride_settings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      }

      // Authenticate and load from Salesforce
      await authService.getAccessToken();
      const response = await apiService.loadSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
        localStorage.setItem('voltride_settings', JSON.stringify(response.data));
        console.log('✅ Settings loaded from Salesforce and cached locally');
      } else {
        console.log('ℹ️ Using local settings, Salesforce data not available');
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error('❌ Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, [apiService, authService]);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    setSaveStatus('saving');
    setError(null);

    try {
      // Update local state immediately for better UX
      const updatedSettings = {
        ...newSettings,
        lastUpdated: new Date().toISOString()
      };
      
      setSettings(updatedSettings);
      localStorage.setItem('voltride_settings', JSON.stringify(updatedSettings));

      // Authenticate and save to Salesforce
      await authService.getAccessToken();
      const response = await apiService.saveSettings(updatedSettings);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Settings saved to Salesforce successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save settings');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      console.error('❌ Error saving settings:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [apiService, authService]);

  const updateProfile = useCallback(async (profile: ProfileData) => {
    setSaveStatus('saving');
    setError(null);

    try {
      const updatedSettings = {
        ...settings,
        profile,
        lastUpdated: new Date().toISOString()
      };

      setSettings(updatedSettings);
      localStorage.setItem('voltride_settings', JSON.stringify(updatedSettings));

      await authService.getAccessToken();
      const response = await apiService.saveProfile(profile);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Profile saved to Salesforce successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save profile');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      console.error('❌ Error saving profile:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService, authService]);

  const updateNotifications = useCallback(async (notifications: NotificationSettings) => {
    setSaveStatus('saving');
    setError(null);

    try {
      const updatedSettings = {
        ...settings,
        notifications,
        lastUpdated: new Date().toISOString()
      };

      setSettings(updatedSettings);
      localStorage.setItem('voltride_settings', JSON.stringify(updatedSettings));

      await authService.getAccessToken();
      const response = await apiService.saveNotifications(notifications);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Notifications saved to Salesforce successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save notifications');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save notifications');
      console.error('❌ Error saving notifications:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService, authService]);

  const updateVehicleSettings = useCallback(async (vehicle: VehicleSettings) => {
    setSaveStatus('saving');
    setError(null);

    try {
      const updatedSettings = {
        ...settings,
        vehicle,
        lastUpdated: new Date().toISOString()
      };

      setSettings(updatedSettings);
      localStorage.setItem('voltride_settings', JSON.stringify(updatedSettings));

      await authService.getAccessToken();
      const response = await apiService.saveVehicleSettings(vehicle);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Vehicle settings saved to Salesforce successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save vehicle settings');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save vehicle settings');
      console.error('❌ Error saving vehicle settings:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService, authService]);

  const updatePrivacySettings = useCallback(async (privacy: PrivacySettings) => {
    setSaveStatus('saving');
    setError(null);

    try {
      const updatedSettings = {
        ...settings,
        privacy,
        lastUpdated: new Date().toISOString()
      };

      setSettings(updatedSettings);
      localStorage.setItem('voltride_settings', JSON.stringify(updatedSettings));

      await authService.getAccessToken();
      const response = await apiService.savePrivacySettings(privacy);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Privacy settings saved to Salesforce successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save privacy settings');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save privacy settings');
      console.error('❌ Error saving privacy settings:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService, authService]);

  const exportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.getAccessToken();
      const response = await apiService.exportUserData();
      
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `voltride-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('✅ Data exported successfully');
      } else {
        throw new Error(response.error || 'Failed to export data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      console.error('❌ Error exporting data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiService, authService]);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.getAccessToken();
      const response = await apiService.deleteAccount();
      
      if (response.success) {
        // Clear local storage
        localStorage.removeItem('voltride_settings');
        authService.logout();
        
        console.log('✅ Account deleted successfully');
        // In a real app, you would redirect to login or show success message
        alert('Account deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      console.error('❌ Error deleting account:', err);
    } finally {
      setLoading(false);
    }
  }, [apiService, authService]);

  return {
    settings,
    loading,
    error,
    saveStatus,
    loadSettings,
    saveSettings,
    updateProfile,
    updateNotifications,
    updateVehicleSettings,
    updatePrivacySettings,
    exportData,
    deleteAccount
  };
};