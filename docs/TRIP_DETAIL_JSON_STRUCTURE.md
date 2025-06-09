# Trip Detail Data JSON Structure for Salesforce

## Overview
This document specifies the exact JSON structure that your Salesforce API should return for individual trip details. The frontend expects this data when calling `/services/apexrest/voltride/tripDetails/{tripId}`.

**IMPORTANT:** You do NOT need to send `startLocation` and `endLocation` separately. The frontend will automatically extract the start location from the first point in the route array and the end location from the last point.

## Complete Trip Detail JSON Structure

```json
{
  "success": true,
  "tripData": {
    "tripId": "trip_001",
    "tripName": "Trip - 0001",
    "date": "2024-01-15",
    "startTime": "08:30",
    "endTime": "09:15",
    
    // Basic Trip Metrics
    "distance": 20.1,           // kilometers
    "duration": 45,             // minutes
    "fuelUsed": 1.3,           // liters
    "avgSpeed": 45,            // km/hr
    "maxSpeed": 105,           // km/hr
    
    // Calculated Score (from your Apex implementation)
    "calculatedScore": 92,      // 0-100 overall score
    
    // Driving Events (from OBD-II analysis)
    "harshAcceleration": 2,     // count of harsh acceleration events
    "harshBraking": 1,          // count of harsh braking events
    "overSpeeding": 45,         // seconds spent over speed limit
    "idling": 180,              // seconds spent idling
    "overRevving": 15,          // seconds spent over-revving
    
    // Route Path (GPS coordinates - FIRST = START, LAST = END)
    "route": [
      { "lat": 19.0760, "lng": 72.8777},      // START LOCATION
      { "lat": 19.0750, "lng": 72.8767 },
      { "lat": 19.0740, "lng": 72.8757 },
      { "lat": 19.0730, "lng": 72.8747 },
      { "lat": 19.0720, "lng": 72.8737 },
      { "lat": 19.0710, "lng": 72.8727 },
      // ... more route points
      { "lat": 19.0176, "lng": 72.8562}       // END LOCATION
    ],
    
    // Detailed Score Breakdown (from your Apex calculation)
    "scoreBreakdown": {
      "safety": 88,             // Safety component score (0-100)
      "efficiency": 85,         // Efficiency component score (0-100)
      "smoothness": 92,         // Smoothness component score (0-100)
      "environmental": 78       // Environmental component score (0-100)
    },
    
    // Penalties Applied (ARRAY FORMAT as requested)
    "penalties": {
      "descriptions": ["Harsh Acceleration", "High CO₂ emission", "Excessive Idling"],
      "points": [10, 10, 5]
    },
    
    // Bonuses Applied (ARRAY FORMAT as requested)
    "bonuses": {
      "descriptions": ["Fuel efficiency above average", "Low CO₂ emissions", "Smooth driving"],
      "points": [20, 20, 15]
    },
    
    // AI-Generated Insights (from your Apex calculation)
    "insights": [
      {
        "type": "positive",
        "message": "Excellent fuel efficiency - 12% better than vehicle specification"
      },
      {
        "type": "warning", 
        "message": "3 harsh braking events detected - try to anticipate stops"
      },
      {
        "type": "tip",
        "message": "Consider using cruise control on highways to maintain consistent speeds"
      }
    ],
    
    // Environmental Context
    "weatherCondition": "clear", // clear, rain, snow, fog
    "timeOfDay": "morning",      // morning, afternoon, evening, night
    "roadType": "city",          // city, highway, residential, rural
    "trafficCondition": "moderate", // light, moderate, heavy
    
    // 🎯 YOUR REQUESTED FORMAT: Detailed OBD-II Data with Time
    "detailedData": {
      "TimeData": ["8:10", "8:12", "8:15", "8:18", "8:20", "8:22", "8:25"],
      "SpeedProfile": [42, 38, 45, 52, 48, 41, 39],
      "ThrottleProfile": [25, 20, 35, 45, 40, 28, 22],
      "RpmProfile": [1800, 1650, 2100, 2400, 2200, 1900, 1750],
      "EngineLoadProfile": [45, 38, 52, 62, 58, 48, 42]
    },
    
    // Calculated Environmental Impact
    "environmentalImpact": {
      "co2Emitted": 3.1,        // kg of CO2 emitted
      "fuelEfficiency": 15.5,   // actual km/l achieved
      "estimatedCost": 132.6    // estimated fuel cost in ₹
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🎯 **Your Requested Time Data Format:**

```json
"detailedData": {
  "TimeData": ["8:10", "8:12", "8:15", "8:18", "8:20", "8:22", "8:25"],
  "SpeedProfile": [42, 38, 45, 52, 48, 41, 39],
  "ThrottleProfile": [25, 20, 35, 45, 40, 28, 22], 
  "RpmProfile": [1800, 1650, 2100, 2400, 2200, 1900, 1750],
  "EngineLoadProfile": [45, 38, 52, 62, 58, 48, 42]
}
```

## 📋 **Key Points:**

1. **TimeData Array**: Contains time strings in "H:MM" format (e.g., "8:10", "8:12")
2. **All Arrays Same Length**: TimeData, SpeedProfile, ThrottleProfile, RpmProfile, and EngineLoadProfile must have the same number of elements
3. **Index Correspondence**: TimeData[0] corresponds to SpeedProfile[0], ThrottleProfile[0], etc.
4. **Time Format**: Use "H:MM" or "HH:MM" format for times (e.g., "8:10" or "08:10")

## 🚀 **Example with More Data Points:**

```json
"detailedData": {
  "TimeData": [
    "8:30", "8:31", "8:32", "8:33", "8:34", "8:35", 
    "8:36", "8:37", "8:38", "8:39", "8:40"
  ],
  "SpeedProfile": [0, 15, 25, 35, 45, 50, 55, 48, 42, 38, 35],
  "ThrottleProfile": [0, 30, 40, 45, 35, 30, 25, 20, 15, 10, 8],
  "RpmProfile": [800, 1200, 1500, 1800, 2000, 2200, 2100, 1900, 1700, 1500, 1400],
  "EngineLoadProfile": [10, 25, 35, 45, 50, 55, 52, 48, 42, 38, 35]
}
```

## ✅ **Benefits:**

- **Simple Format**: Easy to generate from Salesforce
- **Time Precision**: Exact time stamps for each data point
- **Synchronized Data**: All sensor readings perfectly aligned
- **Chart Ready**: Frontend can directly use this for time-based charts
- **Flexible Intervals**: Support for variable time intervals between readings

The frontend will automatically detect this format and create beautiful time-based charts! 📊