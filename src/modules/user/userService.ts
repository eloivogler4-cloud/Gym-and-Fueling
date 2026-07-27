import type { ID, UserProfile } from '../../core/models';
import type { UserRepository } from '../../core/ports';

export class UserService {
  constructor(private repo: UserRepository) {}

  async createUser(payload: Partial<UserProfile> & { id: ID }): Promise<UserProfile> {
    return this.repo.create(payload);
  }

  async getUser(id: ID): Promise<UserProfile | null> {
    return this.repo.getById(id);
  }

  // small example of business logic separated from repo
  async setDisplayName(userId: ID, name: string): Promise<void> {
    const user = await this.repo.getById(userId);
    if (!user) throw new Error('Not found');
    await this.repo.create({ ...user, displayName: name });
  }
}
