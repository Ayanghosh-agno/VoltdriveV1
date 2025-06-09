import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Fuel, Gauge, AlertTriangle, TrendingUp, Zap, TreePine, Activity, WifiOff, RefreshCw } from 'lucide-react';
import TripMap from '../components/TripMap';
import AnalyticsChart from '../components/AnalyticsChart';
import AIAdvice from '../components/AIAdvice';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { useSalesforceData } from '../hooks/useSalesforceData';

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams();
  const { salesforceData, loading, error, refreshData } = useSalesforceData();

  // Find the specific trip from Salesforce data
  const tripData = React.useMemo(() => {
    if (!salesforceData?.recentTrips || !tripId) return null;
    
    const foundTrip = salesforceData.recentTrips.find(trip => trip.tripId === tripId);
    if (!foundTrip) return null;

    // Convert Salesforce trip data to component format
    return {
      id: tripId,
      tripNumber: foundTrip.tripName,
      date: foundTrip.date,
      startTime: foundTrip.startTime,
      endTime: foundTrip.endTime,
      duration: foundTrip.duration, // minutes
      distance: foundTrip.distance, // kilometers
      fuelUsed: foundTrip.fuelUsed, // liters
      co2Emitted: (foundTrip.fuelUsed * 2.31).toFixed(1), // Estimated CO2 (kg)
      avgSpeed: foundTrip.avgSpeed, // km/hr
      maxSpeed: foundTrip.maxSpeed, // km/hr
      score: foundTrip.calculatedScore || calculateTempScore(foundTrip),
      events: {
        harshAcceleration: foundTrip.harshAcceleration || 0,
        harshBraking: foundTrip.harshBraking || 0,
        overRevving: foundTrip.overRevving || 0, // seconds
        idling: foundTrip.idling || 0, // seconds
        overSpeeding: foundTrip.overSpeeding || 0 // seconds
      },
      // Extract start and end locations from route (first and last points)
      startLocation: foundTrip.route && foundTrip.route.length > 0 
        ? { 
            lat: foundTrip.route[0].lat, 
            lng: foundTrip.route[0].lng, 
            name: foundTrip.route[0].address || 'Start Point' 
          }
        : { lat: 37.7749, lng: -122.4194, name: 'Start Point' },
      endLocation: foundTrip.route && foundTrip.route.length > 0 
        ? { 
            lat: foundTrip.route[foundTrip.route.length - 1].lat, 
            lng: foundTrip.route[foundTrip.route.length - 1].lng, 
            name: foundTrip.route[foundTrip.route.length - 1].address || 'End Point' 
          }
        : { lat: 37.7849, lng: -122.4094, name: 'End Point' },
      route: foundTrip.route || [
        { lat: 37.7749, lng: -122.4194 },
        { lat: 37.7779, lng: -122.4164 },
        { lat: 37.7809, lng: -122.4134 },
        { lat: 37.7839, lng: -122.4104 },
        { lat: 37.7849, lng: -122.4094 }
      ],
      // Detailed OBD-II data for charts with time support
      detailedData: foundTrip.detailedData || null
    };
  }, [salesforceData, tripId]);

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

  // Prepare chart data with time support
  const prepareChartData = (profileData: any, dataType: string) => {
    if (!profileData) return null;
    
    // Check if data includes time information
    if (tripData?.detailedData?.timeData) {
      // Option 1: Combined time data objects
      return tripData.detailedData.timeData.map(point => ({
        timeOffset: point.timeOffset,
        timestamp: point.timestamp,
        value: point[dataType] || 0
      }));
    } else if (tripData?.detailedData?.timestamps) {
      // Option 2: Separate timestamps array
      return profileData.map((value: number, index: number) => ({
        timeOffset: index * 5, // Assume 5-second intervals
        timestamp: tripData.detailedData.timestamps[index],
        value: value
      }));
    } else {
      // Option 3: Fallback to array of numbers
      return profileData;
    }
  };

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
          <Link to="/trips" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
            onClick={refreshData}
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
      {/* Header */}
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
          <p className="text-sm text-gray-500 mt-1">Trip ID: {tripId}</p>
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

      {/* Trip Overview Cards */}
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
            <Activity className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-gray-600">Idling</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{formatTime(tripData.events.idling)}</div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
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

      {/* Map */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Route</h3>
        <TripMap 
          startLocation={tripData.startLocation}
          endLocation={tripData.endLocation}
          route={tripData.route}
        />
      </div>

      {/* Analytics Charts - Enhanced with Time Support */}
      {tripData.detailedData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">OBD-II Analytics</h3>
            <div className="text-sm text-gray-600">
              {tripData.detailedData.timeData || tripData.detailedData.timestamps 
                ? 'Real-time data with precise timestamps' 
                : 'Real-time data from your vehicle\'s engine control unit'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Speed Profile */}
            {(tripData.detailedData.speedProfile || tripData.detailedData.timeData) && (
              <AnalyticsChart 
                title="Speed Over Time" 
                data={prepareChartData(tripData.detailedData.speedProfile, 'speed') || tripData.detailedData.speedProfile}
                color="#3B82F6"
                unit="km/hr"
                yAxisDomain={[0, Math.max(...(tripData.detailedData.speedProfile || [100])) + 10]}
                tripDuration={tripData.duration}
                timestamps={tripData.detailedData.timestamps}
              />
            )}
            
            {/* RPM Profile */}
            {(tripData.detailedData.rpmProfile || tripData.detailedData.timeData) && (
              <AnalyticsChart 
                title="Engine RPM Over Time" 
                data={prepareChartData(tripData.detailedData.rpmProfile, 'rpm') || tripData.detailedData.rpmProfile}
                color="#10B981"
                unit="RPM"
                yAxisDomain={[0, Math.max(...(tripData.detailedData.rpmProfile || [3000])) + 200]}
                tripDuration={tripData.duration}
                timestamps={tripData.detailedData.timestamps}
              />
            )}
            
            {/* Engine Load Profile */}
            {(tripData.detailedData.engineLoadProfile || tripData.detailedData.timeData) && (
              <AnalyticsChart 
                title="Engine Load Over Time" 
                data={prepareChartData(tripData.detailedData.engineLoadProfile, 'engineLoad') || tripData.detailedData.engineLoadProfile}
                color="#F59E0B"
                unit="%"
                yAxisDomain={[0, 100]}
                tripDuration={tripData.duration}
                timestamps={tripData.detailedData.timestamps}
              />
            )}
            
            {/* Throttle Profile */}
            {(tripData.detailedData.throttleProfile || tripData.detailedData.timeData) && (
              <AnalyticsChart 
                title="Throttle Position Over Time" 
                data={prepareChartData(tripData.detailedData.throttleProfile, 'throttle') || tripData.detailedData.throttleProfile}
                color="#8B5CF6"
                unit="%"
                yAxisDomain={[0, 100]}
                tripDuration={tripData.duration}
                timestamps={tripData.detailedData.timestamps}
              />
            )}
          </div>
        </div>
      )}

      {/* AI Advice */}
      <AIAdvice tripData={tripData} />
    </div>
  );
};

export default TripDetailPage;