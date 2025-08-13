import React from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { Wifi, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const ConnectionStatus = ({ darkMode }) => {
  const {
    isOnline,
    backendStatus,
    apiHealth,
    statusMessage,
    connectionQuality,
    refreshConnection
  } = useConnectionStatus();

  const getIcon = () => {
    switch (connectionQuality) {
      case 'good':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'poor':
      case 'offline':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'checking':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Wifi size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
      darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
    }`}>
      {getIcon()}
      <span className="text-sm">{statusMessage}</span>
      {!isOnline && <span className="text-sm text-red-500">(Offline)</span>}
      {backendStatus === 'disconnected' && (
        <button 
          onClick={refreshConnection}
          className="text-blue-500 hover:underline text-sm"
        >
          Retry
        </button>
      )}
      <div className="text-xs text-gray-400">
        Weather: {apiHealth.weather} | Cricket: {apiHealth.cricket}
      </div>
    </div>
  );
};