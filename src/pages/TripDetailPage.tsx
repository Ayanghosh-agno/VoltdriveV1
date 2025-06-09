import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Fuel, Gauge, AlertTriangle, TrendingUp, Zap, TreePine, Router as Route, WifiOff, RefreshCw } from 'lucide-react';
import TripMap from '../components/TripMap';
import AnalyticsChart from '../components/AnalyticsChart';
import AIAdvice from '../components/AIAdvice';
import ScoreBreakdown from '../components/ScoreBreakdown';
import AuthService from '../services/authService';

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams();
  const [tripData, setTripData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch trip details from your new API endpoint
  const fetchTripDetails = React.useCallback(async () => {
    if (!tripId) {
      setError('Trip ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching trip details for ID: ${tripId}`);
      
      // Get authenticated service instance
      const authService = AuthService.getInstance();
      
      // Make authenticated request to your new endpoint
      const response = await authService.makeAuthenticatedRequest(`/services/apexrest/voltride/tripDetail/${tripId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Trip details received from Salesforce:', data);
      
      // Check if this is an error response
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch trip details from Salesforce');
      }
      
      // Validate the data structure
      if (!data.tripData) {
        console.warn('⚠️ Invalid trip data structure received from Salesforce');
        throw new Error('Invalid trip data structure received from Salesforce');
      }
      
      // Convert Salesforce trip data to component format
      const convertedTripData = convertSalesforceToTripData(data.tripData, tripId);
      setTripData(convertedTripData);
      
      console.log('📊 Trip data processed successfully:', convertedTripData);
      
    } catch (err) {
      console.error('❌ Error fetching trip details:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Unable to load trip details. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Convert Salesforce API response to internal format
  const convertSalesforceToTripData = (salesforceTripData: any, tripId: string) => {
    return {
      id: tripId,
      tripNumber: salesforceTripData.tripName || `Trip ${tripId}`,
      date: salesforceTripData.date,
      startTime: salesforceTripData.startTime,
      endTime: salesforceTripData.endTime,
      duration: salesforceTripData.duration, // minutes
      distance: salesforceTripData.distance, // kilometers
      fuelUsed: salesforceTripData.fuelUsed, // liters
      co2Emitted: salesforceTripData.environmentalImpact?.co2Emitted || 
                  (salesforceTripData.fuelUsed * 2.31).toFixed(1), // Estimated CO2 (kg)
      avgSpeed: salesforceTripData.avgSpeed, // km/hr
      maxSpeed: salesforceTripData.maxSpeed, // km/hr
      score: salesforceTripData.calculatedScore || calculateTempScore(salesforceTripData),
      // Calculate trip mileage (fuel efficiency)
      mileage: salesforceTripData.fuelUsed > 0 ? 
               (salesforceTripData.distance / salesforceTripData.fuelUsed).toFixed(1) : 
               '0.0',
      events: {
        harshAcceleration: salesforceTripData.harshAcceleration || 0,
        harshBraking: salesforceTripData.harshBraking || 0,
        overRevving: salesforceTripData.overRevving || 0, // seconds
        idling: salesforceTripData.idling || 0, // seconds
        overSpeeding: salesforceTripData.overSpeeding || 0 // seconds
      },
      // Extract start and end locations from route (first and last points)
      startLocation: salesforceTripData.route && salesforceTripData.route.length > 0 
        ? { 
            lat: salesforceTripData.route[0].lat, 
            lng: salesforceTripData.route[0].lng, 
            name: salesforceTripData.route[0].address || 'Start Point' 
          }
        : { lat: 37.7749, lng: -122.4194, name: 'Start Point' },
      endLocation: salesforceTripData.route && salesforceTripData.route.length > 0 
        ? { 
            lat: salesforceTripData.route[salesforceTripData.route.length - 1].lat, 
            lng: salesforceTripData.route[salesforceTripData.route.length - 1].lng, 
            name: salesforceTripData.route[salesforceTripData.route.length - 1].address || 'End Point' 
          }
        : { lat: 37.7849, lng: -122.4094, name: 'End Point' },
      route: salesforceTripData.route || [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7779, lng: -122.4164 },
        { lat: 37.7809, lng: -122.4134 },
        { lat: 37.7839, lng: -122.4104 },
        { lat: 37.7849, lng: -122.4094 }
      ],
      // 🎯 YOUR TimeData format support + backward compatibility
      detailedData: salesforceTripData.detailedData || null,
      // Additional data from Salesforce
      scoreBreakdown: salesforceTripData.scoreBreakdown,
      penalties: salesforceTripData.penalties,
      bonuses: salesforceTripData.bonuses,
      insights: salesforceTripData.insights || [],
      environmentalImpact: salesforceTripData.environmentalImpact
    };
  };

  // Temporary score calculation until Salesforce provides calculatedScore
  const calculateTempScore = (trip: any) => {
    let score = 100;
    
    // Penalty for harsh events
    const harshEvents = (trip.harshAcceleration || 0) + (trip.harshBraking || 0);
    score -= harshEvents * 5;
    
    // Penalty for speeding
    if (trip.overSpeeding > 60) score -= 15;
    else if (trip.overSpeeding > 30) score -= 10;
    else if (trip.overSpeeding > 0) score -= 5;
    
    // Penalty for excessive idling
    const idlingMinutes = (trip.idling || 0) / 60;
    if (idlingMinutes > 5) score -= 10;
    else if (idlingMinutes > 3) score -= 5;
    
    return Math.max(60, Math.min(100, Math.round(score)));
  };

  // Prepare trip data for score breakdown calculation
  const tripScoreInput = React.useMemo(() => {
    if (!tripData) return null;
    
    return {
      distance: tripData.distance,
      duration: tripData.duration,
      fuelUsed: tripData.fuelUsed,
      avgSpeed: tripData.avgSpeed,
      maxSpeed: tripData.maxSpeed,
      harshAcceleration: tripData.events.harshAcceleration,
      harshBraking: tripData.events.harshBraking,
      overSpeeding: tripData.events.overSpeeding,
      idling: tripData.events.idling,
      overRevving: tripData.events.overRevving,
      calculatedScore: tripData.score // Use Salesforce score if available
    };
  }, [tripData]);

  // Fetch trip details on component mount
  React.useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-8">
        <div className="flex items-center space-x-4">
          <Link to="/trips\" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6 pb-20 md:pb-8">
        <div className="flex items-center space-x-4">
          <Link to="/trips" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Details</h1>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <WifiOff className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Trip</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTripDetails}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Show trip not found
  if (!tripData || !tripScoreInput) {
    return (
      <div className="space-y-6 pb-20 md:pb-8">
        <div className="flex items-center space-x-4">
          <Link to="/trips" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Not Found</h1>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Trip Not Found</h3>
          <p className="text-gray-600 mb-4">The trip with ID "{tripId}" could not be found.</p>
          <Link
            to="/trips"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Trips</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header - REMOVED Trip ID display */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/trips" 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{tripData.tripNumber}</h1>
          <p className="text-gray-600 mt-1">
            {new Date(tripData.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} • {tripData.startTime} - {tripData.endTime}
          </p>
          {/* REMOVED: Trip ID display */}
        </div>
        <div className={`ml-auto px-4 py-2 rounded-lg border ${getScoreColor(tripData.score)}`}>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-bold text-lg">{tripData.score}</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown - Now calculated in frontend */}
      <ScoreBreakdown tripData={tripScoreInput} />

      {/* Trip Overview Cards - Removed Idling, now 8 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-600">Distance</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{tripData.distance} km</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-600">Duration</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{tripData.duration} min</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Fuel className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-gray-600">Fuel Used</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{tripData.fuelUsed} L</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Route className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium text-gray-600">Mileage</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{tripData.mileage} km/L</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <TreePine className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-600">CO2 Emitted</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{tripData.co2Emitted} kg</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Gauge className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-600">Avg Speed</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{tripData.avgSpeed} km/hr</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-medium text-gray-600">Max Speed</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{tripData.maxSpeed} km/hr</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-gray-600">Events</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {tripData.events.harshAcceleration + tripData.events.harshBraking}
          </div>
        </div>
      </div>

      {/* Driving Events */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Driving Events</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="text-2xl font-bold text-red-600">{tripData.events.harshAcceleration}</div>
            <div className="text-sm text-red-700">Harsh Acceleration</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="text-2xl font-bold text-red-600">{tripData.events.harshBraking}</div>
            <div className="text-sm text-red-700">Harsh Braking</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">{formatTime(tripData.events.overRevving)}</div>
            <div className="text-sm text-orange-700">Over Revving</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="text-2xl font-bold text-yellow-600">{formatTime(tripData.events.idling)}</div>
            <div className="text-sm text-yellow-700">Idling Time</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="text-2xl font-bold text-red-600">{formatTime(tripData.events.overSpeeding)}</div>
            <div className="text-sm text-red-700">Over Speeding</div>
          </div>
        </div>
      </div>

      {/* 🎯 DETAILED ANALYSIS - ONLY SERVER BONUSES & PENALTIES */}
      {(tripData.penalties || tripData.bonuses) && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Penalties from Server */}
            {tripData.penalties && tripData.penalties.descriptions && tripData.penalties.descriptions.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Penalties Applied
                </h4>
                <div className="space-y-2">
                  {tripData.penalties.descriptions.map((description: string, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-sm text-red-700">{description}</span>
                      <span className="font-semibold text-red-600">
                        -{tripData.penalties.points[index] || 0} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bonuses from Server */}
            {tripData.bonuses && tripData.bonuses.descriptions && tripData.bonuses.descriptions.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Bonuses Earned
                </h4>
                <div className="space-y-2">
                  {tripData.bonuses.descriptions.map((description: string, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-sm text-green-700">{description}</span>
                      <span className="font-semibold text-green-600">
                        +{tripData.bonuses.points[index] || 0} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Show message if no penalties or bonuses */}
          {(!tripData.penalties || !tripData.penalties.descriptions || tripData.penalties.descriptions.length === 0) &&
           (!tripData.bonuses || !tripData.bonuses.descriptions || tripData.bonuses.descriptions.length === 0) && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">📊</div>
              <p className="text-gray-500">No detailed penalties or bonuses data available from server</p>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Route</h3>
        <TripMap 
          startLocation={tripData.startLocation}
          endLocation={tripData.endLocation}
          route={tripData.route}
        />
      </div>

      {/* Analytics Charts - Enhanced with YOUR TimeData Format Support */}
      {tripData.detailedData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">OBD-II Analytics</h3>
            <div className="text-sm text-gray-600">
              {tripData.detailedData.TimeData 
                ? '🎯 Using your TimeData format!' 
                : 'Real-time data from your vehicle\'s engine control unit'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speed Profile with TimeData support */}
            {(tripData.detailedData.SpeedProfile || tripData.detailedData.speedProfile) && (
              <AnalyticsChart 
                title="Speed Over Time" 
                data={tripData.detailedData.SpeedProfile || tripData.detailedData.speedProfile}
                color="#3B82F6"
                unit="km/hr"
                yAxisDomain={[0, Math.max(...(tripData.detailedData.SpeedProfile || tripData.detailedData.speedProfile || [100])) + 10]}
                tripDuration={tripData.duration}
                timeData={tripData.detailedData.TimeData}
              />
            )}
            
            {/* RPM Profile with TimeData support */}
            {(tripData.detailedData.RpmProfile || tripData.detailedData.rpmProfile) && (
              <AnalyticsChart 
                title="Engine RPM Over Time" 
                data={tripData.detailedData.RpmProfile || tripData.detailedData.rpmProfile}
                color="#10B981"
                unit="RPM"
                yAxisDomain={[0, Math.max(...(tripData.detailedData.RpmProfile || tripData.detailedData.rpmProfile || [3000])) + 200]}
                tripDuration={tripData.duration}
                timeData={tripData.detailedData.TimeData}
              />
            )}
            
            {/* Engine Load Profile with TimeData support */}
            {(tripData.detailedData.EngineLoadProfile || tripData.detailedData.engineLoadProfile) && (
              <AnalyticsChart 
                title="Engine Load Over Time" 
                data={tripData.detailedData.EngineLoadProfile || tripData.detailedData.engineLoadProfile}
                color="#F59E0B"
                unit="%"
                yAxisDomain={[0, 100]}
                tripDuration={tripData.duration}
                timeData={tripData.detailedData.TimeData}
              />
            )}
            
            {/* Throttle Profile with TimeData support */}
            {(tripData.detailedData.ThrottleProfile || tripData.detailedData.throttleProfile) && (
              <AnalyticsChart 
                title="Throttle Position Over Time" 
                data={tripData.detailedData.ThrottleProfile || tripData.detailedData.throttleProfile}
                color="#8B5CF6"
                unit="%"
                yAxisDomain={[0, 100]}
                tripDuration={tripData.duration}
                timeData={tripData.detailedData.TimeData}
              />
            )}
          </div>
        </div>
      )}

      {/* AI Driving Insights - ONLY section for insights */}
      <AIAdvice tripData={tripData} />
    </div>
  );
};

export default TripDetailPage;