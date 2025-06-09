# VoltRide Driving Score Calculation System

## Overview
This document outlines the complete driving score calculation algorithm that should be implemented in Salesforce Apex. Each trip gets a score from 0-100 based on multiple driving factors.

## Score Components & Weights

The overall driving score is calculated using these weighted components:

```
Overall Score = (Safety × 35%) + (Efficiency × 25%) + (Smoothness × 25%) + (Environmental × 15%)
```

### 1. Safety Score (35% weight) - Most Important
- **Speeding violations**
- **Harsh acceleration/braking events**
- **Speed consistency**
- **Environmental conditions adjustment**

### 2. Efficiency Score (25% weight)
- **Fuel consumption vs vehicle's claimed mileage**
- **Eco-driving patterns**
- **Engine load optimization**

### 3. Smoothness Score (25% weight)
- **Acceleration/braking patterns**
- **RPM consistency**
- **Throttle smoothness**

### 4. Environmental Score (15% weight)
- **Idling time**
- **Over-revving**
- **Emissions impact**

## Detailed Calculation Logic

### Safety Score Calculation (0-100)

```apex
public static Decimal calculateSafetyScore(TripData trip) {
    Decimal score = 100;
    
    // 1. Speeding Penalty
    Decimal speedingPenalty = calculateSpeedingPenalty(trip);
    score -= speedingPenalty;
    
    // 2. Harsh Events Penalty
    Decimal harshEventsPenalty = calculateHarshEventsPenalty(trip);
    score -= harshEventsPenalty;
    
    // 3. Speed Consistency Bonus/Penalty
    Decimal speedConsistency = calculateSpeedConsistency(trip);
    score += (speedConsistency - 50) * 0.2;
    
    // 4. Environmental Adjustment (weather, time of day)
    Decimal environmentalAdjustment = getEnvironmentalAdjustment(trip);
    score *= environmentalAdjustment;
    
    return Math.max(0, Math.min(100, score));
}
```

#### Speeding Penalty Logic:
```apex
public static Decimal calculateSpeedingPenalty(TripData trip) {
    Decimal speedingSeconds = trip.overSpeedingTime; // seconds
    Decimal tripDurationSeconds = trip.duration * 60;
    
    if (speedingSeconds == 0) return 0;
    
    Decimal speedingPercentage = (speedingSeconds / tripDurationSeconds) * 100;
    
    // Progressive penalty
    if (speedingPercentage <= 5) return 5;      // Minor speeding
    if (speedingPercentage <= 10) return 15;    // Moderate speeding
    return Math.min(30, speedingPercentage * 2); // Major speeding (max 30 points)
}
```

#### Harsh Events Penalty Logic:
```apex
public static Decimal calculateHarshEventsPenalty(TripData trip) {
    Decimal totalEvents = trip.harshAcceleration + trip.harshBraking;
    Decimal eventsPerKm = totalEvents / trip.distance;
    
    // Penalty based on events per kilometer
    if (eventsPerKm <= 0.1) return 0;      // Excellent (≤1 event per 10km)
    if (eventsPerKm <= 0.3) return 5;      // Good (≤3 events per 10km)
    if (eventsPerKm <= 0.5) return 15;     // Average (≤5 events per 10km)
    if (eventsPerKm <= 1.0) return 25;     // Poor (≤10 events per 10km)
    return 35;                             // Very poor (>10 events per 10km)
}
```

### Efficiency Score Calculation (0-100)

```apex
public static Decimal calculateEfficiencyScore(TripData trip, VehicleSettings vehicle) {
    Decimal fuelEfficiencyScore = calculateFuelEfficiencyScore(trip, vehicle);
    Decimal ecoScore = calculateEcoDrivingScore(trip);
    
    return (fuelEfficiencyScore * 0.6) + (ecoScore * 0.4);
}
```

#### Fuel Efficiency Logic:
```apex
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
```

### Smoothness Score Calculation (0-100)

