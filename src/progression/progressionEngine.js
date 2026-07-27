// src/progression/progressionEngine.js
// ProgressionEngine: generates conservative, explainable recommendations for progressive overload

const { DEFAULT_LOOKBACK, MIN_SESSIONS_FOR_CHANGE, DEFAULT_WEIGHT_INCREASE_PERCENT, DEFAULT_REP_INCREASE, DIFFICULTY_MAP, CATEGORY_AGGRESSIVENESS } = require('./progressionRules');
const { Recommendation } = require('../models/recommendation');

function _toNumericDifficulty(d){
  if (d === null || d === undefined) return null;
  if (typeof d === 'number') return Math.max(0, Math.min(10, d));
  const key = String(d).toLowerCase();
  return DIFFICULTY_MAP[key] || null;
}

function _mean(arr){
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}

function _safeName(ex){
  return (ex && (ex.name || ex.exercise && ex.exercise.name)) || 'unknown';
}

// Extract sets for a given exercise identifier or name from recent sessions
function collectExerciseHistory(exerciseRef, sessions, lookback = DEFAULT_LOOKBACK){
  // exerciseRef may be an id or name
  const isId = typeof exerciseRef === 'string' && exerciseRef.length > 0 && exerciseRef.indexOf(' ') === -1; // crude
  const nameRef = String(exerciseRef).toLowerCase();

  const recent = sessions.slice(-lookback); // assume sessions are chronological
  const items = [];
  for (const s of recent){
    if (!Array.isArray(s.exercisesCompleted)) continue;
    for (const ec of s.exercisesCompleted){
      const ecName = (ec.exercise && ec.exercise.name) ? String(ec.exercise.name).toLowerCase() : '';
      const matches = (ec.exerciseId && ec.exerciseId === exerciseRef) || ecName === nameRef || (!ec.exerciseId && ecName === nameRef);
      if (matches){
        items.push({ session: s, exerciseCompleted: ec });
      }
    }
  }
  return items;
}

function analyzeExerciseHistory(items){
  // items: [{session, exerciseCompleted}]
  // compute per-session totals and trends
  if (!items || items.length === 0) return null;
  const perSession = items.map(it => {
    const sets = Array.isArray(it.exerciseCompleted.sets) ? it.exerciseCompleted.sets : [];
    const totalSets = sets.length;
    const completedSets = sets.filter(s => !!s.completed).length;
    const completionRate = totalSets === 0 ? 0 : completedSets/totalSets;
    const reps = sets.map(s => Number.isFinite(s.repetitions) ? s.repetitions : 0);
    const weightVals = sets.map(s => (Number.isFinite(s.weight) ? s.weight : 0));
    const avgReps = reps.length ? _mean(reps) : null;
    const avgWeight = weightVals.length ? _mean(weightVals) : null;
    const difficulties = sets.map(s => _toNumericDifficulty(s.difficulty)).filter(d=>d!==null);
    const avgDifficulty = difficulties.length ? _mean(difficulties) : null;
    const maxEstimated1RM = sets.reduce((max,s)=>{
      if (Number.isFinite(s.weight) && Number.isFinite(s.repetitions) && s.repetitions > 0 && s.repetitions <= 10){
        const est = s.weight*(1 + s.repetitions/30); // Epley
        return Math.max(max, est);
      }
      return max;
    }, 0);

    return {
      sessionDate: it.session.date,
      totalSets,
      completedSets,
      completionRate,
      avgReps,
      avgWeight,
      avgDifficulty,
      maxEstimated1RM,
    };
  });

  // compute trends: simple difference between last and first
  const first = perSession[0];
  const last = perSession[perSession.length-1];
  const trends = {
    sessionsCount: perSession.length,
    completionRate: last.completionRate - first.completionRate,
    avgReps: (last.avgReps || 0) - (first.avgReps || 0),
    avgWeight: (last.avgWeight || 0) - (first.avgWeight || 0),
    avgDifficulty: (last.avgDifficulty || 0) - (first.avgDifficulty || 0),
    maxEstimated1RM: (last.maxEstimated1RM || 0) - (first.maxEstimated1RM || 0),
    perSession,
  };
  return trends;
}

function _categoryAggressiveness(category){
  return CATEGORY_AGGRESSIVENESS[category] || CATEGORY_AGGRESSIVENESS['other'] || 1.0;
}

