// src/validators/userProfileValidator.js

const VALID_GENDERS = ["male", "female", "other", "prefer_not_to_say", null];
const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];
const MAIN_GOALS = ["muscle_gain", "strength", "endurance", "explosiveness", "general_fitness"];
const WEEK_DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const COACHING_STYLES = ["strict","motivating","balanced"];
const FEEDBACK_FREQ = ["rarely","normal","frequently"];

function isNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function validatePersonal(personal) {
  const errors = [];

  if (!personal.name || typeof personal.name !== "string" || personal.name.trim().length === 0) {
    errors.push({ field: "name", message: "Name is required and must be a non-empty string." });
  }

  if (!isNumber(personal.age) || personal.age <= 0 || personal.age > 120) {
    errors.push({ field: "age", message: "Age must be a number between 1 and 120." });
  }

  if (personal.gender !== undefined && !VALID_GENDERS.includes(personal.gender)) {
    errors.push({ field: "gender", message: `Gender must be one of: ${VALID_GENDERS.join(", ")}` });
  }

  if (!isNumber(personal.height) || personal.height < 50 || personal.height > 272) {
    errors.push({ field: "height", message: "Height must be a number in cm between 50 and 272." });
  }

  if (!isNumber(personal.currentWeight) || personal.currentWeight < 20 || personal.currentWeight > 500) {
    errors.push({ field: "currentWeight", message: "Current weight must be a number in kg between 20 and 500." });
  }

  if (!isNumber(personal.targetWeight) || personal.targetWeight < 10 || personal.targetWeight > 500) {
    errors.push({ field: "targetWeight", message: "Target weight must be a number in kg between 10 and 500." });
  }

  return errors;
}

function validateFitness(fitness) {
  const errors = [];

  if (!EXPERIENCE_LEVELS.includes(fitness.experienceLevel)) {
    errors.push({ field: "experienceLevel", message: `Experience level must be one of: ${EXPERIENCE_LEVELS.join(", ")}` });
  }

  if (!MAIN_GOALS.includes(fitness.mainGoal)) {
    errors.push({ field: "mainGoal", message: `Main goal must be one of: ${MAIN_GOALS.join(", ")}` });
  }

  return errors;
}

function validateTraining(training) {
  const errors = [];

  if (!isNumber(training.gymDaysPerWeek) || training.gymDaysPerWeek < 0 || training.gymDaysPerWeek > 7) {
    errors.push({ field: "gymDaysPerWeek", message: "Gym days per week must be a number between 0 and 7." });
  }

  if (!Array.isArray(training.preferredTrainingDays)) {
    errors.push({ field: "preferredTrainingDays", message: "Preferred training days must be an array of weekdays." });
  } else {
    for (const d of training.preferredTrainingDays) {
      if (!WEEK_DAYS.includes(d.toLowerCase())) {
        errors.push({ field: "preferredTrainingDays", message: `Invalid weekday: ${d}. Use: ${WEEK_DAYS.join(", ")}` });
        break;
      }
    }
  }

  if (training.otherSports && !Array.isArray(training.otherSports)) {
    errors.push({ field: "otherSports", message: "otherSports must be an array of strings." });
  }

  if (training.availableEquipment && !Array.isArray(training.availableEquipment)) {
    errors.push({ field: "availableEquipment", message: "availableEquipment must be an array of strings." });
  }

  return errors;
}

function validateAICoach(ai) {
  const errors = [];

  if (!COACHING_STYLES.includes(ai.coachingStyle)) {
    errors.push({ field: "coachingStyle", message: `Coaching style must be one of: ${COACHING_STYLES.join(", ")}` });
  }

  if (!FEEDBACK_FREQ.includes(ai.feedbackFrequency)) {
    errors.push({ field: "feedbackFrequency", message: `Feedback frequency must be one of: ${FEEDBACK_FREQ.join(", ")}` });
  }

  return errors;
}

function validateUserProfile(raw) {
  // Accept either flat structure (model.toJSON) or nested grouped structure
  const grouped = {
    name: raw.name,
    age: raw.age,
    gender: raw.gender,
    height: raw.height,
    currentWeight: raw.currentWeight,
    targetWeight: raw.targetWeight,

    experienceLevel: raw.experienceLevel,
    mainGoal: raw.mainGoal,

    gymDaysPerWeek: raw.gymDaysPerWeek,
    preferredTrainingDays: raw.preferredTrainingDays,
    otherSports: raw.otherSports,
    sportSchedule: raw.sportSchedule,
    availableEquipment: raw.availableEquipment,

    coachingStyle: raw.coachingStyle,
    feedbackFrequency: raw.feedbackFrequency,
  };

  const errors = [];
  errors.push(...validatePersonal(grouped));
  errors.push(...validateFitness(grouped));
  errors.push(...validateTraining(grouped));
  errors.push(...validateAICoach(grouped));

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateUserProfile,
  // exposed constants for UI/other logic
  VALID_GENDERS,
  EXPERIENCE_LEVELS,
  MAIN_GOALS,
  WEEK_DAYS,
  COACHING_STYLES,
  FEEDBACK_FREQ,
};
