import { useCallback } from 'react';
import { useApiData } from './useApiData';
import ApiService from '../services/ApiService';

export const usePlayersData = () => {
  const apiCall = useCallback(() => ApiService.getPlayers(), []);
  return useApiData(apiCall, [], { cacheTime: 300000 }); // 5 minute cache
};

export const useLiveMatches = () => {
  const apiCall = useCallback(() => ApiService.getLiveMatches(), []);
  return useApiData(apiCall, [], { 
    cacheTime: 30000, // 30 second cache
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });
};

export const useAnalytics = () => {
  const apiCall = useCallback(() => ApiService.getAnalytics(), []);
  return useApiData(apiCall, [], { cacheTime: 300000 }); // 5 minute cache
};