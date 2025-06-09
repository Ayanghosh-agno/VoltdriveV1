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
      overRevving: 15
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
      overRevving: 5
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
      overRevving: 30
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