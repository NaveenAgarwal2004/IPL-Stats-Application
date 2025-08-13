// src/hooks/useApiData.js
import { useState, useEffect, useCallback } from 'react';

export const useApiData = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const { 
    cacheTime = 60000, // 1 minute default
    refetchInterval = null,
    enabled = true 
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache
    if (lastFetch && data && (Date.now() - lastFetch) < cacheTime) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, enabled, cacheTime, lastFetch, data]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [refetchInterval, enabled, fetchData]);

  const refetch = useCallback(() => {
    setLastFetch(null); // Force refresh
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};