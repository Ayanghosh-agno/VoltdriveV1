import React from 'react';
import { Shield, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyRatingProps {
  rating: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  className?: string;
}

const SafetyRating: React.FC<SafetyRatingProps> = ({ 
  rating, 
  trend, 
  riskLevel, 
  className = '' 
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (rating >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRatingDescription = (rating: number) => {
    if (rating >= 90) return 'Excellent - Very safe driver';
    if (rating >= 80) return 'Good - Safe driving habits';
    if (rating >= 70) return 'Average - Room for improvement';
    if (rating >= 60) return 'Below Average - Needs attention';
    return 'Poor - Significant safety concerns';
  };

  const TrendIcon = getTrendIcon(trend);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Safety Rating</h3>
          <p className="text-sm text-gray-600">Based on recent driving history</p>
        </div>
      </div>

      {/* Main Rating Display */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${getRatingColor(rating)}`}>
          <span className="text-3xl font-bold">{rating}</span>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-700">
          {getRatingDescription(rating)}
        </p>
      </div>

      {/* Trend and Risk Level */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`flex items-center justify-center space-x-1 ${getTrendColor(trend)}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{trend}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Trend</p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskLevel)}`}>
            {riskLevel === 'low' && <CheckCircle className="h-3 w-3" />}
            {riskLevel === 'high' && <AlertTriangle className="h-3 w-3" />}
            <span className="capitalize">{riskLevel} Risk</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">Risk Level</p>
        </div>
      </div>

      {/* Rating Scale */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Poor</span>
          <span>Average</span>
          <span>Excellent</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
          <div 
            className="absolute top-0 w-3 h-3 bg-white border-2 border-gray-400 rounded-full transform -translate-y-0.5 transition-all duration-500"
            style={{ left: `calc(${rating}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Improvement Tips */}
      {rating < 85 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Quick Tips to Improve</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {rating < 70 && <li>• Reduce harsh braking and acceleration events</li>}
            {rating < 80 && <li>• Maintain consistent speeds and avoid speeding</li>}
            <li>• Plan routes to avoid heavy traffic and reduce idling</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SafetyRating;