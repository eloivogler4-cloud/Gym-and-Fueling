// src/storage/profileStorage.js
// Pluggable storage system for UserProfile instances.

const { UserProfile } = require("../models/userProfile");

// Default localStorage adapter for browser and a simple in-memory fallback for Node
class LocalStorageAdapter {
  constructor(key = "gym_profiles_v1") {
    this.key = key;
    this._isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    if (!this._isBrowser) {
      // in-memory fallback
      this._store = {};
    }
  }

  async _readRaw() {
    if (this._isBrowser) {
      const raw = window.localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : {};
    }
    return JSON.parse(JSON.stringify(this._store || {}));
  }

  async _writeRaw(obj) {
    if (this._isBrowser) {
      window.localStorage.setItem(this.key, JSON.stringify(obj));
      return;
    }
    this._store = JSON.parse(JSON.stringify(obj));
  }

  async list() {
    const raw = await this._readRaw();
    return Object.values(raw);
  }

  async get(id) {
    const raw = await this._readRaw();
    return raw[id] || null;
  }

  async save(profileJson) {
    const raw = await this._readRaw();
    raw[profileJson.id] = profileJson;
    await this._writeRaw(raw);
    return profileJson;
  }

  async delete(id) {
    const raw = await this._readRaw();
    delete raw[id];
    await this._writeRaw(raw);
    return true;
  }
}

class ProfileStorage {
  constructor(adapter = null) {
    this.adapter = adapter || new LocalStorageAdapter();
  }

  setAdapter(adapter) {
    this.adapter = adapter;
  }

  async createProfile(data) {
    const profile = new UserProfile(data);
    const validation = profile.validate();
    if (!validation.valid) {
      const err = new Error("Validation failed");
      err.validation = validation;
      throw err;
    }
    return this.adapter.save(profile.toJSON());
  }

  async getProfile(id) {
    const raw = await this.adapter.get(id);
    if (!raw) return null;
    return UserProfile.fromJSON(raw);
  }

  async updateProfile(id, fields) {
    const existingRaw = await this.adapter.get(id);
    if (!existingRaw) throw new Error("Profile not found");
    const profile = UserProfile.fromJSON(existingRaw);
    profile.update(fields);
    const validation = profile.validate();
    if (!validation.valid) {
      const err = new Error("Validation failed");
      err.validation = validation;
      throw err;
    }
    return this.adapter.save(profile.toJSON());
  }

  async deleteProfile(id) {
    return this.adapter.delete(id);
  }

  async listProfiles() {
    const raws = await this.adapter.list();
    return raws.map((r) => UserProfile.fromJSON(r));
  }
}

module.exports = {
  ProfileStorage,
  LocalStorageAdapter,
};
