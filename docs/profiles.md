# User Profile: model, validation and storage

This directory contains the logic for onboarding and storing user profiles for the Gym-and-Fueling app. It includes:

- src/models/userProfile.js: UserProfile model with serialization and update helpers.
- src/validators/userProfileValidator.js: Validation rules and helpers for onboarding questions.
- src/storage/profileStorage.js: Pluggable storage with a LocalStorage adapter and an in-memory fallback.

Design notes:
- Validation uses simple JS checks, no external dependencies. Range checks and enumerations are defined in the validator.
- Storage is pluggable: you can provide a server-backed adapter that implements list/get/save/delete.
- The saved profile JSON shape is flat to make storage and transport simple; the model provides convenience methods.

Examples

Create a storage instance and create a profile (browser environment):

```js
const { ProfileStorage } = require('./src/storage/profileStorage');
const store = new ProfileStorage();

await store.createProfile({
  name: 'Alex',
  age: 28,
  gender: 'male',
  height: 180,
  currentWeight: 80,
  targetWeight: 78,
  experienceLevel: 'intermediate',
  mainGoal: 'muscle_gain',
  gymDaysPerWeek: 4,
  preferredTrainingDays: ['monday','wednesday','friday','saturday'],
  otherSports: ['running'],
  sportSchedule: 'Evenings',
  availableEquipment: ['barbell','dumbbells','bench'],
  coachingStyle: 'balanced',
  feedbackFrequency: 'normal',
});
```

Updating a profile:

```js
await store.updateProfile(profileId, { targetWeight: 82, coachingStyle: 'motivating' });
```

Validation errors will be thrown as an Error with a `.validation` property containing { valid: false, errors: [] }.
