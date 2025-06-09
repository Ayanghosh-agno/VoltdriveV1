// Frontend Score Breakdown Calculator
// Calculates safety, efficiency, smoothness, and environmental scores from trip data

export interface TripScoreInput {
  // Basic trip data
  distance: number;           // km
  duration: number;           // minutes
  fuelUsed: number;          // liters
  avgSpeed: number;          // km/hr
  maxSpeed: number;          // km/hr
  
  // Driving events
  harshAcceleration: number;  // count
  harshBraking: number;      // count
  overSpeeding: number;      // seconds
  idling: number;            // seconds
  overRevving: number;       // seconds
  
  // Optional: Overall score from Salesforce (if available)
  calculatedScore?: number;
}

export interface VehicleBaselines {
  averageMileage: number;    // km/l from vehicle settings
  speedThreshold: number;    // km/hr from vehicle settings
  fuelType: 'Petrol' | 'Diesel' | 'Electric';
}

export interface ScoreBreakdownResult {
  overall: number;
  safety: number;
  efficiency: number;
  smoothness: number;
  environmental: number;
  breakdown: {
    speedingPenalty: number;
    harshEventsPenalty: number;
    idlingPenalty: number;
    fuelEfficiencyScore: number;
    smoothnessScore: number;
    speedConsistencyScore: number;
  };
}

export class FrontendScoreCalculator {
  
  /**
   * Calculate complete score breakdown from trip data
   */
  static calculateScoreBreakdown(
    tripData: TripScoreInput, 
    vehicleBaselines: VehicleBaselines
  ): ScoreBreakdownResult {
    
    // Use Salesforce score if available, otherwise calculate
    const overallScore = tripData.calculatedScore || this.calculateOverallScore(tripData, vehicleBaselines);
    
    // Calculate component scores
    const safety = this.calculateSafetyScore(tripData, vehicleBaselines);
    const efficiency = this.calculateEfficiencyScore(tripData, vehicleBaselines);
    const smoothness = this.calculateSmoothnessScore(tripData);
    const environmental = this.calculateEnvironmentalScore(tripData, vehicleBaselines);
    
    // Calculate detailed breakdown
    const breakdown = {
      speedingPenalty: this.calculateSpeedingPenalty(tripData),
      harshEventsPenalty: this.calculateHarshEventsPenalty(tripData),
      idlingPenalty: this.calculateIdlingPenalty(tripData),
      fuelEfficiencyScore: this.calculateFuelEfficiencyScore(tripData, vehicleBaselines),
      smoothnessScore: smoothness,
      speedConsistencyScore: this.calculateSpeedConsistencyScore(tripData)
    };
    
    return {
      overall: Math.round(overallScore),
      safety: Math.round(safety),
      efficiency: Math.round(efficiency),
      smoothness: Math.round(smoothness),
      environmental: Math.round(environmental),
      breakdown
    };
  }
  
  /**
   * Calculate overall score if not provided by Salesforce
   */
  private static calculateOverallScore(tripData: TripScoreInput, vehicleBaselines: VehicleBaselines): number {
    const safety = this.calculateSafetyScore(tripData, vehicleBaselines);
    const efficiency = this.calculateEfficiencyScore(tripData, vehicleBaselines);
    const smoothness = this.calculateSmoothnessScore(tripData);
    const environmental = this.calculateEnvironmentalScore(tripData, vehicleBaselines);
    
    // Weighted average
    return (
      safety * 0.35 +           // 35% weight
      efficiency * 0.25 +       // 25% weight
      smoothness * 0.25 +       // 25% weight
      environmental * 0.15      // 15% weight
    );
  }
  
