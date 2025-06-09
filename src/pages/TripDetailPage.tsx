import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Fuel, Gauge, AlertTriangle, TrendingUp, Zap, TreePine, Activity } from 'lucide-react';
import TripMap from '../components/TripMap';
import AnalyticsChart from '../components/AnalyticsChart';
import AIAdvice from '../components/AIAdvice';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { DrivingScoreCalculator, mockTripData } from '../utils/scoreCalculation';

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams();

  // Mock trip data - in real app, this would be fetched based on tripId
  const tripData = {
    id: tripId || 'trip_001',
    tripNumber: `Trip - ${tripId?.replace('trip_', '').padStart(4, '0') || '0001'}`,
    date: '2024-01-15',
    startTime: '08:30 AM',
    endTime: '09:15 AM',
    duration: 45, // minutes
    distance: 20.1, // kilometers
    fuelUsed: 1.3, // liters
    co2Emitted: 3.1, // kg
    avgSpeed: 45, // km/hr
    maxSpeed: 105, // km/hr
    score: 92,
    events: {
      harshAcceleration: 2,
      harshBraking: 1,
      overRevving: 15, // seconds
      idling: 180, // seconds
      overSpeeding: 45 // seconds
    },
    startLocation: { lat: 37.7749, lng: -122.4194, name: 'Start Point' },
    endLocation: { lat: 37.7849, lng: -122.4094, name: 'End Point' },
    route: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7779, lng: -122.4164 },
      { lat: 37.7809, lng: -122.4134 },
      { lat: 37.7839, lng: -122.4104 },
      { lat: 37.7849, lng: -122.4094 }
    ]
  };

  // Calculate detailed score breakdown
  const scoreBreakdown = DrivingScoreCalculator.calculateDrivingScore(mockTripData);

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
        <div className={`ml-auto px-4 py-2 rounded-lg border ${getScoreColor(scoreBreakdown.overall)}`}>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-bold text-lg">{scoreBreakdown.overall}</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <ScoreBreakdown scoreData={scoreBreakdown} />

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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart 
          title="Speed Analysis" 
          type="speed"
          color="#3B82F6"
        />
        <AnalyticsChart 
          title="Engine RPM" 
          type="rpm"
          color="#10B981"
        />
        <AnalyticsChart 
          title="Engine Load" 
          type="load"
          color="#F59E0B"
        />
        <AnalyticsChart 
          title="Throttle Position" 
          type="throttle"
          color="#8B5CF6"
        />
      </div>

      {/* AI Advice */}
      <AIAdvice tripData={tripData} />
    </div>
  );
};

export default TripDetailPage;