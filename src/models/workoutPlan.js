// src/models/workoutPlan.js
const { v4: uuidv4 } = require('uuid');
const { Exercise } = require('./exercise');

class WorkoutPlan {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.goal = data.goal || null; // e.g., 'muscle_gain','strength','endurance','general_fitness'
    // exercises: array of { exercise: Exercise or JSON, sets: [{repetitions, targetWeight}], order }
    this.exercises = Array.isArray(data.exercises) ? data.exercises.map(e => {
      if (e && e.exercise) {
        const ex = e.exercise instanceof Exercise ? e.exercise : new Exercise(e.exercise);
        return {
          id: e.id || uuidv4(),
          exercise: ex.toJSON(),
          sets: Array.isArray(e.sets) ? e.sets : [],
          notes: e.notes || null,
          order: typeof e.order === 'number' ? e.order : null,
        };
      }
      // allow raw Exercise entries
      return {
        id: e.id || uuidv4(),
        exercise: (e instanceof Exercise) ? e.toJSON() : (e.exercise ? e.exercise : e),
        sets: Array.isArray(e.sets) ? e.sets : [],
        notes: e.notes || null,
        order: typeof e.order === 'number' ? e.order : null,
      };
    }) : [];

    // schedule: { type: 'weekly', days: ['monday',...]} or { type: 'every_n_days', interval: 2 } or { type: 'once', date: 'YYYY-MM-DD' }
    this.schedule = data.schedule || { type: 'weekly', days: [] };

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  addExercise(exerciseEntry) {
    const entry = exerciseEntry;
    entry.id = entry.id || uuidv4();
    this.exercises.push(entry);
    this.updatedAt = new Date().toISOString();
  }

  update(fields = {}) {
    Object.keys(fields).forEach(k => {
      if (k === 'exercises' && Array.isArray(fields.exercises)) {
        this.exercises = fields.exercises;
      } else if (k in this) {
        this[k] = fields[k];
      }
    });
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      goal: this.goal,
      exercises: this.exercises,
      schedule: this.schedule,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new WorkoutPlan(json);
  }
}

module.exports = { WorkoutPlan };
