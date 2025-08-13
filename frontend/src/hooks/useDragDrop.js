// src/hooks/useDragDrop.js
import { useState, useCallback, useEffect } from 'react';

export const useDragDrop = (onAddToTeam, fantasyTeam, maxTeamSize = 11) => {
  const [dragMode, setDragMode] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState(null);

  // Generate safe draggable ID
  const generateDraggableId = useCallback((player, index) => {
    const safeName = player.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const safeTeam = player.team.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `player_${index}_${safeName}_${safeTeam}`;
  }, []);

  // Extract player from draggable ID
  const getPlayerFromId = useCallback((draggableId, players) => {
    const match = draggableId.match(/^player_(\d+)_/);
    if (match) {
      const playerIndex = parseInt(match[1]);
      return players[playerIndex] || null;
    }
    return null;
  }, []);

  // Check if player can be added
  const canAddPlayer = useCallback((player) => {
    if (!player) return false;
    if (fantasyTeam.length >= maxTeamSize) return false;
    if (fantasyTeam.some(p => p.name === player.name && p.team === player.team)) return false;
    return true;
  }, [fantasyTeam, maxTeamSize]);

  // Handle drag start
  const onDragStart = useCallback((start) => {
    const player = getPlayerFromId(start.draggableId, []);
    setDraggedPlayer(player);
  }, [getPlayerFromId]);

  // Handle drag end
  const onDragEnd = useCallback((result, players) => {
    setDraggedPlayer(null);
    
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === 'players' && destination.droppableId === 'fantasy-team') {
      const player = getPlayerFromId(draggableId, players);
      if (player && canAddPlayer(player) && onAddToTeam) {
        onAddToTeam(player);
      }
    }
  }, [getPlayerFromId, canAddPlayer, onAddToTeam]);

  // Toggle drag mode
  const toggleDragMode = useCallback(() => {
    setDragMode(prev => !prev);
  }, []);

  // Reset drag state
  const resetDragState = useCallback(() => {
    setDraggedPlayer(null);
    setDragMode(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return resetDragState;
  }, [resetDragState]);

  return {
    dragMode,
    draggedPlayer,
    setDragMode,
    toggleDragMode,
    generateDraggableId,
    onDragStart,
    onDragEnd,
    canAddPlayer,
    resetDragState
  };
};