import React from 'react';
import { Check, X, Loader2, Cloud } from 'lucide-react';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'saving' | 'success' | 'error';
  error?: string | null;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status, error }) => {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Loader2,
          text: 'Saving...',
          className: 'text-blue-600 bg-blue-50 border-blue-200',
          iconClassName: 'animate-spin'
        };
      case 'success':
        return {
          icon: Check,
          text: 'Saved successfully',
          className: 'text-green-600 bg-green-50 border-green-200',
          iconClassName: ''
        };
      case 'error':
        return {
          icon: X,
          text: error || 'Failed to save',
          className: 'text-red-600 bg-red-50 border-red-200',
          iconClassName: ''
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const { icon: Icon, text, className, iconClassName } = config;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg border shadow-lg ${className}`}>
      <Icon className={`h-4 w-4 ${iconClassName}`} />
      <span className="text-sm font-medium">{text}</span>
      <Cloud className="h-3 w-3 opacity-60" />
    </div>
  );
};

export default SaveStatusIndicator;