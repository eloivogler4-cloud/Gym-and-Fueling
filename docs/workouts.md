# Workout tracking: models, validation, storage and AI-friendly analytics

This module contains the core workout tracking logic so the app can: show today's plan, start a session, track sets, finish a session, and later allow AI analysis.

Files added:
- src/models/exercise.js - Exercise model
- src/models/set.js - SetRecord model representing one set performed
- src/models/workoutPlan.js - WorkoutPlan model containing exercises and schedule
- src/models/workoutSession.js - WorkoutSession model capturing completed exercises and sets
- src/validators/workoutValidator.js - Validation logic for plans, sessions, exercises and sets
- src/storage/workoutStorage.js - Pluggable storage for plans and sessions (localStorage adapter + in-memory fallback)

AI preparation and analytics guidance
- Models are serializable to JSON and intentionally keep snapshots of exercises inside sessions. This ensures the AI has stable historical context of exactly what the user performed when comparing progress.
- For each set we store weight, reps, completion flag and difficulty so the AI can compute volume (weight*reps), intensity, and progress over time.

Next steps (suggestions)
- Add an analytics module to compute session summaries (total volume per muscle group, 1RM estimates, velocity if rep timing is added).
- Expose an API that converts sessions and plans into an AI-friendly time-series JSON with standardized fields (timestamp, exercise_id, muscle_groups, volume, rpe).
- Add unit tests for validators and storage.

Example usage

```js
const { WorkoutStorage } = require('./src/storage/workoutStorage');
const { validateWorkoutPlan, validateWorkoutSession } = require('./src/validators/workoutValidator');

const storage = new WorkoutStorage();

// create a plan (validate before creating)
const plan = {
  name: 'Upper / Lower Split',
  goal: 'strength',
  exercises: [
    { exercise: { name: 'Back Squat', category: 'strength', equipment: ['barbell'], primaryMuscles: ['quadriceps','glutes'] }, sets: [ { repetitions: 5, targetWeight: 100 } ] },
  ],
  schedule: { type: 'weekly', days: ['monday','thursday'] },
};
const v = validateWorkoutPlan(plan);
if (!v.valid) console.error(v.errors);
else await storage.createPlan(plan);

// start a session
const session = await storage.createSession({ planId: '...', date: new Date().toISOString(), duration: 45, exercisesCompleted: [ { exerciseId: '...', exercise: { name: 'Back Squat' }, sets: [ { weight: 100, repetitions: 5, completed: true, difficulty: 8 } ] } ], energyLevel: 8, mood: 'focused' });
```
