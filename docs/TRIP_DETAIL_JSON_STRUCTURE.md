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
    
    // Optional: Detailed OBD-II Data for Advanced Analytics
    "detailedData": {
      "speedProfile": [42, 38, 45, 52, 48, 41, 39, 44, 50, 46, 43, 47, 49, 45, 42, 40, 44, 48, 51, 47, 43, 41, 46, 49, 45, 42, 38, 44, 50, 47, 43, 41, 45, 48, 46, 44, 42, 47, 49, 45, 43, 41, 44, 48, 46, 42, 40, 45, 47, 44],
      "rpmProfile": [1800, 1650, 2100, 2400, 2200, 1900, 1750, 2000, 2300, 2100, 1950, 2150, 2250, 2050, 1900, 1800, 2000, 2200, 2350, 2150, 1950, 1850, 2100, 2250, 2050, 1900, 1700, 2000, 2300, 2150, 1950, 1850, 2050, 2200, 2100, 2000, 1900, 2150, 2250, 2050, 1950, 1850, 2000, 2200, 2100, 1900, 1800, 2050, 2150, 2000],
      "throttleProfile": [25, 20, 35, 45, 40, 28, 22, 30, 42, 38, 32, 36, 40, 35, 28, 25, 30, 40, 45, 36, 32, 26, 38, 42, 35, 28, 20, 30, 42, 36, 32, 26, 35, 40, 38, 30, 28, 36, 42, 35, 32, 26, 30, 40, 38, 28, 25, 35, 36, 30],
      "engineLoadProfile": [45, 38, 52, 62, 58, 48, 42, 50, 60, 56, 50, 54, 58, 52, 48, 45, 50, 58, 62, 54, 50, 46, 56, 60, 52, 48, 40, 50, 60, 54, 50, 46, 52, 58, 56, 50, 48, 54, 60, 52, 50, 46, 50, 58, 56, 48, 45, 52, 54, 50]
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

## 🎯 **Key Changes Made:**

### ❌ **REMOVED:**
- `startLocation` object (no longer needed)
- `endLocation` object (no longer needed)

### ✅ **UPDATED:**
- `route` array now includes address information for first and last points
- Frontend will automatically extract:
  - **Start Location:** `route[0]` (first element)
  - **End Location:** `route[route.length - 1]` (last element)

## Route Array Structure

### **Minimum Required Format:**
```json
"route": [
  { "lat": 19.0760, "lng": 72.8777 },  // START (required)
  { "lat": 19.0750, "lng": 72.8767 },  // Intermediate points
  { "lat": 19.0740, "lng": 72.8757 },
  // ... more points
  { "lat": 19.0176, "lng": 72.8562 }   // END (required)
]
```

### **Enhanced Format with Addresses (Optional):**
```json
"route": [
  { 
    "lat": 19.0760, 
    "lng": 72.8777, 
    "address": "Bandra West, Mumbai"     // Optional for start point
  },
  { "lat": 19.0750, "lng": 72.8767 },   // Intermediate points don't need address
  { "lat": 19.0740, "lng": 72.8757 },
  // ... more points
  { 
    "lat": 19.0176, 
    "lng": 72.8562, 
    "address": "Lower Parel, Mumbai"     // Optional for end point
  }
]
```

## Frontend Implementation

The frontend will automatically handle location extraction:

```typescript
// Frontend code - automatically extracts locations from route
const tripData = response.tripData;

if (tripData.route && tripData.route.length >= 2) {
  const startLocation = {
    lat: tripData.route[0].lat,
    lng: tripData.route[0].lng,
    name: tripData.route[0].address || 'Start Point'
  };
  
  const endLocation = {
    lat: tripData.route[tripData.route.length - 1].lat,
    lng: tripData.route[tripData.route.length - 1].lng,
    name: tripData.route[tripData.route.length - 1].address || 'End Point'
  };
  
  // Use startLocation and endLocation for map display
}
```

## Penalties & Bonuses Array Format (Unchanged)

### Penalties Structure:
```json
"penalties": {
  "descriptions": [
    "Harsh Acceleration",
    "High CO₂ emission", 
    "Excessive Idling",
    "Speed Violations",
    "Harsh Braking"
  ],
  "points": [10, 10, 5, 15, 8]
}
```

### Bonuses Structure:
```json
"bonuses": {
  "descriptions": [
    "Fuel efficiency above average",
    "Low CO₂ emissions",
    "Smooth driving",
    "Consistent speed",
    "No harsh events"
  ],
  "points": [20, 20, 15, 10, 5]
}
```

## Required vs Optional Fields

### ✅ **Required Fields** (Must be present):
- `tripId` - Unique identifier for the trip
- `tripName` - Display name for the trip
- `date` - Trip date in YYYY-MM-DD format
- `startTime` - Start time in HH:MM format
- `endTime` - End time in HH:MM format
- `distance` - Trip distance in kilometers
- `duration` - Trip duration in minutes
- `fuelUsed` - Fuel consumed in liters
- `avgSpeed` - Average speed in km/hr
- `maxSpeed` - Maximum speed reached in km/hr
- `calculatedScore` - Overall driving score (0-100)
- `harshAcceleration` - Count of harsh acceleration events
- `harshBraking` - Count of harsh braking events
- `overSpeeding` - Seconds spent speeding
- `idling` - Seconds spent idling
- `overRevving` - Seconds spent over-revving
- `route` - Array of GPS coordinates (minimum 2 points: start and end)

### 🔧 **Optional Fields** (Can be omitted if not available):
- `scoreBreakdown` - Detailed component scores
- `penalties` / `bonuses` - Score calculation details in array format
- `insights` - AI-generated driving tips
- `weatherCondition` / `timeOfDay` / `roadType` / `trafficCondition` - Context data
- `detailedData` - OBD-II sensor readings over time
- `environmentalImpact` - Environmental calculations
- `address` fields in route points - GPS coordinates are sufficient

## API Endpoint

**Endpoint:** `GET /services/apexrest/voltride/tripDetails/{tripId}`

**Example Request:**
```
GET /services/apexrest/voltride/tripDetails/trip_001
Authorization: Bearer {access_token}
```

**Example Response:**
```json
{
  "success": true,
  "tripData": {
    // ... complete trip data as shown above
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Response Format

If trip is not found or there's an error:

```json
{
  "success": false,
  "error": "Trip not found",
  "errorCode": "TRIP_NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🚀 **Benefits of This Approach:**

1. **Simplified API:** No need to send duplicate location data
2. **Consistent Route Data:** All location information comes from one source
3. **Flexible:** Can include addresses in route points or just coordinates
4. **Efficient:** Reduces JSON payload size
5. **Automatic:** Frontend handles location extraction seamlessly

This structure provides all the data needed for comprehensive trip details while using the route array as the single source of truth for location information! 🗺️📍