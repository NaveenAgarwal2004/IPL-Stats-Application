import { MapPin, GripVertical, Star, TrendingUp, Award } from 'lucide-react';
import React, { memo, useState } from 'react';

export const PlayerCard = memo(({ 
  player, 
  darkMode, 
  fantasyTeam, 
  onAddToTeam, 
  isDragging = false, 
  dragMode = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isInTeam = fantasyTeam.some(p => p.name === player.name);
  const isTeamFull = fantasyTeam.length >= 11;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Batsman': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Bowler': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Wicketkeeper': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    }
  };

  const getPerformanceScore = () => {
    // Calculate a simple performance score
    const runScore = (player.runs / Math.max(player.matches, 1)) * 0.6;
    const wicketScore = (player.wickets / Math.max(player.matches, 1)) * 0.4;
    return Math.round(runScore + wicketScore);
  };

  const getPerformanceRating = () => {
    const score = getPerformanceScore();
    if (score >= 30) return { label: 'Excellent', color: 'text-green-600', stars: 5 };
    if (score >= 20) return { label: 'Very Good', color: 'text-blue-600', stars: 4 };
    if (score >= 15) return { label: 'Good', color: 'text-yellow-600', stars: 3 };
    if (score >= 10) return { label: 'Average', color: 'text-orange-600', stars: 2 };
    return { label: 'Below Average', color: 'text-red-600', stars: 1 };
  };

  const rating = getPerformanceRating();

  return (
    <div 
      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 transition-all duration-300 border group ${
        isDragging 
          ? 'shadow-2xl ring-2 ring-blue-500 transform rotate-3 scale-105' 
          : isInTeam
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : isHovered 
          ? 'border-blue-500 shadow-xl transform scale-105' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-xl hover:scale-105'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      {dragMode && (
        <div className="flex justify-center mb-2">
          <GripVertical 
            size={16} 
            className={`text-gray-400 ${isDragging ? 'text-blue-500' : 'group-hover:text-blue-500'} transition-colors cursor-grab active:cursor-grabbing`} 
          />
        </div>
      )}

      {/* Player Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
              {player.name}
            </h3>
            {isInTeam && <Star size={16} className="text-yellow-500 fill-current" />}
          </div>
          <p className="text-sm text-gray-500 mb-2">{player.team}</p>
          <div className="flex items-center space-x-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(player.role)}`}>
              {player.role}
            </span>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`${
                    i < rating.stars
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="text-center">
          <div className={`text-xs font-semibold ${rating.color}`}>
            {rating.label}
          </div>
          <div className="text-lg font-bold text-blue-600">
            {getPerformanceScore()}
          </div>
          <div className="text-xs text-gray-500">Score</div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Matches</div>
            <div className="font-semibold">{player.matches}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Runs</div>
            <div className="font-semibold text-green-600">{player.runs}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Wickets</div>
            <div className="font-semibold text-red-600">{player.wickets}</div>
          </div>
        </div>

        {/* Advanced Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <TrendingUp size={14} className="text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Run Rate</div>
              <div className="text-sm font-medium">
                {(player.runs / Math.max(player.matches, 1)).toFixed(1)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Award size={14} className="text-red-500" />
            <div>
              <div className="text-xs text-gray-500">Wicket Rate</div>
              <div className="text-sm font-medium">
                {(player.wickets / Math.max(player.matches, 1)).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Venue */}
      <div className="text-xs text-gray-500 mb-4 flex items-center">
        <MapPin size={12} className="mr-1 flex-shrink-0" />
        <span className="truncate">{player.venue.split(',')[0]}</span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Run Contribution</span>
            <span>{Math.round((player.runs / 5000) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((player.runs / 5000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Wicket Contribution</span>
            <span>{Math.round((player.wickets / 50) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((player.wickets / 50) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Add to Fantasy Team Button */}
      <button
        onClick={() => onAddToTeam(player)}
        disabled={isTeamFull || isInTeam}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
          isInTeam
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed border border-green-300 dark:border-green-700'
            : isTeamFull
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 shadow-md hover:shadow-lg active:scale-95'
        }`}
      >
        {isInTeam ? (
          <>
            <Star size={16} className="fill-current" />
            <span>In Team</span>
          </>
        ) : isTeamFull ? (
          <span>Team Full</span>
        ) : (
          <>
            <span>Add to Team</span>
            {dragMode && <span className="text-xs opacity-75">(or drag)</span>}
          </>
        )}
      </button>

      {/* Drag Mode Indicator */}
      {dragMode && !isDragging && (
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-400 flex items-center justify-center space-x-1">
            <GripVertical size={12} />
            <span>Drag to add to team</span>
          </div>
        </div>
      )}

      {/* Dragging State Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Adding to team...
          </div>
        </div>
      )}
    </div>
  );
});