/**
 * Storage System for Gym Tracker
 * Offline-first architecture with future cloud sync capability
 */

class StorageManager {
    constructor() {
        this.dbName = 'GymTrackerDB';
        this.version = 1;
        this.db = null;
        this.stores = {
            userProfile: 'userProfile',
            workouts: 'workouts',
            exercises: 'exercises',
            progressRecords: 'progressRecords',
            settings: 'settings',
            syncQueue: 'syncQueue',
            localStorage: 'localStorage'
        };
    }

    /**
     * Initialize IndexedDB with all necessary stores
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // User Profile Store
                if (!db.objectStoreNames.contains(this.stores.userProfile)) {
                    const userStore = db.createObjectStore(this.stores.userProfile, { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                }

                // Workouts Store
                if (!db.objectStoreNames.contains(this.stores.workouts)) {
                    const workoutStore = db.createObjectStore(this.stores.workouts, { keyPath: 'id' });
                    workoutStore.createIndex('date', 'date', { unique: false });
                    workoutStore.createIndex('type', 'type', { unique: false });
                    workoutStore.createIndex('userId', 'userId', { unique: false });
                    workoutStore.createIndex('synced', 'synced', { unique: false });
                }

                // Exercises Store
                if (!db.objectStoreNames.contains(this.stores.exercises)) {
                    const exerciseStore = db.createObjectStore(this.stores.exercises, { keyPath: 'id' });
                    exerciseStore.createIndex('workoutId', 'workoutId', { unique: false });
                    exerciseStore.createIndex('name', 'name', { unique: false });
                    exerciseStore.createIndex('synced', 'synced', { unique: false });
                }

                // Progress Records (for analytics)
                if (!db.objectStoreNames.contains(this.stores.progressRecords)) {
                    const progressStore = db.createObjectStore(this.stores.progressRecords, { keyPath: 'id' });
                    progressStore.createIndex('exerciseId', 'exerciseId', { unique: false });
                    progressStore.createIndex('date', 'date', { unique: false });
                    progressStore.createIndex('type', 'type', { unique: false }); // 'strength', 'weight', etc.
                    progressStore.createIndex('synced', 'synced', { unique: false });
                }

                // Settings Store
                if (!db.objectStoreNames.contains(this.stores.settings)) {
                    db.createObjectStore(this.stores.settings, { keyPath: 'key' });
                }

                // Sync Queue (for future cloud sync)
                if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
                    const syncStore = db.createObjectStore(this.stores.syncQueue, { keyPath: 'id' });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                    syncStore.createIndex('status', 'status', { unique: false }); // 'pending', 'synced', 'failed'
                    syncStore.createIndex('type', 'type', { unique: false }); // 'create', 'update', 'delete'
                }

                console.log('Database schema created');
            };
        });
    }

    /**
     * User Profile Operations
     */
    async saveUserProfile(profile) {
        const id = profile.id || this._generateId();
        const data = {
            id,
            ...profile,
            lastUpdated: new Date().toISOString(),
            synced: false
        };

        await this._addToSyncQueue('update', this.stores.userProfile, data);
        return this._dbOperation(this.stores.userProfile, 'put', data);
    }

    async getUserProfile() {
        return this._dbOperation(this.stores.userProfile, 'getAll');
    }

    /**
     * Workout Operations
     */
    async saveWorkout(workout) {
        const id = workout.id || this._generateId();
        const data = {
            id,
            userId: workout.userId || 'local',
            ...workout,
            createdAt: workout.createdAt || new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            synced: false
        };

        await this._addToSyncQueue('create', this.stores.workouts, data);
        return this._dbOperation(this.stores.workouts, 'put', data);
    }

    async updateWorkout(id, updates) {
        const workout = await this._dbOperation(this.stores.workouts, 'get', id);
        if (!workout) throw new Error('Workout not found');

        const updated = {
            ...workout,
            ...updates,
            lastUpdated: new Date().toISOString(),
            synced: false
        };

        await this._addToSyncQueue('update', this.stores.workouts, updated);
        return this._dbOperation(this.stores.workouts, 'put', updated);
    }

