// Very small storage abstraction to allow swapping persistence strategies

export interface KeyValueStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

// In-memory implementation for development and tests
export class InMemoryStorage implements KeyValueStorage {
  private store = new Map<string, string>();

  async get<T>(key: string): Promise<T | null> {
    const raw = this.store.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
