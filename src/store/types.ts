export interface Game {
  id: string;
  name: string;
  maxScore: number;
  scoreRange: { min: number; max: number };
}

export interface Player {
  id: string;
  name: string;
}

export interface CellScore {
  value: number;
  isSpecial: boolean;
  expression?: string;
}

export interface Session {
  id: string;
  gameId: string;
  startedAt: string;
  playerIds: string[];
  roundCount: number;
  scores: (CellScore | null)[][];
}

export interface AppData {
  games: Game[];
  players: Player[];
  sessions: Session[];
}
