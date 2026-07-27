Exercise information system

This module provides a structured ExerciseInfo model, validation, and pluggable storage intended to power the exercise library and later a visual muscle model.

Files added:
- src/models/exerciseInfo.js - rich exercise information model (technique, muscles, variations, visual mapping placeholder)
- src/validators/exerciseInfoValidator.js - validation rules for exercise info
- src/storage/exerciseInfoStorage.js - pluggable storage with LocalStorage adapter and search helpers
- src/data/muscles.js - canonical muscle list and basic visual anchor placeholders

Design highlights
- Exercises store explicit primary and secondary muscle IDs (referencing src/data/muscles.js). This makes it easy to highlight trained muscles in a visual model later.
- The visual field in ExerciseInfo is a placeholder: an array of mappings { muscleId, regionId?, highlights? } so the UI can later map these to SVG regions or overlay highlights on an image.
- Variations are lightweight references (id optional, name required) so you can later link to other ExerciseInfo entries by id when available.
- Search helpers allow lookup by name, muscle, equipment or difficulty score/range.

Example: Push ups (add to the store)

```js
const { ExerciseInfoStorage } = require('./src/storage/exerciseInfoStorage');
const { MUSCLES } = require('./src/data/muscles');

const store = new ExerciseInfoStorage();

const pushUps = {
  name: 'Push Up',
  description: 'A classic bodyweight pushing exercise that targets the chest, triceps and shoulders.',
  equipment: [],
  difficulty: { level: 'beginner', score: 3 },
  technique: {
    steps: [
      'Start in a high plank with hands under shoulders.',
      'Lower your body until your chest nearly touches the floor.',
      'Push back up to the starting position while keeping a neutral spine.'
    ],
    commonMistakes: [ 'Flaring elbows too wide', 'Sagging hips', 'Incomplete range of motion' ],
    safetyTips: [ 'Keep core braced', 'Avoid breath-holding' ]
  },
  muscles: {
    primary: ['pectoralis_major','triceps_brachii','anterior_deltoid'],
    secondary: ['biceps_brachii']
  },
  variations: {
    easier: [ { name: 'Knee Push Up' } ],
    harder: [ { name: 'Weighted Push Up' }, { name: 'Decline Push Up' } ]
  },
  tags: ['bodyweight','push','chest']
};

await store.create(pushUps);
```

Visual model preparation
- MUSCLES contains ids and defaultAnchor (relative coordinates) that an image/UI can use to place highlights.
- ExerciseInfo.visual entries can reference muscle ids and include highlight styling. When building the visual model, map visual.muscleId to MUSCLES anchors or to named SVG regions.

Next steps
- Populate the exercise library with common exercises and their muscle mappings.
- Build the visual SVG map and map MUSCLES.defaultAnchor to overlay points, or create SVG region ids matching muscle ids for full-area highlights.

