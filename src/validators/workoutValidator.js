// src/validators/workoutValidator.js
const WEEK_DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const PLAN_GOALS = ["muscle_gain","strength","endurance","explosiveness","general_fitness"];
const EXERCISE_CATEGORIES = ["strength","bodybuilding","bodyweight","cardio","mobility","other"];

function isNumber(n){ return typeof n === 'number' && Number.isFinite(n); }

function validateExercise(ex){
  const errors = [];
  if (!ex) { errors.push({field:'exercise', message:'Exercise is required'}); return errors; }
  const name = ex.name || (ex.exercise && ex.exercise.name);
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({field:'exercise.name', message:'Exercise name is required.'});
  }
  const category = ex.category || (ex.exercise && ex.exercise.category);
  if (category && !EXERCISE_CATEGORIES.includes(category)) {
    errors.push({field:'exercise.category', message:`Category must be one of: ${EXERCISE_CATEGORIES.join(', ')}`} );
  }
  // equipment, muscles optional but should be arrays if present
  const equipment = ex.equipment || (ex.exercise && ex.exercise.equipment);
  if (equipment && !Array.isArray(equipment)) errors.push({field:'exercise.equipment', message:'Equipment must be an array.'});
  const primary = ex.primaryMuscles || (ex.exercise && ex.exercise.primaryMuscles);
  if (primary && !Array.isArray(primary)) errors.push({field:'exercise.primaryMuscles', message:'primaryMuscles must be an array.'});
  const secondary = ex.secondaryMuscles || (ex.exercise && ex.exercise.secondaryMuscles);
  if (secondary && !Array.isArray(secondary)) errors.push({field:'exercise.secondaryMuscles', message:'secondaryMuscles must be an array.'});
  return errors;
}

function validateSet(set){
  const errors = [];
  if (!set) { errors.push({field:'set', message:'Set is required'}); return errors; }
  if (set.weight !== null && set.weight !== undefined && !isNumber(set.weight)) errors.push({field:'set.weight', message:'Weight must be a number (kg) or null for bodyweight.'});
  if (set.repetitions === null || set.repetitions === undefined || !Number.isInteger(set.repetitions) || set.repetitions < 0) errors.push({field:'set.repetitions', message:'Repetitions must be an integer >= 0.'});
  if (typeof set.completed !== 'boolean') errors.push({field:'set.completed', message:'completed must be boolean.'});
  if (set.difficulty !== null && set.difficulty !== undefined){
    const d = set.difficulty;
    const ok = (typeof d === 'number' && d >= 1 && d <= 10) || (typeof d === 'string');
    if (!ok) errors.push({field:'set.difficulty', message:'difficulty must be 1-10 number or a string like "easy"/"hard".'});
  }
  return errors;
}

function validateWorkoutPlan(plan){
  const errors = [];
  if (!plan || typeof plan !== 'object') { errors.push({field:'plan', message:'Plan object required'}); return {valid:false, errors}; }
  if (!plan.name || typeof plan.name !== 'string') errors.push({field:'name', message:'Plan name required.'});
  if (!plan.goal || !PLAN_GOALS.includes(plan.goal)) errors.push({field:'goal', message:`goal must be one of: ${PLAN_GOALS.join(', ')}`});
  if (!Array.isArray(plan.exercises)) errors.push({field:'exercises', message:'exercises must be an array.'});
  else {
    plan.exercises.forEach((e, idx) => {
      const errs = validateExercise(e.exercise || e);
      errs.forEach(er => er.field = `exercises[${idx}].${er.field}`);
      errors.push(...errs);
      if (e.sets && !Array.isArray(e.sets)) errors.push({field:`exercises[${idx}].sets`, message:'sets must be an array if provided.'});
    });
  }
  const schedule = plan.schedule;
  if (!schedule) errors.push({field:'schedule', message:'schedule is required.'});
  else {
    if (!schedule.type) errors.push({field:'schedule.type', message:'schedule.type required.'});
    if (schedule.type === 'weekly'){
      if (!Array.isArray(schedule.days)) errors.push({field:'schedule.days', message:'schedule.days must be array of weekdays.'});
      else schedule.days.forEach(d=>{ if (!WEEK_DAYS.includes(d.toLowerCase())) errors.push({field:'schedule.days', message:`invalid day ${d}`}); });
    }
    if (schedule.type === 'once' && !schedule.date) errors.push({field:'schedule.date', message:'date required for once schedules.'});
  }

  return { valid: errors.length === 0, errors };
}

function validateWorkoutSession(sess){
  const errors = [];
  if (!sess || typeof sess !== 'object') { errors.push({field:'session', message:'Session object required'}); return {valid:false, errors}; }
  if (!sess.date) errors.push({field:'date', message:'date is required.'});
  if (sess.duration !== null && sess.duration !== undefined && !isNumber(sess.duration)) errors.push({field:'duration', message:'duration must be number (minutes).'});
  if (!Array.isArray(sess.exercisesCompleted)) errors.push({field:'exercisesCompleted', message:'exercisesCompleted must be array.'});
  else {
    sess.exercisesCompleted.forEach((ec, idx) => {
      const exErrs = validateExercise(ec.exercise || ec);
      exErrs.forEach(er => er.field = `exercisesCompleted[${idx}].${er.field}`);
      errors.push(...exErrs);
      if (!Array.isArray(ec.sets)) errors.push({field:`exercisesCompleted[${idx}].sets`, message:'sets must be an array.'});
      else {
        ec.sets.forEach((s, sidx) => {
          const sErrs = validateSet(s);
          sErrs.forEach(se => se.field = `exercisesCompleted[${idx}].sets[${sidx}].${se.field}`);
          errors.push(...sErrs);
        });
      }
    });
  }
  if (sess.energyLevel !== null && sess.energyLevel !== undefined){
    const el = sess.energyLevel;
    const ok = (typeof el === 'number' && el >= 1 && el <= 10) || ['low','normal','high'].includes(el);
    if (!ok) errors.push({field:'energyLevel', message:'energyLevel must be 1-10 or low/normal/high.'});
  }
  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateWorkoutPlan,
  validateWorkoutSession,
  validateExercise,
  validateSet,
  PLAN_GOALS,
  EXERCISE_CATEGORIES,
};
