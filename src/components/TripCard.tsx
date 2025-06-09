import React from 'react';
import { MapPin, Clock, Fuel, Gauge, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TripCardProps {
  trip: {
    id: number;
    tripId: string;
    tripNumber: string;
    date: string;
    startTime: string;
    endTime: string;
    distance: number;
    duration: number;
    fuelUsed: number;
    avgSpeed: number;
    maxSpeed: number;
    score: number;
    events: {
      hardBraking: number;
      rapidAccel: number;
      speeding: number;
    };
  };
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/trips/${trip.tripId}`} className="block">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
          <div className="flex items-center space-x-4 mb-3 lg:mb-0">
            <div className="bg-blue-500 rounded-full p-2">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {trip.tripNumber}
              </h3>
              <p className="text-sm text-gray-600">{formatDate(trip.date)} • {trip.startTime} - {trip.endTime}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-2 rounded-lg ${getScoreColor(trip.score)}`}>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span className="font-bold">{trip.score}</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Distance</p>
              <p className="font-semibold">{trip.distance} km</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-semibold">{trip.duration} min</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Fuel className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Fuel</p>
              <p className="font-semibold">{trip.fuelUsed} L</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Avg Speed</p>
              <p className="font-semibold">{trip.avgSpeed} km/hr</p>
            </div>
          </div>
        </div>

        {(trip.events.hardBraking > 0 || trip.events.rapidAccel > 0 || trip.events.speeding > 0) && (
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <div className="flex space-x-4 text-sm">
              {trip.events.hardBraking > 0 && (
                <span className="text-red-600">{trip.events.hardBraking} Hard Braking</span>
              )}
              {trip.events.rapidAccel > 0 && (
                <span className="text-orange-600">{trip.events.rapidAccel} Rapid Accel</span>
              )}
              {trip.events.speeding > 0 && (
                <span className="text-red-600">{trip.events.speeding} Speeding</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default TripCard;