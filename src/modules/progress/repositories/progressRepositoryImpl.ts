import type { ProgressRepository } from '../../core/ports';
import type { KeyValueStorage } from '../../core/storage/inMemoryStorage';
import type { WeightEntry, StrengthProgressEntry } from '../../core/models';

const WEIGHTS_KEY = 'progress:weights';
const STRENGTH_KEY = 'progress:strength';

export class ProgressRepositoryImpl implements ProgressRepository {
  constructor(private storage: KeyValueStorage) {}

  async addWeight(entry: WeightEntry): Promise<void> {
    const existing = (await this.storage.get<WeightEntry[]>(WEIGHTS_KEY)) || [];
    await this.storage.set(WEIGHTS_KEY, [...existing, entry]);
  }

  async getWeights(userId: string): Promise<WeightEntry[]> {
    const existing = (await this.storage.get<WeightEntry[]>(WEIGHTS_KEY)) || [];
    return existing.filter(e => e.userId === userId);
  }

  async addStrength(entry: StrengthProgressEntry): Promise<void> {
    const existing = (await this.storage.get<StrengthProgressEntry[]>(STRENGTH_KEY)) || [];
    await this.storage.set(STRENGTH_KEY, [...existing, entry]);
  }

  async getStrengthProgress(userId: string, exerciseId?: string) {
    const existing = (await this.storage.get<StrengthProgressEntry[]>(STRENGTH_KEY)) || [];
    return existing.filter(e => e.userId === userId && (exerciseId ? e.exerciseId === exerciseId : true));
  }
}
