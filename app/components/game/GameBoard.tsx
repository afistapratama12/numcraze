'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Button } from "@/components/ui/8bit/button";
import { getGameLevel } from "../../utils/gameLogic";
import "@/components/ui/8bit/styles/retro.css";

// Animation variants for framer-motion
const shakeVariants = {
  shake: {
    x: [-8, 8, -8, 8, -8, 8, 0],
    transition: { duration: 0.6 }
  },
  normal: { x: 0 }
};

const successVariants = {
  success: {
    scale: [1, 1.05, 1.1, 1.05, 1],
    backgroundColor: [
      "transparent", 
      "rgba(34, 197, 94, 0.1)", 
      "rgba(34, 197, 94, 0.2)", 
      "rgba(34, 197, 94, 0.1)", 
      "transparent"
    ],
    transition: { duration: 1 }
  },
  normal: { scale: 1, backgroundColor: "transparent" }
};

const buttonClickVariants = {
  click: {
    scale: [1, 0.95, 1],
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.1,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.2 }
  },
  normal: { scale: 1, boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }
};

// const typingVariants = {
//   typing: {
//     opacity: [1, 0.3, 1],
//     transition: { duration: 0.5, repeat: Infinity }
//   }
// };

const pulseRedVariants = {
  pulse: {
    backgroundColor: ["rgb(239, 68, 68)", "rgb(220, 38, 38)", "rgb(239, 68, 68)"],
    transition: { duration: 1, repeat: Infinity }
  }
};

interface GameBoardProps {
  targetNumber: number;
  timeLeft: number;
  onGameComplete: (success: boolean, level: number) => void;
  level: number;
  isGameReady: boolean;
}

