Progressive overload engine

This module contains rules and a progression engine that creates conservative, explainable recommendations for progressive overload based on: recent session history, exercise type, difficulty, and user feedback (energy level).

Files added:
- src/progression/progressionRules.js - constants and heuristics
- src/models/recommendation.js - Recommendation model describing an actionable suggestion
- src/progression/progressionEngine.js - Main engine that inspects recent sessions and generates recommendations

Design notes:
- The engine is intentionally conservative: aggressive changes are only recommended after multiple consistent sessions.
- Recommendations are discrete actions the UI can present to the user for acceptance or modification (increase weight, increase reps, maintain, reduce volume, technique focus, deload, adjust for energy).
- Each Recommendation includes a reason and confidence score to help the AI or UI explain and prioritize suggestions.
- The engine returns multiple candidate recommendations per exercise when appropriate. The UI/AI layer can rank, filter or present them.

How to use

```js
const { generateRecommendations } = require('./src/progression/progressionEngine');

const recs = generateRecommendations({
  userProfile, // optional
  plan: workoutPlanJson,
  recentSessions: sessionsArraySortedOldToNew,
  lookback: 3,
});

// recs is an array of Recommendation instances
recs.forEach(r => console.log(r.toJSON()));
```

Integration notes
- The engine is pure JS and has no external dependencies beyond the Recommendation model; it is easy to call from server or client code.
- To connect real AI later: send the Recommendation payload(s) plus session summaries and historical context to the AI for further refinement or to produce a natural-language explanation.
- The engine can be extended to include more complex logic (e.g., statistical trend detection, velocity-based progression using rep timing) or to consume personalized aggressiveness settings from the user's profile.
