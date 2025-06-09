# All Trips Data JSON Structure for Salesforce

## Overview
This document specifies the exact JSON structure that your Salesforce API should return for the 'All Trips' page. The frontend expects this data when calling `/services/apexrest/voltride/trips` or `/services/apexrest/voltride/allTrips`.

## Complete All Trips JSON Structure

```json
{
  "success": true,
  "tripsData": {
    "trips": [
      {
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
        
        // Trip Context
        "timeOfDay": "morning",      // morning, afternoon, evening, night
        "roadType": "city",          // city, highway, residential, rural
        "trafficCondition": "moderate", // light, moderate, heavy
        "weatherCondition": "clear", // clear, rain, snow, fog
        
        // Optional: Start/End locations (for map preview)
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
        
        // Optional: Route preview (simplified - just start and end)
        "route": [
          { "lat": 19.0760, "lng": 72.8777 },  // Start
          { "lat": 19.0176, "lng": 72.8562 }   // End
        ],
        
        // Environmental Impact
        "environmentalImpact": {
          "co2Emitted": 3.1,        // kg of CO2 emitted
          "fuelEfficiency": 15.5,   // actual km/l achieved
          "estimatedCost": 132.6    // estimated fuel cost in ₹
        }
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
        "calculatedScore": 88,
        "harshAcceleration": 0,
        "harshBraking": 1,
        "overSpeeding": 0,
        "idling": 120,
        "overRevving": 5,
        "timeOfDay": "evening",
        "roadType": "city",
        "trafficCondition": "heavy",
        "weatherCondition": "clear",
        "startLocation": {
          "latitude": 19.0176,
          "longitude": 72.8562,
          "address": "Lower Parel, Mumbai"
        },
        "endLocation": {
          "latitude": 19.0760,
          "longitude": 72.8777,
          "address": "Bandra West, Mumbai"
        },
        "route": [
          { "lat": 19.0176, "lng": 72.8562 },
          { "lat": 19.0760, "lng": 72.8777 }
        ],
        "environmentalImpact": {
          "co2Emitted": 1.8,
          "fuelEfficiency": 16.5,
          "estimatedCost": 81.6
        }
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
        "calculatedScore": 85,
        "harshAcceleration": 3,
        "harshBraking": 2,
        "overSpeeding": 120,
        "idling": 240,
        "overRevving": 30,
        "timeOfDay": "morning",
        "roadType": "highway",
        "trafficCondition": "light",
        "weatherCondition": "clear",
        "startLocation": {
          "latitude": 19.0760,
          "longitude": 72.8777,
          "address": "Bandra West, Mumbai"
        },
        "endLocation": {
          "latitude": 18.9220,
          "longitude": 72.8347,
          "address": "Worli, Mumbai"
        },
        "route": [
          { "lat": 19.0760, "lng": 72.8777 },
          { "lat": 18.9220, "lng": 72.8347 }
        ],
        "environmentalImpact": {
          "co2Emitted": 3.5,
          "fuelEfficiency": 13.4,
          "estimatedCost": 153.0
        }
      }
      // ... more trips
    ],
    
    // Summary Statistics for All Trips
    "summary": {
      "totalTrips": 156,
      "totalDistance": 3245.8,     // km
      "totalFuelUsed": 215.4,      // liters
      "totalDuration": 8760,       // minutes
      "avgScore": 87,              // average driving score
      "avgFuelEfficiency": 15.1,   // km/l
      "totalCO2Emitted": 497.5,    // kg
      "totalCost": 21970.8,        // ₹
      
      // Date Range
      "oldestTripDate": "2023-06-15",
      "newestTripDate": "2024-01-15",
      
      // Driving Events Summary
      "totalHarshAcceleration": 89,
      "totalHarshBraking": 67,
      "totalOverSpeeding": 3420,   // seconds
      "totalIdling": 12600,        // seconds
      "totalOverRevving": 890      // seconds
    },
    
    // Pagination Info
    "pagination": {
      "currentPage": 1,
      "totalPages": 16,
      "tripsPerPage": 10,
      "totalTrips": 156,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    
    // Filter Options Available
    "filterOptions": {
      "dateRange": {
        "earliest": "2023-06-15",
        "latest": "2024-01-15"
      },
      "scoreRanges": [
        { "label": "Excellent (90-100)", "min": 90, "max": 100, "count": 45 },
        { "label": "Good (80-89)", "min": 80, "max": 89, "count": 67 },
        { "label": "Average (70-79)", "min": 70, "max": 79, "count": 32 },
        { "label": "Needs Improvement (<70)", "min": 0, "max": 69, "count": 12 }
      ],
      "roadTypes": [
        { "label": "City", "value": "city", "count": 89 },
        { "label": "Highway", "value": "highway", "count": 45 },
        { "label": "Residential", "value": "residential", "count": 15 },
        { "label": "Rural", "value": "rural", "count": 7 }
      ],
      "timeOfDay": [
        { "label": "Morning", "value": "morning", "count": 67 },
        { "label": "Afternoon", "value": "afternoon", "count": 34 },
        { "label": "Evening", "value": "evening", "count": 45 },
        { "label": "Night", "value": "night", "count": 10 }
      ]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🎯 **API Endpoints:**

### 1. **Get All Trips (with pagination)**
```
GET /services/apexrest/voltride/trips?page=1&limit=10&sortBy=date&sortOrder=desc
```

### 2. **Get Filtered Trips**
```
GET /services/apexrest/voltride/trips?scoreMin=80&scoreMax=100&roadType=city&dateFrom=2024-01-01&dateTo=2024-01-15
```

### 3. **Get Trip Summary Only**
```
GET /services/apexrest/voltride/trips/summary
```

## 📋 **Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (1-based) | `page=1` |
| `limit` | integer | Trips per page (max 50) | `limit=10` |
| `sortBy` | string | Sort field: `date`, `score`, `distance`, `duration` | `sortBy=date` |
| `sortOrder` | string | Sort direction: `asc`, `desc` | `sortOrder=desc` |
| `scoreMin` | integer | Minimum score filter (0-100) | `scoreMin=80` |
| `scoreMax` | integer | Maximum score filter (0-100) | `scoreMax=100` |
| `dateFrom` | string | Start date filter (YYYY-MM-DD) | `dateFrom=2024-01-01` |
| `dateTo` | string | End date filter (YYYY-MM-DD) | `dateTo=2024-01-15` |
| `roadType` | string | Road type filter | `roadType=city` |
| `timeOfDay` | string | Time of day filter | `timeOfDay=morning` |
| `search` | string | Search in trip names | `search=Trip` |

## ✅ **Required Fields (Minimum):**

For each trip, these fields are **mandatory**:
- `tripId` - Unique identifier
- `tripName` - Display name
- `date` - Trip date (YYYY-MM-DD)
- `startTime` - Start time (HH:MM)
- `endTime` - End time (HH:MM)
- `distance` - Distance in km
- `duration` - Duration in minutes
- `fuelUsed` - Fuel consumed in liters
- `avgSpeed` - Average speed in km/hr
- `maxSpeed` - Maximum speed in km/hr
- `calculatedScore` - Overall score (0-100)
- `harshAcceleration` - Count of harsh acceleration events
- `harshBraking` - Count of harsh braking events
- `overSpeeding` - Seconds spent speeding
- `idling` - Seconds spent idling
- `overRevving` - Seconds spent over-revving

## 🔧 **Optional Fields:**

These fields enhance the UI but are not required:
- `startLocation` / `endLocation` - For map previews
- `route` - Simplified route (just start/end points)
- `environmentalImpact` - CO2, efficiency, cost data
- `timeOfDay` / `roadType` / `trafficCondition` / `weatherCondition` - Context data

## 📊 **Frontend Usage:**

The frontend will:
1. **Display trip cards** with score, distance, duration, fuel used
2. **Show summary statistics** at the top
3. **Enable filtering** by score, date, road type, etc.
4. **Support pagination** for large trip lists
5. **Calculate additional metrics** like fuel efficiency, events per km
6. **Provide search functionality** across trip names
7. **Show environmental impact** when available

## 🚀 **Performance Tips:**

1. **Pagination**: Always paginate large result sets
2. **Indexing**: Index frequently filtered fields (date, score, roadType)
3. **Caching**: Cache summary statistics for better performance
4. **Lazy Loading**: Load detailed data only when needed
5. **Compression**: Use gzip compression for large responses

## 📱 **Mobile Considerations:**

- **Smaller page sizes** for mobile (5-10 trips per page)
- **Essential fields only** for initial load
- **Progressive loading** for additional details
- **Optimized images** for route previews

This structure provides comprehensive trip data while maintaining flexibility for filtering, sorting, and pagination! 🚗📊