// src/models/userProfile.js
// UserProfile model for Gym-and-Fueling app

const { validateUserProfile } = require("../validators/userProfileValidator");
const { v4: uuidv4 } = require("uuid");

class UserProfile {
  constructor(data = {}) {
    const now = new Date().toISOString();
    this.id = data.id || uuidv4();

    // Personal
    this.name = data.name || "";
    this.age = data.age || null;
    this.gender = data.gender || null; // optional
    this.height = data.height || null; // cm
    this.currentWeight = data.currentWeight || null; // kg
    this.targetWeight = data.targetWeight || null; // kg

    // Fitness
    this.experienceLevel = data.experienceLevel || null; // beginner|intermediate|advanced
    this.mainGoal = data.mainGoal || null; // muscle gain | strength | endurance | explosiveness | general fitness

    // Training
    this.gymDaysPerWeek = data.gymDaysPerWeek || null; // 0-7
    this.preferredTrainingDays = data.preferredTrainingDays || []; // array of weekdays
    this.otherSports = data.otherSports || []; // array of strings
    this.sportSchedule = data.sportSchedule || null; // freeform string or structured later
    this.availableEquipment = data.availableEquipment || []; // array of strings

    // AI Coach preferences
    this.coachingStyle = data.coachingStyle || null; // strict|motivating|balanced
    this.feedbackFrequency = data.feedbackFrequency || null; // rarely|normal|frequently

    this.createdAt = data.createdAt || now;
    this.updatedAt = data.updatedAt || now;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      age: this.age,
      gender: this.gender,
      height: this.height,
      currentWeight: this.currentWeight,
      targetWeight: this.targetWeight,
      experienceLevel: this.experienceLevel,
      mainGoal: this.mainGoal,
      gymDaysPerWeek: this.gymDaysPerWeek,
      preferredTrainingDays: this.preferredTrainingDays,
      otherSports: this.otherSports,
      sportSchedule: this.sportSchedule,
      availableEquipment: this.availableEquipment,
      coachingStyle: this.coachingStyle,
      feedbackFrequency: this.feedbackFrequency,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  update(fields = {}) {
    Object.keys(fields).forEach((k) => {
      if (k in this) {
        this[k] = fields[k];
      }
    });
    this.updatedAt = new Date().toISOString();
  }

  validate() {
    return validateUserProfile(this.toJSON());
  }

  static fromJSON(json) {
    return new UserProfile(json);
  }
}

module.exports = { UserProfile };
