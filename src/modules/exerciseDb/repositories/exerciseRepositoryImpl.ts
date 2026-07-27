import type { Exercise } from '../../core/models';
import type { ExerciseRepository } from '../../core/ports';
import type { KeyValueStorage } from '../../core/storage/inMemoryStorage';

const EX_KEY = 'exercise:all';

export class ExerciseRepositoryImpl implements ExerciseRepository {
  constructor(private storage: KeyValueStorage) {}

  async getExerciseById(id: string) {
    const all = (await this.storage.get<Exercise[]>(EX_KEY)) || [];
    return all.find(e => e.id === id) || null;
  }

  async searchByMuscle(m: string) {
    const all = (await this.storage.get<Exercise[]>(EX_KEY)) || [];
    return all.filter(e => e.primaryMuscles.includes(m as any) || (e.secondaryMuscles || []).includes(m as any));
  }

  async addExercise(e: Exercise) {
    const all = (await this.storage.get<Exercise[]>(EX_KEY)) || [];
    await this.storage.set(EX_KEY, [...all, e]);
  }
}
