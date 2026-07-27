// src/models/exercise.js
const { v4: uuidv4 } = require('uuid');

class Exercise {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.category = data.category || null; // e.g., 'strength', 'bodybuilding', 'bodyweight'
    this.equipment = Array.isArray(data.equipment) ? data.equipment : (data.equipment ? [data.equipment] : []);
    this.primaryMuscles = Array.isArray(data.primaryMuscles) ? data.primaryMuscles : (data.primaryMuscles ? [data.primaryMuscles] : []);
    this.secondaryMuscles = Array.isArray(data.secondaryMuscles) ? data.secondaryMuscles : (data.secondaryMuscles ? [data.secondaryMuscles] : []);
    this.instructions = data.instructions || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
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
      name: this.name,
      category: this.category,
      equipment: this.equipment,
      primaryMuscles: this.primaryMuscles,
      secondaryMuscles: this.secondaryMuscles,
      instructions: this.instructions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json) {
    return new Exercise(json);
  }
}

module.exports = { Exercise };
