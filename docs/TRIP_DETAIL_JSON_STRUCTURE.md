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
      { "lat": 19.0760, "lng": 72.8777, "address": "Bandra West, Mumbai" },      // START LOCATION
      { "lat": 19.0750, "lng": 72.8767 },
      { "lat": 19.0740, "lng": 72.8757 },
      { "lat": 19.0730, "lng": 72.8747 },
      { "lat": 19.0720, "lng": 72.8737 },
      { "lat": 19.0710, "lng": 72.8727 },
      // ... more route points
      { "lat": 19.0176, "lng": 72.8562, "address": "Lower Parel, Mumbai" }       // END LOCATION
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
    
    // Optional: Detailed OBD-II Data for Advanced Analytics WITH TIME DATA
    "detailedData": {
      "dataInterval": 5,  // seconds between each reading
      "startTimestamp": "2024-01-15T08:30:00Z", // ISO timestamp when trip started
      
      // Time-based readings (each array has same length)
      "timeData": [
        {
          "timeOffset": 0,      // seconds from trip start
          "timestamp": "2024-01-15T08:30:00Z",
          "speed": 42,          // km/hr
          "rpm": 1800,          // RPM
          "throttle": 25,       // %
          "engineLoad": 45      // %
        },
        {
          "timeOffset": 5,      // 5 seconds later
          "timestamp": "2024-01-15T08:30:05Z",
          "speed": 38,
          "rpm": 1650,
          "throttle": 20,
          "engineLoad": 38
        },
        {
          "timeOffset": 10,     // 10 seconds later
          "timestamp": "2024-01-15T08:30:10Z",
          "speed": 45,
          "rpm": 2100,
          "throttle": 35,
          "engineLoad": 52
        }
        // ... continue for entire trip duration
      ],
      
      // Alternative: Separate arrays with explicit timestamps (if you prefer this format)
      "timestamps": [
        "2024-01-15T08:30:00Z",
        "2024-01-15T08:30:05Z", 
        "2024-01-15T08:30:10Z",
        "2024-01-15T08:30:15Z"
        // ... one timestamp per data point
      ],
      "speedProfile": [42, 38, 45, 52],
      "rpmProfile": [1800, 1650, 2100, 2400],
      "throttleProfile": [25, 20, 35, 45],
      "engineLoadProfile": [45, 38, 52, 62]
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

## 🎯 **Two Options for Time Data:**

### **Option 1: Combined Time Data Objects (Recommended)**
```json
"detailedData": {
  "dataInterval": 5,  // seconds between readings
  "startTimestamp": "2024-01-15T08:30:00Z",
  "timeData": [
    {
      "timeOffset": 0,
      "timestamp": "2024-01-15T08:30:00Z",
      "speed": 42,
      "rpm": 1800,
      "throttle": 25,
      "engineLoad": 45
    }
    // ... more data points
  ]
}
```

### **Option 2: Separate Arrays with Timestamps**
```json
"detailedData": {
  "timestamps": ["2024-01-15T08:30:00Z", "2024-01-15T08:30:05Z", ...],
  "speedProfile": [42, 38, 45, 52, ...],
  "rpmProfile": [1800, 1650, 2100, 2400, ...],
  "throttleProfile": [25, 20, 35, 45, ...],
  "engineLoadProfile": [45, 38, 52, 62, ...]
}
```

## 📊 **Benefits of Including Time Data:**

1. **Precise Time Axis**: Charts show exact timestamps instead of calculated intervals
2. **Variable Intervals**: Support for non-uniform data collection intervals
3. **Better Synchronization**: All sensor readings are perfectly aligned in time
4. **Event Correlation**: Can correlate driving events with specific timestamps
5. **Replay Capability**: Can replay the trip with exact timing

## 🔧 **Frontend Usage:**

The frontend will automatically detect which format you're using:

```typescript
// Option 1: Combined time data
if (tripData.detailedData?.timeData) {
  const chartData = tripData.detailedData.timeData.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    speed: point.speed,
    rpm: point.rpm,
    // ... other values
  }));
}

// Option 2: Separate arrays with timestamps
else if (tripData.detailedData?.timestamps) {
  const chartData = tripData.detailedData.timestamps.map((timestamp, index) => ({
    time: new Date(timestamp).toLocaleTimeString(),
    speed: tripData.detailedData.speedProfile[index],
    rpm: tripData.detailedData.rpmProfile[index],
    // ... other values
  }));
}

// Fallback: Calculate time from trip duration (current method)
else {
  // Current implementation remains as fallback
}
```

## 🚀 **Recommendation:**

Use **Option 1 (Combined Time Data Objects)** as it's:
- More structured and easier to maintain
- Ensures all data points are perfectly synchronized
- Allows for variable data collection intervals
- Easier to extend with additional sensor data

The frontend will automatically handle whichever format you choose to implement! 🎯