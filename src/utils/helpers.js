import * as THREE from 'three';

/**
 * Check if the device is mobile
 * @returns {boolean} True if the device is mobile
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Generate a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number between min and max
 */
export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate the distance between two points
 * @param {THREE.Vector3} point1 - First point
 * @param {THREE.Vector3} point2 - Second point
 * @returns {number} Distance between the points
 */
export function distance(point1, point2) {
  return point1.distanceTo(point2);
}

/**
 * Create a speech bubble mesh
 * @param {string} text - Text to display
 * @param {number} width - Width of the bubble
 * @param {number} height - Height of the bubble
 * @param {number} radius - Corner radius
 * @param {THREE.Color} color - Color of the bubble
 * @returns {THREE.Mesh} Speech bubble mesh
 */
export function createSpeechBubble(text, width = 2, height = 1, radius = 0.2, color = 0xffffff) {
  // Create a rounded rectangle shape for the bubble
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
  
  // Add a little triangle at the bottom for the speech pointer
  shape.moveTo(x + width / 2 - 0.2, y);
  shape.lineTo(x + width / 2, y - 0.3);
  shape.lineTo(x + width / 2 + 0.2, y);
  
  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
  const bubble = new THREE.Mesh(geometry, material);
  
  // Create text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 128;
  
  context.fillStyle = '#000000';
  context.font = '24px Arial';
  context.textAlign = 'center';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const textTexture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  const textGeometry = new THREE.PlaneGeometry(width * 0.9, height * 0.7);
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.z = 0.01;
  
  // Group the bubble and text
  const group = new THREE.Group();
  group.add(bubble);
  group.add(textMesh);
  
  return group;
}

/**
 * Generate a rhythm pattern based on difficulty
 * @param {number} difficulty - Difficulty level (1-10)
 * @param {number} measures - Number of measures
 * @returns {Array} Array of note objects with lane and time properties
 */
export function generateRhythm(difficulty, measures = 2) {
  const notes = [];
  const beatsPerMeasure = 4; // 4/4 time signature
  const totalBeats = measures * beatsPerMeasure;
  
  // Define common rhythmic patterns (in 16th notes, 4 per beat)
  const rhythmPatterns = {
    // Basic patterns (difficulty 1-3)
    basic: [
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Quarter notes
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], // Quarter, eighth, quarter
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0]  // Eighth notes, then quarters
    ],
    // Intermediate patterns (difficulty 4-6)
    intermediate: [
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0], // Syncopated eighths
      [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0], // Dotted eighths
      [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0]  // Mixed eighths and sixteenths
    ],
    // Advanced patterns (difficulty 7-10)
    advanced: [
      [1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0], // Complex syncopation
      [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0], // Sixteenth note runs
      [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1]  // Varied syncopation
    ]
  };
  
  // Select pattern category based on difficulty
  let patternCategory;
  if (difficulty <= 3) {
    patternCategory = rhythmPatterns.basic;
  } else if (difficulty <= 6) {
    patternCategory = rhythmPatterns.intermediate;
  } else {
    patternCategory = rhythmPatterns.advanced;
  }
  
  // Generate a sequence of patterns for the entire rhythm
  const patternSequence = [];
  for (let m = 0; m < measures; m++) {
    // Choose a pattern from the category, with some variation as difficulty increases
    let patternIndex;
    if (Math.random() < 0.3 && difficulty > 3) {
      // Occasionally use a pattern from a different category for variety
      const allPatterns = [...rhythmPatterns.basic, ...rhythmPatterns.intermediate, ...rhythmPatterns.advanced];
      patternIndex = Math.floor(Math.random() * allPatterns.length);
      patternSequence.push(allPatterns[patternIndex]);
    } else {
      patternIndex = Math.floor(Math.random() * patternCategory.length);
      patternSequence.push(patternCategory[patternIndex]);
    }
  }
  
  // Create notes from the pattern sequence
  for (let m = 0; m < measures; m++) {
    const pattern = patternSequence[m];
    
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === 1) {
        // Convert 16th note position to beat time
        const time = m * beatsPerMeasure + (i / 4);
        
        // Determine lane assignment strategy based on difficulty
        let lane;
        
        if (difficulty <= 3) {
          // Easier difficulties: more predictable lane patterns
          lane = Math.floor(i / 4) % 4; // Cycle through lanes in order
        } else if (difficulty <= 6) {
          // Medium difficulties: some randomness but with musical patterns
          // Create melodic-like patterns that move up and down
          const patternPosition = i % 8;
          if (patternPosition < 4) {
            lane = patternPosition; // Ascending pattern
          } else {
            lane = 7 - patternPosition; // Descending pattern
          }
        } else {
          // Harder difficulties: more random but with some constraints
          // Avoid having too many consecutive notes in the same lane
          const previousNote = notes.length > 0 ? notes[notes.length - 1] : null;
          
          if (previousNote && Math.random() < 0.7) {
            // 70% chance to avoid the same lane as the previous note
            let newLane;
            do {
              newLane = Math.floor(Math.random() * 4);
            } while (newLane === previousNote.lane);
            lane = newLane;
          } else {
            lane = Math.floor(Math.random() * 4);
          }
        }
        
        notes.push({ lane, time });
      }
    }
  }
  
  // Add difficulty-based variations
  if (difficulty > 5) {
    // Add occasional "double notes" (two lanes at once) for higher difficulties
    const doubleNoteCount = Math.floor(difficulty / 3);
    
    for (let i = 0; i < doubleNoteCount; i++) {
      if (notes.length > 4) {
        // Pick a random note (not at the beginning)
        const noteIndex = 2 + Math.floor(Math.random() * (notes.length - 4));
        const originalNote = notes[noteIndex];
        
        // Add a note in a different lane at the same time
        let secondLane;
        do {
          secondLane = Math.floor(Math.random() * 4);
        } while (secondLane === originalNote.lane);
        
        notes.push({
          lane: secondLane,
          time: originalNote.time
        });
      }
    }
  }
  
  // Ensure we don't have too many notes for the highest difficulties
  if (difficulty >= 8 && notes.length > totalBeats * 2.5) {
    // Randomly remove some notes to prevent overwhelming the player
    const targetCount = Math.floor(totalBeats * 2.5);
    while (notes.length > targetCount) {
      const indexToRemove = Math.floor(Math.random() * notes.length);
      notes.splice(indexToRemove, 1);
    }
  }
  
  // Sort by time
  return notes.sort((a, b) => a.time - b.time);
}

/**
 * Calculate score based on timing accuracy
 * @param {number} timeDifference - Difference between expected and actual hit time (in seconds)
 * @returns {object} Score object with points and rating
 */
export function calculateScore(timeDifference) {
  const absDiff = Math.abs(timeDifference);
  
  if (absDiff < 0.05) {
    return { points: 100, rating: 'Perfect', damage: 20 };
  } else if (absDiff < 0.1) {
    return { points: 75, rating: 'Good', damage: 15 };
  } else if (absDiff < 0.2) {
    return { points: 50, rating: 'OK', damage: 10 };
  } else {
    return { points: 0, rating: 'Miss', damage: 0 };
  }
} 