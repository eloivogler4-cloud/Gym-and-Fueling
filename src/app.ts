// Entry point wiring a couple of modules with in-memory repos
import { InMemoryStorage } from './core/storage/inMemoryStorage';
import { UserRepositoryImpl } from './modules/user/repositories/userRepositoryImpl';
import { UserService } from './modules/user/userService';

async function main() {
  const storage = new InMemoryStorage();

  // Wire a user module instance
  const userRepo = new UserRepositoryImpl(storage);
  const userService = new UserService(userRepo);

  // Example: create a user and read profile
  const newUser = await userService.createUser({
    id: 'user_1',
    displayName: 'Demo User',
    email: 'demo@example.com'
  });

  console.log('Created user:', newUser);
  const loaded = await userService.getUser('user_1');
  console.log('Loaded user:', loaded);
}

main().catch(err => console.error(err));
