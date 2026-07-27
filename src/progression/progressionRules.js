// src/progression/progressionRules.js
// Heuristics/constants used by the progression engine

const DEFAULT_LOOKBACK = 3; // number of sessions to inspect

// Minimum number of sessions with exercise data before making an aggressive change
const MIN_SESSIONS_FOR_CHANGE = 2;

// Default percent weight increase for strength-focused progressions
const DEFAULT_WEIGHT_INCREASE_PERCENT = 2.5; // percent

// Default absolute rep increase
const DEFAULT_REP_INCREASE = 1;

// Difficulty mapping for string difficulties
const DIFFICULTY_MAP = {
  easy: 3,
  moderate: 5,
  normal: 5,
  hard: 8,
  very_hard: 9,
};

// Exercise category influence (how conservative/aggressive to be)
const CATEGORY_AGGRESSIVENESS = {
  strength: 1.0, // follow default
  bodybuilding: 0.9, // slightly more conservative
  bodyweight: 0.8, // often limited by user's bodyweight
  other: 0.9,
};

module.exports = {
  DEFAULT_LOOKBACK,
  MIN_SESSIONS_FOR_CHANGE,
  DEFAULT_WEIGHT_INCREASE_PERCENT,
  DEFAULT_REP_INCREASE,
  DIFFICULTY_MAP,
  CATEGORY_AGGRESSIVENESS,
};