  /**
   * Safety Score (0-100) - Based on speeding and harsh events
   */
  private static calculateSafetyScore(tripData: TripScoreInput, vehicleBaselines: VehicleBaselines): number {
    let score = 100;
    
    // Speeding penalty
    const speedingPenalty = this.calculateSpeedingPenalty(tripData);
    score -= speedingPenalty;
    
    // Harsh events penalty
    const harshEventsPenalty = this.calculateHarshEventsPenalty(tripData);
    score -= harshEventsPenalty;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Efficiency Score (0-100) - Based on fuel consumption vs vehicle specs
   */
  private static calculateEfficiencyScore(tripData: TripScoreInput, vehicleBaselines: VehicleBaselines): number {
    if (tripData.fuelUsed <= 0 || tripData.distance <= 0) return 50;
    
    const actualEfficiency = tripData.distance / tripData.fuelUsed; // km/l
    const claimedEfficiency = vehicleBaselines.averageMileage;
    const ratio = actualEfficiency / claimedEfficiency;
    
    // Realistic scoring based on vehicle's claimed efficiency
    if (ratio >= 1.20) return 100;     // 20% better than claimed = excellent
    if (ratio >= 1.10) return 90;      // 10% better than claimed = very good
    if (ratio >= 1.05) return 80;      // 5% better than claimed = good
    if (ratio >= 0.95) return 70;      // Within 5% of claimed = acceptable
    if (ratio >= 0.90) return 60;      // 10% worse than claimed = below average
    if (ratio >= 0.80) return 50;      // 20% worse than claimed = poor
    return Math.max(30, ratio * 50);   // Minimum 30 points
  }
  
  /**
   * Smoothness Score (0-100) - Based on harsh events frequency
   */
  private static calculateSmoothnessScore(tripData: TripScoreInput): number {
    let score = 100;
    
    // Penalty for harsh acceleration/braking
    const totalHarshEvents = tripData.harshAcceleration + tripData.harshBraking;
    const eventsPerKm = tripData.distance > 0 ? totalHarshEvents / tripData.distance : 0;
    
    if (eventsPerKm > 1.0) score -= 40;
    else if (eventsPerKm > 0.5) score -= 25;
    else if (eventsPerKm > 0.3) score -= 15;
    else if (eventsPerKm > 0.1) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Environmental Score (0-100) - Based on idling and over-revving
   */
  private static calculateEnvironmentalScore(tripData: TripScoreInput, vehicleBaselines: VehicleBaselines): number {
    let score = 100;
    
    // Idling penalty
    const idlingPenalty = this.calculateIdlingPenalty(tripData);
    score -= idlingPenalty;
    
    // Over-revving penalty
    const overRevPenalty = Math.min(25, (tripData.overRevving / 60) * 5); // 5 points per minute
    score -= overRevPenalty;
    
    // Fuel efficiency bonus
    if (tripData.fuelUsed > 0 && tripData.distance > 0) {
      const fuelEfficiency = tripData.distance / tripData.fuelUsed; // km/l
      const claimedEfficiency = vehicleBaselines.averageMileage;
      if (fuelEfficiency > claimedEfficiency) {
        score += Math.min(15, (fuelEfficiency - claimedEfficiency) * 2);
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate speeding penalty
   */
  private static calculateSpeedingPenalty(tripData: TripScoreInput): number {
    if (tripData.overSpeeding === 0) return 0;
    
    const speedingSeconds = tripData.overSpeeding;
    const tripDurationSeconds = tripData.duration * 60;
    const speedingPercentage = (speedingSeconds / tripDurationSeconds) * 100;
    
    // Progressive penalty
    if (speedingPercentage <= 5) return 5;      // Minor speeding
    if (speedingPercentage <= 10) return 15;    // Moderate speeding
    return Math.min(30, speedingPercentage * 2); // Major speeding (max 30 points)
  }
  
  /**
   * Calculate harsh events penalty
   */
  private static calculateHarshEventsPenalty(tripData: TripScoreInput): number {
    const totalEvents = tripData.harshAcceleration + tripData.harshBraking;
    if (totalEvents === 0) return 0;
    
    const eventsPerKm = tripData.distance > 0 ? totalEvents / tripData.distance : 0;
    
    // Penalty based on events per kilometer
    if (eventsPerKm <= 0.1) return 0;      // Excellent (≤1 event per 10km)
    if (eventsPerKm <= 0.3) return 5;      // Good (≤3 events per 10km)
    if (eventsPerKm <= 0.5) return 15;     // Average (≤5 events per 10km)
    if (eventsPerKm <= 1.0) return 25;     // Poor (≤10 events per 10km)
    return 35;                             // Very poor (>10 events per 10km)
  }
  
  /**
   * Calculate idling penalty
   */
  private static calculateIdlingPenalty(tripData: TripScoreInput): number {
    if (tripData.idling === 0) return 0;
    
    const idlingMinutes = tripData.idling / 60;
    const tripDurationMinutes = tripData.duration;
    const idlingPercentage = (idlingMinutes / tripDurationMinutes) * 100;
    
    // Progressive penalty
    if (idlingPercentage <= 5) return 0;     // Acceptable (≤5% of trip)
    if (idlingPercentage <= 10) return 5;    // Minor penalty (5-10% of trip)
    if (idlingPercentage <= 20) return 15;   // Moderate penalty (10-20% of trip)
    return Math.min(30, idlingPercentage);   // Major penalty (>20% of trip)
  }
  
  /**
   * Calculate fuel efficiency score
   */
  private static calculateFuelEfficiencyScore(tripData: TripScoreInput, vehicleBaselines: VehicleBaselines): number {
    if (tripData.fuelUsed <= 0 || tripData.distance <= 0) return 50;
    
    const actualEfficiency = tripData.distance / tripData.fuelUsed; // km/l
    const claimedEfficiency = vehicleBaselines.averageMileage;
    const ratio = actualEfficiency / claimedEfficiency;
    
    // Convert ratio to 0-100 score
    if (ratio >= 1.20) return 100;
    if (ratio >= 1.10) return 90;
    if (ratio >= 1.05) return 80;
    if (ratio >= 0.95) return 70;
    if (ratio >= 0.90) return 60;
    if (ratio >= 0.80) return 50;
    return Math.max(30, ratio * 50);
  }
  
  /**
   * Calculate speed consistency score (simplified without speed profile)
   */
  private static calculateSpeedConsistencyScore(tripData: TripScoreInput): number {
    // Without detailed speed profile, use a simplified calculation
    // based on the difference between average and max speed
    const speedRange = tripData.maxSpeed - tripData.avgSpeed;
    const avgSpeedRatio = tripData.avgSpeed / tripData.maxSpeed;
    
    // Higher consistency = smaller speed range and higher avg/max ratio
    if (avgSpeedRatio > 0.8 && speedRange < 20) return 100;  // Very consistent
    if (avgSpeedRatio > 0.7 && speedRange < 30) return 85;   // Good consistency
    if (avgSpeedRatio > 0.6 && speedRange < 40) return 70;   // Average consistency
    if (avgSpeedRatio > 0.5 && speedRange < 50) return 55;   // Poor consistency
    return 40; // Very poor consistency
  }
}