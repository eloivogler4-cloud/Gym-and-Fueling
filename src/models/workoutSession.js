// src/models/workoutSession.js
const { v4: uuidv4 } = require('uuid');
const { SetRecord } = require('./set');

class WorkoutSession {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.planId = data.planId || null; // optional link to WorkoutPlan
    this.date = data.date || new Date().toISOString();
    this.duration = typeof data.duration === 'number' ? data.duration : null; // minutes

    // exercisesCompleted: array of { exerciseId, exercise (json snapshot), sets: [SetRecord] }
    this.exercisesCompleted = Array.isArray(data.exercisesCompleted) ? data.exercisesCompleted.map(ec => ({
      exerciseId: ec.exerciseId || null,
      exercise: ec.exercise || null,
      sets: Array.isArray(ec.sets) ? ec.sets.map(s => (s instanceof SetRecord ? s.toJSON() : s)) : [],
      notes: ec.notes || null,
    })) : [];

    // subjective measures
    this.energyLevel = typeof data.energyLevel !== 'undefined' ? data.energyLevel : null; // 1-10 or 'low'|'normal'|'high'
    this.mood = data.mood || null;
    this.notes = data.notes || null;

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  addExerciseCompletion(exCompleted) {
    this.exercisesCompleted.push(exCompleted);
    this.updatedAt = new Date().toISOString();
  }

  update(fields = {}) {
    Object.keys(fields).forEach(k => {
      if (k in this) this[k] = fields[k];
    });
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      planId: this.planId,
      date: this.date,
      duration: this.duration,
      exercisesCompleted: this.exercisesCompleted,
      energyLevel: this.energyLevel,
      mood: this.mood,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new WorkoutSession(json);
  }
}

module.exports = { WorkoutSession };
