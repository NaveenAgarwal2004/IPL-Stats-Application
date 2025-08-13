// src/App.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Navbar } from './components/ui/Navbar';
import { Sidebar } from './components/ui/Sidebar';
import { ConnectionStatus } from './components/ui/ConnectionStatus';
import { LiveMatchesPage } from './components/pages/LiveMatchesPage';
import { PlayerStatsPage } from './components/pages/PlayerStatsPage';
import { FantasyTeamPage } from './components/pages/FantasyTeamPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePlayersData } from './hooks/usePlayersData';
import { useKeyboardShortcuts, KeyboardShortcutsModal } from './hooks/useKeyboardShortcuts';
import { Footer } from './components/ui/Footer';

function App() {
  // State management
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [activeTab, setActiveTab] = useState('live-matches');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fantasyTeam, setFantasyTeam] = useLocalStorage('fantasyTeam', []);
  const [savedTeams, setSavedTeams] = useLocalStorage('savedTeams', []);
  
  // Filters
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('All Teams');
  const [selectedVenueFilter, setSelectedVenueFilter] = useState('All Venues');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');

  // Get players data for filters
  const { data: playersResponse, refetch: refetchPlayers } = usePlayersData();
  const players = playersResponse?.data || [];

  // Extract unique teams and venues for filters
  const teams = useMemo(() => {
    const uniqueTeams = [...new Set(players.map(p => p.team))];
    return ['All Teams', ...uniqueTeams.sort()];
  }, [players]);

  const venues = useMemo(() => {
    const uniqueVenues = [...new Set(players.map(p => p.venue))];
    return ['All Venues', ...uniqueVenues.slice(0, 10).sort()];
  }, [players]);

  // Keyboard shortcuts callbacks
  const keyboardCallbacks = {
    setActiveTab,
    toggleDarkMode: () => setDarkMode(!darkMode),
    clearFilters: () => {
      setSelectedTeamFilter('All Teams');
      setSelectedVenueFilter('All Venues');
      setSelectedRoleFilter('All Roles');
      setSearchQuery('');
    },
    refreshData: refetchPlayers,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen),
    exportData: () => {
      // This will be handled by individual pages
      const event = new CustomEvent('exportData');
      document.dispatchEvent(event);
    },
    closeModals: () => {
      // Close any open modals
      setSidebarOpen(false);
    }
  };

  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts(keyboardCallbacks);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fantasy team management
  const addToFantasyTeam = useCallback((player) => {
    if (fantasyTeam.length >= 11) {
      // Create a notification instead of alert
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white bg-red-500 transform transition-transform duration-300`;
      notification.textContent = 'Fantasy team is full! Remove a player first.';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
      return;
    }
    
    if (fantasyTeam.some(p => p.name === player.name)) {
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white bg-yellow-500 transform transition-transform duration-300`;
      notification.textContent = 'Player is already in your team!';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 3000);
      return;
    }

    setFantasyTeam(prev => [...prev, player]);
    
    // Success notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white bg-green-500 transform transition-transform duration-300`;
    notification.textContent = `${player.name} added to fantasy team!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }, [fantasyTeam, setFantasyTeam]);

  const removeFromFantasyTeam = useCallback((playerName) => {
    setFantasyTeam(prev => prev.filter(p => p.name !== playerName));
    
    // Success notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white bg-blue-500 transform transition-transform duration-300`;
    notification.textContent = `${playerName} removed from fantasy team!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }, [setFantasyTeam]);

  // Fantasy team validation
  const validateFantasyTeam = useCallback(() => {
    const roles = fantasyTeam.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {});

    const batsmen = roles['Batsman'] || 0;
    const bowlers = roles['Bowler'] || 0;
    const wicketkeepers = roles['Wicketkeeper'] || 0;
    const allRounders = roles['All-rounder'] || 0;

    return {
      batsmen,
      bowlers,
      wicketkeepers,
      allRounders,
      isValid: batsmen >= 5 && bowlers >= 4 && wicketkeepers >= 1 && allRounders >= 1 && fantasyTeam.length === 11
    };
  }, [fantasyTeam]);

  // Save/Load teams
  const saveTeam = useCallback((name, team) => {
    const newTeam = { name, players: team, savedAt: new Date().toISOString() };
    setSavedTeams(prev => [...prev, newTeam]);
  }, [setSavedTeams]);

  const loadTeam = useCallback((team) => {
    setFantasyTeam(team);
  }, [setFantasyTeam]);

  const deleteTeam = useCallback((index) => {
    setSavedTeams(prev => prev.filter((_, i) => i !== index));
  }, [setSavedTeams]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedTeamFilter('All Teams');
    setSelectedVenueFilter('All Venues');
    setSelectedRoleFilter('All Roles');
    setSearchQuery('');
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.menu-button')) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  // Handle export data event
  useEffect(() => {
    const handleExportData = () => {
      // Trigger export on active tab
      const event = new CustomEvent('triggerExport');
      document.dispatchEvent(event);
    };

    document.addEventListener('exportData', handleExportData);
    return () => document.removeEventListener('exportData', handleExportData);
  }, []);

  // Render active page
  const renderActivePage = () => {
    const pageProps = { darkMode, fantasyTeam };
    
    switch (activeTab) {
      case 'live-matches':
        return <LiveMatchesPage {...pageProps} />;
      
      case 'player-stats':
        return (
          <PlayerStatsPage 
            {...pageProps}
            onAddToTeam={addToFantasyTeam}
            searchQuery={searchQuery}
            selectedTeamFilter={selectedTeamFilter}
            selectedRoleFilter={selectedRoleFilter}
          />
        );
      
      case 'fantasy-team':
        return (
          <FantasyTeamPage 
            {...pageProps}
            onRemoveFromTeam={removeFromFantasyTeam}
            validateFantasyTeam={validateFantasyTeam}
            onSaveTeam={saveTeam}
            savedTeams={savedTeams}
            onLoadTeam={loadTeam}
            onDeleteTeam={deleteTeam}
          />
        );
      
      case 'analytics':
        return <AnalyticsPage {...pageProps} />;
      
      default:
        return <LiveMatchesPage {...pageProps} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <Navbar 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSidebarOpen={setSidebarOpen}
        onShowShortcuts={() => setShowShortcutsModal(true)}
      />
      
      <div className="flex flex-1">
        <Sidebar 
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
          teams={teams}
          venues={venues}
          selectedTeamFilter={selectedTeamFilter}
          setSelectedTeamFilter={setSelectedTeamFilter}
          selectedVenueFilter={selectedVenueFilter}
          setSelectedVenueFilter={setSelectedVenueFilter}
          selectedRoleFilter={selectedRoleFilter}
          setSelectedRoleFilter={setSelectedRoleFilter}
          clearFilters={clearFilters}
          fantasyTeam={fantasyTeam}
        />
        
        <main className="flex-1 lg:ml-0 transition-all duration-300 flex flex-col">
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {renderActivePage()}
          </div>
        </main>
      </div>
      
      {/* Footer at the bottom */}
      <Footer darkMode={darkMode} />
      
      <ConnectionStatus darkMode={darkMode} />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        darkMode={darkMode}
      />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Help Button */}
      <button
        onClick={() => setShowShortcutsModal(true)}
        className={`fixed bottom-20 right-4 w-12 h-12 rounded-full ${
          darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
        } text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group`}
        title="Keyboard Shortcuts (Press ?)"
      >
        <span className="text-lg font-bold">?</span>
        <div className={`absolute right-full mr-3 px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
        } pointer-events-none`}>
          Keyboard Shortcuts
        </div>
      </button>
    </div>
  );
}

export default App;