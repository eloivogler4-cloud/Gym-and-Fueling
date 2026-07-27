// Ports: interfaces for repositories and services so implementations can be swapped
import type { ID, UserProfile, PersonalInfo, FitnessGoal, TrainingPreferences, AIPreferences, WorkoutSession, WorkoutPlan, WeightEntry, StrengthProgressEntry, Exercise } from './models';

export interface UserRepository {
  create(profile: Partial<UserProfile> & { id: ID }): Promise<UserProfile>;
  getById(id: ID): Promise<UserProfile | null>;
  updatePersonalInfo(userId: ID, info: Partial<PersonalInfo>): Promise<void>;
  setFitnessGoals(userId: ID, goals: FitnessGoal[]): Promise<void>;
  getAIPreferences(userId: ID): Promise<AIPreferences | null>;
}

export interface WorkoutRepository {
  saveSession(session: WorkoutSession): Promise<void>;
  getSessionsForUser(userId: ID, from?: string, to?: string): Promise<WorkoutSession[]>;
  savePlan(plan: WorkoutPlan): Promise<void>;
  getPlansForUser(userId: ID | null): Promise<WorkoutPlan[]>;
}

export interface ProgressRepository {
  addWeight(entry: WeightEntry): Promise<void>;
  getWeights(userId: ID): Promise<WeightEntry[]>;
  addStrength(entry: StrengthProgressEntry): Promise<void>;
  getStrengthProgress(userId: ID, exerciseId?: ID): Promise<StrengthProgressEntry[]>;
}

export interface ExerciseRepository {
  getExerciseById(id: ID): Promise<Exercise | null>;
  searchByMuscle(m: string): Promise<Exercise[]>;
  addExercise(e: Exercise): Promise<void>;
}
