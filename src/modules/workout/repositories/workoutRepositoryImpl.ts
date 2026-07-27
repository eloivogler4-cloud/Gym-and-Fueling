import type { WorkoutSession, WorkoutPlan } from '../../core/models';
import type { WorkoutRepository } from '../../core/ports';
import type { KeyValueStorage } from '../../core/storage/inMemoryStorage';

const SESSIONS_KEY = 'workout:sessions';
const PLANS_KEY = 'workout:plans';

export class WorkoutRepositoryImpl implements WorkoutRepository {
  constructor(private storage: KeyValueStorage) {}

  async saveSession(session: WorkoutSession): Promise<void> {
    const existing = (await this.storage.get<WorkoutSession[]>(SESSIONS_KEY)) || [];
    await this.storage.set(SESSIONS_KEY, [...existing, session]);
  }

  async getSessionsForUser(userId: string): Promise<WorkoutSession[]> {
    const existing = (await this.storage.get<WorkoutSession[]>(SESSIONS_KEY)) || [];
    return existing.filter(s => s.userId === userId);
  }

  async savePlan(plan: WorkoutPlan): Promise<void> {
    const existing = (await this.storage.get<WorkoutPlan[]>(PLANS_KEY)) || [];
    await this.storage.set(PLANS_KEY, [...existing, plan]);
  }

  async getPlansForUser(userId: string | null): Promise<WorkoutPlan[]> {
    const existing = (await this.storage.get<WorkoutPlan[]>(PLANS_KEY)) || [];
    return existing.filter(p => (userId ? p.userId === userId : p.userId == null));
  }
}
