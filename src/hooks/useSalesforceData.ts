// Hook to fetch and process Salesforce data from /tripInsights endpoint
import { useState, useEffect } from 'react';
import { SalesforceHomePageData, exampleSalesforceResponse } from '../types/salesforceData';
import { SalesforceDataProcessor } from '../utils/salesforceDataProcessor';
import { CalculatedMetrics } from '../utils/performanceCalculator';

export const useSalesforceData = () => {
  const [salesforceData, setSalesforceData] = useState<SalesforceHomePageData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<CalculatedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesforceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching trip insights from Salesforce...');
      
      // Call the /tripInsights endpoint
      const response = await fetch('/salesforce-api/services/apexrest/voltride/tripInsights', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Trip insights received from Salesforce:', data);
      
      // Validate the data structure
      if (!data.currentWeekTripInsight || !data.previousWeekTripInsight || !data.recentTrips) {
        console.warn('⚠️ Invalid data structure, using example data');
        throw new Error('Invalid data structure received from Salesforce');
      }
      
      setSalesforceData(data);
      
      // Process the data to calculate metrics
      const metrics = SalesforceDataProcessor.processHomePageData(data);
      setPerformanceMetrics(metrics);
      
      console.log('📊 Performance metrics calculated:', metrics);
      
    } catch (err) {
      console.error('❌ Error fetching Salesforce data:', err);
      
      // Fallback to example data for development/demo
      console.log('🔄 Using example data as fallback...');
      const fallbackData = exampleSalesforceResponse;
      setSalesforceData(fallbackData);
      
      const metrics = SalesforceDataProcessor.processHomePageData(fallbackData);
      setPerformanceMetrics(metrics);
      
      setError(`Salesforce connection failed: ${err instanceof Error ? err.message : 'Unknown error'}. Using demo data.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesforceData();
  }, []);

  return {
    salesforceData,
    performanceMetrics,
    loading,
    error,
    refreshData: fetchSalesforceData,
  };
};