import React from 'react';
import { Shield, Fuel, Activity, Leaf, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { FrontendScoreCalculator, TripScoreInput, VehicleBaselines } from '../utils/frontendScoreCalculator';
import { useSettings } from '../hooks/useSettings';
import { Link } from 'react-router-dom';

interface ScoreBreakdownProps {
  tripData: TripScoreInput & {
    // Add server data for penalties and bonuses
    penalties?: {
      descriptions: string[];
      points: number[];
    };
    bonuses?: {
      descriptions: string[];
      points: number[];
    };
    scoreBreakdown?: {
      safety: number;
      efficiency: number;
      smoothness: number;
      environmental: number;
    };
  };
  className?: string;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ tripData, className = '' }) => {
  const { settings } = useSettings();
  
  // Create vehicle baselines from settings
  const vehicleBaselines: VehicleBaselines = {
    averageMileage: parseFloat(settings.vehicle.averageMileage) || 15.0,
    speedThreshold: parseFloat(settings.vehicle.speedThreshold) || 80,
    fuelType: settings.vehicle.fuelType as 'Petrol' | 'Diesel' | 'Electric'
  };
  
  // Use server score breakdown if available, otherwise calculate in frontend
  const scoreData = tripData.scoreBreakdown || 
    FrontendScoreCalculator.calculateScoreBreakdown(tripData, vehicleBaselines);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const scoreCategories = [
    {
      name: 'Safety',
      score: scoreData.safety,
      icon: Shield,
      description: 'Speed compliance, harsh events, consistency'
    },
    {
      name: 'Efficiency',
      score: scoreData.efficiency,
      icon: Fuel,
      description: 'Fuel consumption vs vehicle specifications'
    },
    {
      name: 'Smoothness',
      score: scoreData.smoothness,
      icon: Activity,
      description: 'Acceleration and braking patterns'
    },
    {
      name: 'Environmental',
      score: scoreData.environmental,
      icon: Leaf,
      description: 'Idling time and emissions'
    }
  ];

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Score Breakdown</h3>
        <div className={`px-4 py-2 rounded-lg border ${getScoreColor(scoreData.overall || tripData.calculatedScore || 0)}`}>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{scoreData.overall || tripData.calculatedScore || 0}</span>
            <span className="text-lg font-semibold">{getScoreGrade(scoreData.overall || tripData.calculatedScore || 0)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {scoreCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className={`px-2 py-1 rounded text-sm font-semibold ${getScoreColor(category.score)}`}>
                  {category.score}
                </div>
              </div>
              <p className="text-xs text-gray-600">{category.description}</p>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    category.score >= 90 ? 'bg-green-500' :
                    category.score >= 80 ? 'bg-blue-500' :
                    category.score >= 70 ? 'bg-yellow-500' :
                    category.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Analysis - Use Server Data */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-gray-900 mb-3">Detailed Analysis</h4>
        
        {/* Show Server Penalties if available */}
        {tripData.penalties && tripData.penalties.descriptions.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-red-600 mb-2">Penalties Applied</h5>
            <div className="space-y-1 text-sm">
              {tripData.penalties.descriptions.map((description, index) => (
                <div key={index} className="flex justify-between text-red-600">
                  <span>{description}:</span>
                  <span className="font-medium">-{tripData.penalties!.points[index]} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show Server Bonuses if available */}
        {tripData.bonuses && tripData.bonuses.descriptions.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-green-600 mb-2">Bonuses Applied</h5>
            <div className="space-y-1 text-sm">
              {tripData.bonuses.descriptions.map((description, index) => (
                <div key={index} className="flex justify-between text-green-600">
                  <span>{description}:</span>
                  <span className="font-medium">+{tripData.bonuses!.points[index]} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: Show calculated breakdown if no server data */}
        {(!tripData.penalties || tripData.penalties.descriptions.length === 0) && 
         (!tripData.bonuses || tripData.bonuses.descriptions.length === 0) && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Speeding Penalty:</span>
              <span className="font-medium text-red-600">-{scoreData.breakdown?.speedingPenalty || 0} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Harsh Events Penalty:</span>
              <span className="font-medium text-red-600">-{scoreData.breakdown?.harshEventsPenalty || 0} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Idling Penalty:</span>
              <span className="font-medium text-red-600">-{scoreData.breakdown?.idlingPenalty || 0} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fuel Efficiency:</span>
              <span className="font-medium text-green-600">{scoreData.breakdown?.fuelEfficiencyScore || 0} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Speed Consistency:</span>
              <span className="font-medium text-blue-600">{scoreData.breakdown?.speedConsistencyScore || 0} pts</span>
            </div>
          </div>
        )}
      </div>

      {/* Updated Calculation Baseline Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Calculation Baseline</h5>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Vehicle Claimed Mileage: {vehicleBaselines.averageMileage} km/l</div>
          <div>Fuel Type: {vehicleBaselines.fuelType}</div>
          <div className="pt-2 border-t border-blue-200">
            <Link 
              to="/settings" 
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Move to Settings page to check the threshold points →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;