    async deleteWorkout(id) {
        await this._addToSyncQueue('delete', this.stores.workouts, { id });
        return this._dbOperation(this.stores.workouts, 'delete', id);
    }

    async getWorkouts(userId = 'local') {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.workouts], 'readonly');
            const store = transaction.objectStore(this.stores.workouts);
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                resolve(request.result.sort((a, b) => new Date(b.date) - new Date(a.date)));
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getWorkoutById(id) {
        return this._dbOperation(this.stores.workouts, 'get', id);
    }

    /**
     * Exercise Operations (sets and reps for a workout)
     */
    async saveExercise(exercise) {
        const id = exercise.id || this._generateId();
        const data = {
            id,
            ...exercise,
            createdAt: exercise.createdAt || new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            synced: false
        };

        await this._addToSyncQueue('create', this.stores.exercises, data);
        return this._dbOperation(this.stores.exercises, 'put', data);
    }

    async updateExercise(id, updates) {
        const exercise = await this._dbOperation(this.stores.exercises, 'get', id);
        if (!exercise) throw new Error('Exercise not found');

        const updated = {
            ...exercise,
            ...updates,
            lastUpdated: new Date().toISOString(),
            synced: false
        };

        await this._addToSyncQueue('update', this.stores.exercises, updated);
        return this._dbOperation(this.stores.exercises, 'put', updated);
    }

    async getExercisesByWorkout(workoutId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.exercises], 'readonly');
            const store = transaction.objectStore(this.stores.exercises);
            const index = store.index('workoutId');
            const request = index.getAll(workoutId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Progress Records (for analytics and trends)
     */
    async saveProgressRecord(record) {
        const id = record.id || this._generateId();
        const data = {
            id,
            type: record.type, // 'strength', 'weight', 'reps', 'endurance'
            ...record,
            timestamp: record.timestamp || new Date().toISOString(),
            synced: false
        };

        await this._addToSyncQueue('create', this.stores.progressRecords, data);
        return this._dbOperation(this.stores.progressRecords, 'put', data);
    }

    async getProgressRecords(exerciseId, type = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.progressRecords], 'readonly');
            const store = transaction.objectStore(this.stores.progressRecords);
            const index = store.index('exerciseId');
            const request = index.getAll(exerciseId);

            request.onsuccess = () => {
                let records = request.result;
                if (type) {
                    records = records.filter(r => r.type === type);
                }
                resolve(records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Settings Operations
     */
    async saveSetting(key, value) {
        const data = {
            key,
            value,
            lastUpdated: new Date().toISOString()
        };
        return this._dbOperation(this.stores.settings, 'put', data);
    }

    async getSetting(key) {
        const result = await this._dbOperation(this.stores.settings, 'get', key);
        return result ? result.value : null;
    }

    async getAllSettings() {
        return this._dbOperation(this.stores.settings, 'getAll');
    }

    /**
     * Sync Queue Operations (for future cloud sync)
     */
    async _addToSyncQueue(type, storeName, data) {
        const syncItem = {
            id: this._generateId(),
            type, // 'create', 'update', 'delete'
            storeName,
            data,
            timestamp: new Date().toISOString(),
            status: 'pending', // 'pending', 'synced', 'failed'
            retries: 0,
            lastError: null
        };

        return this._dbOperation(this.stores.syncQueue, 'put', syncItem);
    }

    async getPendingSyncItems() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.stores.syncQueue], 'readonly');
            const store = transaction.objectStore(this.stores.syncQueue);
            const index = store.index('status');
            const request = index.getAll('pending');

            request.onsuccess = () => {
                resolve(request.result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            };
            request.onerror = () => reject(request.error);
        });
    }

    async markSyncItemAsSync(id) {
        const item = await this._dbOperation(this.stores.syncQueue, 'get', id);
        if (item) {
            item.status = 'synced';
            item.syncedAt = new Date().toISOString();
            return this._dbOperation(this.stores.syncQueue, 'put', item);
        }
    }

    async markSyncItemAsFailed(id, error) {
        const item = await this._dbOperation(this.stores.syncQueue, 'get', id);
        if (item) {
            item.retries++;
            item.status = item.retries > 3 ? 'failed' : 'pending';
            item.lastError = error;
            return this._dbOperation(this.stores.syncQueue, 'put', item);
        }
    }

    /**
     * Data Export (for backup/debugging)
     */
    async exportAllData() {
        const data = {};
        for (const storeName of Object.values(this.stores)) {
            data[storeName] = await this._dbOperation(storeName, 'getAll');
        }
        return data;
    }

    /**
     * Data Import (for restore)
     */
    async importData(data) {
        for (const [storeName, records] of Object.entries(data)) {
            if (this.stores[storeName] || Object.values(this.stores).includes(storeName)) {
                for (const record of records) {
                    await this._dbOperation(storeName, 'put', record);
                }
            }
        }
    }

    /**
     * Clear all data (for testing/reset)
     */
    async clearAllData() {
        for (const storeName of Object.values(this.stores)) {
            await this._dbOperation(storeName, 'clear');
        }
    }

    /**
     * Backup to LocalStorage (emergency fallback)
     */
    async backupToLocalStorage() {
        const backup = await this.exportAllData();
        localStorage.setItem('gymTrackerBackup', JSON.stringify(backup));
        localStorage.setItem('backupTimestamp', new Date().toISOString());
        return backup;
    }

    /**
     * Restore from LocalStorage backup
     */
    async restoreFromLocalStorage() {
        const backup = localStorage.getItem('gymTrackerBackup');
        if (backup) {
            await this.importData(JSON.parse(backup));
            return JSON.parse(backup);
        }
        return null;
    }

    /**
     * Private helper methods
     */
    _dbOperation(storeName, method, data = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], method.includes('put', 'delete', 'clear') ? 'readwrite' : 'readonly');
            const store = transaction.objectStore(storeName);
            let request;

            switch (method) {
                case 'put':
                    request = store.put(data);
                    break;
                case 'get':
                    request = store.get(data);
                    break;
                case 'delete':
                    request = store.delete(data);
                    break;
                case 'getAll':
                    request = store.getAll();
                    break;
                case 'clear':
                    request = store.clear();
                    break;
                default:
                    reject(new Error(`Unknown method: ${method}`));
                    return;
            }

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    _generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Sync Manager - handles future cloud synchronization
 */
