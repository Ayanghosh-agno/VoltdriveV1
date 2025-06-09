import React from 'react';
import { MapPin, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentTrips: React.FC = () => {
  const recentTrips = [
    {
      id: 1,
      tripId: 'trip_001',
      tripNumber: 'Trip - 0001',
      time: '8:30 AM',
      distance: '20.1 km',
      score: 92,
      duration: '45 min'
    },
    {
      id: 2,
      tripId: 'trip_002',
      tripNumber: 'Trip - 0002',
      time: '6:00 PM',
      distance: '13.2 km',
      score: 88,
      duration: '35 min'
    },
    {
      id: 3,
      tripId: 'trip_003',
      tripNumber: 'Trip - 0003',
      time: '7:15 AM',
      distance: '8.2 km',
      score: 95,
      duration: '20 min'
    }
  ];

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
      <div className="space-y-4">
        {recentTrips.map((trip) => (
          <Link 
            key={trip.id}
            to={`/trips/${trip.tripId}`}
            className="block"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 rounded-full p-2">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{trip.tripNumber}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{trip.time}</span>
                    </span>
                    <span>{trip.distance}</span>
                    <span>{trip.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-bold text-gray-900">{trip.score}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentTrips;