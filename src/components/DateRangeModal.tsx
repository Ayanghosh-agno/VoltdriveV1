import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (dateRange: DateRange) => void;
  currentRange: DateRange;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  preset: string;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentRange
}) => {
  const [selectedRange, setSelectedRange] = useState<DateRange>(currentRange);

  if (!isOpen) return null;

  const presetRanges = [
    {
      label: 'Today',
      value: 'today',
      getRange: () => {
        const today = new Date().toISOString().split('T')[0];
        return { startDate: today, endDate: today };
      }
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      getRange: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];
        return { startDate: dateStr, endDate: dateStr };
      }
    },
    {
      label: 'Last 7 Days',
      value: 'last7days',
      getRange: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { startDate: start.toISOString().split('T')[0], endDate: end };
      }
    },
    {
      label: 'Last 30 Days',
      value: 'last30days',
      getRange: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { startDate: start.toISOString().split('T')[0], endDate: end };
      }
    },
    {
      label: 'This Month',
      value: 'thismonth',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Last Month',
      value: 'lastmonth',
      getRange: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        };
      }
    }
  ];

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getRange();
    setSelectedRange({
      ...range,
      preset: preset.value
    });
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setSelectedRange(prev => ({
      ...prev,
      [field]: value,
      preset: 'custom'
    }));
  };

  const handleApply = () => {
    // Validate dates
    if (selectedRange.startDate && selectedRange.endDate) {
      if (new Date(selectedRange.startDate) > new Date(selectedRange.endDate)) {
        alert('Start date cannot be after end date');
        return;
      }
    }
    
    onApply(selectedRange);
    onClose();
  };

  const handleReset = () => {
    setSelectedRange({
      startDate: '',
      endDate: '',
      preset: 'all'
    });
  };

  const formatDateRange = () => {
    if (!selectedRange.startDate || !selectedRange.endDate) return '';
    
    const start = new Date(selectedRange.startDate);
    const end = new Date(selectedRange.endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    if (selectedRange.startDate === selectedRange.endDate) {
      return formatDate(start);
    }
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Select Date Range</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Current Selection Display */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Selected Range:</span>
            </div>
            <p className="text-blue-900 font-semibold mt-1 text-sm sm:text-base">
              {formatDateRange() || 'No range selected'}
            </p>
          </div>

          {/* Preset Options */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Select</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetRanges.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedRange.preset === preset.value
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-sm">{preset.label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(() => {
                      const range = preset.getRange();
                      if (range.startDate === range.endDate) {
                        return new Date(range.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        });
                      }
                      return `${new Date(range.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })} - ${new Date(range.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}`;
                    })()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Range</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={selectedRange.startDate}
                  onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={selectedRange.endDate}
                  onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min={selectedRange.startDate}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Reset
          </button>
          <div className="flex-1" />
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeModal;