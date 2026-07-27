// src/models/recommendation.js
const { v4: uuidv4 } = require('uuid');

class Recommendation {
  constructor({
    exerciseId = null,
    exerciseName = null,
    action = null, // 'increase_weight'|'increase_reps'|'maintain'|'reduce_volume'|'technique_focus'|'deload'|'adjust_for_energy'
    params = {},
    reason = '',
    confidence = 0.5, // 0..1
    createdAt = new Date().toISOString(),
    expiresAt = null, // optional ISO timestamp
  } = {}) {
    this.id = uuidv4();
    this.exerciseId = exerciseId;
    this.exerciseName = exerciseName;
    this.action = action;
    this.params = params;
    this.reason = reason;
    this.confidence = Math.max(0, Math.min(1, confidence));
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
    this.accepted = false; // user can accept/modify later
    this.applied = false; // whether the system applied the change to the plan
  }

  toJSON() {
    return {
      id: this.id,
      exerciseId: this.exerciseId,
      exerciseName: this.exerciseName,
      action: this.action,
      params: this.params,
      reason: this.reason,
      confidence: this.confidence,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      accepted: this.accepted,
      applied: this.applied,
    };
  }

  static fromJSON(json) {
    const r = new Recommendation(json);
    r.id = json.id || r.id;
    r.accepted = json.accepted || false;
    r.applied = json.applied || false;
    return r;
  }
}

module.exports = { Recommendation };
