# Simple All Trips JSON Structure for Salesforce

## Overview
This document specifies the simplified JSON structure for the 'All Trips' page. The frontend will handle all summary calculations, filtering, and pagination client-side.

## Simple All Trips JSON Structure

```json
{
  "success": true,
  "trips": [
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
      "calculatedScore": 92
    },
    {
      "tripId": "trip_002",
      "tripName": "Trip - 0002",
      "date": "2024-01-14",
      "startTime": "18:00",
      "endTime": "18:35",
      "distance": 13.2,
      "duration": 35,
      "fuelUsed": 0.8,
      "avgSpeed": 35,
      "maxSpeed": 72,
      "harshAcceleration": 0,
      "harshBraking": 1,
      "overSpeeding": 0,
      "idling": 120,
      "overRevving": 5,
      "calculatedScore": 88
    },
    {
      "tripId": "trip_003",
      "tripName": "Trip - 0003",
      "date": "2024-01-13",
      "startTime": "07:45",
      "endTime": "08:30",
      "distance": 20.1,
      "duration": 45,
      "fuelUsed": 1.5,
      "avgSpeed": 50,
      "maxSpeed": 112,
      "harshAcceleration": 3,
      "harshBraking": 2,
      "overSpeeding": 120,
      "idling": 240,
      "overRevving": 30,
      "calculatedScore": 85
    },
    {
      "tripId": "trip_004",
      "tripName": "Trip - 0004",
      "date": "2024-01-12",
      "startTime": "14:15",
      "endTime": "15:00",
      "distance": 18.7,
      "duration": 45,
      "fuelUsed": 1.2,
      "avgSpeed": 42,
      "maxSpeed": 88,
      "harshAcceleration": 1,
      "harshBraking": 0,
      "overSpeeding": 30,
      "idling": 90,
      "overRevving": 10,
      "calculatedScore": 94
    },
    {
      "tripId": "trip_005",
      "tripName": "Trip - 0005",
      "date": "2024-01-11",
      "startTime": "09:00",
      "endTime": "09:30",
      "distance": 15.5,
      "duration": 30,
      "fuelUsed": 1.0,
      "avgSpeed": 52,
      "maxSpeed": 95,
      "harshAcceleration": 1,
      "harshBraking": 0,
      "overSpeeding": 30,
      "idling": 90,
      "overRevving": 10,
      "calculatedScore": 89
    }
    // ... more trips (all your trip data)
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📋 **Required Fields for Each Trip:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `tripId` | string | Unique trip identifier | `"trip_001"` |
| `tripName` | string | Display name for trip | `"Trip - 0001"` |
| `date` | string | Trip date (YYYY-MM-DD) | `"2024-01-15"` |
| `startTime` | string | Start time (HH:MM) | `"08:30"` |
| `endTime` | string | End time (HH:MM) | `"09:15"` |
| `distance` | number | Distance in kilometers | `20.1` |
| `duration` | number | Duration in minutes | `45` |
| `fuelUsed` | number | Fuel consumed in liters | `1.3` |
| `avgSpeed` | number | Average speed in km/hr | `45` |
| `maxSpeed` | number | Maximum speed in km/hr | `105` |
| `harshAcceleration` | number | Count of harsh acceleration events | `2` |
| `harshBraking` | number | Count of harsh braking events | `1` |
| `overSpeeding` | number | Seconds spent over speed limit | `45` |
| `idling` | number | Seconds spent idling | `180` |
| `overRevving` | number | Seconds spent over-revving | `15` |
| `calculatedScore` | number | Overall driving score (0-100) | `92` |

## 🎯 **API Endpoint:**

```
GET /services/apexrest/voltride/trips
```

**Response Format:**
```json
{
  "success": true,
  "trips": [ /* array of all trips */ ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🚀 **Frontend Will Handle:**

### ✅ **Summary Calculations:**
- Total trips count
- Total distance (sum of all trip distances)
- Total fuel used (sum of all trip fuel)
- Average score (average of all calculatedScore values)
- Total harsh events (sum of harshAcceleration + harshBraking)
- Fuel efficiency calculations (distance/fuelUsed for each trip)

### ✅ **Filtering:**
- Filter by score ranges (90-100, 80-89, 70-79, <70)
- Filter by date ranges
- Filter by trip name (search)
- Filter by driving events (high/low harsh events)

### ✅ **Sorting:**
- Sort by date (newest/oldest first)
- Sort by score (highest/lowest first)
- Sort by distance (longest/shortest first)
- Sort by duration (longest/shortest first)
- Sort by fuel efficiency (best/worst first)

### ✅ **Pagination:**
- Client-side pagination (10, 20, 50 trips per page)
- Page navigation controls
- Total pages calculation

## 📊 **Example Frontend Calculations:**

```javascript
// Total Distance
const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);

// Average Score
const avgScore = trips.reduce((sum, trip) => sum + trip.calculatedScore, 0) / trips.length;

// Total Fuel Used
const totalFuel = trips.reduce((sum, trip) => sum + trip.fuelUsed, 0);

// Total Harsh Events
const totalHarshEvents = trips.reduce((sum, trip) => 
  sum + trip.harshAcceleration + trip.harshBraking, 0);

// Filter by Score Range
const excellentTrips = trips.filter(trip => trip.calculatedScore >= 90);

// Sort by Date (newest first)
const sortedTrips = trips.sort((a, b) => new Date(b.date) - new Date(a.date));
```

## 🔧 **Error Response Format:**

```json
{
  "success": false,
  "error": "Unable to fetch trips data",
  "errorCode": "TRIPS_FETCH_ERROR",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📱 **Benefits of This Approach:**

1. **Simple API**: Just return raw trip data, no complex calculations
2. **Fast Response**: Minimal server processing
3. **Flexible Frontend**: Can implement any filtering/sorting logic
4. **Real-time Updates**: Calculations update instantly as user filters
5. **Offline Capable**: All data available for offline filtering
6. **Easy Caching**: Simple data structure easy to cache

This simple structure gives you maximum flexibility while keeping the API clean and fast! 🚗📊