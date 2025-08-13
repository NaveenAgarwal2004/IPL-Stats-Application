import React, { memo } from 'react';
import { MapPin, RefreshCw, Thermometer, Droplets, Wind } from 'lucide-react';

export const LiveMatchCard = memo(({ match, darkMode, onClick }) => (
  <div 
    onClick={() => onClick(match)}
    className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-red-500 font-semibold uppercase text-xs tracking-wide">{match.status}</span>
        <div className="flex items-center text-xs text-gray-500 ml-4">
          <RefreshCw className="w-3 h-3 mr-1" />
          Live Data
        </div>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <MapPin size={14} />
        <span>{match.venue.split(',')[0]}</span>
      </div>
    </div>

    {/* Team Scores */}
    <div className="space-y-3 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">{match.team1.shortName}</span>
          </div>
          <span className="font-semibold">{match.team1.name}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{match.team1.score}</div>
          <div className="text-sm text-gray-500">{match.team1.overs} overs • RR: {match.team1.runRate}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">{match.team2.shortName}</span>
          </div>
          <span className="font-semibold">{match.team2.name}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600">{match.team2.score}</div>
          <div className="text-sm text-gray-500">{match.team2.overs} overs • RR: {match.team2.runRate}</div>
        </div>
      </div>
    </div>

    {/* Weather Info */}
    {match.weather && (
      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Thermometer size={16} className="text-orange-500" />
            <span className="text-sm">{match.weather.temp}°C</span>
          </div>
          <div className="flex items-center space-x-1">
            <Droplets size={16} className="text-blue-500" />
            <span className="text-sm">{match.weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wind size={16} className="text-gray-500" />
            <span className="text-sm">{match.weather.windSpeed}km/h</span>
          </div>
        </div>
        <span className="text-sm text-gray-600">{match.weather.condition}</span>
      </div>
    )}
  </div>
));