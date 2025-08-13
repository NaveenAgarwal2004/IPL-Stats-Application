// src/components/ui/Sidebar.jsx
import React, { memo } from 'react';
import { Filter, Wifi, X } from 'lucide-react';

export const Sidebar = memo(({ 
  darkMode, 
  sidebarOpen, 
  teams, 
  venues, 
  selectedTeamFilter, 
  setSelectedTeamFilter, 
  selectedVenueFilter, 
  setSelectedVenueFilter,
  selectedRoleFilter,
  setSelectedRoleFilter,
  clearFilters,
  fantasyTeam 
}) => (
  <div className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 w-64 h-screen transition-transform duration-300 ${
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  } border-r shadow-lg overflow-y-auto`}>
    
    {/* Mobile close button */}
    <div className="lg:hidden flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setSelectedTeamFilter('All Teams')} // This will be handled by the click outside
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <X size={20} />
      </button>
    </div>

    <div className="p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <Filter className="mr-2" size={20} />
        Filters & Options
      </h3>
      
      {/* Team Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Team</label>
        <select
          value={selectedTeamFilter}
          onChange={(e) => setSelectedTeamFilter(e.target.value)}
          className={`w-full p-2 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      {/* Role Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Role</label>
        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className={`w-full p-2 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="All Roles">All Roles</option>
          <option value="Batsman">Batsman</option>
          <option value="Bowler">Bowler</option>
          <option value="Wicketkeeper">Wicketkeeper</option>
          <option value="All-rounder">All-rounder</option>
        </select>
      </div>

      {/* Venue Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Venue</label>
        <select
          value={selectedVenueFilter}
          onChange={(e) => setSelectedVenueFilter(e.target.value)}
          className={`w-full p-2 rounded-lg border ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          {venues.slice(0, 10).map(venue => (
            <option key={venue} value={venue}>
              {venue === 'All Venues' ? venue : venue.split(',')[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 mb-6"
      >
        Clear All Filters
      </button>

      {/* Fantasy Team Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6">
        <h4 className="font-semibold mb-2 flex items-center">
          <span className="mr-2">⭐</span>
          Fantasy Team
        </h4>
        <p className="text-blue-100 text-sm mb-2">{fantasyTeam.length}/11 Players</p>
        <div className="w-full bg-blue-400 rounded-full h-2 mb-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${(fantasyTeam.length / 11) * 100}%` }}
          ></div>
        </div>
        
        {/* Role breakdown */}
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Batsmen:</span>
            <span>{fantasyTeam.filter(p => p.role === 'Batsman').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Bowlers:</span>
            <span>{fantasyTeam.filter(p => p.role === 'Bowler').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Keepers:</span>
            <span>{fantasyTeam.filter(p => p.role === 'Wicketkeeper').length}</span>
          </div>
          <div className="flex justify-between">
            <span>All-rounders:</span>
            <span>{fantasyTeam.filter(p => p.role === 'All-rounder').length}</span>
          </div>
        </div>

        {/* Quick stats */}
        {fantasyTeam.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-400 text-xs">
            <div className="flex justify-between">
              <span>Total Runs:</span>
              <span>{fantasyTeam.reduce((sum, p) => sum + (p.runs || 0), 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Wickets:</span>
              <span>{fantasyTeam.reduce((sum, p) => sum + (p.wickets || 0), 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* API Status */}
      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h4 className="font-medium text-sm mb-2 flex items-center">
          <Wifi size={16} className="mr-1 text-green-500" />
          Live Data Status
        </h4>
        <div className="text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span>Weather API:</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-green-600 dark:text-green-400">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Cricket API:</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-green-600 dark:text-green-400">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Backend:</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-green-600 dark:text-green-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Status Info */}
      <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} text-xs`}>
        <h5 className="font-medium mb-2">Active Filters:</h5>
        <div className="space-y-1">
          {selectedTeamFilter !== 'All Teams' && (
            <div className="flex items-center justify-between">
              <span>Team:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{selectedTeamFilter}</span>
            </div>
          )}
          {selectedRoleFilter !== 'All Roles' && (
            <div className="flex items-center justify-between">
              <span>Role:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">{selectedRoleFilter}</span>
            </div>
          )}
          {selectedVenueFilter !== 'All Venues' && (
            <div className="flex items-center justify-between">
              <span>Venue:</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {selectedVenueFilter.split(',')[0]}
              </span>
            </div>
          )}
          {selectedTeamFilter === 'All Teams' && 
           selectedRoleFilter === 'All Roles' && 
           selectedVenueFilter === 'All Venues' && (
            <span className="text-gray-500 italic">No filters applied</span>
          )}
        </div>
      </div>
    </div>
  </div>
));