```apex
public static Decimal calculateSmoothnessScore(TripData trip) {
    Decimal score = 100;
    
    // 1. Harsh Events Penalty
    Decimal totalHarshEvents = trip.harshAcceleration + trip.harshBraking;
    Decimal harshPenalty = Math.min(40, totalHarshEvents * 8); // Max 40 points penalty
    score -= harshPenalty;
    
    // 2. RPM Consistency (if available)
    if (trip.rpmReadings != null && trip.rpmReadings.size() > 0) {
        Decimal rpmVariability = calculateVariability(trip.rpmReadings);
        Decimal rpmPenalty = Math.min(20, rpmVariability / 100); // Max 20 points penalty
        score -= rpmPenalty;
    }
    
    // 3. Throttle Smoothness (if available)
    if (trip.throttleReadings != null && trip.throttleReadings.size() > 0) {
        Decimal throttleVariability = calculateVariability(trip.throttleReadings);
        Decimal throttlePenalty = Math.min(15, throttleVariability / 50); // Max 15 points penalty
        score -= throttlePenalty;
    }
    
    return Math.max(0, Math.min(100, score));
}
```

### Environmental Score Calculation (0-100)

```apex
public static Decimal calculateEnvironmentalScore(TripData trip, VehicleSettings vehicle) {
    Decimal score = 100;
    
    // 1. Idling Penalty
    Decimal idlingPenalty = calculateIdlingPenalty(trip);
    score -= idlingPenalty;
    
    // 2. Over-revving Penalty
    Decimal overRevPenalty = Math.min(25, (trip.overRevving / 60) * 5); // 5 points per minute
    score -= overRevPenalty;
    
    // 3. Fuel Efficiency Bonus
    Decimal fuelEfficiency = trip.distance / trip.fuelUsed; // km/l
    Decimal claimedEfficiency = vehicle.averageMileage;
    if (fuelEfficiency > claimedEfficiency) {
        score += Math.min(15, (fuelEfficiency - claimedEfficiency) * 2);
    }
    
    return Math.max(0, Math.min(100, score));
}
```

#### Idling Penalty Logic:
```apex
public static Decimal calculateIdlingPenalty(TripData trip) {
    Decimal idlingMinutes = trip.idling / 60;
    Decimal tripDurationMinutes = trip.duration;
    Decimal idlingPercentage = (idlingMinutes / tripDurationMinutes) * 100;
    
    // Progressive penalty
    if (idlingPercentage <= 5) return 0;     // Acceptable (≤5% of trip)
    if (idlingPercentage <= 10) return 5;    // Minor penalty (5-10% of trip)
    if (idlingPercentage <= 20) return 15;   // Moderate penalty (10-20% of trip)
    return Math.min(30, idlingPercentage);   // Major penalty (>20% of trip)
}
```

## Required Data Structure for Each Trip

### Input Data from OBD-II & GPS:
```json
{
  "tripId": "trip_001",
  "tripName": "Trip - 0001",
  "date": "2024-01-15",
  "startTime": "08:30",
  "endTime": "09:15",
  "distance": 20.1,           // kilometers
  "duration": 45,             // minutes
  "fuelUsed": 1.3,           // liters
  "avgSpeed": 45,            // km/hr
  "maxSpeed": 105,           // km/hr
  
  // Driving Events (from OBD-II analysis)
  "harshAcceleration": 2,     // count of events
  "harshBraking": 1,          // count of events
  "overSpeeding": 45,         // seconds spent over speed limit
  "idling": 180,              // seconds spent idling
  "overRevving": 15,          // seconds spent over-revving
  
  // Optional: Detailed readings for advanced scoring
  "speedProfile": [42, 38, 45, 52, ...],     // speed readings over time
  "rpmProfile": [1800, 1650, 2100, ...],     // RPM readings over time
  "throttleProfile": [25, 20, 35, ...],      // throttle position %
  "engineLoadProfile": [45, 38, 52, ...],    // engine load %
  
  // Context Data
  "weatherCondition": "clear",  // clear, rain, snow, fog
  "timeOfDay": "morning",       // morning, afternoon, evening, night
  "roadType": "city",           // city, highway, residential, rural
  "trafficCondition": "moderate" // light, moderate, heavy
}
```

