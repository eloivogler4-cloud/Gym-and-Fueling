// src/storage/exerciseInfoStorage.js
// Pluggable storage for ExerciseInfo objects with simple search helpers
const { ExerciseInfo } = require('../models/exerciseInfo');

class LocalStorageAdapter {
  constructor(key = 'gym_exercises_v1'){
    this.key = key;
    this._isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    if (!this._isBrowser) this._store = {};
  }

  async _readRaw(){
    if (this._isBrowser){
      const raw = window.localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : {};
    }
    return JSON.parse(JSON.stringify(this._store || {}));
  }

  async _writeRaw(obj){
    if (this._isBrowser){
      window.localStorage.setItem(this.key, JSON.stringify(obj));
      return;
    }
    this._store = JSON.parse(JSON.stringify(obj));
  }

  async list(){ const r = await this._readRaw(); return Object.values(r); }
  async get(id){ const r = await this._readRaw(); return r[id] || null; }
  async save(exJson){ const r = await this._readRaw(); r[exJson.id] = exJson; await this._writeRaw(r); return exJson; }
  async delete(id){ const r = await this._readRaw(); delete r[id]; await this._writeRaw(r); return true; }
}

class ExerciseInfoStorage {
  constructor(adapter = null){
    this.adapter = adapter || new LocalStorageAdapter();
  }

  setAdapter(adapter){ this.adapter = adapter; }

  async create(ex){
    const e = new ExerciseInfo(ex);
    return this.adapter.save(e.toJSON());
  }

  async get(id){ const raw = await this.adapter.get(id); if(!raw) return null; return ExerciseInfo.fromJSON(raw); }
  async update(id, fields){ const raw = await this.adapter.get(id); if(!raw) throw new Error('Exercise not found'); const e = ExerciseInfo.fromJSON(raw); e.update(fields); return this.adapter.save(e.toJSON()); }
  async delete(id){ return this.adapter.delete(id); }
  async list(){ const raws = await this.adapter.list(); return raws.map(r => ExerciseInfo.fromJSON(r)); }

  // simple search helpers
  async searchByName(query){
    const q = String(query || '').toLowerCase();
    const list = await this.list();
    return list.filter(e => e.name.toLowerCase().includes(q) || (e.description||'').toLowerCase().includes(q));
  }

  async searchByMuscle(muscleId){
    const list = await this.list();
    return list.filter(e => (e.muscles.primary || []).includes(muscleId) || (e.muscles.secondary || []).includes(muscleId));
  }

  async searchByEquipment(equipmentName){
    const q = String(equipmentName || '').toLowerCase();
    const list = await this.list();
    return list.filter(e => (e.equipment||[]).some(eq => eq.toLowerCase().includes(q)));
  }

  async filterByDifficulty(levelOrRange){
    // levelOrRange: 'beginner'|'intermediate'|'advanced' or { min:1, max:10 }
    const list = await this.list();
    if (typeof levelOrRange === 'string'){
      return list.filter(e => e.difficulty && e.difficulty.level === levelOrRange);
    }
    if (levelOrRange && typeof levelOrRange === 'object'){
      const min = levelOrRange.min || 1;
      const max = levelOrRange.max || 10;
      return list.filter(e => e.difficulty && typeof e.difficulty.score === 'number' && e.difficulty.score >= min && e.difficulty.score <= max);
    }
    return list;
  }
}

module.exports = { ExerciseInfoStorage, LocalStorageAdapter };
