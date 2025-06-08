import React from 'react';

interface ProgressRingProps {
  percentage: number;
  color: 'blue' | 'green' | 'amber' | 'red';
  size?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percentage, color, size = 120 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    blue: '#3B82F6',
    green: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444'
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClasses[color]}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
};

export default ProgressRing;