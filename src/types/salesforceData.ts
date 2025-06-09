// Salesforce JSON Data Structure for /tripInsights endpoint
// This defines the exact JSON format we expect from Salesforce

export interface SalesforceHomePageData {
  // Current week trip insights (last 7 days)
  currentWeekTripInsight: WeeklyTripInsight;
  
  // Previous week trip insights (8-14 days ago)
  previousWeekTripInsight: WeeklyTripInsight;
  
  // Recent 3 trips for detailed analysis
  recentTrips: RecentTripData[];
  
  // Metadata
  metadata: {
    dataFetchedAt: string; // ISO timestamp
    userId: string;
    oldestTripDate: string;
    newestTripDate: string;
  };
}

export interface WeeklyTripInsight {
  // Time period
  startDate: string; // "2024-01-08"
  endDate: string;   // "2024-01-14"
  
  // Aggregated trip data
  totalTrips: number;
  totalDistance: number; // km
  totalDuration: number; // minutes
  totalFuelUsed: number; // liters
  
  // Calculated averages
  avgSpeed: number; // km/hr
  
  // Driving events (sum of all trips in period)
  totalHarshAcceleration: number;
  totalHarshBraking: number;
  totalOverSpeeding: number; // seconds
  totalIdling: number; // seconds
  totalOverRevving: number; // seconds
  
  // Speed statistics
  maxSpeedRecorded: number; // km/hr
  
  // Environmental data
  estimatedCO2Emissions: number; // kg
}

export interface RecentTripData {
  // Basic trip info
  tripId: string;
  tripName: string; // "Trip - 0001"
  date: string; // "2024-01-15"
  startTime: string; // "08:30"
  endTime: string; // "09:15"
  
  // Trip metrics
  distance: number; // km
  duration: number; // minutes
  fuelUsed: number; // liters
  
  // Speed data
  avgSpeed: number; // km/hr
  maxSpeed: number; // km/hr
  
  // Driving events
  harshAcceleration: number; // count
  harshBraking: number; // count
  overSpeeding: number; // seconds
  idling: number; // seconds
  overRevving: number; // seconds
  
  // Optional: Calculated score from Salesforce
  calculatedScore?: number; // 0-100
  
  // Optional: Route data (GPS coordinates)
  route?: RoutePoint[];
  
  // Optional: Detailed OBD-II data for analytics charts
  detailedData?: {
    speedProfile?: number[];        // Speed readings over time (km/hr)
    rpmProfile?: number[];          // RPM readings over time
    throttleProfile?: number[];     // Throttle position over time (%)
    engineLoadProfile?: number[];   // Engine load over time (%)
  };
}

export interface RoutePoint {
  lat: number;
  lng: number;
  address?: string; // Optional address for start/end points
}

export interface UserBaselines {
  // Vehicle settings - DERIVED FROM SETTINGS PAGE
  averageFuelEfficiency: number; // km/l from user's vehicle settings
  targetFuelEfficiency: number; // km/l industry standard (15 km/l)
  fuelCostPerLiter: number; // ₹ per liter (102 for petrol, 89 for diesel)
  vehicleType: 'petrol' | 'diesel' | 'electric';
  
  // Thresholds from user settings
  speedThreshold: number; // km/hr
  harshAccelThreshold: number; // m/s²
  harshBrakeThreshold: number; // m/s²
  revThreshold: number; // RPM
}

