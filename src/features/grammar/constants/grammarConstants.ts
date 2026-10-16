import type { GameType } from '../types/grammarData';

export const GRAMMAR_GAME_TYPES: readonly GameType[] = [
  'puzzle',
  'error',
  'speed',
  'transformer',
  'context',
];

export const BASE_XP_BY_GAME_TYPE: Record<GameType, number> = {
  puzzle: 25,
  error: 25,
  speed: 15,
  transformer: 30,
  context: 25,
};
