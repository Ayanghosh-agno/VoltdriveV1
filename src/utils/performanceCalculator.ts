// Frontend Performance Calculator
// Calculates all metrics client-side from raw trip data

export interface RawTripData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  distance: number; // km
  duration: number; // minutes
  fuelUsed: number; // liters
  avgSpeed: number; // km/hr
  maxSpeed: number; // km/hr
  
  // Driving events (from OBD-II)
  harshAcceleration: number;
  harshBraking: number;
  overSpeeding: number; // seconds
  idling: number; // seconds
  overRevving: number; // seconds
  
  // Optional detailed data
  speedProfile?: number[]; // speed readings over time
  rpmProfile?: number[]; // RPM readings over time
  throttleProfile?: number[]; // throttle position over time
  engineLoadProfile?: number[]; // engine load over time
}

export interface UserBaselines {
  averageFuelEfficiency: number; // km/l - from user's vehicle settings
  targetFuelEfficiency: number; // km/l - industry standard (15 km/l)
  fuelCostPerLiter: number; // ₹ per liter
  vehicleType: 'petrol' | 'diesel' | 'electric';
  
  // Thresholds from vehicle settings
  speedThreshold: number; // km/hr
  harshAccelThreshold: number; // m/s²
  harshBrakeThreshold: number; // m/s²
  revThreshold: number; // RPM
}

export interface CalculatedMetrics {
  drivingScore: number;
  fuelEfficiency: number;
  safetyRating: number;
  
  // Quick stats with changes
  totalDistance: { value: number; change: string };
  avgSpeed: { value: number; change: string };
  hardBrakingEvents: { value: number; change: string };
  fuelSaved: { value: number; change: string }; // in ₹
  
  // Insights
  insights: Insight[];
  
  // Detailed breakdowns
  scoreBreakdown: {
    safety: number;
    efficiency: number;
    smoothness: number;
    environmental: number;
  };
}

export interface Insight {
  type: 'positive' | 'info' | 'warning' | 'tip';
  icon: string;
  title: string;
  description: string;
  color: 'green' | 'blue' | 'amber' | 'red';
}

export class PerformanceCalculator {
  