// Example JSON that Salesforce should send to /tripInsights endpoint
export const exampleSalesforceResponse: SalesforceHomePageData = {
  currentWeekTripInsight: {
    startDate: "2024-01-08",
    endDate: "2024-01-14",
    totalTrips: 8,
    totalDistance: 156.4,
    totalDuration: 420,
    totalFuelUsed: 10.2,
    avgSpeed: 44.5,
    totalHarshAcceleration: 5,
    totalHarshBraking: 3,
    totalOverSpeeding: 180,
    totalIdling: 1200,
    totalOverRevving: 45,
    maxSpeedRecorded: 100,
    estimatedCO2Emissions: 24.1
  },
  
  previousWeekTripInsight: {
    startDate: "2024-01-01",
    endDate: "2024-01-07",
    totalTrips: 6,
    totalDistance: 132.8,
    totalDuration: 380,
    totalFuelUsed: 9.1,
    avgSpeed: 41.2,
    totalHarshAcceleration: 8,
    totalHarshBraking: 6,
    totalOverSpeeding: 240,
    totalIdling: 1500,
    totalOverRevving: 75,
    maxSpeedRecorded: 118,
    estimatedCO2Emissions: 21.5
  },
  
  recentTrips: [
    {
      tripId: "trip_001",
      tripName: "Trip - 0001",
      date: "2024-01-15",
      startTime: "08:30",
      endTime: "09:15",
      distance: 20.1,
      duration: 45,
      fuelUsed: 1.3,
      avgSpeed: 45,
      maxSpeed: 105,
      harshAcceleration: 2,
      harshBraking: 1,
      overSpeeding: 45,
      idling: 180,
      overRevving: 15,
      calculatedScore: 92,
      route: [
        { lat: 19.0760, lng: 72.8777, address: "Bandra West, Mumbai" },
        { lat: 19.0750, lng: 72.8767 },
        { lat: 19.0740, lng: 72.8757 },
        { lat: 19.0730, lng: 72.8747 },
        { lat: 19.0720, lng: 72.8737 },
        { lat: 19.0176, lng: 72.8562, address: "Lower Parel, Mumbai" }
      ],
      detailedData: {
        speedProfile: [42, 38, 45, 52, 48, 41, 39, 44, 50, 46, 43, 47, 49, 45, 42, 40, 44, 48, 51, 47, 43, 41, 46, 49, 45, 42, 38, 44, 50, 47, 43, 41, 45, 48, 46, 44, 42, 47, 49, 45, 43, 41, 44, 48, 46, 42, 40, 45, 47, 44],
        rpmProfile: [1800, 1650, 2100, 2400, 2200, 1900, 1750, 2000, 2300, 2100, 1950, 2150, 2250, 2050, 1900, 1800, 2000, 2200, 2350, 2150, 1950, 1850, 2100, 2250, 2050, 1900, 1700, 2000, 2300, 2150, 1950, 1850, 2050, 2200, 2100, 2000, 1900, 2150, 2250, 2050, 1950, 1850, 2000, 2200, 2100, 1900, 1800, 2050, 2150, 2000],
        throttleProfile: [25, 20, 35, 45, 40, 28, 22, 30, 42, 38, 32, 36, 40, 35, 28, 25, 30, 40, 45, 36, 32, 26, 38, 42, 35, 28, 20, 30, 42, 36, 32, 26, 35, 40, 38, 30, 28, 36, 42, 35, 32, 26, 30, 40, 38, 28, 25, 35, 36, 30],
        engineLoadProfile: [45, 38, 52, 62, 58, 48, 42, 50, 60, 56, 50, 54, 58, 52, 48, 45, 50, 58, 62, 54, 50, 46, 56, 60, 52, 48, 40, 50, 60, 54, 50, 46, 52, 58, 56, 50, 48, 54, 60, 52, 50, 46, 50, 58, 56, 48, 45, 52, 54, 50]
      }
    },
    {
      tripId: "trip_002",
      tripName: "Trip - 0002",
      date: "2024-01-14",
      startTime: "18:00",
      endTime: "18:35",
      distance: 13.2,
      duration: 35,
      fuelUsed: 0.8,
      avgSpeed: 35,
      maxSpeed: 72,
      harshAcceleration: 0,
      harshBraking: 1,
      overSpeeding: 0,
      idling: 120,
      overRevving: 5,
      calculatedScore: 88,
      route: [
        { lat: 19.0176, lng: 72.8562, address: "Lower Parel, Mumbai" },
        { lat: 19.0186, lng: 72.8572 },
        { lat: 19.0196, lng: 72.8582 },
        { lat: 19.0760, lng: 72.8777, address: "Bandra West, Mumbai" }
      ]
    },
    {
      tripId: "trip_003",
      tripName: "Trip - 0003",
      date: "2024-01-13",
      startTime: "07:45",
      endTime: "08:30",
      distance: 20.1,
      duration: 45,
      fuelUsed: 1.5,
      avgSpeed: 50,
      maxSpeed: 112,
      harshAcceleration: 3,
      harshBraking: 2,
      overSpeeding: 120,
      idling: 240,
      overRevving: 30,
      calculatedScore: 85,
      route: [
        { lat: 19.0760, lng: 72.8777, address: "Bandra West, Mumbai" },
        { lat: 18.9220, lng: 72.8347, address: "Worli, Mumbai" }
      ]
    }
  ],
  
  metadata: {
    dataFetchedAt: "2024-01-15T10:30:00Z",
    userId: "user_12345",
    oldestTripDate: "2023-06-15",
    newestTripDate: "2024-01-15"
  }
};

// 📋 SALESFORCE ENDPOINT SPECIFICATION
// 
// Endpoint: GET /services/apexrest/voltride/tripInsights
// 
// Expected Response Format:
// {
//   "currentWeekTripInsight": { ... },
//   "previousWeekTripInsight": { ... },
//   "recentTrips": [ ... ],
//   "metadata": { ... }
// }
//
// The frontend will:
// 1. Call this endpoint on page load
// 2. Get user baselines from settings page
// 3. Process the data to calculate all metrics
// 4. Display performance scores, insights, and comparisons
// 5. Handle errors gracefully with fallback demo data