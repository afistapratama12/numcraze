'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import "@/components/ui/8bit/styles/retro.css";

interface LeaderboardEntry {
  username: string;
  level: number;
  timestamp: number;
}

interface LeaderboardProps {
  playerUsername: string;
  playerLevel: number;
  gameSessionId: string;
  onPlayAgain: () => void;
  onNewPlayer: () => void;
}

export default function Leaderboard({ 
  playerUsername, 
  playerLevel, 
  gameSessionId,
  onPlayAgain, 
  onNewPlayer 
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasAddedScore, setHasAddedScore] = useState(false);

  useEffect(() => {
    // Load leaderboard from localStorage
    const savedLeaderboard = localStorage.getItem('runblock_leaderboard');
    let currentLeaderboard: LeaderboardEntry[] = savedLeaderboard ? JSON.parse(savedLeaderboard) : [];

    // Only add score if it hasn't been added yet for this game session
    const sessionKey = `runblock_session_${gameSessionId}`;
    const hasSessionScore = localStorage.getItem(sessionKey);

    if (!hasAddedScore && !hasSessionScore) {
      // Add current player's score
      const newEntry: LeaderboardEntry = {
        username: playerUsername,
        level: playerLevel,
        timestamp: Date.now()
      };

      currentLeaderboard.push(newEntry);
      
      // Sort by level (descending) and keep top 15
      currentLeaderboard.sort((a, b) => b.level - a.level);
      currentLeaderboard = currentLeaderboard.slice(0, 15);

      // Save back to localStorage
      localStorage.setItem('runblock_leaderboard', JSON.stringify(currentLeaderboard));
      localStorage.setItem(sessionKey, 'true');
      
      setHasAddedScore(true);
    }

    setLeaderboard(currentLeaderboard);
  }, [playerUsername, playerLevel, gameSessionId, hasAddedScore]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusMessage = () => {
    if (playerLevel === 999) {
      return "🎉 CONGRATULATIONS! YOU'VE MASTERED NUM CRAZE! 🎉";
    }
    return `Game Over! You reached level ${playerLevel}`;
  };

  const isCurrentPlayerEntry = (entry: LeaderboardEntry, index: number) => {
    // Check if this is the current player's most recent entry
    if (entry.username !== playerUsername || entry.level !== playerLevel) {
      return false;
    }
    
    // Find the most recent entry for this player with this level
    let latestIndex = -1;
    let latestTimestamp = 0;
    
    leaderboard.forEach((e, i) => {
      if (e.username === playerUsername && 
          e.level === playerLevel &&
          e.timestamp > latestTimestamp) {
        latestIndex = i;
        latestTimestamp = e.timestamp;
      }
    });
    
    return index === latestIndex;
  };

  const getRank = () => {
    // Find the most recent entry for this player with this level
    let playerRank = -1;
    let latestTimestamp = 0;
    
    leaderboard.forEach((entry, index) => {
      if (entry.username === playerUsername && 
          entry.level === playerLevel &&
          entry.timestamp > latestTimestamp) {
        playerRank = index;
        latestTimestamp = entry.timestamp;
      }
    });
    
    const rank = playerRank >= 0 ? playerRank + 1 : leaderboard.length + 1;
    
    // If rank is 15 or higher, show "14 >"
    return rank >= 15 ? "14 >" : rank;
  };

  return (
    <div className="space-y-4">
      <h2 className="retro text-xl text-center">Num Craze</h2>
      
      {/* Game Result */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{getStatusMessage()}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center">
          <div className="retro text-lg mb-2">
            {playerUsername.includes("@") ? playerUsername : `@${playerUsername}`}
          </div>
          <div className="retro text-sm">
            Rank: #{getRank()} | Level: {playerLevel}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">🏆 Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {leaderboard.map((entry, index) => (
              <div 
                key={`${entry.username}-${entry.timestamp}`}
                className={`flex justify-between items-center p-2 rounded ${
                  isCurrentPlayerEntry(entry, index)
                    ? 'bg-yellow-200 dark:bg-yellow-800' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="retro text-sm font-bold">
                    #{index === 14 && leaderboard.length === 15 ? '14 >' : index + 1}
                  </span>
                  <div>
                    <div className="retro text-sm">{entry.username.includes("@") ? entry.username : `@${entry.username}`}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="retro text-sm font-bold">Level {entry.level}</div>
                  <div className="retro text-xs opacity-70">{formatDate(entry.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={onPlayAgain}>
          Play Again
        </Button>
        <Button onClick={onNewPlayer} variant="outline">
          New Player
        </Button>
      </div>
    </div>
  );
}
