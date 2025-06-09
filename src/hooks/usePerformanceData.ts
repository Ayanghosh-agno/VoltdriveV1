import { useState, useEffect, useMemo } from 'react';
import { PerformanceCalculator, RawTripData, UserBaselines, CalculatedMetrics } from '../utils/performanceCalculator';
import { useSettings } from './useSettings';

// Mock trip data - in production this would come from Salesforce
const mockTripData: RawTripData[] = [
  {
    id: '1',
    date: '2024-01-15',
    startTime: '08:30',
    endTime: '09:15',
    distance: 20.1,
    duration: 45,
    fuelUsed: 1.3,
    avgSpeed: 45,
    maxSpeed: 105,
    harshAcceleration: 2,
    harshBraking: 1,
    overSpeeding: 45,
    idling: 180,
    overRevving: 15,
    speedProfile: Array.from({length: 50}, () => 40 + Math.random() * 25),
    rpmProfile: Array.from({length: 50}, () => 1500 + Math.random() * 1000),
  },
  {
    id: '2',
    date: '2024-01-14',
    startTime: '18:00',
    endTime: '18:35',
    distance: 13.2,
    duration: 35,
    fuelUsed: 0.8,
    avgSpeed: 35,
    maxSpeed: 72,
    harshAcceleration: 0,
    harshBraking: 1,
    overSpeeding: 0,
    idling: 120,
    overRevving: 5,
    speedProfile: Array.from({length: 35}, () => 30 + Math.random() * 15),
  },
  {
    id: '3',
    date: '2024-01-13',
    startTime: '07:45',
    endTime: '08:30',
    distance: 20.1,
    duration: 45,
    fuelUsed: 1.5,
    avgSpeed: 50,
    maxSpeed: 112,
    harshAcceleration: 3,
    harshBraking: 2,
    overSpeeding: 120,
    idling: 240,
    overRevving: 30,
  },
  // Add more mock trips for better calculations...
  {
    id: '4',
    date: '2024-01-12',
    startTime: '14:15',
    endTime: '15:45',
    distance: 30.1,
    duration: 90,
    fuelUsed: 1.9,
    avgSpeed: 40,
    maxSpeed: 88,
    harshAcceleration: 0,
    harshBraking: 0,
    overSpeeding: 0,
    idling: 150,
    overRevving: 0,
  },
  {
    id: '5',
    date: '2024-01-11',
    startTime: '09:00',
    endTime: '09:30',
    distance: 15.5,
    duration: 30,
    fuelUsed: 1.0,
    avgSpeed: 52,
    maxSpeed: 95,
    harshAcceleration: 1,
    harshBraking: 0,
    overSpeeding: 30,
    idling: 90,
    overRevving: 10,
  },
  // Previous period trips (for comparison)
  {
    id: '6',
    date: '2023-12-20',
    startTime: '08:30',
    endTime: '09:15',
    distance: 18.5,
    duration: 45,
    fuelUsed: 1.4,
    avgSpeed: 42,
    maxSpeed: 98,
    harshAcceleration: 3,
    harshBraking: 2,
    overSpeeding: 60,
    idling: 200,
    overRevving: 20,
  },
  {
    id: '7',
    date: '2023-12-19',
    startTime: '18:00',
    endTime: '18:40',
    distance: 14.8,
    duration: 40,
    fuelUsed: 1.1,
    avgSpeed: 38,
    maxSpeed: 85,
    harshAcceleration: 1,
    harshBraking: 3,
    overSpeeding: 15,
    idling: 180,
    overRevving: 25,
  },
];

export const usePerformanceData = () => {
  const { settings } = useSettings();
  const [tripData, setTripData] = useState<RawTripData[]>(mockTripData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create user baselines from settings
  const userBaselines: UserBaselines = useMemo(() => ({
    averageFuelEfficiency: parseFloat(settings.vehicle.averageMileage),
    targetFuelEfficiency: 15, // Industry standard km/l
    fuelCostPerLiter: settings.vehicle.fuelType === 'Petrol' ? 102 : 89, // ₹ per liter
    vehicleType: settings.vehicle.fuelType.toLowerCase() as 'petrol' | 'diesel' | 'electric',
    speedThreshold: parseFloat(settings.vehicle.speedThreshold),
    harshAccelThreshold: parseFloat(settings.vehicle.harshAccelThreshold),
    harshBrakeThreshold: parseFloat(settings.vehicle.harshBrakeThreshold),
    revThreshold: parseFloat(settings.vehicle.revThreshold),
  }), [settings]);

  // Calculate performance metrics
  const performanceMetrics: CalculatedMetrics = useMemo(() => {
    return PerformanceCalculator.calculateMetrics(tripData, userBaselines, 30);
  }, [tripData, userBaselines]);

  // Simulate loading trip data from Salesforce
  const loadTripData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would be an API call to Salesforce
      // const response = await fetch('/salesforce-api/services/apexrest/voltride/trips');
      // const data = await response.json();
      // setTripData(data.trips);
      
      // For now, simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTripData(mockTripData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadTripData();
  }, []);

  return {
    tripData,
    performanceMetrics,
    userBaselines,
    loading,
    error,
    refreshData: loadTripData,
  };
};