  /**
   * Calculate all performance metrics from raw trip data
   */
  static calculateMetrics(
    trips: RawTripData[], 
    baselines: UserBaselines,
    comparisonPeriodDays: number = 30
  ): CalculatedMetrics {
    
    // Separate current and previous period trips
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - (comparisonPeriodDays * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(now.getTime() - (2 * comparisonPeriodDays * 24 * 60 * 60 * 1000));
    
    const currentTrips = trips.filter(trip => 
      new Date(trip.date) >= currentPeriodStart
    );
    
    const previousTrips = trips.filter(trip => 
      new Date(trip.date) >= previousPeriodStart && 
      new Date(trip.date) < currentPeriodStart
    );
    
    // Calculate main metrics
    const drivingScore = this.calculateDrivingScore(currentTrips, baselines);
    const fuelEfficiency = this.calculateFuelEfficiencyScore(currentTrips, baselines);
    const safetyRating = this.calculateSafetyRating(trips.slice(-20), baselines); // Last 20 trips
    
    // Calculate quick stats with changes
    const quickStats = this.calculateQuickStats(currentTrips, previousTrips, baselines);
    
    // Generate insights
    const insights = this.generateInsights(currentTrips, baselines);
    
    // Score breakdown
    const scoreBreakdown = this.calculateScoreBreakdown(currentTrips, baselines);
    
    return {
      drivingScore: Math.round(drivingScore),
      fuelEfficiency: Math.round(fuelEfficiency),
      safetyRating: Math.round(safetyRating),
      ...quickStats,
      insights,
      scoreBreakdown
    };
  }
  
  /**
   * Calculate overall driving score (0-100)
   */
  private static calculateDrivingScore(trips: RawTripData[], baselines: UserBaselines): number {
    if (trips.length === 0) return 0;
    
    const breakdown = this.calculateScoreBreakdown(trips, baselines);
    
    // Weighted average
    return (
      breakdown.safety * 0.35 +
      breakdown.efficiency * 0.25 +
      breakdown.smoothness * 0.25 +
      breakdown.environmental * 0.15
    );
  }
  
  /**
   * Calculate fuel efficiency score (0-100)
   */
  private static calculateFuelEfficiencyScore(trips: RawTripData[], baselines: UserBaselines): number {
    if (trips.length === 0) return 0;
    
    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalFuel = trips.reduce((sum, trip) => sum + trip.fuelUsed, 0);
    
    if (totalFuel === 0) return 0;
    
    const actualEfficiency = totalDistance / totalFuel; // km/l
    const vehicleClaimedEfficiency = baselines.averageFuelEfficiency;
    const ratio = actualEfficiency / vehicleClaimedEfficiency;
    
    // More realistic scoring based on vehicle's claimed efficiency
    if (ratio >= 1.20) return 100;     // 20% better than claimed = excellent
    if (ratio >= 1.10) return 90;      // 10% better than claimed = very good
    if (ratio >= 1.05) return 80;      // 5% better than claimed = good
    if (ratio >= 0.95) return 70;      // Within 5% of claimed = acceptable
    if (ratio >= 0.90) return 60;      // 10% worse than claimed = below average
    if (ratio >= 0.80) return 50;      // 20% worse than claimed = poor
    return Math.max(30, ratio * 50);   // Minimum 30 points
  }
  
  /**
   * Calculate safety rating (0-100)
   */
  private static calculateSafetyRating(recentTrips: RawTripData[], baselines: UserBaselines): number {
    if (recentTrips.length === 0) return 50;
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    // Calculate safety score for each trip with exponential weighting (recent trips matter more)
    recentTrips.forEach((trip, index) => {
      const weight = Math.pow(1.1, index); // Recent trips get higher weight
      const safetyScore = this.calculateTripSafetyScore(trip, baselines);
      
      weightedSum += safetyScore * weight;
      totalWeight += weight;
    });
    
    return weightedSum / totalWeight;
  }
  
  /**
   * Calculate safety score for a single trip
   */
  private static calculateTripSafetyScore(trip: RawTripData, baselines: UserBaselines): number {
    let score = 100;
    
    // Speeding penalty
    const speedingPercentage = (trip.overSpeeding / (trip.duration * 60)) * 100;
    if (speedingPercentage > 10) score -= 30;
    else if (speedingPercentage > 5) score -= 15;
    else if (speedingPercentage > 0) score -= 5;
    
    // Harsh events penalty
    const totalHarshEvents = trip.harshAcceleration + trip.harshBraking;
    const eventsPerKm = totalHarshEvents / trip.distance;
    if (eventsPerKm > 1.0) score -= 35;
    else if (eventsPerKm > 0.5) score -= 25;
    else if (eventsPerKm > 0.3) score -= 15;
    else if (eventsPerKm > 0.1) score -= 5;
    
    // Speed consistency (if speed profile available)
    if (trip.speedProfile && trip.speedProfile.length > 0) {
      const speedVariability = this.calculateVariability(trip.speedProfile);
      if (speedVariability > 25) score -= 15;
      else if (speedVariability > 15) score -= 10;
      else if (speedVariability > 10) score -= 5;
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Calculate quick stats with period-over-period changes
   */
  private static calculateQuickStats(
    currentTrips: RawTripData[], 
    previousTrips: RawTripData[], 
    baselines: UserBaselines
  ) {
    // Current period stats
    const currentDistance = currentTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const currentFuel = currentTrips.reduce((sum, trip) => sum + trip.fuelUsed, 0);
    const currentHarshEvents = currentTrips.reduce((sum, trip) => 
      sum + trip.harshAcceleration + trip.harshBraking, 0);
    const currentAvgSpeed = currentTrips.length > 0 
      ? currentTrips.reduce((sum, trip) => sum + trip.avgSpeed, 0) / currentTrips.length 
      : 0;
    
    // Previous period stats
    const previousDistance = previousTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const previousFuel = previousTrips.reduce((sum, trip) => sum + trip.fuelUsed, 0);
    const previousHarshEvents = previousTrips.reduce((sum, trip) => 
      sum + trip.harshAcceleration + trip.harshBraking, 0);
    const previousAvgSpeed = previousTrips.length > 0 
      ? previousTrips.reduce((sum, trip) => sum + trip.avgSpeed, 0) / previousTrips.length 
      : 0;
    
    // Calculate fuel savings in ₹ based on vehicle's claimed efficiency
    const expectedFuel = currentDistance / baselines.averageFuelEfficiency;
    const fuelSaved = Math.max(0, expectedFuel - currentFuel);
    const moneySaved = fuelSaved * baselines.fuelCostPerLiter;
    
    const previousExpectedFuel = previousDistance / baselines.averageFuelEfficiency;
    const previousFuelSaved = Math.max(0, previousExpectedFuel - previousFuel);
    const previousMoneySaved = previousFuelSaved * baselines.fuelCostPerLiter;
    
    return {
      totalDistance: {
        value: Math.round(currentDistance * 10) / 10,
        change: this.calculateChange(currentDistance, previousDistance)
      },
      avgSpeed: {
        value: Math.round(currentAvgSpeed),
        change: this.calculateChange(currentAvgSpeed, previousAvgSpeed)
      },
      hardBrakingEvents: {
        value: currentHarshEvents,
        change: this.calculateChange(currentHarshEvents, previousHarshEvents)
      },
      fuelSaved: {
        value: Math.round(moneySaved),
        change: this.calculateChange(moneySaved, previousMoneySaved)
      }
    };
  }
  
  /**
   * Calculate percentage change between two values
   */
  private static calculateChange(current: number, previous: number): string {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${Math.round(change)}%`;
  }
  
  /**
   * Generate insights based on trip data
   */
  private static generateInsights(trips: RawTripData[], baselines: UserBaselines): Insight[] {
    const insights: Insight[] = [];
    
    if (trips.length === 0) return insights;
    
    // Calculate metrics for insights
    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalFuel = trips.reduce((sum, trip) => sum + trip.fuelUsed, 0);
    const actualEfficiency = totalDistance / totalFuel;
    const efficiencyVsClaimed = ((actualEfficiency - baselines.averageFuelEfficiency) / baselines.averageFuelEfficiency) * 100;
    
    const totalHarshEvents = trips.reduce((sum, trip) => 
      sum + trip.harshAcceleration + trip.harshBraking, 0);
    const harshEventsPerKm = totalHarshEvents / totalDistance;
    
    const avgIdlingTime = trips.reduce((sum, trip) => sum + trip.idling, 0) / trips.length / 60; // minutes
    
    // Fuel efficiency insight compared to vehicle's claimed mileage
    if (efficiencyVsClaimed > 10) {
      insights.push({
        type: 'positive',
        icon: 'trending-up',
        title: 'Exceeding vehicle specifications!',
        description: `You're getting ${Math.round(efficiencyVsClaimed)}% better fuel efficiency than your vehicle's claimed ${baselines.averageFuelEfficiency} km/l.`,
        color: 'green'
      });
    } else if (efficiencyVsClaimed < -15) {
      insights.push({
        type: 'warning',
        icon: 'fuel',
        title: 'Below expected fuel efficiency',
        description: `Your efficiency is ${Math.abs(Math.round(efficiencyVsClaimed))}% below your vehicle's claimed ${baselines.averageFuelEfficiency} km/l.`,
        color: 'amber'
      });
    } else if (Math.abs(efficiencyVsClaimed) <= 5) {
      insights.push({
        type: 'positive',
        icon: 'check-circle',
        title: 'Meeting vehicle specifications',
        description: `Your fuel efficiency is close to your vehicle's claimed ${baselines.averageFuelEfficiency} km/l.`,
        color: 'blue'
      });
    }
    
    // Smooth driving insight
    if (harshEventsPerKm < 0.1) {
      insights.push({
        type: 'positive',
        icon: 'shield',
        title: 'Smooth driving detected',
        description: 'Your acceleration patterns are very consistent.',
        color: 'blue'
      });
    } else if (harshEventsPerKm > 0.5) {
      insights.push({
        type: 'warning',
        icon: 'alert-triangle',
        title: 'Frequent harsh events detected',
        description: 'Try to anticipate stops and accelerate more gradually.',
        color: 'amber'
      });
    }
    
    // Idling insight
    if (avgIdlingTime > 3) {
      insights.push({
        type: 'tip',
        icon: 'clock',
        title: 'Reduce idling time',
        description: `Average idling time is ${Math.round(avgIdlingTime)} minutes. Turn off engine when stopped for more than 30 seconds.`,
        color: 'blue'
      });
    }
    
    // Speed consistency insight
    const speedConsistentTrips = trips.filter(trip => {
      if (!trip.speedProfile) return false;
      const variability = this.calculateVariability(trip.speedProfile);
      return variability < 10;
    });
    
    if (speedConsistentTrips.length / trips.length > 0.8) {
      insights.push({
        type: 'positive',
        icon: 'gauge',
        title: 'Excellent speed control',
        description: 'You maintained consistent speeds throughout your trips.',
        color: 'green'
      });
    }
    
    return insights;
  }
  
