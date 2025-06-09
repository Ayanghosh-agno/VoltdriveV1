// Hook to fetch and process Salesforce data from /tripInsights endpoint
import { useState, useEffect } from 'react';
import { SalesforceHomePageData, exampleSalesforceResponse } from '../types/salesforceData';
import { SalesforceDataProcessor } from '../utils/salesforceDataProcessor';
import { CalculatedMetrics } from '../utils/performanceCalculator';
import { useSettings } from './useSettings';
import AuthService from '../services/authService';

export const useSalesforceData = () => {
  const { settings } = useSettings(); // Get settings for userBaselines
  const [salesforceData, setSalesforceData] = useState<SalesforceHomePageData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<CalculatedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesforceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching trip insights from Salesforce...');
      
      // Get authenticated service instance
      const authService = AuthService.getInstance();
      
      // Make authenticated request to /tripInsights endpoint
      const response = await authService.makeAuthenticatedRequest('/services/apexrest/voltride/tripInsights', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Trip insights received from Salesforce:', data);
      
      // Check if this is a demo mode response
      if (data.mode === 'demo' || data.success === false) {
        console.log('🔄 Demo mode detected, using example data...');
        const fallbackData = exampleSalesforceResponse;
        setSalesforceData(fallbackData);
        
        // Process with settings-derived userBaselines
        const metrics = SalesforceDataProcessor.processHomePageData(fallbackData, settings);
        setPerformanceMetrics(metrics);
        
        setError('Running in demo mode - Salesforce integration not available');
        return;
      }
      
      // Validate the data structure
      if (!data.currentWeekTripInsight || !data.previousWeekTripInsight || !data.recentTrips) {
        console.warn('⚠️ Invalid data structure, using example data');
        throw new Error('Invalid data structure received from Salesforce');
      }
      
      setSalesforceData(data);
      
      // Process the data to calculate metrics using settings
      const metrics = SalesforceDataProcessor.processHomePageData(data, settings);
      setPerformanceMetrics(metrics);
      
      console.log('📊 Performance metrics calculated:', metrics);
      
    } catch (err) {
      console.error('❌ Error fetching Salesforce data:', err);
      
      // Fallback to example data for development/demo
      console.log('🔄 Using example data as fallback...');
      const fallbackData = exampleSalesforceResponse;
      setSalesforceData(fallbackData);
      
      // Process with settings-derived userBaselines
      const metrics = SalesforceDataProcessor.processHomePageData(fallbackData, settings);
      setPerformanceMetrics(metrics);
      
      setError(`Salesforce connection failed: ${err instanceof Error ? err.message : 'Unknown error'}. Using demo data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when settings are available
    if (settings) {
      fetchSalesforceData();
    }
  }, [settings]);

  return {
    salesforceData,
    performanceMetrics,
    loading,
    error,
    refreshData: fetchSalesforceData,
  };
};