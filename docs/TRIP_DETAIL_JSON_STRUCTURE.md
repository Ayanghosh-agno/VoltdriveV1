# Trip Detail Data JSON Structure for Salesforce

## Overview
This document specifies the exact JSON structure that your Salesforce API should return for individual trip details. The frontend expects this data when calling `/services/apexrest/voltride/tripDetails/{tripId}`.

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
    
    // Location Data (GPS coordinates)
    "startLocation": {
      "latitude": 19.0760,
      "longitude": 72.8777,
      "address": "Bandra West, Mumbai"
    },
    "endLocation": {
      "latitude": 19.0176,
      "longitude": 72.8562,
      "address": "Lower Parel, Mumbai"
    },
    
    // Route Path (array of GPS coordinates for map display)
    "route": [
      { "lat": 19.0760, "lng": 72.8777 },
      { "lat": 19.0750, "lng": 72.8767 },
      { "lat": 19.0740, "lng": 72.8757 },
      { "lat": 19.0730, "lng": 72.8747 },
      { "lat": 19.0720, "lng": 72.8737 },
      { "lat": 19.0710, "lng": 72.8727 },
      // ... more route points
      { "lat": 19.0176, "lng": 72.8562 }
    ],
    
    // Detailed Score Breakdown (from your Apex calculation)
    "scoreBreakdown": {
      "safety": 88,             // Safety component score (0-100)
      "efficiency": 85,         // Efficiency component score (0-100)
      "smoothness": 92,         // Smoothness component score (0-100)
      "environmental": 78       // Environmental component score (0-100)
    },
    
    // Penalties Applied (from your Apex calculation)
    "penalties": {
      "speedingPenalty": 5,     // Points deducted for speeding
      "harshEventsPenalty": 15, // Points deducted for harsh events
      "idlingPenalty": 10       // Points deducted for excessive idling
    },
    
    // Bonuses Applied (from your Apex calculation)
    "bonuses": {
      "fuelEfficiencyBonus": 8, // Points added for good fuel efficiency
      "smoothnessBonus": 5      // Points added for smooth driving
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

### 🔧 **Optional Fields** (Can be omitted if not available):
- `startLocation` / `endLocation` - GPS coordinates and addresses
- `route` - Array of GPS coordinates for route visualization
- `scoreBreakdown` - Detailed component scores
- `penalties` / `bonuses` - Score calculation details
- `insights` - AI-generated driving tips
- `weatherCondition` / `timeOfDay` / `roadType` / `trafficCondition` - Context data
- `detailedData` - OBD-II sensor readings over time
- `environmentalImpact` - Environmental calculations

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

## Frontend Usage

The frontend will:

1. **Call the API** when user clicks on a trip or navigates to `/trips/{tripId}`
2. **Display trip overview** using basic metrics (distance, duration, fuel, score)
3. **Show route on map** using `startLocation`, `endLocation`, and `route` coordinates
4. **Render score breakdown** using `scoreBreakdown`, `penalties`, and `bonuses`
5. **Display insights** using the `insights` array
6. **Show analytics charts** using `detailedData` profiles (speed, RPM, throttle, engine load)
7. **Calculate environmental impact** using `environmentalImpact` data

## Implementation Notes

1. **Score Calculation**: Use the Apex implementation from the driving score documentation to calculate `calculatedScore`, `scoreBreakdown`, `penalties`, `bonuses`, and `insights`.

2. **Route Data**: If you don't have detailed route coordinates, you can provide just start and end locations. The map will show a straight line between them.

3. **Detailed Profiles**: The `speedProfile`, `rpmProfile`, etc. are arrays of sensor readings taken at regular intervals during the trip. If not available, the frontend will show placeholder charts.

4. **Error Handling**: Always return proper error responses with meaningful messages when trips are not found or there are system errors.

5. **Performance**: For trips with large amounts of sensor data, consider pagination or data compression to keep response times reasonable.

This structure provides all the data needed for a comprehensive trip detail view with maps, charts, scores, and insights! 🚗📊