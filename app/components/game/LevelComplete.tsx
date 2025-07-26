'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import "@/components/ui/8bit/styles/retro.css";

interface LevelCompleteProps {
  level: number;
  onContinue: () => void;
}

export default function LevelComplete({ level, onContinue }: LevelCompleteProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 500); // Fast 500ms transition

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="space-y-4">
      <h2 className="retro text-xl text-center">Num Craze</h2>
      
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="text-center text-green-600">🎉 Level Complete! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="retro text-lg mb-4">
            Level {level} Completed!
          </div>
          <div className="retro text-sm">
            Preparing Level {level + 1}...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
