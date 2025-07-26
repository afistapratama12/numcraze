export interface GameLevel {
  level: number;
  timeLimit: number;
  minNumber: number;
  maxNumber: number;
}

export const getGameLevel = (level: number): GameLevel => {
  if (level <= 10) {
    return {
      level,
      timeLimit: 120,
      minNumber: 20,
      maxNumber: 49
    };
  } else if (level <= 15) {
    return {
      level,
      timeLimit: 110,
      minNumber: 50,
      maxNumber: 99
    }
  }
  else if (level <= 20) {
    return {
      level,
      timeLimit: 100,
      minNumber: 100,
      maxNumber: 249
    };
  } 
  else if (level <= 25) {
    return {
      level,
      timeLimit: 90,
      minNumber: 250,
      maxNumber: 499
    };
  }else if (level <= 30) {
    return {
      level,
      timeLimit: 85,
      minNumber: 500,
      maxNumber: 1000
    };
  } else if (level <= 50) {
    return {
      level,
      timeLimit: 80,
      minNumber: 1000,
      maxNumber: 2500
    };
  } else if (level <= 100) {
    return {
      level,
      timeLimit: 75,
      minNumber: 2500,
      maxNumber: 5000
    };
  } else if (level <= 200) {
    return {
      level,
      timeLimit: 70,
      minNumber: 5000,
      maxNumber: 10000
    };
  } else if (level <= 500) {
    return {
      level,
      timeLimit: 65,
      minNumber: 10000,
      maxNumber: 50000
    };
  } else {
    return {
      level,
      timeLimit: 60,
      minNumber: 50000,
      maxNumber: 100000
    };
  }
};

export const getGameLevelHard = (level: number): GameLevel => {
  if (level <= 10) {
    return {
      level,
      timeLimit: 60,
      minNumber: 20,
      maxNumber: 99
    };
  }
  else if (level <= 20) {
    return {
      level,
      timeLimit: 55,
      minNumber: 100,
      maxNumber: 499
    };
  } else if (level <= 30) {
    return {
      level,
      timeLimit: 50,
      minNumber: 500,
      maxNumber: 1000
    };
  } else if (level <= 50) {
    return {
      level,
      timeLimit: 50,
      minNumber: 1000,
      maxNumber: 2500
    };
  } else if (level <= 100) {
    return {
      level,
      timeLimit: 45,
      minNumber: 2500,
      maxNumber: 5000
    };
  } else if (level <= 200) {
    return {
      level,
      timeLimit: 45,
      minNumber: 5000,
      maxNumber: 10000
    };
  } else if (level <= 500) {
    return {
      level,
      timeLimit: 40,
      minNumber: 10000,
      maxNumber: 50000
    };
  } else {
    return {
      level,
      timeLimit: 40,
      minNumber: 50000,
      maxNumber: 100000
    };
  }
};

export const getGameLevelByDifficulty = (level: number, difficulty: Difficulty): GameLevel => {
  return difficulty === 'hard' ? getGameLevelHard(level) : getGameLevel(level);
};

export const generateTargetNumber = (level: number, difficulty: Difficulty = 'normal'): number => {
  const gameLevel = difficulty === 'hard' ? getGameLevelHard(level) : getGameLevel(level);
  return Math.floor(Math.random() * (gameLevel.maxNumber - gameLevel.minNumber + 1)) + gameLevel.minNumber;
};

export type Difficulty = 'normal' | 'hard';

export interface PlayerData {
  username: string;
  currentLevel: number;
  isFirstTime: boolean;
  difficulty: Difficulty;
}

export const savePlayerData = (player: PlayerData): void => {
  localStorage.setItem('runblock_player', JSON.stringify(player));
};

export const loadPlayerData = (): PlayerData | null => {
  const saved = localStorage.getItem('runblock_player');
  return saved ? JSON.parse(saved) : null;
};

export const clearPlayerData = (): void => {
  localStorage.removeItem('runblock_player');
};
