// src/hooks/useKeyboardShortcuts.js
import React, { useEffect, useCallback, useState } from 'react';

export const useKeyboardShortcuts = (callbacks = {}) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const handleKeyDown = useCallback((event) => {
    const key = event.key.toLowerCase();
    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;

    // Add key to pressed keys set
    setPressedKeys(prev => new Set(prev).add(key));

    // Prevent default for our shortcuts
    const shouldPreventDefault = (isCtrl && ['1', '2', '3', '4', 'k', 'd', 'f', 'r'].includes(key)) ||
                                (key === '?' && !isCtrl) ||
                                (key === 'escape');

    if (shouldPreventDefault) {
      event.preventDefault();
    }

    // Tab navigation (Ctrl + 1,2,3,4)
    if (isCtrl && !isShift && !isAlt) {
      switch (key) {
        case '1':
          callbacks.setActiveTab?.('live-matches');
          break;
        case '2':
          callbacks.setActiveTab?.('player-stats');
          break;
        case '3':
          callbacks.setActiveTab?.('fantasy-team');
          break;
        case '4':
          callbacks.setActiveTab?.('analytics');
          break;
        case 'k':
          // Focus search
          const searchInput = document.querySelector('input[placeholder*="Search"]');
          searchInput?.focus();
          break;
        case 'd':
          // Toggle dark mode
          callbacks.toggleDarkMode?.();
          break;
        case 'f':
          // Clear filters
          callbacks.clearFilters?.();
          break;
        case 'r':
          // Refresh current data
          callbacks.refreshData?.();
          break;
      }
    }

    // Help modal (?)
    if (key === '?' && !isCtrl && !isShift && !isAlt) {
      setShowShortcutsModal(true);
    }

    // Close modal (Escape)
    if (key === 'escape') {
      setShowShortcutsModal(false);
      // Also close any other modals
      callbacks.closeModals?.();
    }

    // Toggle sidebar (Ctrl + Shift + S)
    if (isCtrl && isShift && key === 's') {
      callbacks.toggleSidebar?.();
    }

    // Export data (Ctrl + Shift + E)
    if (isCtrl && isShift && key === 'e') {
      callbacks.exportData?.();
    }

    // Quick add to fantasy team (Space)
    if (key === ' ' && !isCtrl && !isShift && !isAlt) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.closest('.player-card')) {
        const addButton = activeElement.querySelector('button');
        if (addButton && !addButton.disabled) {
          event.preventDefault();
          addButton.click();
        }
      }
    }

  }, [callbacks]);

  const handleKeyUp = useCallback((event) => {
    const key = event.key.toLowerCase();
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Clear pressed keys on window blur
  useEffect(() => {
    const handleBlur = () => setPressedKeys(new Set());
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  return {
    showShortcutsModal,
    setShowShortcutsModal,
    pressedKeys
  };
};

// Shortcuts modal component
export const KeyboardShortcutsModal = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', '1'], description: 'Navigate to Live Matches' },
    { keys: ['Ctrl', '2'], description: 'Navigate to Player Stats' },
    { keys: ['Ctrl', '3'], description: 'Navigate to Fantasy Team' },
    { keys: ['Ctrl', '4'], description: 'Navigate to Analytics' },
    { keys: ['Ctrl', 'K'], description: 'Focus Search Bar' },
    { keys: ['Ctrl', 'D'], description: 'Toggle Dark Mode' },
    { keys: ['Ctrl', 'F'], description: 'Clear All Filters' },
    { keys: ['Ctrl', 'R'], description: 'Refresh Current Data' },
    { keys: ['Ctrl', 'Shift', 'S'], description: 'Toggle Sidebar' },
    { keys: ['Ctrl', 'Shift', 'E'], description: 'Export Data' },
    { keys: ['Space'], description: 'Add Focused Player to Team' },
    { keys: ['?'], description: 'Show This Help' },
    { keys: ['Escape'], description: 'Close Modals' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      } rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center">
              <span className="mr-3">⌨️</span>
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Master these shortcuts to navigate faster
          </p>
        </div>

        {/* Shortcuts List */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                } hover:bg-opacity-75 transition-colors`}
              >
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex items-center space-x-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      {keyIndex > 0 && <span className="text-gray-400 mx-1">+</span>}
                      <kbd className={`px-2 py-1 text-xs rounded ${
                        darkMode 
                          ? 'bg-gray-600 text-gray-200 border border-gray-500' 
                          : 'bg-white text-gray-700 border border-gray-300'
                      } shadow-sm font-mono`}>
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tips */}
          <div className={`mt-6 p-4 rounded-lg ${
            darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'
          } border`}>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Pro Tips
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
              <li>• Use Tab to navigate between elements and Space to activate</li>
              <li>• Hold Ctrl while clicking to select multiple filters</li>
              <li>• Use arrow keys to navigate through player cards</li>
              <li>• Press Enter on any focused button to activate it</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${
          darkMode ? 'bg-gray-750' : 'bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <span className="mr-2">💻</span>
              Works on Windows, Mac, and Linux
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};