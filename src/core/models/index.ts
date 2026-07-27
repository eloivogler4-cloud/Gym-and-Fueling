// Domain models shared across modules

export type ID = string;

// User module
export interface UserProfile {
  id: ID;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

export interface PersonalInfo {
  dateOfBirth?: string; // ISO date
  heightCm?: number;
  weightKg?: number;
  sex?: 'male' | 'female' | 'other';
}

export interface FitnessGoal {
  id: ID;
  name: string; // e.g. 'Lose fat', 'Build muscle'
  targetWeightKg?: number;
  targetDate?: string; // ISO
  notes?: string;
}

export interface TrainingPreferences {
  preferredDaysPerWeek?: number;
  preferredWorkoutDurationMin?: number;
  preferredTrainingStyle?: 'strength' | 'hypertrophy' | 'endurance' | 'mix';
}

export interface AIPreferences {
  tone?: 'friendly' | 'motivational' | 'strict';
  provideProgressGraphs?: boolean;
}

// Workout module
export interface ExerciseSet {
  reps?: number;
  weightKg?: number;
  durationSec?: number; // for timed sets
  rpe?: number; // rate of perceived exertion
}

export interface ExerciseInstance {
  id: ID;
  exerciseId: ID; // reference to Exercise DB
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: ID;
  userId: ID;
  date: string; // ISO
  exercises: ExerciseInstance[];
  notes?: string;
}

export interface WorkoutPlan {
  id: ID;
  userId?: ID | null; // null = template
  name: string;
  description?: string;
  sessionsTemplate: Array<{day: number; exercises: Array<{exerciseId: ID; sets: ExerciseSet[]}>}>;
}

// Progress module
export interface WeightEntry {
  id: ID;
  userId: ID;
  date: string;
  weightKg: number;
}

export interface StrengthProgressEntry {
  id: ID;
  userId: ID;
  exerciseId: ID;
  date: string;
  bestLiftKg?: number;
  reps?: number;
}

// Exercise DB
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio'
  | 'full-body';

export interface Exercise {
  id: ID;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  instructions?: string;
  variations?: ID[]; // other exercise IDs
}
