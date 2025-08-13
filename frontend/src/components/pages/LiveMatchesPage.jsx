import React, { memo, useState, useEffect, useRef } from 'react';
import { Zap, Activity, RefreshCw, Pause, Play, Timer } from 'lucide-react';
import { useLiveMatches } from '../../hooks/usePlayersData';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { LiveMatchCard } from '../cards/LiveMatchCard';

export const LiveMatchesPage = memo(({ darkMode }) => {
  const { data: matchesResponse, loading, error, refetch } = useLiveMatches();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const liveMatches = matchesResponse?.data || [];

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      // Main refresh interval (30 seconds)
      intervalRef.current = setInterval(() => {
        refetch();
        setLastUpdated(new Date());
        setCountdown(30); // Reset countdown
      }, 30000);

      // Countdown timer (1 second)
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) return 30;
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefresh, refetch]);

  // Manual refresh
  const handleManualRefresh = () => {
    refetch();
    setLastUpdated(new Date());
    setCountdown(30);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    if (!autoRefresh) {
      setCountdown(30);
    }
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading && liveMatches.length === 0) {
    return <LoadingSpinner darkMode={darkMode} message="Loading live matches..." />;
  }
  
  if (error && liveMatches.length === 0) {
    return <ErrorBoundary error={error} darkMode={darkMode} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      {/* Header with Auto-refresh Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <Zap className="mr-3 text-red-500" />
          Live Matches
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Auto-refresh Status */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <Activity className={`w-4 h-4 ${autoRefresh ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </span>
          </div>

          {/* Countdown Timer */}
          {autoRefresh && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
            } text-blue-600 dark:text-blue-400`}>
              <Timer className="w-4 h-4" />
              <span className="text-sm font-mono">
                Next refresh: {countdown}s
              </span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAutoRefresh}
              className={`p-2 rounded-lg transition-all duration-200 ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh now"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className={`flex items-center justify-between px-4 py-2 rounded-lg ${
        darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data from Cricket API</span>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {formatTime(lastUpdated)}
        </div>
      </div>

      {/* Loading Overlay for Refresh */}
      {loading && liveMatches.length > 0 && (
        <div className="fixed top-20 right-4 z-50 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm">Refreshing...</span>
        </div>
      )}

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveMatches.map((match, index) => (
          <div key={match.id} className="transform transition-all duration-500 ease-in-out">
            <LiveMatchCard 
              match={match} 
              darkMode={darkMode} 
              onClick={setSelectedMatch}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {liveMatches.length === 0 && !loading && (
        <div className="text-center py-12">
          <Zap size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No live matches</h3>
          <p className="text-gray-400 mb-4">Check back later for live match updates</p>
          <button
            onClick={handleManualRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Match Details</h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg">{selectedMatch.team1.name}</h4>
                    <p className="text-2xl font-bold text-blue-600">{selectedMatch.team1.score}</p>
                    <p className="text-sm text-gray-500">{selectedMatch.team1.overs} overs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">VS</div>
                    <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMatch.status === 'Live' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {selectedMatch.status}
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-lg">{selectedMatch.team2.name}</h4>
                    <p className="text-2xl font-bold text-yellow-600">{selectedMatch.team2.score}</p>
                    <p className="text-sm text-gray-500">{selectedMatch.team2.overs} overs</p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h5 className="font-semibold mb-2">Venue</h5>
                  <p className="text-gray-600 dark:text-gray-300">{selectedMatch.venue}</p>
                </div>

                {selectedMatch.weather && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h5 className="font-semibold mb-2">Weather Conditions</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Temperature: {selectedMatch.weather.temp}°C</div>
                      <div>Humidity: {selectedMatch.weather.humidity}%</div>
                      <div>Wind: {selectedMatch.weather.windSpeed}km/h</div>
                      <div>Condition: {selectedMatch.weather.condition}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});