// Salesforce Data Processor
// Converts Salesforce JSON to our internal performance metrics

import { SalesforceHomePageData, WeeklyTripInsight, RecentTripData, UserBaselines } from '../types/salesforceData';
import { CalculatedMetrics, Insight } from './performanceCalculator';
import { AppSettings } from '../types/settings';

export class SalesforceDataProcessor {
  
  /**
   * Process Salesforce data and calculate all metrics
   * Now takes settings to derive userBaselines
   */
  static processHomePageData(salesforceData: SalesforceHomePageData, settings: AppSettings): CalculatedMetrics {
    const { currentWeekTripInsight, previousWeekTripInsight, recentTrips } = salesforceData;
    
    // Create userBaselines from settings page data
    const userBaselines = this.createUserBaselinesFromSettings(settings);
    
    // Calculate main scores
    const drivingScore = this.calculateDrivingScore(recentTrips, userBaselines);
    const fuelEfficiency = this.calculateFuelEfficiencyScore(currentWeekTripInsight, userBaselines);
    const safetyRating = this.calculateSafetyRating(recentTrips, userBaselines);
    
    // Calculate quick stats with period-over-period changes
    const quickStats = this.calculateQuickStats(currentWeekTripInsight, previousWeekTripInsight, userBaselines);
    
    // Generate insights
    const insights = this.generateInsights(currentWeekTripInsight, previousWeekTripInsight, recentTrips, userBaselines);
    
    // Score breakdown
    const scoreBreakdown = this.calculateScoreBreakdown(currentWeekTripInsight, recentTrips, userBaselines);
    
    return {
      drivingScore,
      fuelEfficiency,
      safetyRating,
      ...quickStats,
      insights,
      scoreBreakdown
    };
  }
  
  /**
   * Create UserBaselines from settings page data
   */
  private static createUserBaselinesFromSettings(settings: AppSettings): UserBaselines {
    return {
      averageFuelEfficiency: parseFloat(settings.vehicle.averageMileage),
      targetFuelEfficiency: 15.0, // Industry standard km/l
      fuelCostPerLiter: settings.vehicle.fuelType === 'Petrol' ? 102 : 89, // ₹ per liter
      vehicleType: settings.vehicle.fuelType.toLowerCase() as 'petrol' | 'diesel' | 'electric',
      speedThreshold: parseFloat(settings.vehicle.speedThreshold),
      harshAccelThreshold: parseFloat(settings.vehicle.harshAccelThreshold),
      harshBrakeThreshold: parseFloat(settings.vehicle.harshBrakeThreshold),
      revThreshold: parseFloat(settings.vehicle.revThreshold),
    };
  }
  
  /**
   * Calculate overall driving score from recent trips (0-100)
   */
  private static calculateDrivingScore(recentTrips: RecentTripData[], userBaselines: UserBaselines): number {
    if (recentTrips.length === 0) return 0;
    
    let totalScore = 0;
    
    recentTrips.forEach(trip => {
      let tripScore = 100;
      
      // Safety penalties
      const speedingPercentage = (trip.overSpeeding / (trip.duration * 60)) * 100;
      if (speedingPercentage > 10) tripScore -= 30;
      else if (speedingPercentage > 5) tripScore -= 15;
      else if (speedingPercentage > 0) tripScore -= 5;
      
      // Harsh events penalty
      const totalHarshEvents = trip.harshAcceleration + trip.harshBraking;
      const eventsPerKm = totalHarshEvents / trip.distance;
      if (eventsPerKm > 1.0) tripScore -= 35;
      else if (eventsPerKm > 0.5) tripScore -= 25;
      else if (eventsPerKm > 0.3) tripScore -= 15;
      else if (eventsPerKm > 0.1) tripScore -= 5;
      
      // Fuel efficiency bonus/penalty
      const tripEfficiency = trip.distance / trip.fuelUsed;
      const efficiencyRatio = tripEfficiency / userBaselines.targetFuelEfficiency;
      if (efficiencyRatio > 1.2) tripScore += 10;
      else if (efficiencyRatio < 0.8) tripScore -= 15;
      
      // Idling penalty
      const idlingPercentage = (trip.idling / (trip.duration * 60)) * 100;
      if (idlingPercentage > 20) tripScore -= 20;
      else if (idlingPercentage > 10) tripScore -= 10;
      else if (idlingPercentage > 5) tripScore -= 5;
      
      totalScore += Math.max(0, Math.min(100, tripScore));
    });
    
    return Math.round(totalScore / recentTrips.length);
  }
  
