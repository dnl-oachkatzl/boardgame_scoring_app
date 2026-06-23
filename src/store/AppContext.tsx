import React, { createContext, useContext, useEffect, useReducer } from 'react';

import { uid } from '@/utils/expression';

import { loadAppData, saveAppData } from './storage';
import type { AppData, CellScore, Game, Player, Session } from './types';

type State = AppData & {
  loaded: boolean;
  setupGameId: string | null;
  setupPlayerIds: string[];
  activeSessionId: string | null;
};

type Action =
  | { type: 'LOADED'; data: AppData }
  | { type: 'ADD_GAME'; game: Omit<Game, 'id'> }
  | { type: 'ADD_PLAYER'; player: Omit<Player, 'id'> }
  | { type: 'SELECT_GAME'; gameId: string }
  | { type: 'SET_SETUP_PLAYERS'; playerIds: string[] }
  | { type: 'START_SESSION' }
  | { type: 'SET_SCORE'; playerIndex: number; roundIndex: number; score: CellScore }
  | { type: 'ADD_ROUND' };

const initialState: State = {
  games: [],
  players: [],
  sessions: [],
  loaded: false,
  setupGameId: null,
  setupPlayerIds: [],
  activeSessionId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADED':
      return { ...state, ...action.data, loaded: true };

    case 'ADD_GAME': {
      const game: Game = { id: uid(), ...action.game };
      return { ...state, games: [...state.games, game] };
    }

    case 'ADD_PLAYER': {
      const player: Player = { id: uid(), ...action.player };
      return { ...state, players: [...state.players, player] };
    }

    case 'SELECT_GAME':
      return { ...state, setupGameId: action.gameId, setupPlayerIds: [] };

    case 'SET_SETUP_PLAYERS':
      return { ...state, setupPlayerIds: action.playerIds };

    case 'START_SESSION': {
      if (!state.setupGameId || state.setupPlayerIds.length === 0) return state;
      const session: Session = {
        id: uid(),
        gameId: state.setupGameId,
        startedAt: new Date().toISOString(),
        playerIds: state.setupPlayerIds,
        roundCount: 1,
        scores: state.setupPlayerIds.map(() => [null]),
      };
      return {
        ...state,
        sessions: [...state.sessions, session],
        activeSessionId: session.id,
      };
    }

    case 'SET_SCORE': {
      if (!state.activeSessionId) return state;
      const sessions = state.sessions.map(s => {
        if (s.id !== state.activeSessionId) return s;
        const scores = s.scores.map((row, pi) => {
          if (pi !== action.playerIndex) return row;
          const newRow = [...row];
          newRow[action.roundIndex] = action.score;
          return newRow;
        });
        return { ...s, scores };
      });
      return { ...state, sessions };
    }

    case 'ADD_ROUND': {
      if (!state.activeSessionId) return state;
      const sessions = state.sessions.map(s => {
        if (s.id !== state.activeSessionId) return s;
        return {
          ...s,
          roundCount: s.roundCount + 1,
          scores: s.scores.map(row => [...row, null]),
        };
      });
      return { ...state, sessions };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  activeSession: Session | undefined;
  activeGame: Game | undefined;
  activePlayers: Player[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadAppData().then(data => dispatch({ type: 'LOADED', data }));
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    saveAppData({ games: state.games, players: state.players, sessions: state.sessions });
  }, [state.games, state.players, state.sessions, state.loaded]);

  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);
  const activeGame = state.games.find(g => g.id === activeSession?.gameId);
  const activePlayers = activeSession
    ? activeSession.playerIds.map(id => state.players.find(p => p.id === id)!).filter(Boolean)
    : [];

  return (
    <AppContext.Provider value={{ state, dispatch, activeSession, activeGame, activePlayers }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
