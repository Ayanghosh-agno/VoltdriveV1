export interface DrivingData {
  // Trip basic info
  distance: number; // kilometers
  duration: number; // minutes
  avgSpeed: number; // km/hr
  maxSpeed: number; // km/hr
  
  // Driving events
  harshAcceleration: number; // count
  harshBraking: number; // count
  rapidLaneChanges: number; // count
  overSpeeding: number; // seconds
  overRevving: number; // seconds
  idling: number; // seconds
  
  // Vehicle data from OBD-2
  fuelConsumption: number; // liters
  engineLoad: number[]; // percentage array over time
  throttlePosition: number[]; // percentage array over time
  rpm: number[]; // RPM array over time
  speed: number[]; // speed array over time
  
  // Environmental factors
  weatherCondition: 'clear' | 'rain' | 'snow' | 'fog';
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk';
  roadType: 'highway' | 'city' | 'residential' | 'rural';
}

export interface ScoreBreakdown {
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

export class DrivingScoreCalculator {
  // Speed limits by road type (km/hr)
  private static readonly SPEED_LIMITS = {
    highway: 110,
    city: 60,
    residential: 40,
    rural: 90
  };

  // Scoring weights
  private static readonly WEIGHTS = {
    safety: 0.35,      // 35% - Most important
    efficiency: 0.25,  // 25% - Fuel consumption and eco-driving
    smoothness: 0.25,  // 25% - Acceleration, braking patterns
    environmental: 0.15 // 15% - Idling, emissions
  };

  /**
   * Calculate overall driving score (0-100)
   */
  static calculateDrivingScore(data: DrivingData): ScoreBreakdown {
    const safetyScore = this.calculateSafetyScore(data);
    const efficiencyScore = this.calculateEfficiencyScore(data);
    const smoothnessScore = this.calculateSmoothnessScore(data);
    const environmentalScore = this.calculateEnvironmentalScore(data);

    const overall = Math.round(
      safetyScore * this.WEIGHTS.safety +
      efficiencyScore * this.WEIGHTS.efficiency +
      smoothnessScore * this.WEIGHTS.smoothness +
      environmentalScore * this.WEIGHTS.environmental
    );

    return {
      overall: Math.max(0, Math.min(100, overall)),
      safety: Math.round(safetyScore),
      efficiency: Math.round(efficiencyScore),
      smoothness: Math.round(smoothnessScore),
      environmental: Math.round(environmentalScore),
      breakdown: {
        speedingPenalty: this.calculateSpeedingPenalty(data),
        harshEventsPenalty: this.calculateHarshEventsPenalty(data),
        idlingPenalty: this.calculateIdlingPenalty(data),
        fuelEfficiencyScore: this.calculateFuelEfficiencyScore(data),
        smoothnessScore: Math.round(smoothnessScore),
        speedConsistencyScore: this.calculateSpeedConsistencyScore(data)
      }
    };
  }

