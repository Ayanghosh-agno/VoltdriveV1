import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  title: string;
  type: 'speed' | 'rpm' | 'load' | 'throttle';
  color: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title, type, color }) => {
  // Mock data - in real app, this would come from OBD-2 readings
  const generateData = () => {
    const dataPoints = 50;
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const time = i * 0.5; // 30-second intervals
      let value = 0;
      
      switch (type) {
        case 'speed':
          value = Math.max(0, 48 + Math.sin(i * 0.3) * 24 + Math.random() * 16);
          break;
        case 'rpm':
          value = Math.max(800, 2000 + Math.sin(i * 0.2) * 800 + Math.random() * 400);
          break;
        case 'load':
          value = Math.max(0, Math.min(100, 40 + Math.sin(i * 0.25) * 20 + Math.random() * 15));
          break;
        case 'throttle':
          value = Math.max(0, Math.min(100, 25 + Math.sin(i * 0.35) * 25 + Math.random() * 20));
          break;
      }
      
      data.push({
        time: `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`,
        value: Math.round(value * 10) / 10
      });
    }
    
    return data;
  };

  const data = generateData();
  
  const getUnit = () => {
    switch (type) {
      case 'speed': return 'km/hr';
      case 'rpm': return 'RPM';
      case 'load': return '%';
      case 'throttle': return '%';
      default: return '';
    }
  };

  const getYAxisDomain = () => {
    switch (type) {
      case 'speed': return [0, 120];
      case 'rpm': return [0, 4000];
      case 'load': return [0, 100];
      case 'throttle': return [0, 100];
      default: return ['auto', 'auto'];
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={getYAxisDomain()}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [`${value} ${getUnit()}`, title]}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;