### Output: Calculated Score
```json
{
  "tripId": "trip_001",
  "calculatedScore": 92,      // Overall score (0-100)
  "scoreBreakdown": {
    "safety": 88,             // Safety component score
    "efficiency": 85,         // Efficiency component score
    "smoothness": 92,         // Smoothness component score
    "environmental": 78       // Environmental component score
  },
  "penalties": {
    "speedingPenalty": 5,     // Points deducted for speeding
    "harshEventsPenalty": 15, // Points deducted for harsh events
    "idlingPenalty": 10       // Points deducted for idling
  },
  "bonuses": {
    "fuelEfficiencyBonus": 8, // Points added for good fuel efficiency
    "smoothnessBonus": 5      // Points added for smooth driving
  },
  "insights": [
    {
      "type": "positive",
      "message": "Excellent fuel efficiency - 12% better than vehicle specification"
    },
    {
      "type": "warning", 
      "message": "3 harsh braking events detected - try to anticipate stops"
    }
  ]
}
```

## Implementation in Salesforce Apex

### Main Calculation Method:
```apex
public class DrivingScoreCalculator {
    
    public static TripScore calculateTripScore(TripData trip, VehicleSettings vehicle) {
        // Calculate component scores
        Decimal safetyScore = calculateSafetyScore(trip);
        Decimal efficiencyScore = calculateEfficiencyScore(trip, vehicle);
        Decimal smoothnessScore = calculateSmoothnessScore(trip);
        Decimal environmentalScore = calculateEnvironmentalScore(trip, vehicle);
        
        // Calculate weighted overall score
        Decimal overallScore = Math.round(
            safetyScore * 0.35 +
            efficiencyScore * 0.25 +
            smoothnessScore * 0.25 +
            environmentalScore * 0.15
        );
        
        // Create result object
        TripScore result = new TripScore();
        result.tripId = trip.tripId;
        result.calculatedScore = Integer.valueOf(Math.max(0, Math.min(100, overallScore)));
        result.scoreBreakdown = new ScoreBreakdown();
        result.scoreBreakdown.safety = Integer.valueOf(safetyScore);
        result.scoreBreakdown.efficiency = Integer.valueOf(efficiencyScore);
        result.scoreBreakdown.smoothness = Integer.valueOf(smoothnessScore);
        result.scoreBreakdown.environmental = Integer.valueOf(environmentalScore);
        
        // Add insights
        result.insights = generateInsights(trip, vehicle, result.scoreBreakdown);
        
        return result;
    }
}
```

## Score Interpretation Guide

### Overall Score Ranges:
- **90-100**: Excellent Driver - Very safe and efficient
- **80-89**: Good Driver - Minor areas for improvement
- **70-79**: Average Driver - Several areas need attention
- **60-69**: Below Average - Significant improvement needed
- **0-59**: Poor Driver - Major safety and efficiency concerns

### Component Score Interpretation:
- **Safety**: Focus on speed compliance and smooth driving
- **Efficiency**: Optimize fuel consumption and eco-driving
- **Smoothness**: Improve acceleration/braking patterns
- **Environmental**: Reduce idling and emissions

## Frontend Integration

The frontend expects this data structure in the trip insights response:

```json
{
  "recentTrips": [
    {
      "tripId": "trip_001",
      "tripName": "Trip - 0001",
      "date": "2024-01-15",
      "startTime": "08:30",
      "endTime": "09:15",
      "distance": 20.1,
      "duration": 45,
      "fuelUsed": 1.3,
      "avgSpeed": 45,
      "maxSpeed": 105,
      "harshAcceleration": 2,
      "harshBraking": 1,
      "overSpeeding": 45,
      "idling": 180,
      "overRevving": 15,
      "calculatedScore": 92    // ← This is what you calculate in Apex
    }
  ]
}
```

The frontend will use the `calculatedScore` field to display trip scores, generate insights, and calculate overall performance metrics.