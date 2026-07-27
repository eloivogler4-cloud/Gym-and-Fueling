import type { ID, UserProfile, AIPreferences } from '../../core/models';
import type { UserRepository } from '../../core/ports';
import type { KeyValueStorage } from '../../core/storage/inMemoryStorage';

const USER_PREFIX = 'user:';

export class UserRepositoryImpl implements UserRepository {
  constructor(private storage: KeyValueStorage) {}

  async create(profile: Partial<UserProfile> & { id: ID }): Promise<UserProfile> {
    const p: UserProfile = { id: profile.id, displayName: profile.displayName || 'Unnamed', email: profile.email };
    await this.storage.set(USER_PREFIX + p.id, p);
    return p;
  }

  async getById(id: ID): Promise<UserProfile | null> {
    return this.storage.get<UserProfile>(USER_PREFIX + id);
  }

  async updatePersonalInfo(userId: ID, info: Partial<any>): Promise<void> {
    const existing = await this.getById(userId);
    if (!existing) throw new Error('User not found');
    const merged = { ...existing, ...info };
    await this.storage.set(USER_PREFIX + userId, merged);
  }

  async setFitnessGoals(userId: ID, goals: any[]): Promise<void> {
    const existing = await this.getById(userId);
    if (!existing) throw new Error('User not found');
    // store goals under a separate key
    await this.storage.set(`${USER_PREFIX}${userId}:goals`, goals);
  }

  async getAIPreferences(userId: ID): Promise<AIPreferences | null> {
    return this.storage.get<AIPreferences>(`${USER_PREFIX}${userId}:ai`);
  }
}
