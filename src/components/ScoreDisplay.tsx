import React from 'react';
import { TrendingUp, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { TripScore, getScoreInterpretation, getScoreColor } from '../types/drivingScore';

interface ScoreDisplayProps {
  tripScore: TripScore;
  showBreakdown?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  tripScore, 
  showBreakdown = false, 
  size = 'medium' 
}) => {
  const interpretation = getScoreInterpretation(tripScore.calculatedScore);
  const colorClass = getScoreColor(tripScore.calculatedScore);
  
  const sizeClasses = {
    small: 'text-lg p-2',
    medium: 'text-2xl p-4',
    large: 'text-4xl p-6'
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle;
    if (score >= 80) return TrendingUp;
    if (score >= 70) return Award;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon(tripScore.calculatedScore);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Main Score Display */}
      <div className={`${colorClass} rounded-t-xl ${sizeClasses[size]} text-center`}>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <ScoreIcon className="h-6 w-6" />
          <span className="font-bold">{tripScore.calculatedScore}</span>
        </div>
        <div className="text-sm font-medium">{interpretation.label}</div>
        <div className="text-xs opacity-80">{interpretation.description}</div>
      </div>

      {/* Score Breakdown */}
      {showBreakdown && (
        <div className="p-4 space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Safety</span>
              <span className="font-semibold">{tripScore.scoreBreakdown.safety}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Efficiency</span>
              <span className="font-semibold">{tripScore.scoreBreakdown.efficiency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Smoothness</span>
              <span className="font-semibold">{tripScore.scoreBreakdown.smoothness}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Environmental</span>
              <span className="font-semibold">{tripScore.scoreBreakdown.environmental}</span>
            </div>
          </div>

          {/* Penalties & Bonuses */}
          {(tripScore.penalties.speedingPenalty > 0 || 
            tripScore.penalties.harshEventsPenalty > 0 || 
            tripScore.penalties.idlingPenalty > 0) && (
            <div className="pt-3 border-t border-gray-200">
              <h5 className="text-sm font-medium text-red-600 mb-2">Penalties</h5>
              <div className="space-y-1 text-xs">
                {tripScore.penalties.speedingPenalty > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Speeding</span>
                    <span>-{tripScore.penalties.speedingPenalty}</span>
                  </div>
                )}
                {tripScore.penalties.harshEventsPenalty > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Harsh Events</span>
                    <span>-{tripScore.penalties.harshEventsPenalty}</span>
                  </div>
                )}
                {tripScore.penalties.idlingPenalty > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Idling</span>
                    <span>-{tripScore.penalties.idlingPenalty}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(tripScore.bonuses.fuelEfficiencyBonus > 0 || 
            tripScore.bonuses.smoothnessBonus > 0) && (
            <div className="pt-3 border-t border-gray-200">
              <h5 className="text-sm font-medium text-green-600 mb-2">Bonuses</h5>
              <div className="space-y-1 text-xs">
                {tripScore.bonuses.fuelEfficiencyBonus > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Fuel Efficiency</span>
                    <span>+{tripScore.bonuses.fuelEfficiencyBonus}</span>
                  </div>
                )}
                {tripScore.bonuses.smoothnessBonus > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Smooth Driving</span>
                    <span>+{tripScore.bonuses.smoothnessBonus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insights */}
          {tripScore.insights.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Insights</h5>
              <div className="space-y-2">
                {tripScore.insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`text-xs p-2 rounded ${
                      insight.type === 'positive' ? 'bg-green-50 text-green-700' :
                      insight.type === 'warning' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {insight.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;