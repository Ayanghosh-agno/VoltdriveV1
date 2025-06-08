import React, { useState } from 'react';
import { User, Bell, Shield, Car, Smartphone, HelpCircle, LogOut, Edit3, Save, X, Download, Trash2, Cloud, CloudOff } from 'lucide-react';
import SettingSection from '../components/SettingSection';
import ToggleSwitch from '../components/ToggleSwitch';
import EditProfileModal from '../components/EditProfileModal';
import SaveStatusIndicator from '../components/SaveStatusIndicator';
import { useSettings } from '../hooks/useSettings';
import { VehicleSettings } from '../types/settings';

const SettingsPage: React.FC = () => {
  const {
    settings,
    loading,
    error,
    saveStatus,
    connectionStatus,
    updateProfile,
    updateNotifications,
    updateVehicleSettings,
    updatePrivacySettings,
    exportData,
    deleteAccount
  } = useSettings();

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [tempVehicleSettings, setTempVehicleSettings] = useState<VehicleSettings>(settings.vehicle);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = { ...settings.notifications, [key]: value };
    await updateNotifications(updatedNotifications);
  };

  const handlePrivacyChange = async (key: string, value: boolean) => {
    const updatedPrivacy = { ...settings.privacy, [key]: value };
    await updatePrivacySettings(updatedPrivacy);
  };

  const handleVehicleSettingChange = (key: string, value: string) => {
    setTempVehicleSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEditVehicle = () => {
    setTempVehicleSettings(settings.vehicle);
    setIsEditingVehicle(true);
  };

  const handleSaveVehicle = async () => {
    await updateVehicleSettings(tempVehicleSettings);
    setIsEditingVehicle(false);
  };

  const handleCancelVehicle = () => {
    setTempVehicleSettings(settings.vehicle);
    setIsEditingVehicle(false);
  };

  const handleProfileSave = async (newProfileData: any) => {
    await updateProfile(newProfileData);
  };

  const handleExportData = async () => {
    await exportData();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await deleteAccount();
    }
    setShowDeleteConfirm(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Save Status Indicator */}
      <SaveStatusIndicator status={saveStatus} error={error} />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Customize your VoltRide experience</p>
            {settings.lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(settings.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <SettingSection icon={User} title="Profile" description="Manage your account information">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{getInitials(settings.profile.name)}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{settings.profile.name}</h3>
              <p className="text-gray-600">{settings.profile.email}</p>
              {settings.profile.phone && (
                <p className="text-sm text-gray-500">{settings.profile.phone}</p>
              )}
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="text-blue-600 text-sm hover:text-blue-700 transition-colors mt-1"
              >
                Edit Profile
              </button>
            </div>
          </div>
          
          {/* Additional Profile Info */}
          {(settings.profile.address || settings.profile.licenseNumber) && (
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {settings.profile.address && (
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <div className="font-medium text-gray-900">{settings.profile.address}</div>
                  </div>
                )}
                {settings.profile.licenseNumber && (
                  <div>
                    <span className="text-gray-600">License:</span>
                    <div className="font-medium text-gray-900">{settings.profile.licenseNumber}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={Bell} title="Notifications" description="Control what notifications you receive">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Trip Summary</h4>
              <p className="text-sm text-gray-600">Get notified after each trip</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.tripSummary}
              onChange={(value) => handleNotificationChange('tripSummary', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Safety Alerts</h4>
              <p className="text-sm text-gray-600">Receive alerts for driving events</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.safetyAlerts}
              onChange={(value) => handleNotificationChange('safetyAlerts', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Fuel Efficiency Tips</h4>
              <p className="text-sm text-gray-600">Get personalized fuel saving tips</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.fuelEfficiency}
              onChange={(value) => handleNotificationChange('fuelEfficiency', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Maintenance Reminders</h4>
              <p className="text-sm text-gray-600">Vehicle maintenance notifications</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.maintenance}
              onChange={(value) => handleNotificationChange('maintenance', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Report</h4>
              <p className="text-sm text-gray-600">Weekly driving performance summary</p>
            </div>
            <ToggleSwitch
              enabled={settings.notifications.weeklyReport}
              onChange={(value) => handleNotificationChange('weeklyReport', value)}
            />
          </div>
        </div>
      </SettingSection>

      {/* Vehicle Settings */}
      <SettingSection icon={Car} title="Vehicle Settings" description="Configure your vehicle information and thresholds">
        <div className="space-y-4">
          {/* Header with Edit/Save/Cancel buttons */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Vehicle Configuration</h4>
            {!isEditingVehicle ? (
              <button
                onClick={handleEditVehicle}
                className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveVehicle}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelVehicle}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>

          {/* Vehicle Settings Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Make & Model</label>
              {isEditingVehicle ? (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.makeModel}
                  onChange={(e) => handleVehicleSettingChange('makeModel', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.makeModel}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
              {isEditingVehicle ? (
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.fuelType}
                  onChange={(e) => handleVehicleSettingChange('fuelType', e.target.value)}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                </select>
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.fuelType}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Engine Size (L)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.engineSize}
                  onChange={(e) => handleVehicleSettingChange('engineSize', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.engineSize} L
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cold Start Threshold (°C)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.coldStartThreshold}
                  onChange={(e) => handleVehicleSettingChange('coldStartThreshold', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.coldStartThreshold}°C
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Cooldown Time (min)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.tripCooldownTime}
                  onChange={(e) => handleVehicleSettingChange('tripCooldownTime', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.tripCooldownTime} min
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aggressive Throttle Threshold (%)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.aggressiveThrottleThreshold}
                  onChange={(e) => handleVehicleSettingChange('aggressiveThrottleThreshold', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.aggressiveThrottleThreshold}%
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harsh Acceleration Threshold (m/s²)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.harshAccelThreshold}
                  onChange={(e) => handleVehicleSettingChange('harshAccelThreshold', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.harshAccelThreshold} m/s²
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harsh Brake Threshold (m/s²)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.harshBrakeThreshold}
                  onChange={(e) => handleVehicleSettingChange('harshBrakeThreshold', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.harshBrakeThreshold} m/s²
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Average Mileage (km/L)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.averageMileage}
                  onChange={(e) => handleVehicleSettingChange('averageMileage', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.averageMileage} km/L
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rev Threshold (RPM)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.revThreshold}
                  onChange={(e) => handleVehicleSettingChange('revThreshold', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.revThreshold} RPM
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Speed Threshold (km/hr)</label>
              {isEditingVehicle ? (
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={tempVehicleSettings.speedThreshold}
                  onChange={(e) => handleVehicleSettingChange('speedThreshold', e.target.value)}
                />
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {settings.vehicle.speedThreshold} km/hr
                </div>
              )}
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Device Settings */}
      <SettingSection icon={Smartphone} title="Device Settings" description="Manage connected VoltRide Module">
        <div className="space-y-4">
          {/* VoltRide Module Status */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            connectionStatus.connected 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus.connected ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <div>
                <h4 className="font-medium text-gray-900">VoltRide Module</h4>
                <p className="text-sm text-gray-600">
                  {connectionStatus.connected 
                    ? 'Connected to cloud - OBD-II & GPS Integrated'
                    : 'Not connected to cloud - OBD-II & GPS Integrated'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus.connected ? (
                <Cloud className="h-5 w-5 text-green-600" />
              ) : (
                <CloudOff className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Module Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Firmware Version:</span>
                <div className="font-semibold">v2.1.3</div>
              </div>
              <div>
                <span className="text-gray-600">Last Sync:</span>
                <div className="font-semibold">2 minutes ago</div>
              </div>
              <div>
                <span className="text-gray-600">Battery Level:</span>
                <div className="font-semibold">87%</div>
              </div>
              <div>
                <span className="text-gray-600">Signal Strength:</span>
                <div className="font-semibold">Excellent</div>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Privacy & Security */}
      <SettingSection icon={Shield} title="Privacy & Security" description="Control your data and privacy settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Data Sharing</h4>
              <p className="text-sm text-gray-600">Allow anonymous data sharing for research</p>
            </div>
            <ToggleSwitch 
              enabled={settings.privacy.dataSharing} 
              onChange={(value) => handlePrivacyChange('dataSharing', value)} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Location History</h4>
              <p className="text-sm text-gray-600">Store trip locations for analysis</p>
            </div>
            <ToggleSwitch 
              enabled={settings.privacy.locationHistory} 
              onChange={(value) => handlePrivacyChange('locationHistory', value)} 
            />
          </div>
          <button 
            onClick={handleExportData}
            className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Export My Data</h4>
                <p className="text-sm text-gray-600">Download all your driving data</p>
              </div>
            </div>
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-red-500">Permanently delete your account and data</p>
              </div>
            </div>
          </button>
        </div>
      </SettingSection>

      {/* Help & Support */}
      <SettingSection icon={HelpCircle} title="Help & Support" description="Get help and contact support">
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <h4 className="font-medium text-gray-900">FAQ</h4>
            <p className="text-sm text-gray-600">Frequently asked questions</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <h4 className="font-medium text-gray-900">Contact Support</h4>
            <p className="text-sm text-gray-600">Get help from our support team</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <h4 className="font-medium text-gray-900">User Guide</h4>
            <p className="text-sm text-gray-600">Learn how to use VoltRide</p>
          </button>
        </div>
      </SettingSection>

      {/* Sign Out */}
      <div className="pt-6 border-t border-gray-200">
        <button className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleProfileSave}
        currentProfile={settings.profile}
      />

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <Trash2 className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;