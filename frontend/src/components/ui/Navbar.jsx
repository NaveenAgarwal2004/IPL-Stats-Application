// src/components/ui/Navbar.jsx
import React, { memo, useEffect } from 'react';
import { Search, Moon, Sun, Menu, Trophy, Zap, Users, Star, BarChart3, HelpCircle } from 'lucide-react';

export const Navbar = memo(({ 
  darkMode, 
  setDarkMode, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  setSidebarOpen,
  onShowShortcuts
}) => {
  const navigationItems = [
    { id: 'live-matches', label: 'Live Matches', icon: Zap },
    { id: 'player-stats', label: 'Player Stats', icon: Users },
    { id: 'fantasy-team', label: 'Fantasy Team', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        switch(e.key) {
          case '1': setActiveTab('live-matches'); break;
          case '2': setActiveTab('player-stats'); break;
          case '3': setActiveTab('fantasy-team'); break;
          case '4': setActiveTab('analytics'); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setActiveTab]);

  return (
    <nav className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-lg backdrop-blur-md bg-opacity-95`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors menu-button"
            >
              <Menu size={20} />
            </button>
            <Trophy className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                IPL Live Stats & Fantasy
              </h1>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : `hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Search, Help, and Theme Toggle */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search players or matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 w-64 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              />
            </div>

            {/* Help Button */}
            {onShowShortcuts && (
              <button
                onClick={onShowShortcuts}
                className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                } transition-all duration-200`}
                title="Keyboard Shortcuts"
              >
                <HelpCircle size={20} />
              </button>
            )}
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              } transition-all duration-200`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto px-4 py-2">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap mr-2 transition-all duration-200 ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : `hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`
              }`}
            >
              <Icon size={16} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 pr-4 py-2 w-full rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
          />
        </div>
      </div>
    </nav>
  );
});