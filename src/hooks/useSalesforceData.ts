// Hook to fetch and process Salesforce data
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
      // In production, this would be the actual Salesforce API call
      // const response = await fetch('/salesforce-api/services/apexrest/voltride/homepage-data');
      // const data = await response.json();
      
      // For now, simulate API call with example data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = exampleSalesforceResponse;
      
      setSalesforceData(data);
      
      // Process the data to calculate metrics
      const metrics = SalesforceDataProcessor.processHomePageData(data);
      setPerformanceMetrics(metrics);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data from Salesforce');
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