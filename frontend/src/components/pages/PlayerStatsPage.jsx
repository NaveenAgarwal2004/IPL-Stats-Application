// src/components/pages/PlayerStatsPage.jsx
import React, { memo, useState, useMemo, useCallback } from 'react';
import { Users, Download, SlidersHorizontal, TrendingUp, TrendingDown, Search, X } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import ApiService from '../../services/ApiService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { PlayerCard } from '../cards/PlayerCard';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const PlayerStatsPage = memo(({ 
  darkMode, 
  fantasyTeam, 
  onAddToTeam, 
  searchQuery: globalSearchQuery = '',
  selectedTeamFilter = 'All Teams',
  selectedRoleFilter = 'All Roles'
}) => {
  const [sortBy, setSortBy] = useState('runs');
  const [sortOrder, setSortOrder] = useState('desc');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    minRuns: '',
    maxRuns: '',
    minWickets: '',
    maxWickets: '',
    minMatches: '',
    maxMatches: ''
  });

  // Use local search if available, otherwise global search
  const effectiveSearchQuery = localSearchQuery || globalSearchQuery;

  // Use API for player search with filters
  const { data: playersResponse, loading, error, refetch } = useApiData(
    useCallback(() => ApiService.searchPlayers(effectiveSearchQuery, {
      team: selectedTeamFilter !== 'All Teams' ? selectedTeamFilter : '',
      role: selectedRoleFilter !== 'All Roles' ? selectedRoleFilter : '',
      limit: 500
    }), [effectiveSearchQuery, selectedTeamFilter, selectedRoleFilter]),
    [effectiveSearchQuery, selectedTeamFilter, selectedRoleFilter],
    { cacheTime: 60000 }
  );

  const players = playersResponse?.data || [];

  // Apply advanced filters
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const { minRuns, maxRuns, minWickets, maxWickets, minMatches, maxMatches } = filters;
      
      if (minRuns && player.runs < parseInt(minRuns)) return false;
      if (maxRuns && player.runs > parseInt(maxRuns)) return false;
      if (minWickets && player.wickets < parseInt(minWickets)) return false;
      if (maxWickets && player.wickets > parseInt(maxWickets)) return false;
      if (minMatches && player.matches < parseInt(minMatches)) return false;
      if (maxMatches && player.matches > parseInt(maxMatches)) return false;
      
      return true;
    });
  }, [players, filters]);

  // Sort players with multiple criteria
  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'performance':
          // Custom performance score based on runs, wickets, and matches
          aVal = (a.runs * 0.6) + (a.wickets * 0.3) + (a.matches * 0.1);
          bVal = (b.runs * 0.6) + (b.wickets * 0.3) + (b.matches * 0.1);
          break;
        case 'runRate':
          aVal = a.matches > 0 ? a.runs / a.matches : 0;
          bVal = b.matches > 0 ? b.runs / b.matches : 0;
          break;
        case 'wicketRate':
          aVal = a.matches > 0 ? a.wickets / a.matches : 0;
          bVal = b.matches > 0 ? b.wickets / b.matches : 0;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        default:
          aVal = a[sortBy];
          bVal = b[sortBy];
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [filteredPlayers, sortBy, sortOrder]);

  // Generate truly unique draggable IDs - Include more unique data
  const generateDraggableId = useCallback((player, index) => {
    // Create a comprehensive unique string including stats to ensure uniqueness
    const uniqueString = `${player.name}_${player.team}_${player.role}_${player.runs}_${player.wickets}_${player.matches}_${index}`;
    
    // Create a hash and include index as backup for absolute uniqueness
    const playerHash = btoa(encodeURIComponent(uniqueString))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 20);
    
    return `player_${playerHash}_${index}`;
  }, []);

  // Create stable player list with IDs - This prevents ID mismatches
  const playersWithIds = useMemo(() => {
    const playerMap = new Map();
    const duplicateCheck = new Set();
    
    const result = sortedPlayers.map((player, index) => {
      const baseId = generateDraggableId(player, index);
      
      // Ensure absolute uniqueness by checking for duplicates
      let finalId = baseId;
      let counter = 0;
      while (playerMap.has(finalId)) {
        counter++;
        finalId = `${baseId}_dup_${counter}`;
      }
      
      playerMap.set(finalId, true);
      
      // Debug: Check for any remaining duplicates
      if (duplicateCheck.has(finalId)) {
        console.warn('Duplicate ID detected:', finalId, player);
        finalId = `${finalId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      duplicateCheck.add(finalId);
      
      return {
        ...player,
        draggableId: finalId,
        originalIndex: index
      };
    });
    
    // Final validation
    const finalIds = result.map(p => p.draggableId);
    const uniqueIds = new Set(finalIds);
    if (finalIds.length !== uniqueIds.size) {
      console.error('Still have duplicate IDs after processing!', finalIds);
    }
    
    return result;
  }, [sortedPlayers, generateDraggableId]);

  // Statistics
  const stats = useMemo(() => {
    if (sortedPlayers.length === 0) return null;
    
    const totalRuns = sortedPlayers.reduce((sum, p) => sum + p.runs, 0);
    const totalWickets = sortedPlayers.reduce((sum, p) => sum + p.wickets, 0);
    const avgRuns = Math.round(totalRuns / sortedPlayers.length);
    const avgWickets = Math.round(totalWickets / sortedPlayers.length);
    
    return {
      totalPlayers: sortedPlayers.length,
      totalRuns,
      totalWickets,
      avgRuns,
      avgWickets,
      topScorer: sortedPlayers.reduce((top, p) => p.runs > top.runs ? p : top, sortedPlayers[0]),
      topBowler: sortedPlayers.reduce((top, p) => p.wickets > top.wickets ? p : top, sortedPlayers[0])
    };
  }, [sortedPlayers]);

  const exportToCSV = useCallback(() => {
    const headers = ['Name', 'Team', 'Role', 'Matches', 'Runs', 'Wickets', 'Run Rate', 'Wicket Rate', 'Venue'];
    const csvContent = [
      headers.join(','),
      ...sortedPlayers.map(player => [
        `"${player.name}"`,
        `"${player.team}"`,
        `"${player.role}"`,
        player.matches,
        player.runs,
        player.wickets,
        (player.runs / Math.max(player.matches, 1)).toFixed(2),
        (player.wickets / Math.max(player.matches, 1)).toFixed(2),
        `"${player.venue}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ipl_players_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [sortedPlayers]);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy, sortOrder]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setFilters({
      minRuns: '',
      maxRuns: '',
      minWickets: '',
      maxWickets: '',
      minMatches: '',
      maxMatches: ''
    });
  }, []);

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Improved drag and drop handlers
  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === 'players' && destination.droppableId === 'fantasy-team') {
      // Find player by draggableId
      const player = playersWithIds.find(p => p.draggableId === draggableId);
      if (player && onAddToTeam) {
        onAddToTeam(player);
      }
    }
  }, [playersWithIds, onAddToTeam]);

  const onDragStart = useCallback((start) => {
    // Optional: Add visual feedback when drag starts
    console.log('Drag started:', start.draggableId);
  }, []);

  // Disable drag and drop in strict mode or if there are issues
  const isDragDropEnabled = dragMode && typeof window !== 'undefined';

  if (loading) return <LoadingSpinner darkMode={darkMode} message="Loading players..." />;
  if (error) return <ErrorBoundary error={error} darkMode={darkMode} onRetry={refetch} />;

  const content = (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center mb-2">
            <Users className="mr-3 text-blue-500" />
            Player Statistics
          </h2>
          {stats && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{stats.totalPlayers} players</span>
              <span>•</span>
              <span>{stats.totalRuns.toLocaleString()} total runs</span>
              <span>•</span>
              <span>{stats.totalWickets} total wickets</span>
              <span>•</span>
              <span>Avg: {stats.avgRuns} runs, {stats.avgWickets} wickets</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDragMode(!dragMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              dragMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {dragMode ? 'Drag Mode ON' : 'Enable Drag & Drop'}
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search players locally..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {localSearchQuery && (
          <button
            onClick={() => setLocalSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 mr-4">Sort by:</span>
          {[
            { key: 'runs', label: 'Runs' },
            { key: 'wickets', label: 'Wickets' },
            { key: 'matches', label: 'Matches' },
            { key: 'performance', label: 'Performance' },
            { key: 'runRate', label: 'Run Rate' },
            { key: 'wicketRate', label: 'Wicket Rate' },
            { key: 'name', label: 'Name' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                sortBy === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{label}</span>
              {sortBy === key && (
                sortOrder === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
            showAdvancedFilters || hasActiveFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>Advanced Filters</span>
          {hasActiveFilters && <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">!</span>}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Advanced Filters</h3>
            <button
              onClick={clearAdvancedFilters}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Runs Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minRuns}
                  onChange={(e) => handleFilterChange('minRuns', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxRuns}
                  onChange={(e) => handleFilterChange('maxRuns', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Wickets Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minWickets}
                  onChange={(e) => handleFilterChange('minWickets', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxWickets}
                  onChange={(e) => handleFilterChange('maxWickets', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Matches Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minMatches}
                  onChange={(e) => handleFilterChange('minMatches', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxMatches}
                  onChange={(e) => handleFilterChange('maxMatches', e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers Highlight */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'} border border-green-200 dark:border-green-700`}>
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Top Run Scorer</h3>
                <p className="text-lg font-bold">{stats.topScorer.name} - {stats.topScorer.runs} runs</p>
                <p className="text-sm text-green-600 dark:text-green-400">{stats.topScorer.team}</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-50'} border border-red-200 dark:border-red-700`}>
            <div className="flex items-center space-x-3">
              <TrendingUp className="text-red-600" size={24} />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Top Wicket Taker</h3>
                <p className="text-lg font-bold">{stats.topBowler.name} - {stats.topBowler.wickets} wickets</p>
                <p className="text-sm text-red-600 dark:text-red-400">{stats.topBowler.team}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fantasy Team Drop Zone (when drag mode is enabled) */}
      {isDragDropEnabled && (
        <div className={`p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600`}>
          <div className="text-center">
            <Users className="mx-auto mb-2 text-gray-400" size={32} />
            <h3 className="font-medium text-gray-600 dark:text-gray-300">
              Drop players here to add to fantasy team
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Fantasy Team: {fantasyTeam.length}/11 players
            </p>
          </div>
        </div>
      )}

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playersWithIds.map((player, index) => (
          <div key={player.draggableId}>
            <PlayerCard 
              player={player} 
              darkMode={darkMode} 
              fantasyTeam={fantasyTeam}
              onAddToTeam={onAddToTeam}
              isDragging={false}
              dragMode={dragMode}
            />
          </div>
        ))}
      </div>

      {sortedPlayers.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No players found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );

  // Only wrap with DragDropContext if drag mode is enabled and working
  if (isDragDropEnabled) {
    return (
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <div className="space-y-6">
          {/* All the content except player grid */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center mb-2">
                <Users className="mr-3 text-blue-500" />
                Player Statistics
              </h2>
              {stats && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{stats.totalPlayers} players</span>
                  <span>•</span>
                  <span>{stats.totalRuns.toLocaleString()} total runs</span>
                  <span>•</span>
                  <span>{stats.totalWickets} total wickets</span>
                  <span>•</span>
                  <span>Avg: {stats.avgRuns} runs, {stats.avgWickets} wickets</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDragMode(!dragMode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dragMode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {dragMode ? 'Drag Mode ON' : 'Enable Drag & Drop'}
              </button>
              <button 
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search and filters - same as before */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search players locally..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {localSearchQuery && (
              <button
                onClick={() => setLocalSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Rest of the filters and stats sections */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 mr-4">Sort by:</span>
              {[
                { key: 'runs', label: 'Runs' },
                { key: 'wickets', label: 'Wickets' },
                { key: 'matches', label: 'Matches' },
                { key: 'performance', label: 'Performance' },
                { key: 'runRate', label: 'Run Rate' },
                { key: 'wicketRate', label: 'Wicket Rate' },
                { key: 'name', label: 'Name' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    sortBy === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{label}</span>
                  {sortBy === key && (
                    sortOrder === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <SlidersHorizontal size={16} />
              <span>Advanced Filters</span>
              {hasActiveFilters && <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">!</span>}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Advanced Filters</h3>
                <button
                  onClick={clearAdvancedFilters}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Runs Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minRuns}
                      onChange={(e) => handleFilterChange('minRuns', e.target.value)}
                      className={`flex-1 px-3 py-2 rounded border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxRuns}
                      onChange={(e) => handleFilterChange('maxRuns', e.target.value)}
                      className={`flex-1 px-3 py-2 rounded border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Wickets Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minWickets}
                      onChange={(e) => handleFilterChange('minWickets', e.target.value)}
                      className={`flex-1 px-3 py-2 rounded border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxWickets}
                      onChange={(e) => handleFilterChange('maxWickets', e.target.value)}
                      className={`flex-1 px-3 py-2 rounded border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Matches Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minMatches}
                      onChange={(e) => handleFilterChange('minMatches', e.target.value)}
                      className={`flex-1 px-3 py-2 rounded border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxMatches}
                      onChange={(e) => handleFilterChange('maxMatches', e.target.value)}
                      className={`flex-1 px-3 py-2 rounded border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Performers Highlight */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'} border border-green-200 dark:border-green-700`}>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-green-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300">Top Run Scorer</h3>
                    <p className="text-lg font-bold">{stats.topScorer.name} - {stats.topScorer.runs} runs</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{stats.topScorer.team}</p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-50'} border border-red-200 dark:border-red-700`}>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="text-red-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-300">Top Wicket Taker</h3>
                    <p className="text-lg font-bold">{stats.topBowler.name} - {stats.topBowler.wickets} wickets</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{stats.topBowler.team}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fantasy Team Drop Zone */}
          <Droppable droppableId="fantasy-team">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-6 rounded-lg border-2 border-dashed transition-colors ${
                  snapshot.isDraggingOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <Users className="mx-auto mb-2 text-gray-400" size={32} />
                  <h3 className="font-medium text-gray-600 dark:text-gray-300">
                    Drop players here to add to fantasy team
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Fantasy Team: {fantasyTeam.length}/11 players
                  </p>
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Draggable Player Cards Grid */}
          <Droppable droppableId="players" isDropDisabled={true}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {playersWithIds.map((player, index) => (
                  <Draggable
                    key={player.draggableId}
                    draggableId={player.draggableId}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          transform: snapshot.isDragging
                            ? provided.draggableProps.style?.transform
                            : 'none',
                        }}
                        className={snapshot.isDragging ? 'z-50' : ''}
                      >
                        <PlayerCard 
                          player={player} 
                          darkMode={darkMode} 
                          fantasyTeam={fantasyTeam}
                          onAddToTeam={onAddToTeam}
                          isDragging={snapshot.isDragging}
                          dragMode={dragMode}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {sortedPlayers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No players found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </DragDropContext>
    );
  }

  // Return regular content without drag and drop
  return content;
});