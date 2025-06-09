export interface NotificationSettings {
  tripSummary: boolean;
  safetyAlerts: boolean;
  fuelEfficiency: boolean;
  maintenance: boolean;
  weeklyReport: boolean;
}

export interface VehicleSettings {
  makeModel: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric';
  engineSize: string;
  coldStartThreshold: string;
  tripCooldownTime: string;
  aggressiveThrottleThreshold: string;
  harshAccelThreshold: string;
  harshBrakeThreshold: string;
  averageMileage: string;
  revThreshold: string;
  speedThreshold: string;
}

export interface PrivacySettings {
  dataSharing: boolean;
  locationHistory: boolean;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  licenseNumber: string;
}

export interface AppSettings {
  profile: ProfileData;
  notifications: NotificationSettings;
  vehicle: VehicleSettings;
  privacy: PrivacySettings;
  lastUpdated: string;
  version: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  mode: 'production' | 'error';
}