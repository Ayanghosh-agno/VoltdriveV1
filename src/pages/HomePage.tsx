import React from 'react';
import { TrendingUp, Fuel, Clock, Shield, AlertTriangle, Award, Star, Gift } from 'lucide-react';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import RecentTrips from '../components/RecentTrips';
import SafetyRating from '../components/SafetyRating';
import { DrivingScoreCalculator, ScoreBreakdown } from '../utils/scoreCalculation';
import { useSettings } from '../hooks/useSettings';

const HomePage: React.FC = () => {
  const { settings, loading } = useSettings();

  // Mock recent scores for safety rating calculation
  const recentScores: ScoreBreakdown[] = [
    { overall: 92, safety: 94, efficiency: 88, smoothness: 95, environmental: 90, breakdown: { speedingPenalty: 2, harshEventsPenalty: 5, idlingPenalty: 3, fuelEfficiencyScore: 85, smoothnessScore: 95, speedConsistencyScore: 88 } },
    { overall: 88, safety: 90, efficiency: 85, smoothness: 92, environmental: 85, breakdown: { speedingPenalty: 5, harshEventsPenalty: 8, idlingPenalty: 5, fuelEfficiencyScore: 80, smoothnessScore: 92, speedConsistencyScore: 85 } },
    { overall: 85, safety: 87, efficiency: 82, smoothness: 88, environmental: 83, breakdown: { speedingPenalty: 8, harshEventsPenalty: 10, idlingPenalty: 7, fuelEfficiencyScore: 78, smoothnessScore: 88, speedConsistencyScore: 82 } },
  ];

  const safetyRating = DrivingScoreCalculator.calculateSafetyRating(recentScores);
  const drivingScore = 87;
  const fuelEfficiency = 92;

  // Extract first name from full name for a more personal greeting
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Show loading state while fetching user data
  if (loading) {
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
              <div className="text-2xl font-bold">204 km</div>
              <div className="text-blue-200 text-sm">Distance Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">15</div>
              <div className="text-blue-200 text-sm">Trips This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Feature Banner with Sticker */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <img 
            src="/black_circle_360x360.png" 
            alt="VoltRide Premium Feature" 
            className="h-20 w-20 object-contain animate-pulse cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={() => {
              alert('🎉 Premium VoltRide Features Coming Soon!');
            }}
          />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Star className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Premium Analytics Unlocked!</h3>
              <p className="text-purple-100">Advanced AI insights and personalized coaching</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="h-5 w-5 text-yellow-300" />
                <span className="font-semibold">AI Coach</span>
              </div>
              <p className="text-sm text-purple-100">Real-time driving tips</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="font-semibold">Predictive Analytics</span>
              </div>
              <p className="text-sm text-purple-100">Fuel cost predictions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-blue-300" />
                <span className="font-semibold">Safety Alerts</span>
              </div>
              <p className="text-sm text-purple-100">Advanced warnings</p>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Driving Score</h3>
            <Award className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex items-center justify-center">
            <ProgressRing percentage={drivingScore} color="blue" size={120} />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Excellent driving! Keep it up.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Fuel Efficiency</h3>
            <Fuel className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex items-center justify-center">
            <ProgressRing percentage={fuelEfficiency} color="green" size={120} />
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Above average efficiency
          </p>
        </div>

        <SafetyRating 
          rating={safetyRating.rating}
          trend={safetyRating.trend}
          riskLevel={safetyRating.riskLevel}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Distance"
          value="2,005 km"
          change="+12%"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Avg. Speed"
          value="51 km/hr"
          change="-2%"
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Hard Braking"
          value="3 events"
          change="-50%"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Fuel Saved"
          value="₹1,247"
          change="+8%"
          icon={Fuel}
          color="emerald"
        />
      </div>

      {/* Recent Trips */}
      <RecentTrips />

      {/* Insights & Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Today's Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="bg-green-500 rounded-full p-1">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-800">Great fuel efficiency!</p>
              <p className="text-sm text-green-600">You saved 15% more fuel than average today.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="bg-blue-500 rounded-full p-1">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-800">Smooth driving detected</p>
              <p className="text-sm text-blue-600">Your acceleration patterns are very consistent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;