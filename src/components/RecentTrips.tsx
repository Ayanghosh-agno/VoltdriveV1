import React from 'react';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSalesforceData } from '../hooks/useSalesforceData';

const RecentTrips: React.FC = () => {
  const { salesforceData, loading, error } = useSalesforceData();

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Recent Trips</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-300 rounded-full p-2 w-8 h-8"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Recent Trips</h3>
        </div>
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load recent trips</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Use actual data from Salesforce
  const recentTrips = salesforceData?.recentTrips || [];

  // Calculate score for display (you can remove this once calculatedScore comes from Salesforce)
  const calculateDisplayScore = (trip: any) => {
    if (trip.calculatedScore) return trip.calculatedScore;
    
    // Temporary calculation until Salesforce provides calculatedScore
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Recent Trips</h3>
        <Link 
          to="/trips"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View All
        </Link>
      </div>
      
      {recentTrips.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No recent trips</h4>
          <p className="text-gray-600">Start driving to see your trip history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentTrips.slice(0, 3).map((trip) => {
            const score = calculateDisplayScore(trip);
            
            return (
              <Link 
                key={trip.tripId}
                to={`/trips/${trip.tripId}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 rounded-full p-2">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{trip.tripName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{trip.startTime}</span>
                        </span>
                        <span>{trip.distance} km</span>
                        <span>{trip.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-bold text-gray-900">{score}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTrips;