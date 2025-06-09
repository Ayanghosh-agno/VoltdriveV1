// TypeScript interfaces for driving score calculation
// These match the Apex classes for consistent data structure

export interface TripData {
  tripId: string;
  distance: number;        // km
  duration: number;        // minutes
  fuelUsed: number;        // liters
  avgSpeed: number;        // km/hr
  maxSpeed: number;        // km/hr
  harshAcceleration: number;
  harshBraking: number;
  overSpeeding: number;    // seconds
  idling: number;          // seconds
  overRevving: number;     // seconds
  weatherCondition: 'clear' | 'rain' | 'snow' | 'fog';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  roadType: 'city' | 'highway' | 'residential' | 'rural';
  speedProfile?: number[];
  rpmProfile?: number[];
  throttleProfile?: number[];
  engineLoadProfile?: number[];
}

export interface VehicleSettings {
  averageMileage: number;  // km/l claimed by manufacturer
  fuelType: 'Petrol' | 'Diesel' | 'Electric';
  speedThreshold: number;  // km/hr
}

export interface TripScore {
  tripId: string;
  calculatedScore: number; // 0-100
  scoreBreakdown: ScoreBreakdown;
  penalties: TripPenalties;
  bonuses: TripBonuses;
  insights: TripInsight[];
}

export interface ScoreBreakdown {
  safety: number;          // 0-100
  efficiency: number;      // 0-100
  smoothness: number;      // 0-100
  environmental: number;   // 0-100
}

export interface TripPenalties {
  speedingPenalty: number;
  harshEventsPenalty: number;
  idlingPenalty: number;
}

export interface TripBonuses {
  fuelEfficiencyBonus: number;
  smoothnessBonus: number;
}

export interface TripInsight {
  type: 'positive' | 'warning' | 'tip';
  message: string;
}

// Score interpretation constants
export const SCORE_RANGES = {
  EXCELLENT: { min: 90, max: 100, label: 'Excellent Driver', description: 'Very safe and efficient' },
  GOOD: { min: 80, max: 89, label: 'Good Driver', description: 'Minor areas for improvement' },
  AVERAGE: { min: 70, max: 79, label: 'Average Driver', description: 'Several areas need attention' },
  BELOW_AVERAGE: { min: 60, max: 69, label: 'Below Average', description: 'Significant improvement needed' },
  POOR: { min: 0, max: 59, label: 'Poor Driver', description: 'Major safety and efficiency concerns' }
} as const;

export const COMPONENT_WEIGHTS = {
  SAFETY: 0.35,      // 35% - Most important
  EFFICIENCY: 0.25,  // 25% - Fuel consumption and eco-driving
  SMOOTHNESS: 0.25,  // 25% - Acceleration, braking patterns
  ENVIRONMENTAL: 0.15 // 15% - Idling, emissions
} as const;

// Helper function to get score interpretation
export function getScoreInterpretation(score: number): typeof SCORE_RANGES[keyof typeof SCORE_RANGES] {
  if (score >= 90) return SCORE_RANGES.EXCELLENT;
  if (score >= 80) return SCORE_RANGES.GOOD;
  if (score >= 70) return SCORE_RANGES.AVERAGE;
  if (score >= 60) return SCORE_RANGES.BELOW_AVERAGE;
  return SCORE_RANGES.POOR;
}

// Helper function to get score color for UI
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}