import { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);
  const [apiHealth, setApiHealth] = useState({
    weather: 'unknown',
    cricket: 'unknown'
  });

  // Monitor browser online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser is online');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      console.log('Browser is offline');
      setIsOnline(false);
      setBackendStatus('disconnected');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check backend health with enhanced monitoring
  useEffect(() => {
    let checkInterval;
    
    const checkBackend = async () => {
      if (!isOnline) {
        setBackendStatus('offline');
        return;
      }

      try {
        setBackendStatus('checking');
        
        const healthResponse = await ApiService.checkHealth();
        
        if (healthResponse.success) {
          setBackendStatus('connected');
          setLastCheck(new Date());
          
          // Extract API status from health response
          if (healthResponse.apis) {
            setApiHealth({
              weather: healthResponse.apis.weather === 'configured' ? 'configured' : 'missing',
              cricket: healthResponse.apis.cricket === 'configured' ? 'configured' : 'missing'
            });
          }
          
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus('disconnected');
        
        // More specific error handling
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error('Network error - backend may not be running');
        } else if (error.message.includes('500')) {
          console.error('Backend server error');
          setBackendStatus('error');
        }
      }
    };

    // Initial check
    checkBackend();
    
    // Set up periodic health checks
    if (isOnline) {
      checkInterval = setInterval(checkBackend, 30000); // Check every 30 seconds
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [isOnline]);

  // Manual refresh function
  const refreshConnection = async () => {
    if (!isOnline) return;
    
    try {
      setBackendStatus('checking');
      const healthResponse = await ApiService.checkHealth();
      
      if (healthResponse.success) {
        setBackendStatus('connected');
        setLastCheck(new Date());
      }
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  // Get connection quality indicator
  const getConnectionQuality = () => {
    if (!isOnline) return 'offline';
    if (backendStatus === 'connected') return 'good';
    if (backendStatus === 'checking') return 'checking';
    return 'poor';
  };

  // Get status message for UI
  const getStatusMessage = () => {
    if (!isOnline) return 'No internet connection';
    
    switch (backendStatus) {
      case 'connected':
        return 'All systems operational';
      case 'checking':
        return 'Checking connection...';
      case 'disconnected':
        return 'Backend server unavailable';
      case 'error':
        return 'Server error detected';
      default:
        return 'Connection status unknown';
    }
  };

  return {
    isOnline,
    backendStatus,
    apiHealth,
    lastCheck,
    connectionQuality: getConnectionQuality(),
    statusMessage: getStatusMessage(),
    refreshConnection
  };
};