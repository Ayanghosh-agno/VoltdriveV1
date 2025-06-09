import React from 'react';
import { TrendingUp, Fuel, Clock, Shield, AlertTriangle, Award, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import RecentTrips from '../components/RecentTrips';
import SafetyRating from '../components/SafetyRating';
import { usePerformanceData } from '../hooks/usePerformanceData';
import { useSettings } from '../hooks/useSettings';

const HomePage: React.FC = () => {
  const { settings, loading: settingsLoading } = useSettings();
  const { performanceMetrics, loading: dataLoading, error, refreshData } = usePerformanceData();

  // Extract first name from full name for a more personal greeting
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Show loading state while fetching data
  if (settingsLoading || dataLoading) {
    return (
      <div className="space-y-8 pb-20 md:pb-8">
        {/* Loading Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="h-8 bg-white/20 rounded-lg w-64 mb-2 animate-pulse"></div>
              <div className="h-5 bg-white/10 rounded-lg w-80 animate-pulse"></div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <div className="text-center">
                <div className="h-6 bg-white/20 rounded w-16 mb-1 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-20 animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-6 bg-white/20 rounded w-8 mb-1 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading placeholder for rest of content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8 pb-20 md:pb-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Determine safety rating trend and risk level
  const getSafetyTrend = (score: number): 'improving' | 'stable' | 'declining' => {
    if (score >= 90) return 'improving';
    if (score >= 70) return 'stable';
    return 'declining';
  };

  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 85) return 'low';
    if (score >= 70) return 'medium';
    return 'high';
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {getFirstName(settings.profile.name)}!
            </h2>
            <p className="text-blue-100 text-lg">Your driving performance is looking great this week.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{performanceMetrics.totalDistance.value} km</div>
              <div className="text-blue-200 text-sm">Distance This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {performanceMetrics.totalDistance.value > 0 ? Math.ceil(performanceMetrics.totalDistance.value / 20) : 0}
              </div>
              <div className="text-blue-200 text-sm">Trips This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Driving Score</h3>
            <Award className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex items-center justify-center">
            <ProgressRing percentage={performanceMetrics.drivingScore} color="blue" size={120} />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            {performanceMetrics.drivingScore >= 90 ? 'Excellent driving! Keep it up.' :
             performanceMetrics.drivingScore >= 80 ? 'Good driving with room for improvement.' :
             performanceMetrics.drivingScore >= 70 ? 'Average performance, focus on safety.' :
             'Needs improvement - drive more carefully.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Fuel Efficiency</h3>
            <Fuel className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex items-center justify-center">
            <ProgressRing percentage={performanceMetrics.fuelEfficiency} color="green" size={120} />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            {performanceMetrics.fuelEfficiency >= 80 ? 'Excellent fuel efficiency' :
             performanceMetrics.fuelEfficiency >= 70 ? 'Good fuel efficiency' :
             'Room for improvement'}
          </p>
        </div>

        <SafetyRating 
          rating={performanceMetrics.safetyRating}
          trend={getSafetyTrend(performanceMetrics.safetyRating)}
          riskLevel={getRiskLevel(performanceMetrics.safetyRating)}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Distance"
          value={`${performanceMetrics.totalDistance.value} km`}
          change={performanceMetrics.totalDistance.change}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Avg. Speed"
          value={`${performanceMetrics.avgSpeed.value} km/hr`}
          change={performanceMetrics.avgSpeed.change}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Hard Braking"
          value={`${performanceMetrics.hardBrakingEvents.value} events`}
          change={performanceMetrics.hardBrakingEvents.change}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Fuel Saved"
          value={`₹${performanceMetrics.fuelSaved.value}`}
          change={performanceMetrics.fuelSaved.change}
          icon={Fuel}
          color="emerald"
        />
      </div>

      {/* Recent Trips */}
      <RecentTrips />

      {/* Insights & Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Today's Insights</h3>
          <button
            onClick={refreshData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="space-y-4">
          {performanceMetrics.insights.length > 0 ? (
            performanceMetrics.insights.map((insight, index) => (
              <div key={index} className={`flex items-start space-x-3 p-4 rounded-xl border ${
                insight.color === 'green' ? 'bg-green-50 border-green-100' :
                insight.color === 'blue' ? 'bg-blue-50 border-blue-100' :
                insight.color === 'amber' ? 'bg-amber-50 border-amber-100' :
                'bg-red-50 border-red-100'
              }`}>
                <div className={`rounded-full p-1 ${
                  insight.color === 'green' ? 'bg-green-500' :
                  insight.color === 'blue' ? 'bg-blue-500' :
                  insight.color === 'amber' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}>
                  <div className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className={`font-medium ${
                    insight.color === 'green' ? 'text-green-800' :
                    insight.color === 'blue' ? 'text-blue-800' :
                    insight.color === 'amber' ? 'text-amber-800' :
                    'text-red-800'
                  }`}>{insight.title}</p>
                  <p className={`text-sm ${
                    insight.color === 'green' ? 'text-green-600' :
                    insight.color === 'blue' ? 'text-blue-600' :
                    insight.color === 'amber' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{insight.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No insights available yet. Drive more to get personalized recommendations!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;