  /**
   * Safety Score (0-100) - Based on speeding, harsh events, and speed consistency
   */
  private static calculateSafetyScore(data: DrivingData): number {
    let score = 100;
    
    // Speeding penalty
    const speedingPenalty = this.calculateSpeedingPenalty(data);
    score -= speedingPenalty;
    
    // Harsh events penalty
    const harshEventsPenalty = this.calculateHarshEventsPenalty(data);
    score -= harshEventsPenalty;
    
    // Speed consistency bonus/penalty
    const speedConsistency = this.calculateSpeedConsistencyScore(data);
    score += (speedConsistency - 50) * 0.2; // Adjust based on consistency
    
    // Environmental condition adjustments
    const environmentalAdjustment = this.getEnvironmentalAdjustment(data);
    score *= environmentalAdjustment;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Efficiency Score (0-100) - Based on fuel consumption and eco-driving
   */
  private static calculateEfficiencyScore(data: DrivingData): number {
    const fuelEfficiencyScore = this.calculateFuelEfficiencyScore(data);
    const ecoScore = this.calculateEcoDrivingScore(data);
    
    return (fuelEfficiencyScore * 0.6 + ecoScore * 0.4);
  }

  /**
   * Smoothness Score (0-100) - Based on acceleration/braking patterns
   */
  private static calculateSmoothnessScore(data: DrivingData): number {
    let score = 100;
    
    // Penalty for harsh acceleration/braking
    const totalHarshEvents = data.harshAcceleration + data.harshBraking;
    const harshPenalty = Math.min(40, totalHarshEvents * 8); // Max 40 points penalty
    score -= harshPenalty;
    
    // RPM consistency
    if (data.rpm.length > 0) {
      const rpmVariability = this.calculateVariability(data.rpm);
      const rpmPenalty = Math.min(20, rpmVariability / 100); // Max 20 points penalty
      score -= rpmPenalty;
    }
    
    // Throttle smoothness
    if (data.throttlePosition.length > 0) {
      const throttleVariability = this.calculateVariability(data.throttlePosition);
      const throttlePenalty = Math.min(15, throttleVariability / 50); // Max 15 points penalty
      score -= throttlePenalty;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Environmental Score (0-100) - Based on idling and emissions
   */
  private static calculateEnvironmentalScore(data: DrivingData): number {
    let score = 100;
    
    // Idling penalty
    const idlingPenalty = this.calculateIdlingPenalty(data);
    score -= idlingPenalty;
    
    // Over-revving penalty
    const overRevPenalty = Math.min(25, (data.overRevving / 60) * 5); // 5 points per minute
    score -= overRevPenalty;
    
    // Fuel efficiency bonus
    const fuelEfficiency = data.distance / data.fuelConsumption; // km/l
    const avgEfficiency = 15; // km/l baseline
    if (fuelEfficiency > avgEfficiency) {
      score += Math.min(15, (fuelEfficiency - avgEfficiency) * 2);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate speeding penalty
   */
  private static calculateSpeedingPenalty(data: DrivingData): number {
    const speedLimit = this.SPEED_LIMITS[data.roadType];
    const speedingSeconds = data.overSpeeding;
    const tripDurationSeconds = data.duration * 60;
    
    if (speedingSeconds === 0) return 0;
    
    const speedingPercentage = (speedingSeconds / tripDurationSeconds) * 100;
    
    // Progressive penalty: 0-5% = 5 points, 5-10% = 15 points, >10% = 30 points
    if (speedingPercentage <= 5) return 5;
    if (speedingPercentage <= 10) return 15;
    return Math.min(30, speedingPercentage * 2);
  }

  /**
   * Calculate harsh events penalty
   */
  private static calculateHarshEventsPenalty(data: DrivingData): number {
    const totalEvents = data.harshAcceleration + data.harshBraking + data.rapidLaneChanges;
    const eventsPerKm = totalEvents / data.distance;
    
    // Penalty based on events per kilometer
    if (eventsPerKm <= 0.1) return 0;      // Very good
    if (eventsPerKm <= 0.3) return 5;      // Good
    if (eventsPerKm <= 0.5) return 15;     // Average
    if (eventsPerKm <= 1.0) return 25;     // Poor
    return 35; // Very poor
  }

  /**
   * Calculate idling penalty
   */
  private static calculateIdlingPenalty(data: DrivingData): number {
    const idlingMinutes = data.idling / 60;
    const tripDurationMinutes = data.duration;
    const idlingPercentage = (idlingMinutes / tripDurationMinutes) * 100;
    
    // Progressive penalty
    if (idlingPercentage <= 5) return 0;     // Acceptable
    if (idlingPercentage <= 10) return 5;    // Minor penalty
    if (idlingPercentage <= 20) return 15;   // Moderate penalty
    return Math.min(30, idlingPercentage);   // Major penalty
  }

  /**
   * Calculate fuel efficiency score
   */
  private static calculateFuelEfficiencyScore(data: DrivingData): number {
    const fuelEfficiency = data.distance / data.fuelConsumption; // km/l
    const baselineEfficiency = 15; // Average car efficiency in km/l
    
    // Score based on efficiency relative to baseline
    const efficiencyRatio = fuelEfficiency / baselineEfficiency;
    
    if (efficiencyRatio >= 1.3) return 100;  // 30% better than average
    if (efficiencyRatio >= 1.2) return 90;   // 20% better
    if (efficiencyRatio >= 1.1) return 80;   // 10% better
    if (efficiencyRatio >= 1.0) return 70;   // Average
    if (efficiencyRatio >= 0.9) return 60;   // 10% worse
    if (efficiencyRatio >= 0.8) return 50;   // 20% worse
    return Math.max(30, efficiencyRatio * 50); // Minimum 30 points
  }

  /**
   * Calculate eco-driving score based on engine load and throttle usage
   */
  private static calculateEcoDrivingScore(data: DrivingData): number {
    let score = 100;
    
    if (data.engineLoad.length > 0) {
      const avgEngineLoad = data.engineLoad.reduce((a, b) => a + b) / data.engineLoad.length;
      // Optimal engine load is 40-60%
      if (avgEngineLoad > 80) score -= 20;
      else if (avgEngineLoad > 70) score -= 10;
      else if (avgEngineLoad < 20) score -= 15; // Too low load is also inefficient
    }
    
    if (data.throttlePosition.length > 0) {
      const avgThrottle = data.throttlePosition.reduce((a, b) => a + b) / data.throttlePosition.length;
      // Gentle throttle usage
      if (avgThrottle > 60) score -= 15;
      else if (avgThrottle > 40) score -= 5;
    }
    
    return Math.max(0, score);
  }

  /**
   * Calculate speed consistency score
   */
  private static calculateSpeedConsistencyScore(data: DrivingData): number {
    if (data.speed.length === 0) return 50; // Neutral score
    
    const speedVariability = this.calculateVariability(data.speed);
    
    // Lower variability = higher score
    if (speedVariability <= 5) return 100;   // Very consistent
    if (speedVariability <= 10) return 85;   // Good consistency
    if (speedVariability <= 15) return 70;   // Average consistency
    if (speedVariability <= 25) return 55;   // Poor consistency
    return 40; // Very poor consistency
  }

  /**
   * Calculate coefficient of variation for an array
   */
  private static calculateVariability(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return (stdDev / mean) * 100; // Coefficient of variation as percentage
  }

  /**
   * Get environmental adjustment factor
   */
  private static getEnvironmentalAdjustment(data: DrivingData): number {
    let adjustment = 1.0;
    
    // Weather adjustments
    switch (data.weatherCondition) {
      case 'rain': adjustment *= 1.05; break;
      case 'snow': adjustment *= 1.10; break;
      case 'fog': adjustment *= 1.08; break;
      default: break;
    }
    
    // Time of day adjustments
    switch (data.timeOfDay) {
      case 'night': adjustment *= 1.03; break;
      case 'dawn':
      case 'dusk': adjustment *= 1.02; break;
      default: break;
    }
    
    return Math.min(1.15, adjustment); // Max 15% bonus
  }

  /**
   * Calculate safety rating based on historical data
   */
  static calculateSafetyRating(recentScores: ScoreBreakdown[]): {
    rating: number;
    trend: 'improving' | 'stable' | 'declining';
    riskLevel: 'low' | 'medium' | 'high';
  } {
    if (recentScores.length === 0) {
      return { rating: 50, trend: 'stable', riskLevel: 'medium' };
    }
    
    // Calculate weighted average (recent trips have more weight)
    let weightedSum = 0;
    let totalWeight = 0;
    
    recentScores.forEach((score, index) => {
      const weight = Math.pow(1.1, index); // Recent trips get higher weight
      weightedSum += score.safety * weight;
      totalWeight += weight;
    });
    
    const rating = Math.round(weightedSum / totalWeight);
    
    // Calculate trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentScores.length >= 3) {
      const recent = recentScores.slice(-3).map(s => s.safety);
      const older = recentScores.slice(-6, -3).map(s => s.safety);
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;
        
        if (recentAvg > olderAvg + 5) trend = 'improving';
        else if (recentAvg < olderAvg - 5) trend = 'declining';
      }
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (rating >= 85) riskLevel = 'low';
    else if (rating <= 60) riskLevel = 'high';
    
    return { rating, trend, riskLevel };
  }
}

// Example usage and testing
export const mockTripData: DrivingData = {
  distance: 20.1, // km
  duration: 45,
  avgSpeed: 45, // km/hr
  maxSpeed: 105, // km/hr
  harshAcceleration: 2,
  harshBraking: 1,
  rapidLaneChanges: 0,
  overSpeeding: 45,
  overRevving: 15,
  idling: 180,
  fuelConsumption: 1.3, // liters
  engineLoad: Array.from({length: 50}, () => 40 + Math.random() * 30),
  throttlePosition: Array.from({length: 50}, () => 20 + Math.random() * 40),
  rpm: Array.from({length: 50}, () => 1500 + Math.random() * 1000),
  speed: Array.from({length: 50}, () => 40 + Math.random() * 25),
  weatherCondition: 'clear',
  timeOfDay: 'day',
  roadType: 'city'
};