export default function GameBoard({ targetNumber, timeLeft, onGameComplete, level, isGameReady }: GameBoardProps) {
  const [expression, setExpression] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [numberButtons, setNumberButtons] = useState<number[]>([]);
  const [operators] = useState<string[]>(['x', ':', '+', '-']);
  const [displayExpression, setDisplayExpression] = useState<string>('');
  const [realTimeResult, setRealTimeResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [lastSubmitWrong, setLastSubmitWrong] = useState<boolean>(false); // @typescript-eslint/no-unused-vars
  const [buttonClickEffect, setButtonClickEffect] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(0);
  const [showEncouragement, setShowEncouragement] = useState<string>('');

  // Audio feedback functions
  const playSound = (type: 'click' | 'success' | 'error' | 'warning') => {
    if (typeof window !== 'undefined') { // @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'click':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          break;
        case 'success':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          break;
        case 'warning':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          break;
      }
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + (type === 'success' ? 0.3 : 0.2));
    }
  };

  // Encouragement messages
  const getEncouragementMessage = (combo: number) => {
    if (combo >= 10) return "🔥 ON FIRE! 🔥";
    if (combo >= 7) return "⚡ UNSTOPPABLE! ⚡";
    if (combo >= 5) return "🌟 AMAZING! 🌟";
    if (combo >= 3) return "💪 GREAT! 💪";
    return "";
  };

  // Function to calculate real-time result with left-to-right evaluation
  const calculateRealTime = (expr: string) => {
    try {
      // Only calculate if expression is complete (ends with a number)
      if (expr && !isNaN(Number(expr.slice(-1)))) {
        return evaluateLeftToRight(expr);
      }
    } catch (error) {
      // Silent fail for incomplete expressions
    }
    return null;
  };

  // Evaluate expression from left to right
  const evaluateLeftToRight = (expr: string) => {
    // Split expression into tokens (numbers and operators)
    const tokens = expr.match(/\d+|[+\-*/]/g);
    if (!tokens || tokens.length < 3) return null;

    let result = parseFloat(tokens[0]);
    
    // Process each operator and number pair from left to right
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i];
      const nextNumber = parseFloat(tokens[i + 1]);
      
      // Break if we don't have a valid number
      if (isNaN(nextNumber)) break;
      
      switch (operator) {
        case '+':
          result = result + nextNumber;
          break;
        case '-':
          result = result - nextNumber;
          break;
        case '*':
          result = result * nextNumber;
          break;
        case '/':
          if (nextNumber === 0) return null; // Prevent division by zero
          result = result / nextNumber;
          break;
        default:
          return null;
      }
    }
    
    return isFinite(result) ? result : null;
  };

  useEffect(() => {
    // Generate 5 random numbers (1-9)
    const numbers: number[] = [];
    for (let i = 0; i < 5; i++) {
      let rand = Math.floor(Math.random() * 9) + 1;

      while (numbers.includes(rand)) {
        rand = Math.floor(Math.random() * 9) + 1;
      }
      numbers.push(rand);
    }
    setNumberButtons(numbers);
  }, [targetNumber]);

  useEffect(() => {
    // Only trigger game over if game is ready and timer reached 0
    if (isGameReady && timeLeft <= 0 &&  targetNumber > 0) {
      onGameComplete(false, level);
    }
  }, [timeLeft, onGameComplete, level, targetNumber, isGameReady]);

  // Timer warning system
  useEffect(() => {
    if (timeLeft === 30 || timeLeft === 15 || timeLeft === 10 || timeLeft === 5) {
      playSound('warning');
    }
  }, [timeLeft]);

  const handleNumberClick = (number: number) => {
    // Enhanced audio feedback
    playSound('click');
    
    // Button click effect
    setButtonClickEffect(`number-${number}`);
    setTimeout(() => setButtonClickEffect(''), 200);
    
    // Check if last character is an operator or if expression is empty
    const lastChar = displayExpression.slice(-1);
    const isLastCharOperator = ['+', '-', 'x', ':'].includes(lastChar);
    const isEmpty = displayExpression === '';
    
    let newDisplay: string;
    let newExpression: string;
    
    if (isEmpty || isLastCharOperator) {
      // If empty or last char is operator, just add the number
      newDisplay = displayExpression + number.toString();
      newExpression = expression + number.toString();
    } else {
      // If last char is a number, replace it with the new number (single digit only)
      newDisplay = displayExpression.slice(0, -1) + number.toString();
      newExpression = expression.slice(0, -1) + number.toString();
    }
    
    setDisplayExpression(newDisplay);
    setExpression(newExpression);
    
    // Show calculating state briefly
    setIsCalculating(true);
    setTimeout(() => {
      const realtimeResult = calculateRealTime(newExpression);
      setRealTimeResult(realtimeResult);
      setIsCalculating(false);
      
      // Auto advance to next level if result matches target
      if (realtimeResult !== null && Math.abs(realtimeResult - targetNumber) < 0.001) {
        playSound('success');
        setCombo(prev => prev + 1);
        const encouragement = getEncouragementMessage(combo + 1);
        if (encouragement) {
          setShowEncouragement(encouragement);
          setTimeout(() => setShowEncouragement(''), 2000);
        }
        setIsSuccess(true);
        setLastSubmitWrong(false);
        setTimeout(() => {
          onGameComplete(true, level);
        }, 1000); // Delay to show success animation
      }
    }, 300);
    
    // Clear any previous wrong submission state
    setLastSubmitWrong(false);
    setIsShaking(false);
    setIsSuccess(false);
  };

  const handleOperatorClick = (operator: string) => {
    if (displayExpression && !isNaN(Number(displayExpression.slice(-1)))) {
      // Enhanced audio feedback
      playSound('click');
      
      // Button click effect
      setButtonClickEffect(`operator-${operator}`);
      setTimeout(() => setButtonClickEffect(''), 200);
      
      // Convert display operator to actual operator for calculation
      let actualOperator = operator;
      if (operator === 'x') actualOperator = '*';
      if (operator === ':') actualOperator = '/';
      
      setDisplayExpression(prev => prev + operator);
      setExpression(prev => prev + actualOperator);
      // Clear real-time result when adding operator (incomplete expression)
      setRealTimeResult(null);
      setLastSubmitWrong(false);
      setIsShaking(false);
      setIsSuccess(false);
      
      // Check if current expression before operator already matches target
      const currentResult = calculateRealTime(expression);
      if (currentResult !== null && Math.abs(currentResult - targetNumber) < 0.001) {
        playSound('success');
        setCombo(prev => prev + 1);
        const encouragement = getEncouragementMessage(combo + 1);
        if (encouragement) {
          setShowEncouragement(encouragement);
          setTimeout(() => setShowEncouragement(''), 2000);
        }
        setIsSuccess(true);
        setLastSubmitWrong(false);
        setTimeout(() => {
          onGameComplete(true, level);
        }, 1000); // Delay to show success animation
      }
    } else {
      // Provide feedback when operator can't be used
      playSound('error');
    }
  };

  const handleClear = () => {
    playSound('click');
    setExpression('');
    setDisplayExpression('');
    setCurrentResult(null);
    setRealTimeResult(null);
    setLastSubmitWrong(false);
    setIsCalculating(false);
    setIsShaking(false);
    setIsSuccess(false);
  };

  const handleSubmit = () => {
    if (!expression || !displayExpression) return;
    
    // Use real-time result if available, otherwise calculate with left-to-right evaluation
    let result = realTimeResult;
    
    if (result === null) {
      try {
        result = evaluateLeftToRight(expression);
        
        if (result === null) {
          console.error('Invalid expression');
          playSound('error');
          setCombo(0); // Reset combo on error
          setIsShaking(true);
          setLastSubmitWrong(true);
          setTimeout(() => setIsShaking(false), 600);
          return;
        }
      } catch (error) {
        console.error('Invalid expression:', error);
        playSound('error');
        setCombo(0); // Reset combo on error
        setCurrentResult(null);
        setIsShaking(true);
        setLastSubmitWrong(true);
        setTimeout(() => setIsShaking(false), 600);
        return;
      }
    }
    
    setCurrentResult(result);
    setRealTimeResult(null); // Clear real-time result when showing final result
    
    // Check if result matches target (with small tolerance for floating point)
    if (result !== null && Math.abs(result - targetNumber) < 0.001) {
      playSound('success');
      setCombo(prev => prev + 1);
      const encouragement = getEncouragementMessage(combo + 1);
      if (encouragement) {
        setShowEncouragement(encouragement);
        setTimeout(() => setShowEncouragement(''), 2000);
      }
      setIsSuccess(true);
      setLastSubmitWrong(false);
      setTimeout(() => {
        onGameComplete(true, level);
      }, 1000); // Delay to show success animation
    } else {
      playSound('error');
      setCombo(0); // Reset combo on wrong answer
      setIsShaking(true);
      setLastSubmitWrong(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="retro text-xl text-center">Run Block</h2>
      
      {/* Give Up Button */}
      <div className="flex justify-center">
        <Button onClick={() => onGameComplete(false, level)} variant="outline" size="sm">
          Give Up
        </Button>
      </div>
      
      {/* Game Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="retro text-sm">Level: {level}</div>
          <div className={`retro text-sm ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : ''}`}>
            Time: {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* Combo & Encouragement Display */}
        <AnimatePresence>
          {combo > 2 && (
            <motion.div 
              className="text-center retro text-xs text-yellow-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              Combo: {combo}x
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showEncouragement && (
            <motion.div 
              className="text-center retro text-sm font-bold text-green-600"
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {showEncouragement}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Time bar */}
        <div className="w-full bg-gray-300 h-2 rounded">
          <motion.div 
            className={`h-2 rounded transition-all duration-1000 ${
              timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ 
              width: `${(timeLeft / (getGameLevel(level).timeLimit)) * 100}%` 
            }}
            variants={pulseRedVariants}
            animate={timeLeft <= 10 ? "pulse" : "normal"}
          />
        </div>
      </div>

      {/* Target Number */}
      <motion.div
        variants={isShaking ? shakeVariants : successVariants}
        animate={isShaking ? "shake" : isSuccess ? "success" : "normal"}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">{targetNumber}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 w-full">
            <motion.div 
              className={`retro text-center text-base min-h-[2rem] break-all transition-all duration-300 ${
                displayExpression ? 'opacity-100' : 'opacity-50'
              }`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: displayExpression ? 1 : 0.5 }}
            >
              {displayExpression || 'Enter calculation...'}
            </motion.div>
            
            {/* Real-time result with typing animation */}
            {/* <AnimatePresence>
              {isCalculating && (
                <motion.div 
                  className="retro text-center text-sm mt-2 text-blue-600"
                  variants={typingVariants}
                  animate="typing"
                  initial={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                >
                  Calculating...
                </motion.div>
              )}
            </AnimatePresence> */}
            
            <AnimatePresence>
              {realTimeResult !== null && currentResult === null && !isCalculating && (
                <motion.div 
                  className="retro text-center text-sm mt-2 text-blue-600"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  = {realTimeResult}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Final result after submit */}
            <AnimatePresence>
              {currentResult !== null && (
                <motion.div 
                  className={`retro text-center text-sm mt-2 ${
                    Math.abs(currentResult - targetNumber) < 0.001 ? 'text-green-600' : 'text-red-600'
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.1 }}
                >
                  = {currentResult} {Math.abs(currentResult - targetNumber) < 0.001 ? '✅ Correct!' : '❌ Try again'}
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {displayExpression && (
                <motion.div 
                  className="retro text-center text-xs mt-2 opacity-70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                >
                  Continue calculating numbers...
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Number Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Calculate</CardTitle>
        </CardHeader>
        <CardContent className="p-2 flex flex-col align-center gap-6">
            <div className="flex justify-between gap-2">
              {numberButtons.map((number, index) => (
                <motion.div
                  key={index}
                  variants={buttonClickVariants}
                  animate={buttonClickEffect === `number-${number}` ? "click" : "normal"}
                  whileHover="hover"
                >
                  <Button
                    onClick={() => handleNumberClick(number)}
                    className="aspect-square w-full"
                    variant="outline"
                  >
                    {number}
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-around gap-2">
              {operators.map((operator) => (
                <motion.div
                  key={operator}
                  variants={buttonClickVariants}
                  animate={buttonClickEffect === `operator-${operator}` ? "click" : "normal"}
                  whileHover="hover"
                >
                  <Button
                    onClick={() => handleOperatorClick(operator)}
                    variant="default"
                    className={`aspect-square ${
                      displayExpression && isNaN(Number(displayExpression.slice(-1))) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                    disabled={!displayExpression || isNaN(Number(displayExpression.slice(-1)))}
                  >
                    {operator}
                  </Button>
                </motion.div>
              ))}
            </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-around gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleClear} 
            variant="destructive" 
            size="default"
            className="w-full"
          >
            Clear
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: !displayExpression ? 1 : 1.05 }}
          whileTap={{ scale: !displayExpression ? 1 : 0.95 }}
        >
          <Button 
            onClick={handleSubmit} 
            disabled={!displayExpression} 
            size="default"
            className={`w-full ${
              !displayExpression ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Submit
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
