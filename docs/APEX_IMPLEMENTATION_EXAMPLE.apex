/**
 * VoltRide Driving Score Calculator
 * Implement this logic in your Salesforce Apex classes
 */

public class DrivingScoreCalculator {
    
    // Main method to calculate trip score
    public static TripScore calculateTripScore(TripData trip, VehicleSettings vehicle) {
        try {
            // Validate input data
            if (trip == null || vehicle == null) {
                throw new IllegalArgumentException('Trip data and vehicle settings are required');
            }
            
            if (trip.distance <= 0 || trip.duration <= 0 || trip.fuelUsed <= 0) {
                throw new IllegalArgumentException('Invalid trip data: distance, duration, and fuel must be positive');
            }
            
            // Calculate component scores
            Decimal safetyScore = calculateSafetyScore(trip);
            Decimal efficiencyScore = calculateEfficiencyScore(trip, vehicle);
            Decimal smoothnessScore = calculateSmoothnessScore(trip);
            Decimal environmentalScore = calculateEnvironmentalScore(trip, vehicle);
            
            // Calculate weighted overall score
            Decimal overallScore = 
                safetyScore * 0.35 +           // 35% weight
                efficiencyScore * 0.25 +       // 25% weight
                smoothnessScore * 0.25 +       // 25% weight
                environmentalScore * 0.15;     // 15% weight
            
            // Create and populate result
            TripScore result = new TripScore();
            result.tripId = trip.tripId;
            result.calculatedScore = Integer.valueOf(Math.max(0, Math.min(100, Math.round(overallScore))));
            
            // Score breakdown
            result.scoreBreakdown = new ScoreBreakdown();
            result.scoreBreakdown.safety = Integer.valueOf(Math.round(safetyScore));
            result.scoreBreakdown.efficiency = Integer.valueOf(Math.round(efficiencyScore));
            result.scoreBreakdown.smoothness = Integer.valueOf(Math.round(smoothnessScore));
            result.scoreBreakdown.environmental = Integer.valueOf(Math.round(environmentalScore));
            
            // Calculate penalties and bonuses for insights
            result.penalties = calculatePenalties(trip);
            result.bonuses = calculateBonuses(trip, vehicle);
            
            // Generate insights
            result.insights = generateInsights(trip, vehicle, result);
            
            return result;
            
        } catch (Exception e) {
            System.debug('Error calculating trip score: ' + e.getMessage());
            // Return default score in case of error
            return createDefaultScore(trip.tripId);
        }
    }
    
    // Safety Score Calculation (0-100)
    public static Decimal calculateSafetyScore(TripData trip) {
        Decimal score = 100;
        
        // 1. Speeding penalty
        Decimal speedingPenalty = calculateSpeedingPenalty(trip);
        score -= speedingPenalty;
        
        // 2. Harsh events penalty
        Decimal harshEventsPenalty = calculateHarshEventsPenalty(trip);
        score -= harshEventsPenalty;
        
        // 3. Speed consistency (if speed profile available)
        if (trip.speedProfile != null && trip.speedProfile.size() > 0) {
            Decimal speedVariability = calculateVariability(trip.speedProfile);
            if (speedVariability > 25) score -= 15;
            else if (speedVariability > 15) score -= 10;
            else if (speedVariability > 10) score -= 5;
        }
        
        // 4. Environmental adjustment (bonus for difficult conditions)
        Decimal environmentalAdjustment = getEnvironmentalAdjustment(trip);
        score *= environmentalAdjustment;
        
        return Math.max(0, Math.min(100, score));
    }
    
    // Speeding penalty calculation
    public static Decimal calculateSpeedingPenalty(TripData trip) {
        if (trip.overSpeeding == 0) return 0;
        
        Decimal speedingSeconds = trip.overSpeeding;
        Decimal tripDurationSeconds = trip.duration * 60;
        Decimal speedingPercentage = (speedingSeconds / tripDurationSeconds) * 100;
        
        // Progressive penalty
        if (speedingPercentage <= 5) return 5;      // Minor speeding
        if (speedingPercentage <= 10) return 15;    // Moderate speeding
        return Math.min(30, speedingPercentage * 2); // Major speeding (max 30 points)
    }
    
