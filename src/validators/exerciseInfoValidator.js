// src/validators/exerciseInfoValidator.js
const VALID_DIFFICULTY_LEVELS = ['beginner','intermediate','advanced'];

function isStringNonEmpty(v){ return typeof v === 'string' && v.trim().length > 0; }
function isArrayOrEmpty(v){ return v === undefined || Array.isArray(v); }

function validateExerciseInfo(raw){
  const errors = [];
  if (!raw || typeof raw !== 'object'){
    errors.push({ field: 'exercise', message: 'Exercise object is required.' });
    return { valid: false, errors };
  }

  if (!isStringNonEmpty(raw.name)) errors.push({ field: 'name', message: 'Exercise name is required and must be a non-empty string.' });
  if (raw.description !== undefined && typeof raw.description !== 'string') errors.push({ field: 'description', message: 'Description must be a string.' });

  if (!isArrayOrEmpty(raw.equipment)) errors.push({ field: 'equipment', message: 'Equipment must be an array of strings.' });
  else if (Array.isArray(raw.equipment)){
    for (const e of raw.equipment){ if (typeof e !== 'string') { errors.push({ field: 'equipment', message: 'Equipment entries must be strings.' }); break; } }
  }

  if (raw.difficulty){
    const level = raw.difficulty.level;
    const score = raw.difficulty.score;
    if (level && !VALID_DIFFICULTY_LEVELS.includes(level)) errors.push({ field: 'difficulty.level', message: `difficulty.level must be one of: ${VALID_DIFFICULTY_LEVELS.join(', ')}` });
    if (score !== undefined && score !== null){ if (typeof score !== 'number' || score < 1 || score > 10) errors.push({ field: 'difficulty.score', message: 'difficulty.score must be a number between 1 and 10.' }); }
  }

  // technique object
  if (raw.technique){
    if (raw.technique.steps && !Array.isArray(raw.technique.steps)) errors.push({ field: 'technique.steps', message: 'technique.steps must be an array of strings.' });
    if (raw.technique.commonMistakes && !Array.isArray(raw.technique.commonMistakes)) errors.push({ field: 'technique.commonMistakes', message: 'technique.commonMistakes must be an array of strings.' });
    if (raw.technique.safetyTips && !Array.isArray(raw.technique.safetyTips)) errors.push({ field: 'technique.safetyTips', message: 'technique.safetyTips must be an array of strings.' });
  }

  // muscles
  if (!raw.muscles || typeof raw.muscles !== 'object') errors.push({ field: 'muscles', message: 'muscles object with primary (array) is required.' });
  else {
    if (!Array.isArray(raw.muscles.primary) || raw.muscles.primary.length === 0) errors.push({ field: 'muscles.primary', message: 'At least one primary muscle id is required.' });
    if (raw.muscles.primary && Array.isArray(raw.muscles.primary)){
      for (const m of raw.muscles.primary){ if (typeof m !== 'string') { errors.push({ field: 'muscles.primary', message: 'muscle ids must be strings.' }); break; } }
    }
    if (raw.muscles.secondary && !Array.isArray(raw.muscles.secondary)) errors.push({ field: 'muscles.secondary', message: 'muscles.secondary must be an array of muscle ids.' });
  }

  // variations
  if (raw.variations){
    if (raw.variations.easier && !Array.isArray(raw.variations.easier)) errors.push({ field: 'variations.easier', message: 'variations.easier must be an array.' });
    if (raw.variations.harder && !Array.isArray(raw.variations.harder)) errors.push({ field: 'variations.harder', message: 'variations.harder must be an array.' });
  }

  // visual placeholders
  if (raw.visual && !Array.isArray(raw.visual)) errors.push({ field: 'visual', message: 'visual must be an array of mappings.' });

  return { valid: errors.length === 0, errors };
}

module.exports = { validateExerciseInfo, VALID_DIFFICULTY_LEVELS };
