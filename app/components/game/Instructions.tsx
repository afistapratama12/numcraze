'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import "@/components/ui/8bit/styles/retro.css";

interface InstructionsProps {
  onStartGame: () => void;
}

export default function Instructions({ onStartGame }: InstructionsProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const instructions = [
    {
      title: "Welcome to Run Block!",
      content: "A math puzzle game where you need to reach the target number using the given numbers and operations."
    },
    {
      title: "How to Play",
      content: "You'll see a target number at the top. Use the number buttons and operation buttons (+, -, x, :) to create a calculation that equals the target."
    },
    {
      title: "Example",
      content: "Target: 47\nNumbers: 6, 4, 7\nSolution: 6 + 4 x 4 + 7\nCalculation: 6 + 4 = 10, then 10 x 4 = 40, then 40 + 7 = 47\n(Calculated from left to right!)"
    },
    {
      title: "Calculation Rule",
      content: "Important: Operations are calculated from LEFT to RIGHT!\nExample: 2 + 3 x 4 = 20 (not 14)\nBecause: 2 + 3 = 5, then 5 x 4 = 20"
    },
    {
      title: "Time Limit",
      content: "Each level has a time limit. Level 1-10: 45 seconds, Level 11-20: 40 seconds, and so on."
    },
    {
      title: "Difficulty",
      content: "As you progress, target numbers get larger and time gets shorter. Can you reach level 999?"
    },
    {
      title: "Ready?",
      content: "Good luck! Click Start Game to begin your journey."
    }
  ];

  const nextSlide = () => {
    if (currentSlide < instructions.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="retro text-xl text-center">Run Block</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{instructions[currentSlide].title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="retro text-sm whitespace-pre-line text-center min-h-[120px] flex items-center justify-center">
            {instructions[currentSlide].content}
          </div>
        </CardContent>
      </Card>

      {/* Slide indicators */}
      <div className="flex justify-center space-x-2">
        {instructions.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentSlide ? 'bg-foreground' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button 
          onClick={prevSlide} 
          disabled={currentSlide === 0}
          variant="outline"
        >
          Previous
        </Button>
        
        {currentSlide === instructions.length - 1 ? (
          <Button onClick={onStartGame}>
            Start Game
          </Button>
        ) : (
          <Button onClick={nextSlide}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
