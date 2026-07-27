// src/models/exerciseInfo.js
const { v4: uuidv4 } = require('uuid');

/**
 * ExerciseInfo - rich exercise information intended for an exercise library.
 *
 * Fields:
 * - id
 * - name
 * - description
 * - equipment: array of strings
 * - difficulty: { level: 'beginner'|'intermediate'|'advanced', score: 1..10 }
 * - technique: { steps: [string], commonMistakes: [string], safetyTips: [string] }
 * - muscles: { primary: [muscleId], secondary: [muscleId] }
 * - variations: { easier: [ { id?, name } ], harder: [ { id?, name } ] }
 * - tags: array of strings
 * - meta: freeform object for future fields (e.g., video links, image urls)
 * - visual: placeholder for muscle-visual mapping: array of { muscleId, regionId?, highlights?: {opacity:number,color?:string} }
 */
class ExerciseInfo {
  constructor(data = {}){
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.equipment = Array.isArray(data.equipment) ? data.equipment : (data.equipment ? [data.equipment] : []);
    this.difficulty = data.difficulty || { level: data.level || 'intermediate', score: data.score || null };

    this.technique = {
      steps: Array.isArray(data.technique && data.technique.steps) ? data.technique.steps : (data.technique && data.technique.steps ? [data.technique.steps] : []),
      commonMistakes: Array.isArray(data.technique && data.technique.commonMistakes) ? data.technique.commonMistakes : (data.technique && data.technique.commonMistakes ? [data.technique.commonMistakes] : []),
      safetyTips: Array.isArray(data.technique && data.technique.safetyTips) ? data.technique.safetyTips : (data.technique && data.technique.safetyTips ? [data.technique.safetyTips] : []),
    };

    this.muscles = {
      primary: Array.isArray(data.muscles && data.muscles.primary) ? data.muscles.primary : (data.muscles && data.muscles.primary ? [data.muscles.primary] : []),
      secondary: Array.isArray(data.muscles && data.muscles.secondary) ? data.muscles.secondary : (data.muscles && data.muscles.secondary ? [data.muscles.secondary] : []),
    };

    this.variations = {
      easier: Array.isArray(data.variations && data.variations.easier) ? data.variations.easier : (data.variations && data.variations.easier ? [data.variations.easier] : []),
      harder: Array.isArray(data.variations && data.variations.harder) ? data.variations.harder : (data.variations && data.variations.harder ? [data.variations.harder] : []),
    };

    this.tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);

    this.meta = data.meta || {};

    // visual mapping for future muscle-highlighting. Array of { muscleId, regionId?, highlights?: { opacity, color } }
    this.visual = Array.isArray(data.visual) ? data.visual : [];

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  update(fields = {}){
    Object.keys(fields).forEach(k => {
      if (k === 'technique' && typeof fields.technique === 'object'){
        this.technique = Object.assign({}, this.technique, fields.technique);
      } else if (k === 'muscles' && typeof fields.muscles === 'object'){
        this.muscles = Object.assign({}, this.muscles, fields.muscles);
      } else if (k === 'variations' && typeof fields.variations === 'object'){
        this.variations = Object.assign({}, this.variations, fields.variations);
      } else if (k in this){
        this[k] = fields[k];
      }
    });
    this.updatedAt = new Date().toISOString();
  }

  toJSON(){
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      equipment: this.equipment,
      difficulty: this.difficulty,
      technique: this.technique,
      muscles: this.muscles,
      variations: this.variations,
      tags: this.tags,
      meta: this.meta,
      visual: this.visual,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(json){
    return new ExerciseInfo(json);
  }
}

module.exports = { ExerciseInfo };