  /**
   * Calculate fuel efficiency score (0-100)
   */
  private static calculateFuelEfficiencyScore(currentWeek: WeeklyTripInsight, userBaselines: UserBaselines): number {
    const ratio = currentWeek.actualFuelEfficiency / userBaselines.targetFuelEfficiency;
    
    if (ratio >= 1.3) return 100;      // 30% better than target
    if (ratio >= 1.2) return 90;       // 20% better
    if (ratio >= 1.1) return 80;       // 10% better  
    if (ratio >= 1.0) return 70;       // At target
    if (ratio >= 0.9) return 60;       // 10% worse
    if (ratio >= 0.8) return 50;       // 20% worse
    return Math.max(30, ratio * 50);   // Minimum 30 points
  }
  
  /**
   * Calculate safety rating (0-100)
   */
  private static calculateSafetyRating(recentTrips: RecentTripData[], userBaselines: UserBaselines): number {
    if (recentTrips.length === 0) return 50;
    
    let totalSafetyScore = 0;
    
    recentTrips.forEach(trip => {
      let safetyScore = 100;
      
      // Speed violations
      const speedingPercentage = (trip.overSpeeding / (trip.duration * 60)) * 100;
      if (speedingPercentage > 10) safetyScore -= 40;
      else if (speedingPercentage > 5) safetyScore -= 20;
      else if (speedingPercentage > 0) safetyScore -= 10;
      
      // Harsh driving events
      const totalHarshEvents = trip.harshAcceleration + trip.harshBraking;
      const eventsPerKm = totalHarshEvents / trip.distance;
      if (eventsPerKm > 1.0) safetyScore -= 40;
      else if (eventsPerKm > 0.5) safetyScore -= 30;
      else if (eventsPerKm > 0.3) safetyScore -= 20;
      else if (eventsPerKm > 0.1) safetyScore -= 10;
      
      // Over-revving penalty
      if (trip.overRevving > 60) safetyScore -= 15;
      else if (trip.overRevving > 30) safetyScore -= 10;
      else if (trip.overRevving > 10) safetyScore -= 5;
      
      totalSafetyScore += Math.max(0, safetyScore);
    });
    
    return Math.round(totalSafetyScore / recentTrips.length);
  }
  
  /**
   * Calculate quick stats with period-over-period changes
   */
  private static calculateQuickStats(
    currentWeek: WeeklyTripInsight, 
    previousWeek: WeeklyTripInsight, 
    userBaselines: UserBaselines
  ) {
    // Calculate fuel savings in ₹
    const expectedFuel = currentWeek.totalDistance / userBaselines.targetFuelEfficiency;
    const actualFuel = currentWeek.totalFuelUsed;
    const fuelSaved = Math.max(0, expectedFuel - actualFuel);
    const moneySaved = fuelSaved * userBaselines.fuelCostPerLiter;
    
    const previousExpectedFuel = previousWeek.totalDistance / userBaselines.targetFuelEfficiency;
    const previousActualFuel = previousWeek.totalFuelUsed;
    const previousFuelSaved = Math.max(0, previousExpectedFuel - previousActualFuel);
    const previousMoneySaved = previousFuelSaved * userBaselines.fuelCostPerLiter;
    
    return {
      totalDistance: {
        value: Math.round(currentWeek.totalDistance * 10) / 10,
        change: this.calculateChange(currentWeek.totalDistance, previousWeek.totalDistance)
      },
      avgSpeed: {
        value: Math.round(currentWeek.avgSpeed),
        change: this.calculateChange(currentWeek.avgSpeed, previousWeek.avgSpeed)
      },
      hardBrakingEvents: {
        value: currentWeek.totalHarshAcceleration + currentWeek.totalHarshBraking,
        change: this.calculateChange(
          currentWeek.totalHarshAcceleration + currentWeek.totalHarshBraking,
          previousWeek.totalHarshAcceleration + previousWeek.totalHarshBraking
        )
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
   * Generate insights based on current vs previous week data
   */
  private static generateInsights(
    currentWeek: WeeklyTripInsight,
    previousWeek: WeeklyTripInsight,
    recentTrips: RecentTripData[],
    userBaselines: UserBaselines
  ): Insight[] {
    const insights: Insight[] = [];
    
    // Fuel efficiency comparison
    const efficiencyImprovement = ((currentWeek.actualFuelEfficiency - previousWeek.actualFuelEfficiency) / previousWeek.actualFuelEfficiency) * 100;
    
    if (efficiencyImprovement > 10) {
      insights.push({
        type: 'positive',
        icon: 'trending-up',
        title: 'Great fuel efficiency improvement!',
        description: `You improved fuel efficiency by ${Math.round(efficiencyImprovement)}% this week.`,
        color: 'green'
      });
    } else if (efficiencyImprovement < -10) {
      insights.push({
        type: 'warning',
        icon: 'fuel',
        title: 'Fuel efficiency decreased',
        description: `Try maintaining steady speeds and gentle acceleration to improve efficiency.`,
        color: 'amber'
      });
    }
    
    // Harsh events comparison
    const currentHarshEvents = currentWeek.totalHarshAcceleration + currentWeek.totalHarshBraking;
    const previousHarshEvents = previousWeek.totalHarshAcceleration + previousWeek.totalHarshBraking;
    const harshEventsChange = ((currentHarshEvents - previousHarshEvents) / Math.max(1, previousHarshEvents)) * 100;
    
    if (harshEventsChange < -30) {
      insights.push({
        type: 'positive',
        icon: 'shield',
        title: 'Smooth driving detected',
        description: `You reduced harsh driving events by ${Math.abs(Math.round(harshEventsChange))}% this week.`,
        color: 'blue'
      });
    } else if (harshEventsChange > 50) {
      insights.push({
        type: 'warning',
        icon: 'alert-triangle',
        title: 'More harsh events detected',
        description: 'Try to anticipate stops and accelerate more gradually.',
        color: 'amber'
      });
    }
    
    // Idling comparison
    const avgIdlingCurrent = currentWeek.totalIdling / currentWeek.totalTrips / 60; // minutes per trip
    const avgIdlingPrevious = previousWeek.totalIdling / previousWeek.totalTrips / 60;
    
    if (avgIdlingCurrent > 3 && avgIdlingCurrent > avgIdlingPrevious * 1.2) {
      insights.push({
        type: 'tip',
        icon: 'clock',
        title: 'Reduce idling time',
        description: `Average idling increased to ${Math.round(avgIdlingCurrent)} minutes per trip. Turn off engine when stopped for more than 30 seconds.`,
        color: 'blue'
      });
    }
    
    // Speed consistency insight
    const speedImprovement = ((currentWeek.avgSpeed - previousWeek.avgSpeed) / previousWeek.avgSpeed) * 100;
    if (Math.abs(speedImprovement) < 5 && currentHarshEvents < previousHarshEvents) {
      insights.push({
        type: 'positive',
        icon: 'gauge',
        title: 'Excellent speed control',
        description: 'You maintained consistent speeds with fewer harsh events.',
        color: 'green'
      });
    }
    
    return insights;
  }
  
  /**
   * Calculate detailed score breakdown
   */
  private static calculateScoreBreakdown(
    currentWeek: WeeklyTripInsight, 
    recentTrips: RecentTripData[], 
    userBaselines: UserBaselines
  ) {
    // Safety score (based on harsh events and speeding)
    const totalHarshEvents = currentWeek.totalHarshAcceleration + currentWeek.totalHarshBraking;
    const harshEventsPerKm = totalHarshEvents / currentWeek.totalDistance;
    const speedingPercentage = (currentWeek.totalOverSpeeding / (currentWeek.totalDuration * 60)) * 100;
    
    let safety = 100;
    if (harshEventsPerKm > 1.0) safety -= 40;
    else if (harshEventsPerKm > 0.5) safety -= 25;
    else if (harshEventsPerKm > 0.3) safety -= 15;
    else if (harshEventsPerKm > 0.1) safety -= 5;
    
    if (speedingPercentage > 10) safety -= 30;
    else if (speedingPercentage > 5) safety -= 15;
    else if (speedingPercentage > 0) safety -= 5;
    
    // Efficiency score
    const efficiency = this.calculateFuelEfficiencyScore(currentWeek, userBaselines);
    
    // Smoothness score (based on harsh events frequency)
    let smoothness = 100;
    if (harshEventsPerKm > 1.0) smoothness -= 40;
    else if (harshEventsPerKm > 0.5) smoothness -= 25;
    else if (harshEventsPerKm > 0.3) smoothness -= 15;
    else if (harshEventsPerKm > 0.1) smoothness -= 5;
    
    // Environmental score (based on idling and over-revving)
    let environmental = 100;
    const avgIdlingPercentage = (currentWeek.totalIdling / (currentWeek.totalDuration * 60)) * 100;
    if (avgIdlingPercentage > 20) environmental -= 30;
    else if (avgIdlingPercentage > 10) environmental -= 15;
    else if (avgIdlingPercentage > 5) environmental -= 5;
    
    const avgOverRevTime = currentWeek.totalOverRevving / currentWeek.totalTrips;
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
}