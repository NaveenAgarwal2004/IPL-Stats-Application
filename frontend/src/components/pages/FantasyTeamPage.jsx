// src/components/pages/FantasyTeamPage.jsx
import React, { memo, useState } from 'react';
import { Star, Trophy, Save, Share2, Trash2, Plus } from 'lucide-react';
import { FantasyPlayerCard } from '../cards/FantasyPlayerCard';

export const FantasyTeamPage = memo(({ 
  fantasyTeam, 
  darkMode, 
  onRemoveFromTeam, 
  validateFantasyTeam, 
  onSaveTeam, 
  savedTeams, 
  onLoadTeam, 
  onDeleteTeam 
}) => {
  const validation = validateFantasyTeam();
  const [teamName, setTeamName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const handleSaveTeam = () => {
    if (teamName.trim() && fantasyTeam.length === 11) {
      onSaveTeam(teamName.trim(), fantasyTeam);
      setTeamName('');
      setShowSaveForm(false);
    }
  };

  const shareTeam = () => {
    const teamData = encodeURIComponent(JSON.stringify(fantasyTeam));
    const shareUrl = `${window.location.origin}${window.location.pathname}?team=${teamData}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Team URL copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <Star className="mr-3 text-yellow-500" />
          Fantasy Team Builder
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className={`font-semibold ${fantasyTeam.length === 11 ? 'text-green-600' : 'text-blue-600'}`}>
              {fantasyTeam.length}/11
            </span>
            <span className="text-gray-500 ml-1">Players Selected</span>
          </div>
          {fantasyTeam.length === 11 && (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSaveForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Save Team</span>
              </button>
              <button
                onClick={shareTeam}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team Validation */}
      <div className={`p-4 rounded-lg ${validation.isValid ? 'bg-green-100 border-green-500 dark:bg-green-900' : 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900'} border`}>
        <div className="flex items-center mb-2">
          <Trophy className="mr-2" size={20} />
          <h3 className="font-semibold">Team Composition</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className={`flex justify-between ${validation.batsmen >= 5 ? 'text-green-600' : 'text-red-600'}`}>
            <span>Batsmen:</span>
            <span>{validation.batsmen}/5+</span>
          </div>
          <div className={`flex justify-between ${validation.bowlers >= 4 ? 'text-green-600' : 'text-red-600'}`}>
            <span>Bowlers:</span>
            <span>{validation.bowlers}/4+</span>
          </div>
          <div className={`flex justify-between ${validation.wicketkeepers >= 1 ? 'text-green-600' : 'text-red-600'}`}>
            <span>Keepers:</span>
            <span>{validation.wicketkeepers}/1+</span>
          </div>
          <div className={`flex justify-between ${validation.allRounders >= 1 ? 'text-green-600' : 'text-red-600'}`}>
            <span>All-rounders:</span>
            <span>{validation.allRounders}/1+</span>
          </div>
        </div>
        {!validation.isValid && (
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
            Complete your team composition to enable saving and sharing.
          </p>
        )}
      </div>

      {/* Save Team Form */}
      {showSaveForm && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border`}>
          <h3 className="font-semibold mb-3">Save Your Team</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Enter team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={handleSaveTeam}
              disabled={!teamName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Teams */}
      {savedTeams.length > 0 && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border`}>
          <h3 className="font-semibold mb-3">Saved Teams</h3>
          <div className="space-y-2">
            {savedTeams.map((team, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div>
                  <span className="font-medium">{team.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({team.players.length} players)</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => onLoadTeam(team.players)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDeleteTeam(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fantasy Team Formation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {fantasyTeam.map(player => (
          <FantasyPlayerCard 
            key={player.name} 
            player={player} 
            darkMode={darkMode}
            onRemove={onRemoveFromTeam}
          />
        ))}

        {/* Empty slots */}
        {Array.from({ length: 11 - fantasyTeam.length }).map((_, index) => (
          <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[120px]`}>
            <div className="text-center text-gray-400">
              <Plus size={32} className="mx-auto mb-2" />
              <span className="text-sm">Add Player</span>
            </div>
          </div>
        ))}
      </div>

      {fantasyTeam.length === 0 && (
        <div className="text-center py-12">
          <Star size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Build Your Dream Team</h3>
          <p className="text-gray-400">Select players from the Player Stats page to build your fantasy team</p>
        </div>
      )}
    </div>
  );
});