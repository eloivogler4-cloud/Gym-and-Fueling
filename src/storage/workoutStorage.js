// src/storage/workoutStorage.js
// Pluggable storage for workout plans and sessions (browser localStorage + in-memory fallback)
const { v4: uuidv4 } = require('uuid');
const { WorkoutPlan } = require('../models/workoutPlan');
const { WorkoutSession } = require('../models/workoutSession');

class LocalStorageAdapter {
  constructor(prefix = 'gym_workouts_v1'){
    this.prefix = prefix; // will store two keys: ${prefix}:plans and ${prefix}:sessions
    this._isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    if (!this._isBrowser) this._store = { plans: {}, sessions: {} };
  }

  async _read(key){
    if (this._isBrowser){
      const raw = window.localStorage.getItem(`${this.prefix}:${key}`);
      return raw ? JSON.parse(raw) : {};
    }
    return JSON.parse(JSON.stringify(this._store[key] || {}));
  }

  async _write(key, obj){
    if (this._isBrowser){
      window.localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(obj));
    } else {
      this._store[key] = JSON.parse(JSON.stringify(obj));
    }
  }

  // plans
  async listPlans(){ const p = await this._read('plans'); return Object.values(p); }
  async getPlan(id){ const p = await this._read('plans'); return p[id] || null; }
  async savePlan(planJson){ const p = await this._read('plans'); p[planJson.id] = planJson; await this._write('plans', p); return planJson; }
  async deletePlan(id){ const p = await this._read('plans'); delete p[id]; await this._write('plans', p); return true; }

  // sessions
  async listSessions(){ const s = await this._read('sessions'); return Object.values(s); }
  async getSession(id){ const s = await this._read('sessions'); return s[id] || null; }
  async saveSession(sessJson){ const s = await this._read('sessions'); s[sessJson.id] = sessJson; await this._write('sessions', s); return sessJson; }
  async deleteSession(id){ const s = await this._read('sessions'); delete s[id]; await this._write('sessions', s); return true; }
}

class WorkoutStorage {
  constructor(adapter = null){
    this.adapter = adapter || new LocalStorageAdapter();
  }

  setAdapter(adapter){ this.adapter = adapter; }

  // Plans
  async createPlan(data){
    const plan = new WorkoutPlan(data);
    // validation should be performed by caller using validators
    return this.adapter.savePlan(plan.toJSON());
  }

  async getPlan(id){
    const raw = await this.adapter.getPlan(id);
    if (!raw) return null;
    return WorkoutPlan.fromJSON(raw);
  }

  async updatePlan(id, fields){
    const raw = await this.adapter.getPlan(id);
    if (!raw) throw new Error('Plan not found');
    const plan = WorkoutPlan.fromJSON(raw);
    plan.update(fields);
    return this.adapter.savePlan(plan.toJSON());
  }

  async deletePlan(id){ return this.adapter.deletePlan(id); }
  async listPlans(){ const raws = await this.adapter.listPlans(); return raws.map(r => WorkoutPlan.fromJSON(r)); }

  // Sessions
  async createSession(data){
    const sess = new WorkoutSession(data);
    return this.adapter.saveSession(sess.toJSON());
  }

  async getSession(id){ const raw = await this.adapter.getSession(id); if(!raw) return null; return WorkoutSession.fromJSON(raw); }
  async updateSession(id, fields){ const raw = await this.adapter.getSession(id); if(!raw) throw new Error('Session not found'); const sess = WorkoutSession.fromJSON(raw); sess.update(fields); return this.adapter.saveSession(sess.toJSON()); }
  async deleteSession(id){ return this.adapter.deleteSession(id); }
  async listSessions(){ const raws = await this.adapter.listSessions(); return raws.map(r => WorkoutSession.fromJSON(r)); }
}

module.exports = { WorkoutStorage, LocalStorageAdapter };
