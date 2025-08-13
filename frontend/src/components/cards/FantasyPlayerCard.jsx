import { X } from 'lucide-react';
import React, { memo} from 'react';


export const FantasyPlayerCard = memo(({ player, darkMode, onRemove }) => (
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4 border-2 border-blue-500`}>
    <div className="flex justify-between items-start mb-3">
      <div>
        <h4 className="font-bold text-lg">{player.name}</h4>
        <p className="text-sm text-gray-500">{player.team}</p>
      </div>
      <button
        onClick={() => onRemove(player.name)}
        className="p-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
    
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
      player.role === 'Batsman' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
      player.role === 'Bowler' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
      player.role === 'Wicketkeeper' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    }`}>
      {player.role}
    </span>
    
    <div className="mt-3 text-sm">
      <span className="text-green-600 font-semibold">{player.runs}R</span>
      <span className="mx-2">•</span>
      <span className="text-red-600 font-semibold">{player.wickets}W</span>
    </div>
  </div>
));