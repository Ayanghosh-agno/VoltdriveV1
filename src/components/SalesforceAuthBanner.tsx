import React from 'react';
import { AlertCircle, LogIn, X } from 'lucide-react';

interface SalesforceAuthBannerProps {
  onLogin: () => void;
  onDismiss: () => void;
}

const SalesforceAuthBanner: React.FC<SalesforceAuthBannerProps> = ({ onLogin, onDismiss }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">Connect to Salesforce</h3>
          <p className="text-sm text-blue-700 mt-1">
            Sign in to Salesforce to sync your settings and data across devices. Your data is currently stored locally.
          </p>
          <div className="mt-3 flex space-x-3">
            <button
              onClick={onLogin}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign in to Salesforce</span>
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-2 text-blue-600 text-sm hover:text-blue-700 transition-colors"
            >
              Continue Offline
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-blue-100 rounded transition-colors"
        >
          <X className="h-4 w-4 text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default SalesforceAuthBanner;