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
      drivingScore: Math.round(drivingScore),
      fuelEfficiency: Math.round(fuelEfficiency),
      safetyRating: Math.round(safetyRating),
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
      averageFuelEfficiency: parseFloat(settings.vehicle.averageMileage) || 15.0,
      targetFuelEfficiency: parseFloat(settings.vehicle.averageMileage) || 15.0, // Use same as average
      fuelCostPerLiter: settings.vehicle.fuelType === 'Petrol' ? 102 : 89, // ₹ per liter
      vehicleType: settings.vehicle.fuelType.toLowerCase() as 'petrol' | 'diesel' | 'electric',
      speedThreshold: parseFloat(settings.vehicle.speedThreshold) || 80,
      harshAccelThreshold: parseFloat(settings.vehicle.harshAccelThreshold) || 3.5,
      harshBrakeThreshold: parseFloat(settings.vehicle.harshBrakeThreshold) || 4.0,
      revThreshold: parseFloat(settings.vehicle.revThreshold) || 3500,
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
      const eventsPerKm = trip.distance > 0 ? totalHarshEvents / trip.distance : 0;
      if (eventsPerKm > 1.0) tripScore -= 35;
      else if (eventsPerKm > 0.5) tripScore -= 25;
      else if (eventsPerKm > 0.3) tripScore -= 15;
      else if (eventsPerKm > 0.1) tripScore -= 5;
      
      // Fuel efficiency bonus/penalty
      if (trip.fuelUsed > 0 && trip.distance > 0) {
        const tripEfficiency = trip.distance / trip.fuelUsed;
        const efficiencyRatio = tripEfficiency / userBaselines.averageFuelEfficiency;
        if (efficiencyRatio > 1.1) tripScore += 10; // 10% better than claimed
        else if (efficiencyRatio < 0.9) tripScore -= 15; // 10% worse than claimed
      }
      
      // Idling penalty
      const idlingPercentage = (trip.idling / (trip.duration * 60)) * 100;
      if (idlingPercentage > 20) tripScore -= 20;
      else if (idlingPercentage > 10) tripScore -= 10;
      else if (idlingPercentage > 5) tripScore -= 5;
      
      totalScore += Math.max(0, Math.min(100, tripScore));
    });
    
    return totalScore / recentTrips.length;
  }
  
  /**
   * Calculate fuel efficiency score (0-100)
   */
  private static calculateFuelEfficiencyScore(currentWeek: WeeklyTripInsight, userBaselines: UserBaselines): number {
    // Handle edge cases for fuel efficiency calculation
    if (!currentWeek.totalFuelUsed || currentWeek.totalFuelUsed <= 0 || 
        !currentWeek.totalDistance || currentWeek.totalDistance <= 0) {
      console.warn('Invalid fuel or distance data for efficiency calculation');
      return 50; // Return neutral score
    }
    
    // Check if actualFuelEfficiency is provided and valid
    let actualEfficiency: number;
    if (currentWeek.actualFuelEfficiency && 
        !isNaN(currentWeek.actualFuelEfficiency) && 
        currentWeek.actualFuelEfficiency > 0) {
      actualEfficiency = currentWeek.actualFuelEfficiency;
    } else {
      // Calculate from totalDistance / totalFuelUsed
      actualEfficiency = currentWeek.totalDistance / currentWeek.totalFuelUsed;
    }
    
    // Validate calculated efficiency
    if (!actualEfficiency || isNaN(actualEfficiency) || actualEfficiency <= 0) {
      console.warn('Invalid calculated fuel efficiency:', actualEfficiency);
      return 50; // Return neutral score
    }
    
    // Compare against vehicle's claimed mileage
    const ratio = actualEfficiency / userBaselines.averageFuelEfficiency;
    
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
      const eventsPerKm = trip.distance > 0 ? totalHarshEvents / trip.distance : 0;
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
    
    return totalSafetyScore / recentTrips.length;
  }
  
  /**
   * Calculate quick stats with period-over-period changes
   */
  private static calculateQuickStats(
    currentWeek: WeeklyTripInsight, 
    previousWeek: WeeklyTripInsight, 
    userBaselines: UserBaselines
  ) {
    // Calculate fuel savings in ₹ with proper validation
    let currentFuelSaved = 0;
    let previousFuelSaved = 0;
    
    if (currentWeek.totalDistance > 0 && currentWeek.totalFuelUsed > 0) {
      const expectedFuel = currentWeek.totalDistance / userBaselines.averageFuelEfficiency;
      currentFuelSaved = Math.max(0, expectedFuel - currentWeek.totalFuelUsed);
    }
    
    if (previousWeek.totalDistance > 0 && previousWeek.totalFuelUsed > 0) {
      const previousExpectedFuel = previousWeek.totalDistance / userBaselines.averageFuelEfficiency;
      previousFuelSaved = Math.max(0, previousExpectedFuel - previousWeek.totalFuelUsed);
    }
    
    const moneySaved = currentFuelSaved * userBaselines.fuelCostPerLiter;
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
    if (!previous || previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    
    if (!current || isNaN(current) || !isFinite(current)) {
      return "0%";
    }
    
    const change = ((current - previous) / previous) * 100;
    
    if (!isFinite(change) || isNaN(change)) {
      return "0%";
    }
    
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
    
    // Fuel efficiency comparison - with proper validation
    let efficiencyImprovement = 0;
    if (currentWeek.totalFuelUsed > 0 && previousWeek.totalFuelUsed > 0 &&
        currentWeek.totalDistance > 0 && previousWeek.totalDistance > 0) {
      
      const currentEfficiency = currentWeek.actualFuelEfficiency || 
                               (currentWeek.totalDistance / currentWeek.totalFuelUsed);
      const previousEfficiency = previousWeek.actualFuelEfficiency || 
                                (previousWeek.totalDistance / previousWeek.totalFuelUsed);
      
      if (currentEfficiency > 0 && previousEfficiency > 0) {
        efficiencyImprovement = ((currentEfficiency - previousEfficiency) / previousEfficiency) * 100;
      }
    }
    
    // Compare against vehicle's claimed mileage
    if (currentWeek.totalFuelUsed > 0 && currentWeek.totalDistance > 0) {
      const currentEfficiency = currentWeek.actualFuelEfficiency || 
                               (currentWeek.totalDistance / currentWeek.totalFuelUsed);
      const efficiencyVsClaimed = ((currentEfficiency - userBaselines.averageFuelEfficiency) / userBaselines.averageFuelEfficiency) * 100;
      
      if (efficiencyVsClaimed > 10) {
        insights.push({
          type: 'positive',
          icon: 'trending-up',
          title: 'Exceeding vehicle specifications!',
          description: `You're getting ${Math.round(efficiencyVsClaimed)}% better fuel efficiency than your vehicle's claimed ${userBaselines.averageFuelEfficiency} km/l.`,
          color: 'green'
        });
      } else if (efficiencyVsClaimed < -15) {
        insights.push({
          type: 'warning',
          icon: 'fuel',
          title: 'Below expected fuel efficiency',
          description: `Your efficiency is ${Math.abs(Math.round(efficiencyVsClaimed))}% below your vehicle's claimed ${userBaselines.averageFuelEfficiency} km/l. Check driving habits and vehicle maintenance.`,
          color: 'amber'
        });
      } else if (Math.abs(efficiencyVsClaimed) <= 5) {
        insights.push({
          type: 'positive',
          icon: 'check-circle',
          title: 'Meeting vehicle specifications',
          description: `Your fuel efficiency is close to your vehicle's claimed ${userBaselines.averageFuelEfficiency} km/l. Great job!`,
          color: 'blue'
        });
      }
    }
    
    if (efficiencyImprovement > 5) {
      insights.push({
        type: 'positive',
        icon: 'trending-up',
        title: 'Fuel efficiency improved!',
        description: `You improved fuel efficiency by ${Math.round(efficiencyImprovement)}% this week compared to last week.`,
        color: 'green'
      });
    }
    
    // Harsh events comparison
    const currentHarshEvents = currentWeek.totalHarshAcceleration + currentWeek.totalHarshBraking;
    const previousHarshEvents = previousWeek.totalHarshAcceleration + previousWeek.totalHarshBraking;
    const harshEventsChange = previousHarshEvents > 0 ? 
      ((currentHarshEvents - previousHarshEvents) / previousHarshEvents) * 100 : 0;
    
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
    const avgIdlingCurrent = currentWeek.totalTrips > 0 ? 
      currentWeek.totalIdling / currentWeek.totalTrips / 60 : 0; // minutes per trip
    const avgIdlingPrevious = previousWeek.totalTrips > 0 ? 
      previousWeek.totalIdling / previousWeek.totalTrips / 60 : 0;
    
    if (avgIdlingCurrent > 3 && avgIdlingPrevious > 0 && avgIdlingCurrent > avgIdlingPrevious * 1.2) {
      insights.push({
        type: 'tip',
        icon: 'clock',
        title: 'Reduce idling time',
        description: `Average idling increased to ${Math.round(avgIdlingCurrent)} minutes per trip. Turn off engine when stopped for more than 30 seconds.`,
        color: 'blue'
      });
    }
    
    // Speed consistency insight
    const speedImprovement = previousWeek.avgSpeed > 0 ? 
      ((currentWeek.avgSpeed - previousWeek.avgSpeed) / previousWeek.avgSpeed) * 100 : 0;
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
    const harshEventsPerKm = currentWeek.totalDistance > 0 ? totalHarshEvents / currentWeek.totalDistance : 0;
    const speedingPercentage = currentWeek.totalDuration > 0 ? 
      (currentWeek.totalOverSpeeding / (currentWeek.totalDuration * 60)) * 100 : 0;
    
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
    const avgIdlingPercentage = currentWeek.totalDuration > 0 ? 
      (currentWeek.totalIdling / (currentWeek.totalDuration * 60)) * 100 : 0;
    if (avgIdlingPercentage > 20) environmental -= 30;
    else if (avgIdlingPercentage > 10) environmental -= 15;
    else if (avgIdlingPercentage > 5) environmental -= 5;
    
    const avgOverRevTime = currentWeek.totalTrips > 0 ? 
      currentWeek.totalOverRevving / currentWeek.totalTrips : 0;
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