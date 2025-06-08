import React, { useState, useMemo } from 'react';
import { Calendar, Filter, MapPin, Clock, Fuel, TrendingUp } from 'lucide-react';
import TripCard from '../components/TripCard';
import FilterModal from '../components/FilterModal';
import DateRangeModal, { DateRange } from '../components/DateRangeModal';

const TripsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
    preset: 'all'
  });

  const allTrips = [
    {
      id: 1,
      tripNumber: 'Trip - 0001',
      date: '2024-01-15',
      startTime: '08:30 AM',
      endTime: '09:15 AM',
      distance: 20.1,
      duration: 45,
      fuelUsed: 1.3,
      avgSpeed: 45,
      maxSpeed: 105,
      score: 92,
      events: { hardBraking: 0, rapidAccel: 1, speeding: 0 }
    },
    {
      id: 2,
      tripNumber: 'Trip - 0002',
      date: '2024-01-15',
      startTime: '06:00 PM',
      endTime: '06:35 PM',
      distance: 13.2,
      duration: 35,
      fuelUsed: 0.8,
      avgSpeed: 35,
      maxSpeed: 72,
      score: 88,
      events: { hardBraking: 1, rapidAccel: 0, speeding: 0 }
    },
    {
      id: 3,
      tripNumber: 'Trip - 0003',
      date: '2024-01-14',
      startTime: '07:45 AM',
      endTime: '08:30 AM',
      distance: 20.1,
      duration: 45,
      fuelUsed: 1.5,
      avgSpeed: 50,
      maxSpeed: 112,
      score: 85,
      events: { hardBraking: 2, rapidAccel: 1, speeding: 1 }
    },
    {
      id: 4,
      tripNumber: 'Trip - 0004',
      date: '2024-01-13',
      startTime: '02:15 PM',
      endTime: '03:45 PM',
      distance: 30.1,
      duration: 90,
      fuelUsed: 1.9,
      avgSpeed: 40,
      maxSpeed: 88,
      score: 94,
      events: { hardBraking: 0, rapidAccel: 0, speeding: 0 }
    },
    {
      id: 5,
      tripNumber: 'Trip - 0005',
      date: '2024-01-12',
      startTime: '09:00 AM',
      endTime: '09:30 AM',
      distance: 15.5,
      duration: 30,
      fuelUsed: 1.0,
      avgSpeed: 52,
      maxSpeed: 95,
      score: 89,
      events: { hardBraking: 1, rapidAccel: 0, speeding: 0 }
    },
    {
      id: 6,
      tripNumber: 'Trip - 0006',
      date: '2024-01-11',
      startTime: '05:30 PM',
      endTime: '06:15 PM',
      distance: 22.3,
      duration: 45,
      fuelUsed: 1.4,
      avgSpeed: 42,
      maxSpeed: 85,
      score: 91,
      events: { hardBraking: 0, rapidAccel: 1, speeding: 0 }
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Trips' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'high-score', label: 'High Score (90+)' },
    { value: 'low-score', label: 'Needs Improvement (<80)' }
  ];

  // Filter trips based on selected filters and date range
  const filteredTrips = useMemo(() => {
    let filtered = [...allTrips];

    // Apply score filter
    if (selectedFilter === 'high-score') {
      filtered = filtered.filter(trip => trip.score >= 90);
    } else if (selectedFilter === 'low-score') {
      filtered = filtered.filter(trip => trip.score < 80);
    } else if (selectedFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(trip => trip.date === today);
    } else if (selectedFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(trip => new Date(trip.date) >= weekAgo);
    } else if (selectedFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(trip => new Date(trip.date) >= monthAgo);
    }

    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.date);
        return tripDate >= startDate && tripDate <= endDate;
      });
    }

    return filtered;
  }, [selectedFilter, dateRange]);

  const totalDistance = filteredTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const totalFuel = filteredTrips.reduce((sum, trip) => sum + trip.fuelUsed, 0);
  const avgScore = filteredTrips.length > 0 
    ? Math.round(filteredTrips.reduce((sum, trip) => sum + trip.score, 0) / filteredTrips.length)
    : 0;

  const handleDateRangeApply = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const getDateRangeLabel = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'Date Range';
    }

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    if (dateRange.startDate === dateRange.endDate) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === selectedFilter);
    return option ? option.label : 'Filter';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Trips</h1>
          <p className="text-gray-600 mt-1">
            Track and analyze your driving patterns
            {filteredTrips.length !== allTrips.length && (
              <span className="ml-2 text-blue-600">
                ({filteredTrips.length} of {allTrips.length} trips)
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors shadow-sm ${
              selectedFilter !== 'all' 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>{getFilterLabel()}</span>
          </button>
          <button 
            onClick={() => setShowDateRange(true)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors shadow-sm ${
              dateRange.startDate && dateRange.endDate
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{getDateRangeLabel()}</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedFilter !== 'all' || (dateRange.startDate && dateRange.endDate)) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {selectedFilter !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getFilterLabel()}
              <button
                onClick={() => setSelectedFilter('all')}
                className="ml-2 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          {dateRange.startDate && dateRange.endDate && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {getDateRangeLabel()}
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '', preset: 'all' })}
                className="ml-2 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSelectedFilter('all');
              setDateRange({ startDate: '', endDate: '', preset: 'all' });
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Total Distance</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(1)} km</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Fuel className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Fuel Used</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalFuel.toFixed(1)} L</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Avg Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgScore}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">Total Trips</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{filteredTrips.length}</div>
        </div>
      </div>

      {/* Trip List */}
      <div className="space-y-4">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or date range to see more trips.
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredTrips.length > 0 && filteredTrips.length >= 6 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            Load More Trips
          </button>
        </div>
      )}

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal
          options={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Date Range Modal */}
      {showDateRange && (
        <DateRangeModal
          isOpen={showDateRange}
          onClose={() => setShowDateRange(false)}
          onApply={handleDateRangeApply}
          currentRange={dateRange}
        />
      )}
    </div>
  );
};

export default TripsPage;