    // Harsh events penalty calculation
    public static Decimal calculateHarshEventsPenalty(TripData trip) {
        Decimal totalEvents = trip.harshAcceleration + trip.harshBraking;
        if (totalEvents == 0) return 0;
        
        Decimal eventsPerKm = totalEvents / trip.distance;
        
        // Penalty based on events per kilometer
        if (eventsPerKm <= 0.1) return 0;      // Excellent (≤1 event per 10km)
        if (eventsPerKm <= 0.3) return 5;      // Good (≤3 events per 10km)
        if (eventsPerKm <= 0.5) return 15;     // Average (≤5 events per 10km)
        if (eventsPerKm <= 1.0) return 25;     // Poor (≤10 events per 10km)
        return 35;                             // Very poor (>10 events per 10km)
    }
    
    // Efficiency Score Calculation (0-100)
    public static Decimal calculateEfficiencyScore(TripData trip, VehicleSettings vehicle) {
        Decimal fuelEfficiencyScore = calculateFuelEfficiencyScore(trip, vehicle);
        Decimal ecoScore = calculateEcoDrivingScore(trip);
        
        return (fuelEfficiencyScore * 0.6) + (ecoScore * 0.4);
    }
    
    // Fuel efficiency score based on vehicle's claimed mileage
    public static Decimal calculateFuelEfficiencyScore(TripData trip, VehicleSettings vehicle) {
        Decimal actualEfficiency = trip.distance / trip.fuelUsed; // km/l
        Decimal claimedEfficiency = vehicle.averageMileage; // from vehicle settings
        Decimal ratio = actualEfficiency / claimedEfficiency;
        
        // Realistic scoring based on vehicle's claimed efficiency
        if (ratio >= 1.20) return 100;     // 20% better than claimed = excellent
        if (ratio >= 1.10) return 90;      // 10% better than claimed = very good
        if (ratio >= 1.05) return 80;      // 5% better than claimed = good
        if (ratio >= 0.95) return 70;      // Within 5% of claimed = acceptable
        if (ratio >= 0.90) return 60;      // 10% worse than claimed = below average
        if (ratio >= 0.80) return 50;      // 20% worse than claimed = poor
        return Math.max(30, ratio * 50);   // Minimum 30 points
    }
    
    // Eco-driving score based on engine behavior
    public static Decimal calculateEcoDrivingScore(TripData trip) {
        Decimal score = 100;
        
        // Engine load optimization (if available)
        if (trip.engineLoadProfile != null && trip.engineLoadProfile.size() > 0) {
            Decimal avgEngineLoad = calculateAverage(trip.engineLoadProfile);
            // Optimal engine load is 40-60%
            if (avgEngineLoad > 80) score -= 20;
            else if (avgEngineLoad > 70) score -= 10;
            else if (avgEngineLoad < 20) score -= 15; // Too low load is also inefficient
        }
        
        // Throttle usage optimization (if available)
        if (trip.throttleProfile != null && trip.throttleProfile.size() > 0) {
            Decimal avgThrottle = calculateAverage(trip.throttleProfile);
            // Gentle throttle usage
            if (avgThrottle > 60) score -= 15;
            else if (avgThrottle > 40) score -= 5;
        }
        
        return Math.max(0, score);
    }
    
    // Smoothness Score Calculation (0-100)
    public static Decimal calculateSmoothnessScore(TripData trip) {
        Decimal score = 100;
        
        // 1. Harsh events penalty
        Decimal totalHarshEvents = trip.harshAcceleration + trip.harshBraking;
        Decimal harshPenalty = Math.min(40, totalHarshEvents * 8); // Max 40 points penalty
        score -= harshPenalty;
        
        // 2. RPM consistency (if available)
        if (trip.rpmProfile != null && trip.rpmProfile.size() > 0) {
            Decimal rpmVariability = calculateVariability(trip.rpmProfile);
            Decimal rpmPenalty = Math.min(20, rpmVariability / 100); // Max 20 points penalty
            score -= rpmPenalty;
        }
        
        // 3. Throttle smoothness (if available)
        if (trip.throttleProfile != null && trip.throttleProfile.size() > 0) {
            Decimal throttleVariability = calculateVariability(trip.throttleProfile);
            Decimal throttlePenalty = Math.min(15, throttleVariability / 50); // Max 15 points penalty
            score -= throttlePenalty;
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    // Environmental Score Calculation (0-100)
    public static Decimal calculateEnvironmentalScore(TripData trip, VehicleSettings vehicle) {
        Decimal score = 100;
        
        // 1. Idling penalty
        Decimal idlingPenalty = calculateIdlingPenalty(trip);
        score -= idlingPenalty;
        
        // 2. Over-revving penalty
        Decimal overRevPenalty = Math.min(25, (trip.overRevving / 60) * 5); // 5 points per minute
        score -= overRevPenalty;
        
        // 3. Fuel efficiency bonus
        Decimal fuelEfficiency = trip.distance / trip.fuelUsed; // km/l
        Decimal claimedEfficiency = vehicle.averageMileage;
        if (fuelEfficiency > claimedEfficiency) {
            score += Math.min(15, (fuelEfficiency - claimedEfficiency) * 2);
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    // Idling penalty calculation
    public static Decimal calculateIdlingPenalty(TripData trip) {
        if (trip.idling == 0) return 0;
        
        Decimal idlingMinutes = trip.idling / 60;
        Decimal tripDurationMinutes = trip.duration;
        Decimal idlingPercentage = (idlingMinutes / tripDurationMinutes) * 100;
        
        // Progressive penalty
        if (idlingPercentage <= 5) return 0;     // Acceptable (≤5% of trip)
        if (idlingPercentage <= 10) return 5;    // Minor penalty (5-10% of trip)
        if (idlingPercentage <= 20) return 15;   // Moderate penalty (10-20% of trip)
        return Math.min(30, idlingPercentage);   // Major penalty (>20% of trip)
    }
    
    // Environmental adjustment for difficult driving conditions
    public static Decimal getEnvironmentalAdjustment(TripData trip) {
        Decimal adjustment = 1.0;
        
        // Weather adjustments (bonus for difficult conditions)
        if (trip.weatherCondition == 'rain') adjustment *= 1.05;
        else if (trip.weatherCondition == 'snow') adjustment *= 1.10;
        else if (trip.weatherCondition == 'fog') adjustment *= 1.08;
        
        // Time of day adjustments
        if (trip.timeOfDay == 'night') adjustment *= 1.03;
        else if (trip.timeOfDay == 'dawn' || trip.timeOfDay == 'dusk') adjustment *= 1.02;
        
        return Math.min(1.15, adjustment); // Max 15% bonus
    }
    
    // Utility method to calculate coefficient of variation
    public static Decimal calculateVariability(List<Decimal> values) {
        if (values == null || values.size() == 0) return 0;
        
        Decimal mean = calculateAverage(values);
        if (mean == 0) return 0;
        
        Decimal sumSquaredDiffs = 0;
        for (Decimal value : values) {
            sumSquaredDiffs += Math.pow(value - mean, 2);
        }
        
        Decimal variance = sumSquaredDiffs / values.size();
        Decimal stdDev = Math.sqrt(variance);
        
        return (stdDev / mean) * 100; // Coefficient of variation as percentage
    }
    
    // Utility method to calculate average
    public static Decimal calculateAverage(List<Decimal> values) {
        if (values == null || values.size() == 0) return 0;
        
        Decimal sum = 0;
        for (Decimal value : values) {
            sum += value;
        }
        return sum / values.size();
    }
    
    // Generate insights based on trip performance
    public static List<TripInsight> generateInsights(TripData trip, VehicleSettings vehicle, TripScore score) {
        List<TripInsight> insights = new List<TripInsight>();
        
        // Fuel efficiency insight
        Decimal actualEfficiency = trip.distance / trip.fuelUsed;
        Decimal efficiencyVsClaimed = ((actualEfficiency - vehicle.averageMileage) / vehicle.averageMileage) * 100;
        
        if (efficiencyVsClaimed > 10) {
            insights.add(new TripInsight('positive', 'Exceeding vehicle specifications! You\'re getting ' + 
                Math.round(efficiencyVsClaimed) + '% better fuel efficiency than claimed.'));
        } else if (efficiencyVsClaimed < -15) {
            insights.add(new TripInsight('warning', 'Below expected fuel efficiency. You\'re ' + 
                Math.abs(Math.round(efficiencyVsClaimed)) + '% below your vehicle\'s claimed mileage.'));
        }
        
        // Harsh events insight
        Decimal totalHarshEvents = trip.harshAcceleration + trip.harshBraking;
        if (totalHarshEvents == 0) {
            insights.add(new TripInsight('positive', 'Excellent! No harsh driving events detected.'));
        } else if (totalHarshEvents > 5) {
            insights.add(new TripInsight('warning', totalHarshEvents + ' harsh driving events detected. Try to anticipate stops and accelerate gradually.'));
        }
        
        // Idling insight
        if (trip.idling > 180) { // More than 3 minutes
            Decimal idlingMinutes = Math.round(trip.idling / 60);
            insights.add(new TripInsight('tip', 'You idled for ' + idlingMinutes + ' minutes. Turn off engine when stopped for more than 30 seconds.'));
        }
        
        // Speed insight
        if (trip.overSpeeding > 60) { // More than 1 minute of speeding
            insights.add(new TripInsight('warning', 'Speeding detected for ' + Math.round(trip.overSpeeding / 60) + ' minutes. Maintain speed limits for safety.'));
        }
        
        return insights;
    }
    
    // Calculate penalties for detailed breakdown
    public static TripPenalties calculatePenalties(TripData trip) {
        TripPenalties penalties = new TripPenalties();
        penalties.speedingPenalty = Integer.valueOf(calculateSpeedingPenalty(trip));
        penalties.harshEventsPenalty = Integer.valueOf(calculateHarshEventsPenalty(trip));
        penalties.idlingPenalty = Integer.valueOf(calculateIdlingPenalty(trip));
        return penalties;
    }
    
    // Calculate bonuses for detailed breakdown
    public static TripBonuses calculateBonuses(TripData trip, VehicleSettings vehicle) {
        TripBonuses bonuses = new TripBonuses();
        
        // Fuel efficiency bonus
        Decimal actualEfficiency = trip.distance / trip.fuelUsed;
        if (actualEfficiency > vehicle.averageMileage) {
            bonuses.fuelEfficiencyBonus = Integer.valueOf(Math.min(15, (actualEfficiency - vehicle.averageMileage) * 2));
        }
        
        // Smoothness bonus (no harsh events)
        if (trip.harshAcceleration + trip.harshBraking == 0) {
            bonuses.smoothnessBonus = 5;
        }
        
        return bonuses;
    }
    
    // Create default score in case of errors
    public static TripScore createDefaultScore(String tripId) {
        TripScore defaultScore = new TripScore();
        defaultScore.tripId = tripId;
        defaultScore.calculatedScore = 50; // Neutral score
        defaultScore.scoreBreakdown = new ScoreBreakdown();
        defaultScore.scoreBreakdown.safety = 50;
        defaultScore.scoreBreakdown.efficiency = 50;
        defaultScore.scoreBreakdown.smoothness = 50;
        defaultScore.scoreBreakdown.environmental = 50;
        defaultScore.insights = new List<TripInsight>();
        return defaultScore;
    }
}

// Data classes for the calculation
public class TripData {
    public String tripId;
    public Decimal distance;        // km
    public Decimal duration;        // minutes
    public Decimal fuelUsed;        // liters
    public Decimal avgSpeed;        // km/hr
    public Decimal maxSpeed;        // km/hr
    public Integer harshAcceleration;
    public Integer harshBraking;
    public Integer overSpeeding;    // seconds
    public Integer idling;          // seconds
    public Integer overRevving;     // seconds
    public String weatherCondition; // clear, rain, snow, fog
    public String timeOfDay;        // morning, afternoon, evening, night
    public String roadType;         // city, highway, residential, rural
    public List<Decimal> speedProfile;
    public List<Decimal> rpmProfile;
    public List<Decimal> throttleProfile;
    public List<Decimal> engineLoadProfile;
}

public class VehicleSettings {
    public Decimal averageMileage;  // km/l claimed by manufacturer
    public String fuelType;        // Petrol, Diesel, Electric
    public Decimal speedThreshold; // km/hr
}

public class TripScore {
    public String tripId;
    public Integer calculatedScore;
    public ScoreBreakdown scoreBreakdown;
    public TripPenalties penalties;
    public TripBonuses bonuses;
    public List<TripInsight> insights;
}

public class ScoreBreakdown {
    public Integer safety;
    public Integer efficiency;
    public Integer smoothness;
    public Integer environmental;
}

public class TripPenalties {
    public Integer speedingPenalty;
    public Integer harshEventsPenalty;
    public Integer idlingPenalty;
}

public class TripBonuses {
    public Integer fuelEfficiencyBonus;
    public Integer smoothnessBonus;
}

public class TripInsight {
    public String type;     // positive, warning, tip
    public String message;
    
    public TripInsight(String type, String message) {
        this.type = type;
        this.message = message;
    }
}