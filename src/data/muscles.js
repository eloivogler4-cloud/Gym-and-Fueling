// src/data/muscles.js
// Canonical muscle list used across exercises and for future visual mapping.
// Each muscle has an id (string), a human-readable name, and metadata for grouping and visual anchors.

const MUSCLES = [
  { id: 'pectoralis_major', name: 'Pectoralis Major', group: 'chest', side: 'both', region: 'front', defaultAnchor: { x: 0.45, y: 0.35 } },
  { id: 'pectoralis_minor', name: 'Pectoralis Minor', group: 'chest', side: 'both', region: 'front', defaultAnchor: { x: 0.45, y: 0.4 } },
  { id: 'triceps_brachii', name: 'Triceps Brachii', group: 'arms', side: 'both', region: 'back', defaultAnchor: { x: 0.6, y: 0.4 } },
  { id: 'anterior_deltoid', name: 'Anterior Deltoid', group: 'shoulder', side: 'both', region: 'front', defaultAnchor: { x: 0.45, y: 0.25 } },
  { id: 'biceps_brachii', name: 'Biceps Brachii', group: 'arms', side: 'both', region: 'front', defaultAnchor: { x: 0.45, y: 0.4 } },
  { id: 'quadriceps', name: 'Quadriceps', group: 'legs', side: 'both', region: 'front', defaultAnchor: { x: 0.5, y: 0.7 } },
  { id: 'gluteus_maximus', name: 'Gluteus Maximus', group: 'glutes', side: 'both', region: 'back', defaultAnchor: { x: 0.5, y: 0.7 } },
  { id: 'hamstrings', name: 'Hamstrings', group: 'legs', side: 'both', region: 'back', defaultAnchor: { x: 0.5, y: 0.78 } },
  { id: 'latissimus_dorsi', name: 'Latissimus Dorsi', group: 'back', side: 'both', region: 'back', defaultAnchor: { x: 0.4, y: 0.45 } },
  { id: 'trapezius', name: 'Trapezius', group: 'upper_back', side: 'both', region: 'back', defaultAnchor: { x: 0.5, y: 0.2 } },
  // Add more muscles as needed. defaultAnchor are relative coordinates (0..1) on a canonical body image.
];

module.exports = { MUSCLES };
