import React, { memo } from 'react';

export const LoadingSpinner = memo(({ darkMode, message = "Loading..." }) => (
  <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{message}</p>
    </div>
  </div>
));