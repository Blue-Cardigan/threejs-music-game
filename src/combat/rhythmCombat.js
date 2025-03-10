export class RhythmCombat {
  constructor(assets) {
    this.assets = assets;
    
    // Rhythm state
    this.isPlaying = false;
    this.pattern = [];
    this.playerInput = [];
    this.currentNoteIndex = 0;
    this.lastAccuracy = 0;
    
    // New states for enhanced features
    this.isPlayingDemo = false;
    this.isRehearsing = false;
    this.demoTimeout = null;
    
    // Timing variables
    this.bpm = 80; // Beats per minute
    this.beatDuration = 60 / this.bpm; // Duration of one beat in seconds
    this.measureDuration = this.beatDuration * 4; // Duration of a 4/4 measure in seconds
    this.noteWindow = 0.2; // Time window for hitting a note in seconds
    this.startTime = 0;
    this.currentTime = 0;
    
    // UI elements
    this.rhythmContainer = document.getElementById('rhythm-container');
    this.rhythmNotesElement = document.getElementById('rhythm-notes');
    this.instructionsElement = document.getElementById('instructions');
    
    // Create timing indicator
    this.createTimingIndicator();
    
    // Available keys for rhythm patterns
    this.availableKeys = ['z', 'x', 'j', 'k'];
    this.keyColors = {
      'z': '#FF5252', // Red
      'x': '#FFEB3B', // Yellow
      'j': '#4CAF50', // Green
      'k': '#2196F3'  // Blue
    };
    
    // Callback for when combat is complete
    this.onCombatComplete = null;
    
    // Animation frame ID for timing indicator
    this.animationFrameId = null;
  }
  
  createTimingIndicator() {
    // Create timing track
    this.timingTrack = document.createElement('div');
    this.timingTrack.className = 'timing-track';
    this.timingTrack.style.position = 'relative';
    this.timingTrack.style.width = '100%';
    this.timingTrack.style.height = '30px';
    this.timingTrack.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    this.timingTrack.style.borderRadius = '15px';
    this.timingTrack.style.marginTop = '10px';
    this.timingTrack.style.marginBottom = '20px';
    this.timingTrack.style.overflow = 'hidden';
    
    // Create timing indicator
    this.timingIndicator = document.createElement('div');
    this.timingIndicator.className = 'timing-indicator';
    this.timingIndicator.style.position = 'absolute';
    this.timingIndicator.style.width = '10px';
    this.timingIndicator.style.height = '100%';
    this.timingIndicator.style.backgroundColor = 'white';
    this.timingIndicator.style.borderRadius = '5px';
    this.timingIndicator.style.left = '0';
    this.timingIndicator.style.transform = 'translateX(-50%)';
    
    // Add timing indicator to track
    this.timingTrack.appendChild(this.timingIndicator);
    
    // Add measure markers (4 beats per measure)
    for (let i = 0; i <= 4; i++) {
      const marker = document.createElement('div');
      marker.className = 'beat-marker';
      marker.style.position = 'absolute';
      marker.style.width = '2px';
      marker.style.height = '100%';
      marker.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
      marker.style.left = `${i * 25}%`;
      this.timingTrack.appendChild(marker);
    }
    
    // Add to rhythm container (before the notes)
    this.rhythmContainer.insertBefore(this.timingTrack, this.rhythmNotesElement);
  }
  
  generatePattern(difficulty) {
    // Clear existing pattern
    this.pattern = [];
    
    // Determine number of measures based on difficulty
    const numMeasures = Math.min(2, Math.max(1, Math.floor(difficulty / 2)));
    
    // Generate a 4/4 rhythm pattern with possible rests
    for (let measure = 0; measure < numMeasures; measure++) {
      // Decide on rhythm complexity based on difficulty
      let rhythmType;
      const complexityRoll = Math.random();
      
      if (difficulty <= 2) {
        // Simpler rhythms for lower difficulties
        if (complexityRoll < 0.7) {
          rhythmType = 'quarter'; // Quarter notes (4 per measure)
        } else {
          rhythmType = 'eighth'; // Eighth notes (8 per measure)
        }
      } else if (difficulty <= 4) {
        // Medium complexity
        if (complexityRoll < 0.3) {
          rhythmType = 'quarter';
        } else if (complexityRoll < 0.7) {
          rhythmType = 'eighth';
        } else {
          rhythmType = 'mixed'; // Mix of quarter and eighth notes
        }
      } else {
        // Higher complexity
        if (complexityRoll < 0.2) {
          rhythmType = 'eighth';
        } else if (complexityRoll < 0.6) {
          rhythmType = 'mixed';
        } else {
          rhythmType = 'syncopated'; // Syncopated rhythms with rests
        }
      }
      
      // Generate notes based on rhythm type
      switch (rhythmType) {
        case 'quarter':
          this.generateQuarterNotePattern(measure);
          break;
        case 'eighth':
          this.generateEighthNotePattern(measure);
          break;
        case 'mixed':
          this.generateMixedNotePattern(measure);
          break;
        case 'syncopated':
          this.generateSyncopatedPattern(measure);
          break;
      }
    }
    
    // Display pattern
    this.displayPattern();
  }
  
  generateQuarterNotePattern(measure) {
    // 4 quarter notes per measure
    for (let beat = 0; beat < 4; beat++) {
      // Randomly decide if this beat is a note or a rest
      if (Math.random() < 0.8) { // 80% chance of a note, 20% chance of a rest
        const key = this.availableKeys[Math.floor(Math.random() * this.availableKeys.length)];
        this.pattern.push({
          key: key,
          timing: (measure * this.measureDuration) + (beat * this.beatDuration),
          duration: 'quarter',
          position: (measure * 4) + beat // Position in the visual grid
        });
      }
    }
  }
  
  generateEighthNotePattern(measure) {
    // 8 eighth notes per measure
    for (let eighthNote = 0; eighthNote < 8; eighthNote++) {
      // Randomly decide if this eighth note is a note or a rest
      if (Math.random() < 0.7) { // 70% chance of a note, 30% chance of a rest
        const key = this.availableKeys[Math.floor(Math.random() * this.availableKeys.length)];
        this.pattern.push({
          key: key,
          timing: (measure * this.measureDuration) + (eighthNote * this.beatDuration / 2),
          duration: 'eighth',
          position: (measure * 8) + eighthNote // Position in the visual grid
        });
      }
    }
  }
  
  generateMixedNotePattern(measure) {
    // Mix of quarter and eighth notes
    let position = 0;
    while (position < 4) { // 4 beats per measure
      // Decide if we place a quarter note or eighth notes
      if (Math.random() < 0.5) {
        // Quarter note
        if (Math.random() < 0.8) { // 80% chance of a note, 20% chance of a rest
          const key = this.availableKeys[Math.floor(Math.random() * this.availableKeys.length)];
          this.pattern.push({
            key: key,
            timing: (measure * this.measureDuration) + (position * this.beatDuration),
            duration: 'quarter',
            position: (measure * 4) + position
          });
        }
        position += 1;
      } else {
        // Two eighth notes
        for (let i = 0; i < 2; i++) {
          if (Math.random() < 0.7) { // 70% chance of a note, 30% chance of a rest
            const key = this.availableKeys[Math.floor(Math.random() * this.availableKeys.length)];
            this.pattern.push({
              key: key,
              timing: (measure * this.measureDuration) + (position * this.beatDuration),
              duration: 'eighth',
              position: (measure * 4) + position
            });
          }
          position += 0.5;
        }
      }
    }
  }
  
  generateSyncopatedPattern(measure) {
    // Syncopated pattern with rests in unexpected places
    // Start with a basic eighth note pattern
    const possiblePositions = [];
    for (let eighthNote = 0; eighthNote < 8; eighthNote++) {
      possiblePositions.push(eighthNote);
    }
    
    // Shuffle the positions to create syncopation
    this.shuffleArray(possiblePositions);
    
    // Use about 5-6 notes per measure
    const numNotes = 5 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numNotes; i++) {
      const eighthNote = possiblePositions[i];
      const key = this.availableKeys[Math.floor(Math.random() * this.availableKeys.length)];
      this.pattern.push({
        key: key,
        timing: (measure * this.measureDuration) + (eighthNote * this.beatDuration / 2),
        duration: 'eighth',
        position: (measure * 8) + eighthNote
      });
    }
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  displayPattern() {
    // Clear existing notes
    this.rhythmNotesElement.innerHTML = '';
    
    // Sort pattern by timing
    this.pattern.sort((a, b) => a.timing - b.timing);
    
    // Create a container for the rhythm grid
    const gridContainer = document.createElement('div');
    gridContainer.className = 'rhythm-grid';
    gridContainer.style.display = 'flex';
    gridContainer.style.flexDirection = 'row';
    gridContainer.style.justifyContent = 'space-between';
    gridContainer.style.width = '100%';
    gridContainer.style.height = '80px';
    gridContainer.style.position = 'relative';
    
    // Calculate the total number of positions needed
    const totalMeasures = Math.ceil(this.pattern[this.pattern.length - 1].timing / this.measureDuration) + 1;
    const totalPositions = totalMeasures * 8; // 8 eighth-note positions per measure
    
    // Create grid cells for each eighth note position
    for (let i = 0; i < totalPositions; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.width = `${100 / totalPositions}%`;
      cell.style.height = '100%';
      cell.style.position = 'relative';
      cell.style.borderRight = (i % 8 === 7) ? '2px solid rgba(255, 255, 255, 0.5)' : 'none';
      
      // Add beat markers
      if (i % 2 === 0) {
        const beatMarker = document.createElement('div');
        beatMarker.className = 'beat-marker';
        beatMarker.style.position = 'absolute';
        beatMarker.style.bottom = '0';
        beatMarker.style.left = '50%';
        beatMarker.style.transform = 'translateX(-50%)';
        beatMarker.style.width = '1px';
        beatMarker.style.height = '10px';
        beatMarker.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        cell.appendChild(beatMarker);
      }
      
      gridContainer.appendChild(cell);
    }
    
    // Add notes to the grid
    this.pattern.forEach(note => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note';
      noteElement.textContent = note.key.toUpperCase();
      noteElement.style.backgroundColor = this.keyColors[note.key];
      noteElement.style.position = 'absolute';
      
      // Calculate position based on timing
      const measureIndex = Math.floor(note.timing / this.measureDuration);
      const beatPosition = (note.timing % this.measureDuration) / this.beatDuration;
      const position = (measureIndex * 8) + (beatPosition * 2); // Convert to eighth-note positions
      
      // Set position and size
      noteElement.style.left = `${(position / totalPositions) * 100}%`;
      noteElement.style.transform = 'translateX(-50%)';
      noteElement.style.width = '40px';
      noteElement.style.height = '40px';
      noteElement.style.borderRadius = '50%';
      noteElement.style.display = 'flex';
      noteElement.style.justifyContent = 'center';
      noteElement.style.alignItems = 'center';
      noteElement.style.fontWeight = 'bold';
      noteElement.style.fontSize = '18px';
      noteElement.style.zIndex = '2';
      
      gridContainer.appendChild(noteElement);
    });
    
    // Add grid container to the rhythm notes element
    this.rhythmNotesElement.appendChild(gridContainer);
    
    // Update instructions
    this.instructionsElement.textContent = "Press H to hear the pattern, SPACE to rehearse, or ENTER to start";
  }
  
  startRhythm() {
    // End rehearsal if active
    if (this.isRehearsing) {
      this.endRehearsal();
    }
    
    // Reset state
    this.isPlaying = true;
    this.playerInput = [];
    this.currentNoteIndex = 0;
    this.startTime = performance.now() / 1000; // Convert to seconds
    this.currentTime = this.startTime;
    
    // Update instructions
    this.instructionsElement.textContent = "Play the rhythm using Z, X, J, K keys!";
    
    // Start animation for timing indicator
    this.animateTimingIndicator();
    
    // Start timer for auto-completion
    const totalDuration = this.pattern.length > 0 
      ? this.pattern[this.pattern.length - 1].timing + 2 // Add 2 seconds after the last note
      : 4; // Default to 4 seconds if no pattern
      
    this.rhythmTimeout = setTimeout(() => {
      this.completeRhythm();
    }, totalDuration * 1000);
  }
  
  animateTimingIndicator() {
    const animate = () => {
      // Calculate elapsed time in seconds
      this.currentTime = performance.now() / 1000;
      const elapsedTime = this.currentTime - this.startTime;
      
      // Calculate position based on elapsed time
      const totalWidth = this.timingTrack.offsetWidth;
      const totalDuration = this.pattern.length > 0 
        ? this.pattern[this.pattern.length - 1].timing + 2 // Add 2 seconds after the last note
        : 4; // Default to 4 seconds if no pattern
      
      const position = (elapsedTime / totalDuration) * totalWidth;
      
      // Update indicator position
      this.timingIndicator.style.left = `${position}px`;
      
      // Check if we've reached a new note
      if (this.currentNoteIndex < this.pattern.length) {
        const currentNote = this.pattern[this.currentNoteIndex];
        if (elapsedTime >= currentNote.timing) {
          this.highlightCurrentNote();
          
          // If in demo mode, play the sound
          if (this.isPlayingDemo) {
            const soundIndex = this.availableKeys.indexOf(currentNote.key);
            if (soundIndex >= 0 && soundIndex < this.assets.audio.drum.length) {
              this.assets.audio.drum[soundIndex].play();
            }
          }
          
          this.currentNoteIndex++;
        }
      }
      
      // Continue animation if still playing
      if (this.isPlaying || this.isPlayingDemo) {
        this.animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  highlightCurrentNote() {
    // Get all note elements
    const noteElements = this.rhythmNotesElement.querySelectorAll('.note');
    
    // Remove highlight from all notes
    noteElements.forEach(note => {
      note.style.border = 'none';
    });
    
    // Highlight current note if within pattern
    if (this.currentNoteIndex < this.pattern.length && this.currentNoteIndex < noteElements.length) {
      noteElements[this.currentNoteIndex].style.border = '3px solid white';
    }
  }
  
  pressKey(key) {
    // Handle rehearsal mode
    if (this.isRehearsing) {
      // Play drum sound
      const soundIndex = this.availableKeys.indexOf(key);
      if (soundIndex >= 0 && soundIndex < this.assets.audio.drum.length) {
        this.assets.audio.drum[soundIndex].play();
      }
      return;
    }
    
    if (!this.isPlaying) return;
    
    // Get current time in seconds
    const currentTime = performance.now() / 1000;
    const elapsedTime = currentTime - this.startTime;
    
    // Find the closest expected note
    let closestNote = null;
    let closestDistance = Infinity;
    
    for (let i = 0; i < this.pattern.length; i++) {
      const note = this.pattern[i];
      const timingDifference = Math.abs(elapsedTime - note.timing);
      
      // Only consider notes that haven't been hit yet and are within the timing window
      if (timingDifference < this.noteWindow && timingDifference < closestDistance) {
        closestNote = note;
        closestDistance = timingDifference;
      }
    }
    
    if (!closestNote) return; // No valid note to hit
    
    // Check if key press matches the expected key
    const isCorrectKey = key === closestNote.key;
    
    // Calculate accuracy (0 to 1)
    const accuracy = isCorrectKey ? 
      Math.max(0, 1 - (closestDistance / this.noteWindow)) : 0;
    
    // Record input
    this.playerInput.push({
      key: key,
      timing: elapsedTime,
      expectedKey: closestNote.key,
      expectedTiming: closestNote.timing,
      accuracy: accuracy
    });
    
    // Play drum sound
    const soundIndex = this.availableKeys.indexOf(key);
    if (soundIndex >= 0 && soundIndex < this.assets.audio.drum.length) {
      this.assets.audio.drum[soundIndex].play();
    }
    
    // Visual feedback
    if (isCorrectKey) {
      // Find the note element
      const noteElements = this.rhythmNotesElement.querySelectorAll('.note');
      const noteIndex = this.pattern.indexOf(closestNote);
      
      if (noteIndex >= 0 && noteIndex < noteElements.length) {
        const noteElement = noteElements[noteIndex];
        
        // Add hit effect
        noteElement.style.border = '3px solid white';
        noteElement.style.boxShadow = '0 0 10px white';
        
        // Remove effect after a short time
        setTimeout(() => {
          noteElement.style.border = 'none';
          noteElement.style.boxShadow = 'none';
        }, 200);
      }
    }
  }
  
  completeRhythm() {
    // Clear timeout and animation
    if (this.rhythmTimeout) {
      clearTimeout(this.rhythmTimeout);
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // If in rehearsal mode, just end rehearsal without calculating accuracy
    if (this.isRehearsing) {
      this.endRehearsal();
      return;
    }
    
    // Calculate overall accuracy
    let totalAccuracy = 0;
    let notesHit = 0;
    
    // If player didn't input anything, accuracy is 0
    if (this.playerInput.length === 0) {
      this.lastAccuracy = 0;
    } else {
      // Create a copy of the pattern to track which notes were hit
      const patternCopy = [...this.pattern];
      
      // For each input, find the closest matching note
      this.playerInput.forEach(input => {
        // Find the closest note that matches the input key
        let bestMatchIndex = -1;
        let bestMatchDistance = Infinity;
        
        for (let i = 0; i < patternCopy.length; i++) {
          if (patternCopy[i].key === input.expectedKey) {
            const distance = Math.abs(input.timing - patternCopy[i].timing);
            if (distance < this.noteWindow && distance < bestMatchDistance) {
              bestMatchIndex = i;
              bestMatchDistance = distance;
            }
          }
        }
        
        // If we found a match, add its accuracy and remove it from the copy
        if (bestMatchIndex !== -1) {
          const accuracy = Math.max(0, 1 - (bestMatchDistance / this.noteWindow));
          totalAccuracy += accuracy;
          notesHit++;
          
          // Remove the note so it can't be matched again
          patternCopy.splice(bestMatchIndex, 1);
        }
      });
      
      // Calculate average accuracy based on notes hit vs total notes
      this.lastAccuracy = notesHit > 0 ? totalAccuracy / this.pattern.length : 0;
    }
    
    // Reset state
    this.isPlaying = false;
    
    // Reset timing indicator
    this.timingIndicator.style.left = '0';
    
    // Call combat complete callback
    if (this.onCombatComplete) {
      this.onCombatComplete({
        accuracy: this.lastAccuracy,
        inputs: this.playerInput.length,
        expected: this.pattern.length,
        notesHit: notesHit
      });
    }
  }
  
  // New method to play the pattern once for the player to hear
  playPatternDemo() {
    if (this.isPlaying || this.isPlayingDemo) return;
    
    this.isPlayingDemo = true;
    this.currentNoteIndex = 0;
    this.startTime = performance.now() / 1000;
    this.currentTime = this.startTime;
    
    // Update instructions
    this.instructionsElement.textContent = "Listen to the pattern...";
    
    // Start animation for timing indicator
    this.animateTimingIndicator();
    
    // End the demo after the last note plus a small buffer
    const totalDuration = this.pattern.length > 0 
      ? this.pattern[this.pattern.length - 1].timing - this.startTime + 1 // Add 1 second after the last note
      : 4; // Default to 4 seconds if no pattern
      
    this.demoTimeout = setTimeout(() => {
      this.endPatternDemo();
    }, totalDuration * 1000);
  }
  
  // End the pattern demo
  endPatternDemo() {
    // Clear timeout and animation
    if (this.demoTimeout) {
      clearTimeout(this.demoTimeout);
      this.demoTimeout = null;
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Reset state
    this.isPlayingDemo = false;
    
    // Reset timing indicator
    this.timingIndicator.style.left = '0';
    
    // Update instructions
    this.instructionsElement.textContent = "Press SPACE to rehearse, or ENTER to start the challenge";
  }
  
  // Start rehearsal mode
  startRehearsal() {
    if (this.isPlaying || this.isPlayingDemo) return;
    
    this.isRehearsing = true;
    this.playerInput = [];
    
    // Update instructions
    this.instructionsElement.textContent = "Rehearsal mode: Practice the pattern (no scoring). Press ENTER when ready.";
  }
  
  // End rehearsal mode
  endRehearsal() {
    this.isRehearsing = false;
    this.playerInput = [];
    
    // Update instructions
    this.instructionsElement.textContent = "Press SPACE to rehearse, or ENTER to start the challenge";
  }
} 