function recommendForExercise(planExercise, historyItems, userProfile, recentSessions, options = {}){
  // planExercise: entry from plan.exercises (has exercise snapshot and optional sets template)
  const name = _safeName(planExercise.exercise);
  const exerciseId = planExercise.id || (planExercise.exercise && planExercise.exercise.id) || null;
  const category = (planExercise.exercise && planExercise.exercise.category) || 'other';
  const aggressiveness = _categoryAggressiveness(category);
  const analysis = analyzeExerciseHistory(historyItems);
  const recs = [];

  // If no history, be conservative: no recommendation
  if (!analysis || analysis.sessionsCount < 1) {
    return recs; // empty
  }

  const sessionsCount = analysis.sessionsCount;
  const lastSession = analysis.perSession[analysis.perSession.length-1];
  const avgDifficulty = lastSession.avgDifficulty || analysis.perSession.reduce((acc,s)=>acc+(s.avgDifficulty||0),0)/analysis.perSession.length || null;
  const completionRate = lastSession.completionRate;
  const avgReps = lastSession.avgReps || 0;

  // prefer numeric difficulty
  const numericDifficulty = (avgDifficulty !== null) ? avgDifficulty : null;

  // Determine easy / struggle heuristics
  const didCompleteAll = completionRate >= 0.95; // nearly all sets completed
  const struggled = completionRate < 0.75 || (numericDifficulty !== null && numericDifficulty >= 8);

  // energy adjustments (last session energy if present)
  const lastEnergy = (recentSessions && recentSessions.length) ? (recentSessions[recentSessions.length-1].energyLevel) : null;
  const lowEnergy = (typeof lastEnergy === 'number' && lastEnergy <= 3) || (typeof lastEnergy === 'string' && String(lastEnergy).toLowerCase() === 'low');

  // Only make stronger recommendations if we have at least MIN_SESSIONS_FOR_CHANGE sessions
  const canChange = analysis.sessionsCount >= (options.minSessions || MIN_SESSIONS_FOR_CHANGE);

  // Case: user completes all sets easily
  if (didCompleteAll && (!numericDifficulty || numericDifficulty <= 5)){
    if (canChange){
      // Prefer weight increase for strength exercises, reps for bodybuilding/bodyweight
      if (category === 'strength'){
        const percent = DEFAULT_WEIGHT_INCREASE_PERCENT * aggressiveness;
        const reason = `Completed all sets with low difficulty (${numericDifficulty || 'unknown'}) — suggest a conservative ${percent}% weight increase.`;
        recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'increase_weight', params: { percent }, reason, confidence: 0.8*aggressiveness }));
      } else if (category === 'bodyweight'){
        const reps = Math.max(1, Math.round(DEFAULT_REP_INCREASE * aggressiveness));
        const reason = `Bodyweight exercise completed easily — suggest increasing reps by ${reps} or progressing to a harder variant.`;
        recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'increase_reps', params: { reps }, reason, confidence: 0.75*aggressiveness }));
      } else {
        // bodybuilding or other
        const percent = DEFAULT_WEIGHT_INCREASE_PERCENT * 0.9 * aggressiveness;
        const reps = Math.max(1, Math.round(DEFAULT_REP_INCREASE * aggressiveness));
        const reason = `Completed sets easily — suggest either +${percent}% weight or +${reps} reps. Offer both options.`;
        recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'increase_weight', params: { percent }, reason, confidence: 0.7 }));
        recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'increase_reps', params: { reps }, reason, confidence: 0.6 }));
      }
    }
  }

  // Case: user struggled
  if (struggled){
    const reason = `Completion rate ${Math.round(completionRate*100)}% and difficulty ${numericDifficulty || 'unknown'} indicate struggle.`;
    // Suggest maintain weight, reduce volume, or technique focus
    recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'maintain', params: {}, reason: `${reason} Maintain weight to build consistency.`, confidence: 0.9 }));
    recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'reduce_volume', params: { reduceSets: 1 }, reason: `${reason} Reduce volume (e.g., -1 set) to allow recovery.`, confidence: 0.8 }));
    recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'technique_focus', params: { cue: 'focus on tempo and full range of motion' }, reason: `${reason} Suggest technique cues to improve efficiency.`, confidence: 0.7 }));
  }

  // Case: low energy
  if (lowEnergy){
    const reason = `User reported low energy in the most recent session (${lastEnergy}).`;
    recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'adjust_for_energy', params: { reduceIntensityPercent: 15 }, reason: `${reason} Suggest lowering intensity/volume for next workout.`, confidence: 0.85 }));
  }

  // If no strong signal but stable progress, recommend maintain with low confidence
  if (recs.length === 0){
    // gentle maintain suggestion
    recs.push(new Recommendation({ exerciseId, exerciseName: name, action: 'maintain', params: {}, reason: `No strong progression signal — keep current load and monitor.`, confidence: 0.4 }));
  }

  // attach meta: small adjustment to confidence when less history
  recs.forEach(r => {
    if (analysis.sessionsCount < (options.minSessions || MIN_SESSIONS_FOR_CHANGE)){
      r.confidence *= 0.6; // reduce confidence if few sessions
      r.reason = `(Based on limited data) ${r.reason}`;
    }
  });

  return recs;
}

function generateRecommendations({ userProfile = null, plan = null, recentSessions = [], lookback = DEFAULT_LOOKBACK, options = {} } = {}){
  // plan: WorkoutPlan JSON object
  // recentSessions: array of WorkoutSession JSON objects, assumed chronological old->new
  if (!plan || !plan.exercises) return [];
  const recs = [];

  for (const pe of plan.exercises){
    // collect history by matching exercise id or name
    const ref = (pe.id) || (pe.exercise && pe.exercise.id) || (pe.exercise && pe.exercise.name) || '';
    const items = collectExerciseHistory(ref, recentSessions, lookback);
    const exerciseRecs = recommendForExercise(pe, items, userProfile, recentSessions, options);
    recs.push(...exerciseRecs);
  }

  // global adjustments: if user overall low energy across recent sessions, add a plan-level deload recommendation
  const energies = recentSessions.slice(-lookback).map(s => s.energyLevel).filter(e=>e!==null && e!==undefined);
  const lowEnergyCount = energies.filter(e => (typeof e === 'number' && e <=3) || (typeof e === 'string' && e.toLowerCase()==='low')).length;
  if (lowEnergyCount >= Math.ceil(Math.max(1, lookback/2))){
    recs.push(new Recommendation({ exerciseId: null, exerciseName: null, action: 'deload', params: { reduceVolumePercent: 20 }, reason: 'Multiple recent sessions reported low energy — consider a deload week or reduced load.', confidence: 0.9 }));
  }

  return recs;
}

module.exports = {
  generateRecommendations,
  recommendForExercise,
  analyzeExerciseHistory,
};