  /**
   * Calculate detailed score breakdown
   */
  private static calculateScoreBreakdown(trips: RawTripData[], baselines: UserBaselines) {
    if (trips.length === 0) {
      return { safety: 0, efficiency: 0, smoothness: 0, environmental: 0 };
    }
    
    // Safety score (average of all trip safety scores)
    const safetyScores = trips.map(trip => this.calculateTripSafetyScore(trip, baselines));
    const safety = safetyScores.reduce((sum, score) => sum + score, 0) / safetyScores.length;
    
    // Efficiency score
    const efficiency = this.calculateFuelEfficiencyScore(trips, baselines);
    
    // Smoothness score (based on harsh events and consistency)
    let smoothness = 100;
    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalHarshEvents = trips.reduce((sum, trip) => 
      sum + trip.harshAcceleration + trip.harshBraking, 0);
    const harshEventsPerKm = totalHarshEvents / totalDistance;
    
    if (harshEventsPerKm > 1.0) smoothness -= 40;
    else if (harshEventsPerKm > 0.5) smoothness -= 25;
    else if (harshEventsPerKm > 0.3) smoothness -= 15;
    else if (harshEventsPerKm > 0.1) smoothness -= 5;
    
    // Environmental score (based on idling and over-revving)
    let environmental = 100;
    const avgIdlingPercentage = trips.reduce((sum, trip) => {
      return sum + (trip.idling / (trip.duration * 60)) * 100;
    }, 0) / trips.length;
    
    if (avgIdlingPercentage > 20) environmental -= 30;
    else if (avgIdlingPercentage > 10) environmental -= 15;
    else if (avgIdlingPercentage > 5) environmental -= 5;
    
    const avgOverRevTime = trips.reduce((sum, trip) => sum + trip.overRevving, 0) / trips.length;
    if (avgOverRevTime > 60) environmental -= 25;
    else if (avgOverRevTime > 30) environmental -= 15;
    else if (avgOverRevTime > 10) environmental -= 5;
    
    return {
      safety: Math.round(Math.max(0, safety)),
      efficiency: Math.round(Math.max(0, efficiency)),
      smoothness: Math.round(Math.max(0, smoothness)),
      environmental: Math.round(Math.max(0, environmental))
    };
  }
  
  /**
   * Calculate coefficient of variation for consistency metrics
   */
  private static calculateVariability(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return (stdDev / mean) * 100; // Coefficient of variation as percentage
  }
}