class SyncManager {
    constructor(storageManager, apiEndpoint = null) {
        this.storage = storageManager;
        this.apiEndpoint = apiEndpoint;
        this.isSyncing = false;
        this.syncListeners = [];
    }

    /**
     * Start automatic sync (when online)
     */
    startAutoSync(interval = 30000) {
        // Only sync if online
        if (navigator.onLine) {
            setInterval(() => this._syncPending(), interval);
        }

        // Listen for online/offline events
        window.addEventListener('online', () => this._syncPending());
        window.addEventListener('offline', () => {
            console.log('Going offline - sync paused');
        });
    }

    /**
     * Manual sync trigger
     */
    async sync() {
        if (!this.apiEndpoint) {
            console.warn('No API endpoint configured - sync disabled');
            return { success: false, message: 'Sync not configured' };
        }

        return this._syncPending();
    }

    /**
     * Private sync method
     */
    async _syncPending() {
        if (this.isSyncing || !navigator.onLine) return;

        this.isSyncing = true;
        const pendingItems = await this.storage.getPendingSyncItems();

        for (const item of pendingItems) {
            try {
                // Future: Send to cloud API
                // await this._sendToAPI(item);
                await this.storage.markSyncItemAsSync(item.id);
                this._notifyListeners({ type: 'synced', item });
            } catch (error) {
                await this.storage.markSyncItemAsFailed(item.id, error.message);
                this._notifyListeners({ type: 'syncFailed', item, error });
            }
        }

        this.isSyncing = false;
    }

    /**
     * Add sync listener for UI updates
     */
    onSync(callback) {
        this.syncListeners.push(callback);
    }

    _notifyListeners(event) {
        this.syncListeners.forEach(cb => cb(event));
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, SyncManager };
}