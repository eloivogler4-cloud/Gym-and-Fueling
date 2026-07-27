// src/models/set.js
const { v4: uuidv4 } = require('uuid');

class SetRecord {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.weight = typeof data.weight === 'number' ? data.weight : null; // kilograms, null for bodyweight
    this.repetitions = Number.isInteger(data.repetitions) ? data.repetitions : null;
    this.completed = !!data.completed;
    // difficulty: allow numeric RPE-like 1-10 or enums 'easy'|'moderate'|'hard'
    this.difficulty = (typeof data.difficulty === 'number' || typeof data.difficulty === 'string') ? data.difficulty : null;
    this.notes = data.notes || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      weight: this.weight,
      repetitions: this.repetitions,
      completed: this.completed,
      difficulty: this.difficulty,
      notes: this.notes,
      createdAt: this.createdAt,
    };
  }

  static fromJSON(json) {
    return new SetRecord(json);
  }
}

module.exports = { SetRecord };
