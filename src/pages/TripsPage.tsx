import React, { useState, useMemo } from 'react';
import { Calendar, Filter, MapPin, Clock, Fuel, TrendingUp, WifiOff, RefreshCw } from 'lucide-react';
import TripCard from '../components/TripCard';
import FilterModal from '../components/FilterModal';
import DateRangeModal, { DateRange } from '../components/DateRangeModal';
import AuthService from '../services/authService';

const TripsPage: React.FC = () => {
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
    preset: 'all'
  });

  // Fetch all trips from your new API endpoint
  const fetchAllTrips = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching all trips from /voltride/tripList...');
      
      // Get authenticated service instance
      const authService = AuthService.getInstance();
      
      // Make authenticated request to your new endpoint
      const response = await authService.makeAuthenticatedRequest('/services/apexrest/voltride/tripList', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ All trips received from Salesforce:', data);
      
      // Check if this is an error response
      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch trips from Salesforce');
      }
      
      // Validate the data structure - expect simple array of trips
      const trips = data.trips || data || [];
      if (!Array.isArray(trips)) {
        console.warn('⚠️ Invalid trips data structure received from Salesforce');
        throw new Error('Invalid trips data structure received from Salesforce');
      }
      
      // Convert to internal format
      const convertedTrips = trips.map((trip, index) => ({
        id: index + 1,
        tripId: trip.tripId,
        tripNumber: trip.tripName,
        date: trip.date,
        startTime: trip.startTime,
        endTime: trip.endTime,
        distance: trip.distance,
        duration: trip.duration,
        fuelUsed: trip.fuelUsed,
        avgSpeed: trip.avgSpeed,
        maxSpeed: trip.maxSpeed,
        score: trip.calculatedScore || calculateTempScore(trip),
        events: { 
          hardBraking: trip.harshBraking || 0, 
          rapidAccel: trip.harshAcceleration || 0, 
          speeding: trip.overSpeeding > 0 ? 1 : 0 
        }
      }));
      
      setAllTrips(convertedTrips);
      console.log('📊 Trips data processed successfully:', convertedTrips.length, 'trips');
      
    } catch (err) {
      console.error('❌ Error fetching trips:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Unable to load trips. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trips on component mount
  React.useEffect(() => {
    fetchAllTrips();
  }, [fetchAllTrips]);

  // Calculate score for display (temporary until Salesforce provides calculatedScore)
  const calculateTempScore = (trip: any) => {
    if (trip.calculatedScore) return trip.calculatedScore;
    
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
  }, [allTrips, selectedFilter, dateRange]);

  // Calculate summary stats from filtered trips
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

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Trips</h1>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Trips</h1>
            <p className="text-gray-600 mt-1">Track and analyze your driving patterns</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <WifiOff className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Trips</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAllTrips}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

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

      {/* Summary Stats - Calculated from filtered trips */}
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
            <TripCard key={trip.tripId} trip={trip} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-600">
              {allTrips.length === 0 
                ? 'Start driving to see your trip history!'
                : 'Try adjusting your filters or date range to see more trips.'
              }
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