import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  title: string;
  data: number[] | TimeDataPoint[];
  color: string;
  unit: string;
  yAxisDomain?: [number, number];
  tripDuration?: number; // minutes - for fallback calculation
  timeData?: string[]; // NEW: TimeData array from your format
}

interface TimeDataPoint {
  timeOffset: number;
  timestamp: string;
  value: number;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  title, 
  data, 
  color, 
  unit, 
  yAxisDomain,
  tripDuration,
  timeData
}) => {
  // Convert data to chart format with your TimeData format support
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 🎯 YOUR FORMAT: TimeData array with corresponding data arrays
    if (timeData && timeData.length === data.length) {
      return (data as number[]).map((value, index) => ({
        time: timeData[index], // Use your time format directly (e.g., "8:10", "8:12")
        timeInSeconds: index * 60, // Approximate seconds for sorting
        value: Math.round(value * 10) / 10,
        index: index
      }));
    }
    
    // Option 2: Data is already time-based objects (existing support)
    if (typeof data[0] === 'object' && 'timestamp' in data[0]) {
      const timeDataPoints = data as TimeDataPoint[];
      return timeDataPoints.map((point, index) => ({
        time: new Date(point.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        timeInSeconds: point.timeOffset,
        value: Math.round(point.value * 10) / 10,
        index: index
      }));
    }
    
    // Option 3: Fallback - calculate time from trip duration (current method)
    if (tripDuration) {
      const timeIntervalSeconds = (tripDuration * 60) / data.length;
      
      return (data as number[]).map((value, index) => {
        const timeInSeconds = index * timeIntervalSeconds;
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        
        return {
          time: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          timeInSeconds: timeInSeconds,
          value: Math.round(value * 10) / 10,
          index: index
        };
      });
    }
    
    // Final fallback - just use index
    return (data as number[]).map((value, index) => ({
      time: `${index}`,
      timeInSeconds: index,
      value: Math.round(value * 10) / 10,
      index: index
    }));
  }, [data, tripDuration, timeData]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const values = Array.isArray(data) && typeof data[0] === 'object' 
      ? (data as TimeDataPoint[]).map(d => d.value)
      : data as number[];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return {
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      avg: Math.round(avg * 10) / 10
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Header with title and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">{title}</h3>
        {stats && (
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Min</div>
              <div className="font-semibold" style={{ color }}>{stats.min} {unit}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Avg</div>
              <div className="font-semibold" style={{ color }}>{stats.avg} {unit}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Max</div>
              <div className="font-semibold" style={{ color }}>{stats.max} {unit}</div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={yAxisDomain || ['auto', 'auto']}
              tick={{ fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px'
              }}
              formatter={(value: any, name: string) => [
                `${value} ${unit}`, 
                title
              ]}
              labelFormatter={(label: string) => `Time: ${label}`}
              labelStyle={{ color: '#374151', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 4, 
                fill: color,
                stroke: 'white',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data points info */}
      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
        <span>{data.length} data points</span>
        <span>
          {timeData ? 'TimeData format' : 
           tripDuration ? `Duration: ${Math.floor(tripDuration)} minutes` : 
           'Calculated intervals'}
        </span>
      </div>
    </div>
  );
};

export default AnalyticsChart;