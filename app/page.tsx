'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Label } from "@/components/ui/8bit/label";
import { Input } from "@/components/ui/8bit/input";
import { Button } from "@/components/ui/8bit/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import GameContainer from "./components/game/GameContainer";
import { PlayerData, loadPlayerData, savePlayerData, clearPlayerData, Difficulty } from "./utils/gameLogic";
import "@/components/ui/8bit/styles/retro.css";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  // const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  useEffect(() => {
    // Check if there's existing player data
    const saved = loadPlayerData();
    if (saved) {
      // Handle backward compatibility for existing saves without difficulty
      const playerWithDifficulty = {
        ...saved,
        difficulty: saved.difficulty || 'normal' as Difficulty
      };
      setPlayerData(playerWithDifficulty);
      setUsername(playerWithDifficulty.username);
      setSelectedDifficulty(playerWithDifficulty.difficulty);
    }
  }, []);

  const handleStart = () => {
    if (!username.trim()) {
      alert('Please enter both name and username');
      return;
    }

    const newPlayerData: PlayerData = {
      username: username.trim(),
      currentLevel: 1,
      isFirstTime: !playerData || playerData.username !== username.trim(),
      difficulty: selectedDifficulty
    };

    setPlayerData(newPlayerData);
    savePlayerData(newPlayerData);
    setGameStarted(true);
  };

  const handleGameEnd = () => {
    setGameStarted(false);
    // Don't clear player data, just return to menu
  };

  const handleClearData = () => {
    clearPlayerData();
    setPlayerData(null);
    setUsername('');
  };

  if (gameStarted && playerData) {
    return (
      <div className="min-h-screen bg-black">
        <div className="w-full max-w-md mx-auto min-h-screen bg-gray-200">
          <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-6 pb-20 gap-8">
            <main className="flex flex-col gap-6 row-start-2 items-center w-full">
              <GameContainer playerData={playerData} onGameEnd={handleGameEnd} />
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full max-w-md mx-auto min-h-screen bg-gray-200">
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-6 pb-20 gap-8">
          <main className="flex flex-col gap-6 row-start-2 items-center w-full">
            <h2 className="retro text-xl">Run Block</h2>
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Before starting game you need to create an account and select difficulty.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="username">Name / Username</Label>
                  <Input 
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@pedro" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Select Difficulty</Label>
                  <Tabs value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as Difficulty)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="normal">Normal</TabsTrigger>
                      <TabsTrigger value="hard">Hard</TabsTrigger>
                    </TabsList>
                    <TabsContent value="normal" className="mt-2">
                      <Card>
                        <CardContent className="p-3">
                          <div className="retro text-sm font-medium mb-1">Normal Mode</div>
                          <div className="retro text-xs opacity-70">
                            • More time per level<br/>
                            • Lower number ranges<br/>
                            • Great for beginners
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="hard" className="mt-2">
                      <Card>
                        <CardContent className="p-3">
                          <div className="retro text-sm font-medium mb-1">Hard Mode</div>
                          <div className="retro text-xs opacity-70">
                            • Less time per level<br/>
                            • Higher number ranges<br/>
                            • For experienced players
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-center">
                <Button onClick={handleStart}>Start Game</Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
