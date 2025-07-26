'use client';

import { useState, useEffect } from 'react';
import Instructions from './Instructions';
import GameBoard from './GameBoard';
import Leaderboard from './Leaderboard';
import LevelComplete from './LevelComplete';
import { getGameLevel, getGameLevelByDifficulty, generateTargetNumber, PlayerData, savePlayerData } from '../../utils/gameLogic';
import "@/components/ui/8bit/styles/retro.css";
import { MAX_LEVEL } from '@/lib/constants';

interface GameContainerProps {
  playerData: PlayerData;
  onGameEnd: () => void;
}

type GameState = 'instructions' | 'playing' | 'levelComplete' | 'leaderboard';

export default function GameContainer({ playerData, onGameEnd }: GameContainerProps) {
  const [gameState, setGameState] = useState<GameState>(playerData.isFirstTime ? 'instructions' : 'playing');
  const [currentLevel, setCurrentLevel] = useState(playerData.currentLevel);
  const [targetNumber, setTargetNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [gameSessionId] = useState(() => Date.now().toString());
  const [isGameReady, setIsGameReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Initialize level when entering playing state or level changes
  useEffect(() => {
    if (gameState === 'playing' && !isInitializing) {
      initializeLevel();
    }
  }, [gameState, currentLevel]);

  const initializeLevel = async () => {
    if (isInitializing) return; // Prevent multiple initializations
    
    setIsInitializing(true);
    setIsGameReady(false);
    
    // Clear any existing timer first
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    try {
      const gameLevel = getGameLevelByDifficulty(currentLevel, playerData.difficulty);
      const target = generateTargetNumber(currentLevel, playerData.difficulty);
      
      setTargetNumber(target);
      setTimeLeft(gameLevel.timeLimit);
      
      // Reduced delay to match faster level transition
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setIsGameReady(true);
      
      // Quick start after ready
      await new Promise(resolve => setTimeout(resolve, 100));
      startTimer();
      
    } catch (error) {
      console.error('Error initializing level:', error);
      // Fallback: try again after a delay
      setTimeout(() => {
        setIsInitializing(false);
        initializeLevel();
      }, 500);
      return;
    }
    
    setIsInitializing(false);
  };

  const startTimer = () => {
    // Clear existing timer first
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    console.log()

    // Only start timer if we're in playing state and have valid time
    if (gameState === 'playing' && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimerInterval(interval);
    }
  };

  const handleStartGame = () => {
    // Mark player as not first time and save
    const updatedPlayer = { ...playerData, isFirstTime: false };
    savePlayerData(updatedPlayer);
    
    // Switch to playing state, which will trigger level initialization and timer
    setGameState('playing');
  };

  const handleGameComplete = (success: boolean, level: number) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (success) {
      if (level === MAX_LEVEL) {
        // Player won the game!
        setGameState('leaderboard');
      } else {
        // Show level complete screen
        setGameState('levelComplete');
      }
    } else {
      // Game over
      setGameState('leaderboard');
    }
  };

  const handleLevelContinue = () => {
    // Move to next level
    const nextLevel = currentLevel + 1;
    setCurrentLevel(nextLevel);
    const updatedPlayer = { ...playerData, currentLevel: nextLevel };
    savePlayerData(updatedPlayer);
    setGameState('playing');
  };

  const handlePlayAgain = () => {
    const updatedPlayer = { ...playerData, currentLevel: 1 };
    setCurrentLevel(1);
    savePlayerData(updatedPlayer);
    setGameState('playing');
  };

  const handleNewPlayer = () => {
    onGameEnd();
  };

  if (gameState === 'instructions') {
    return <Instructions onStartGame={handleStartGame} />;
  }

  if (gameState === 'playing') {
    return (
      <GameBoard
        targetNumber={targetNumber}
        timeLeft={timeLeft}
        onGameComplete={handleGameComplete}
        level={currentLevel}
        isGameReady={isGameReady}
      />
    );
  }

  if (gameState === 'levelComplete') {
    return (
      <LevelComplete
        level={currentLevel}
        onContinue={handleLevelContinue}
      />
    );
  }

  if (gameState === 'leaderboard') {
    return (
      <Leaderboard
        playerUsername={playerData.username}
        playerLevel={currentLevel}
        gameSessionId={gameSessionId}
        onPlayAgain={handlePlayAgain}
        onNewPlayer={handleNewPlayer}
      />
    );
  }

  return null;
}
