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
  const [needsAuth, setNeedsAuth] = useState(false);

  const apiService = SettingsApiService.getInstance();
  const authService = AuthService.getInstance();

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    setLoading(true);
    try {
      const success = await authService.handleOAuthCallback(code, state);
      if (success) {
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        // Load settings after successful authentication
        await loadSettings();
        setNeedsAuth(false);
      } else {
        setError('Authentication failed');
        setNeedsAuth(true);
      }
    } catch (err) {
      setError('Authentication error');
      setNeedsAuth(true);
    } finally {
      setLoading(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to load from localStorage first (for immediate UI)
      const localSettings = localStorage.getItem('voltride_settings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      }

      // Check if we need authentication
      if (apiService.needsAuthentication()) {
        setNeedsAuth(true);
        console.log('ℹ️ Salesforce authentication required');
        setLoading(false);
        return;
      }

      // Try to load from Salesforce
      const response = await apiService.loadSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
        setNeedsAuth(false);
        console.log('✅ Settings loaded from Salesforce');
      } else if (response.error === 'Authentication required') {
        setNeedsAuth(true);
        console.log('🔐 Authentication required for Salesforce');
      } else {
        console.log('ℹ️ Using local settings, Salesforce data not available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication')) {
        setNeedsAuth(true);
      }
      
      console.error('❌ Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, [apiService]);

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

      // Try to save to Salesforce
      const response = await apiService.saveSettings(updatedSettings);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Settings saved successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save settings');
      }
    } catch (err) {
      setSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication')) {
        setNeedsAuth(true);
      }
      
      console.error('❌ Error saving settings:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [apiService]);

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

      const response = await apiService.saveProfile(profile);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Profile saved successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save profile');
      }
    } catch (err) {
      setSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication')) {
        setNeedsAuth(true);
      }
      
      console.error('❌ Error saving profile:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService]);

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

      const response = await apiService.saveNotifications(notifications);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Notifications saved successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save notifications');
      }
    } catch (err) {
      setSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to save notifications';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication')) {
        setNeedsAuth(true);
      }
      
      console.error('❌ Error saving notifications:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService]);

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

      const response = await apiService.saveVehicleSettings(vehicle);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Vehicle settings saved successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save vehicle settings');
      }
    } catch (err) {
      setSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to save vehicle settings';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication')) {
        setNeedsAuth(true);
      }
      
      console.error('❌ Error saving vehicle settings:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService]);

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

      const response = await apiService.savePrivacySettings(privacy);
      
      if (response.success) {
        setSaveStatus('success');
        console.log('✅ Privacy settings saved successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save privacy settings');
      }
    } catch (err) {
      setSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to save privacy settings';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication')) {
        setNeedsAuth(true);
      }
      
      console.error('❌ Error saving privacy settings:', err);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings, apiService]);

  const exportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to export data';
      setError(errorMessage);
      
      if (errorMessage.includes('Authentication')) {
        setNeedsAuth(true);
      }
      
      console.error('❌ Error exporting data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.deleteAccount();
      
      if (response.success) {
        // Clear local storage
        localStorage.removeItem('voltride_settings');
        authService.logout();
        
        console.log('✅ Account deleted successfully');
        alert('Account deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
      console.error('❌ Error deleting account:', err);
    } finally {
      setLoading(false);
    }
  }, [apiService, authService]);

  const loginToSalesforce = useCallback(() => {
    apiService.initiateLogin();
  }, [apiService]);

  return {
    settings,
    loading,
    error,
    saveStatus,
    needsAuth,
    loadSettings,
    saveSettings,
    updateProfile,
    updateNotifications,
    updateVehicleSettings,
    updatePrivacySettings,
    exportData,
    deleteAccount,
    loginToSalesforce
  };
};