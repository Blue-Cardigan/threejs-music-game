export class RhythmCombat {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.container = document.getElementById('rhythm-container');
    this.notes = [];
    this.activeNotes = [];
    this.bpm = 60; // Beats per minute
    this.beatDuration = 60 / this.bpm; // Duration of one beat in seconds
    this.timeSignature = 4; // 4/4 time signature
    this.measureDuration = this.beatDuration * this.timeSignature; // Duration of one measure in seconds
    this.noteSpeed = 300; // Pixels per second
    this.hitLinePosition = 100; // X position of the hit line
    this.hitWindow = 0.15; // Time window for hitting notes (in seconds)
    this.perfectWindow = 0.05; // Time window for perfect hits (in seconds)
    this.goodWindow = 0.10; // Time window for good hits (between perfect and okay)
    this.currentTime = 0;
    this.nextBeatTime = 0;
    this.metronomeCount = 0;
    this.isActive = false;
    this.rhythmCompleted = false;
    this.totalNotes = 0;
    this.hitNotes = 0;
    this.missedNotes = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.okayHits = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.currentLevel = 1;
    this.noteColors = {
      'z': '#FF0000', // Kick - Red
      'x': '#00FF00', // Snare - Green
      'j': '#0000FF', // Tom - Blue
      'k': '#FFFF00'  // Tambourine - Yellow
    };
    this.keyToSound = {
      'z': 'kick',
      'x': 'snare',
      'j': 'tom',
      'k': 'tambourine'
    };
    
    // Create visual feedback elements
    this.feedbackElement = document.createElement('div');
    this.feedbackElement.id = 'rhythm-feedback';
    this.feedbackElement.style.position = 'absolute';
    this.feedbackElement.style.top = '10px';
    this.feedbackElement.style.left = '50%';
    this.feedbackElement.style.transform = 'translateX(-50%)';
    this.feedbackElement.style.fontSize = '24px';
    this.feedbackElement.style.fontWeight = 'bold';
    this.feedbackElement.style.color = 'white';
    this.feedbackElement.style.textShadow = '0 0 5px black';
    this.feedbackElement.style.opacity = '0';
    this.feedbackElement.style.transition = 'opacity 0.3s';
    this.container.appendChild(this.feedbackElement);
    
    // Create combo counter
    this.comboElement = document.createElement('div');
    this.comboElement.id = 'combo-counter';
    this.comboElement.style.position = 'absolute';
    this.comboElement.style.bottom = '10px';
    this.comboElement.style.right = '20px';
    this.comboElement.style.fontSize = '20px';
    this.comboElement.style.fontWeight = 'bold';
    this.comboElement.style.color = 'white';
    this.comboElement.style.textShadow = '0 0 5px black';
    this.container.appendChild(this.comboElement);
    
    // Create beat indicator
    this.beatIndicator = document.createElement('div');
    this.beatIndicator.id = 'beat-indicator';
    this.beatIndicator.style.position = 'absolute';
    this.beatIndicator.style.top = '5px';
    this.beatIndicator.style.left = '5px';
    this.beatIndicator.style.width = '15px';
    this.beatIndicator.style.height = '15px';
    this.beatIndicator.style.borderRadius = '50%';
    this.beatIndicator.style.backgroundColor = 'white';
    this.beatIndicator.style.opacity = '0.5';
    this.container.appendChild(this.beatIndicator);
    
    // Create progress bar
    this.progressContainer = document.createElement('div');
    this.progressContainer.style.position = 'absolute';
    this.progressContainer.style.top = '-10px';
    this.progressContainer.style.left = '0';
    this.progressContainer.style.width = '100%';
    this.progressContainer.style.height = '5px';
    this.progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    this.container.appendChild(this.progressContainer);
    
    this.progressBar = document.createElement('div');
    this.progressBar.style.height = '100%';
    this.progressBar.style.width = '0%';
    this.progressBar.style.backgroundColor = '#00FFFF';
    this.progressContainer.appendChild(this.progressBar);
    
    // Create key indicators with animations
    this.keyIndicators = {};
    const lanes = ['z', 'x', 'j', 'k'];
    lanes.forEach((key, index) => {
      const indicator = document.querySelector(`.note-lane:nth-child(${index + 1}) .key-indicator`);
      if (indicator) {
        this.keyIndicators[key] = indicator;
      }
    });
    
    // Create rhythmic patterns for different levels
    this.rhythmPatterns = this.createRhythmPatterns();
  }

  createRhythmPatterns() {
    // Create predefined rhythm patterns for more musical and realistic rhythms
    return {
      // Level 1: Simple patterns with quarter notes
      1: [
        // Basic 4/4 pattern with kick on 1 and 3, snare on 2 and 4
        [
          { key: 'z', beat: 0 },
          { key: 'x', beat: 1 },
          { key: 'z', beat: 2 },
          { key: 'x', beat: 3 }
        ],
        // Simple alternating pattern
        [
          { key: 'z', beat: 0 },
          { key: 'j', beat: 1 },
          { key: 'x', beat: 2 },
          { key: 'k', beat: 3 }
        ]
      ],
      
      // Level 2: Eighth note patterns
      2: [
        // Basic rock beat with eighth notes
        [
          { key: 'z', beat: 0 },
          { key: 'k', beat: 0.5 },
          { key: 'x', beat: 1 },
          { key: 'k', beat: 1.5 },
          { key: 'z', beat: 2 },
          { key: 'k', beat: 2.5 },
          { key: 'x', beat: 3 },
          { key: 'k', beat: 3.5 }
        ],
        // Syncopated pattern
        [
          { key: 'z', beat: 0 },
          { key: 'x', beat: 1 },
          { key: 'j', beat: 1.5 },
          { key: 'z', beat: 2 },
          { key: 'k', beat: 2.5 },
          { key: 'x', beat: 3 },
          { key: 'j', beat: 3.5 }
        ]
      ],
      
      // Level 3: Sixteenth note patterns
      3: [
        [
          { key: 'z', beat: 0 },
          { key: 'x', beat: 1 },
          { key: 'j', beat: 1.5 },
          { key: 'z', beat: 2 },
          { key: 'k', beat: 2.5 },
          { key: 'x', beat: 3 },
          { key: 'j', beat: 3.5 }
        ]
        // Funk-inspired pattern
        // [
        //   { key: 'z', beat: 0 },
        //   { key: 'k', beat: 0.5 },
        //   { key: 'x', beat: 1 },
        //   { key: 'j', beat: 1.25 },
        //   { key: 'k', beat: 1.5 },
        //   { key: 'z', beat: 2 },
        //   { key: 'k', beat: 2.5 },
        //   { key: 'x', beat: 3 },
        //   { key: 'j', beat: 3.25 },
        //   { key: 'k', beat: 3.5 },
        //   { key: 'j', beat: 3.75 }
        // ],
        // Complex pattern with sixteenth notes
        // [
        //   { key: 'z', beat: 0 },
        //   { key: 'j', beat: 0.25 },
        //   { key: 'k', beat: 0.5 },
        //   { key: 'j', beat: 0.75 },
        //   { key: 'x', beat: 1 },
        //   { key: 'k', beat: 1.5 },
        //   { key: 'z', beat: 2 },
        //   { key: 'j', beat: 2.25 },
        //   { key: 'k', beat: 2.5 },
        //   { key: 'j', beat: 2.75 },
        //   { key: 'x', beat: 3 },
        //   { key: 'k', beat: 3.5 }
        // ]
      ]
    };
  }

  startCombat(level) {
    this.isActive = true;
    this.rhythmCompleted = false;
    this.currentLevel = level;
    this.totalNotes = 0;
    this.hitNotes = 0;
    this.missedNotes = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.okayHits = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.currentTime = 0;
    this.nextBeatTime = 0;
    this.metronomeCount = 0;
    this.notes = [];
    this.activeNotes = [];
    this.countdownActive = true; // Add flag to track countdown state
    
    // Clear any existing notes from the container
    const existingNotes = this.container.querySelectorAll('.note');
    existingNotes.forEach(note => note.remove());
    
    // Reset UI elements
    this.feedbackElement.style.opacity = '0';
    this.comboElement.textContent = '';
    this.progressBar.style.width = '0%';
    
    // Generate rhythm pattern based on level
    this.generateRhythm(level);
    
    // Add intro countdown
    this.showCountdown();
    
    // Don't start metronome until countdown is complete
    // The metronome will be started in the showCountdown method
  }

  showCountdown() {
    const countdown = document.createElement('div');
    countdown.style.position = 'absolute';
    countdown.style.top = '50%';
    countdown.style.left = '50%';
    countdown.style.transform = 'translate(-50%, -50%)';
    countdown.style.fontSize = '72px';
    countdown.style.fontWeight = 'bold';
    countdown.style.color = 'white';
    countdown.style.textShadow = '0 0 10px black';
    countdown.style.zIndex = '10';
    this.container.appendChild(countdown);
    
    // Hide all notes during countdown
    this.notes.forEach(note => {
      if (note.element) {
        note.element.style.visibility = 'hidden';
      }
    });
    
    let count = 4;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdown.textContent = count;
        this.audioManager.playSound('metronome');
      } else {
        countdown.textContent = 'GO!';
        
        // When countdown finishes, reset the game time and start the rhythm
        setTimeout(() => {
          countdown.remove();
          this.countdownActive = false;
          
          // Reset time values to ensure notes start from the beginning
          this.currentTime = 0;
          this.nextBeatTime = 0;
          
          // Show all notes
          this.notes.forEach(note => {
            if (note.element) {
              note.element.style.visibility = 'visible';
            }
          });
          
          // Start metronome
          this.audioManager.playSound('metronome');
        }, 500);
        
        clearInterval(countdownInterval);
      }
    }, 500);
  }

  endCombat() {
    this.isActive = false;
    
    // Clear any existing notes from the container
    const existingNotes = this.container.querySelectorAll('.note');
    existingNotes.forEach(note => note.remove());
    
    // Reset UI elements
    this.feedbackElement.style.opacity = '0';
    this.comboElement.textContent = '';
    this.progressBar.style.width = '0%';
    
    this.notes = [];
    this.activeNotes = [];
    
    // Show combat results
    this.showCombatResults();
  }

  showCombatResults() {
    const resultsElement = document.createElement('div');
    resultsElement.style.position = 'absolute';
    resultsElement.style.top = '50%';
    resultsElement.style.left = '50%';
    resultsElement.style.transform = 'translate(-50%, -50%)';
    resultsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    resultsElement.style.padding = '20px';
    resultsElement.style.borderRadius = '10px';
    resultsElement.style.color = 'white';
    resultsElement.style.textAlign = 'center';
    resultsElement.style.zIndex = '10';
    
    const accuracy = this.totalNotes > 0 ? Math.round((this.hitNotes / this.totalNotes) * 100) : 0;
    
    resultsElement.innerHTML = `
      <h2>Combat Results</h2>
      <p>Accuracy: ${accuracy}%</p>
      <p>Perfect: ${this.perfectHits}</p>
      <p>Good: ${this.goodHits}</p>
      <p>Okay: ${this.okayHits}</p>
      <p>Missed: ${this.missedNotes}</p>
      <p>Max Combo: ${this.maxCombo}</p>
    `;
    
    this.container.appendChild(resultsElement);
    
    setTimeout(() => {
      resultsElement.remove();
    }, 3000);
  }

  generateRhythm(level) {
    // Clear existing notes
    this.notes = [];
    
    // Determine number of measures based on level
    const measures = Math.min(level + 1, 4);
    
    // Use predefined patterns for more musical rhythms
    if (this.rhythmPatterns[level]) {
      const patterns = this.rhythmPatterns[level];
      
      for (let measure = 0; measure < measures; measure++) {
        const measureStartTime = measure * this.measureDuration;
        // Select a random pattern for this measure
        const patternIndex = Math.floor(Math.random() * patterns.length);
        const pattern = patterns[patternIndex];
        
        // Create notes from the pattern
        for (const note of pattern) {
          this.notes.push({
            key: note.key,
            time: measureStartTime + (note.beat * this.beatDuration),
            hit: false,
            missed: false,
            element: null
          });
        }
      }
    } else {
      // Fallback to random generation for higher levels
      // Determine note density based on level
      const notesPerMeasure = Math.min(level * 2, 8);
      
      // Generate notes for each measure
      for (let measure = 0; measure < measures; measure++) {
        const measureStartTime = measure * this.measureDuration;
        
        // Create a set of possible beat positions within the measure
        const possibleBeats = [];
        for (let beat = 0; beat < this.timeSignature; beat++) {
          // Add the main beat
          possibleBeats.push(beat * this.beatDuration);
          
          // For higher levels, add eighth notes
          if (level >= 2) {
            possibleBeats.push(beat * this.beatDuration + this.beatDuration / 2);
          }
          
          // For even higher levels, add sixteenth notes
          if (level >= 3) {
            possibleBeats.push(beat * this.beatDuration + this.beatDuration / 4);
            possibleBeats.push(beat * this.beatDuration + this.beatDuration * 3 / 4);
          }
        }
        
        // Shuffle and select a subset of beats
        const shuffledBeats = this.shuffleArray([...possibleBeats]);
        const selectedBeats = shuffledBeats.slice(0, notesPerMeasure);
        
        // Create notes for the selected beats
        for (const beat of selectedBeats) {
          const keys = Object.keys(this.keyToSound);
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          
          this.notes.push({
            key: randomKey,
            time: measureStartTime + beat,
            hit: false,
            missed: false,
            element: null
          });
        }
      }
    }
    
    // Sort notes by time
    this.notes.sort((a, b) => a.time - b.time);
    
    // Update total notes count
    this.totalNotes = this.notes.length;
    
    // Create HTML elements for each note
    this.createNoteElements();
  }

  createNoteElements() {
    // Get lane heights
    const laneHeight = 30;
    
    // Create elements for each note
    this.notes.forEach((note, index) => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note';
      noteElement.style.backgroundColor = this.noteColors[note.key];
      
      // Add visual enhancements to notes
      noteElement.style.boxShadow = `0 0 10px ${this.noteColors[note.key]}`;
      noteElement.style.border = '1px solid white';
      
      // Determine lane based on key
      let laneIndex;
      switch (note.key) {
        case 'z': laneIndex = 0; break;
        case 'x': laneIndex = 1; break;
        case 'j': laneIndex = 2; break;
        case 'k': laneIndex = 3; break;
      }
      
      // Position note in the correct lane
      noteElement.style.top = (laneIndex * laneHeight) + 'px';
      
      // Initial position is off-screen to the right
      noteElement.style.left = '600px';
      
      // Add to container
      this.container.appendChild(noteElement);
      
      // Store element reference
      note.element = noteElement;
      
      // Add key letter to note for better visibility
      const keyLabel = document.createElement('div');
      keyLabel.style.position = 'absolute';
      keyLabel.style.top = '50%';
      keyLabel.style.left = '50%';
      keyLabel.style.transform = 'translate(-50%, -50%)';
      keyLabel.style.color = 'white';
      keyLabel.style.fontWeight = 'bold';
      keyLabel.style.textShadow = '0 0 2px black';
      keyLabel.textContent = note.key.toUpperCase();
      noteElement.appendChild(keyLabel);
    });
  }

  update(deltaTime) {
    if (!this.isActive) return null;
    
    // Don't update game time or note positions during countdown
    if (this.countdownActive) {
      return null;
    }
    
    // Update current time
    this.currentTime += deltaTime;
    
    // Check if it's time for a metronome tick
    if (this.currentTime >= this.nextBeatTime) {
      this.audioManager.playSound('metronome');
      this.metronomeCount = (this.metronomeCount + 1) % this.timeSignature;
      this.nextBeatTime = this.currentTime + this.beatDuration;
      
      // Visual feedback for beat
      this.beatIndicator.style.opacity = '1';
      this.beatIndicator.style.transform = 'scale(1.5)';
      this.beatIndicator.style.transition = 'opacity 0.1s, transform 0.1s';
      
      setTimeout(() => {
        this.beatIndicator.style.opacity = '0.5';
        this.beatIndicator.style.transform = 'scale(1)';
      }, 100);
    }
    
    // Update note positions
    this.updateNotePositions(deltaTime);
    
    // Check for missed notes
    const result = this.checkMissedNotes();
    
    // Update progress bar
    if (this.totalNotes > 0) {
      const progress = (this.hitNotes + this.missedNotes) / this.totalNotes * 100;
      this.progressBar.style.width = `${progress}%`;
    }
    
    // Check if rhythm is completed
    if (this.isRhythmCompleted() && !this.rhythmCompleted) {
      this.rhythmCompleted = true;
      
      // Calculate damage based on accuracy and combo
      const accuracy = this.hitNotes / this.totalNotes;
      const comboMultiplier = 1 + (this.maxCombo / 20); // Bonus for high combos
      const perfectBonus = this.perfectHits / this.totalNotes * 0.5; // Bonus for perfect hits
      
      let damage = Math.round((accuracy * 50 * this.currentLevel + perfectBonus * 20) * comboMultiplier);
      
      // Return completion result
      return {
        type: 'complete',
        damage: damage,
        accuracy: accuracy,
        maxCombo: this.maxCombo,
        perfectHits: this.perfectHits,
        goodHits: this.goodHits,
        okayHits: this.okayHits,
        missedNotes: this.missedNotes
      };
    }
    
    return result;
  }

  updateNotePositions(deltaTime) {
    // Calculate distance to move notes
    const distance = this.noteSpeed * deltaTime;
    
    // Update position of each note
    this.notes.forEach(note => {
      if (note.element && !note.hit && !note.missed) {
        // Calculate note's current time position
        const noteTimePosition = note.time - this.currentTime;
        
        // Calculate x position based on time
        const xPosition = this.hitLinePosition + (noteTimePosition * this.noteSpeed);
        
        // Update element position
        note.element.style.left = xPosition + 'px';
        
        // Add to active notes if it's approaching the hit line
        if (noteTimePosition <= 1 && !this.activeNotes.includes(note)) {
          this.activeNotes.push(note);
        }
        
        // Add visual effects as notes approach the hit line
        if (noteTimePosition <= 0.5) {
          const proximity = 1 - (Math.abs(noteTimePosition) / 0.5);
          note.element.style.transform = `scale(${1 + proximity * 0.2})`;
          note.element.style.boxShadow = `0 0 ${10 + proximity * 10}px ${this.noteColors[note.key]}`;
        } else {
          note.element.style.transform = 'scale(1)';
        }
      }
    });
    
    // Remove notes that are no longer active
    this.activeNotes = this.activeNotes.filter(note => {
      return !note.hit && !note.missed && note.time - this.currentTime > -1;
    });
  }

  checkMissedNotes() {
    let result = null;
    
    // Check for notes that have passed the hit line
    this.activeNotes.forEach(note => {
      if (!note.hit && !note.missed && note.time + this.hitWindow < this.currentTime) {
        // Mark note as missed
        note.missed = true;
        this.missedNotes++;
        
        // Reset combo
        this.combo = 0;
        this.updateComboDisplay();
        
        // Visual feedback for missed note
        if (note.element) {
          note.element.style.opacity = '0.3';
          note.element.style.transform = 'scale(0.8)';
          note.element.style.filter = 'grayscale(100%)';
          
          // Add X mark for missed note
          const missMarker = document.createElement('div');
          missMarker.textContent = '✗';
          missMarker.style.position = 'absolute';
          missMarker.style.top = '50%';
          missMarker.style.left = '50%';
          missMarker.style.transform = 'translate(-50%, -50%)';
          missMarker.style.color = 'red';
          missMarker.style.fontSize = '24px';
          missMarker.style.fontWeight = 'bold';
          note.element.appendChild(missMarker);
        }
        
        // Show feedback
        this.showFeedback('MISS', '#FF0000');
        
        // Play miss sound
        this.audioManager.playSound('miss');
        
        // Return damage result
        result = {
          type: 'damage',
          amount: 5
        };
      }
    });
    
    return result;
  }

  handleKeyPress(key) {
    // Don't process key presses during countdown
    if (!this.isActive || this.countdownActive) return;
    
    if (!this.isActive) return;
    
    // Visual feedback for key press
    if (this.keyIndicators[key]) {
      this.keyIndicators[key].style.backgroundColor = this.noteColors[key];
      this.keyIndicators[key].style.transform = 'scale(1.2)';
      
      setTimeout(() => {
        this.keyIndicators[key].style.backgroundColor = '#333';
        this.keyIndicators[key].style.transform = 'scale(1)';
      }, 100);
    }
    
    // Find the closest active note for this key
    const matchingNotes = this.activeNotes.filter(note => note.key === key && !note.hit && !note.missed);
    
    if (matchingNotes.length > 0) {
      // Sort by proximity to hit line
      matchingNotes.sort((a, b) => Math.abs(a.time - this.currentTime) - Math.abs(b.time - this.currentTime));
      
      const closestNote = matchingNotes[0];
      const timeDifference = Math.abs(closestNote.time - this.currentTime);
      
      // Check if within hit window
      if (timeDifference <= this.hitWindow) {
        // Mark note as hit
        closestNote.hit = true;
        this.hitNotes++;
        
        // Increment combo
        this.combo++;
        if (this.combo > this.maxCombo) {
          this.maxCombo = this.combo;
        }
        this.updateComboDisplay();
        
        // Play corresponding sound
        this.audioManager.playSound(this.keyToSound[key]);
        
        // Determine hit quality
        let hitQuality = 'okay';
        let hitColor = '#FFFFFF';
        
        if (timeDifference <= this.perfectWindow) {
          hitQuality = 'PERFECT!';
          hitColor = '#FFD700'; // Gold
          this.perfectHits++;
        } else if (timeDifference <= this.goodWindow) {
          hitQuality = 'GOOD!';
          hitColor = '#00FF00'; // Green
          this.goodHits++;
        } else {
          hitQuality = 'OKAY';
          hitColor = '#FFFFFF'; // White
          this.okayHits++;
        }
        
        // Show feedback
        this.showFeedback(hitQuality, hitColor);
        
        // Visual feedback for hit note
        if (closestNote.element) {
          closestNote.element.style.opacity = '0.3';
          
          // Different visual effects based on hit quality
          if (hitQuality === 'PERFECT!') {
            closestNote.element.style.border = '2px solid gold';
            closestNote.element.style.boxShadow = '0 0 20px gold';
            
            // Create star burst effect
            this.createStarBurst(closestNote.element);
          } else if (hitQuality === 'GOOD!') {
            closestNote.element.style.border = '2px solid lime';
            closestNote.element.style.boxShadow = '0 0 15px lime';
          } else {
            closestNote.element.style.border = '1px solid white';
            closestNote.element.style.boxShadow = '0 0 10px white';
          }
          
          // Add check mark for hit note
          const hitMarker = document.createElement('div');
          hitMarker.textContent = '✓';
          hitMarker.style.position = 'absolute';
          hitMarker.style.top = '50%';
          hitMarker.style.left = '50%';
          hitMarker.style.transform = 'translate(-50%, -50%)';
          hitMarker.style.color = hitColor;
          hitMarker.style.fontSize = '24px';
          hitMarker.style.fontWeight = 'bold';
          closestNote.element.appendChild(hitMarker);
        }
        
        // Play hit sound
        this.audioManager.playSound(hitQuality.toLowerCase());
      } else {
        // Wrong timing, play miss sound
        this.audioManager.playSound('miss');
        
        // Reset combo
        this.combo = 0;
        this.updateComboDisplay();
        
        // Show feedback
        this.showFeedback('TOO EARLY!', '#FF0000');
        
        // Return damage result
        return {
          type: 'damage',
          amount: 5
        };
      }
    } else {
      // No matching note, play miss sound
      this.audioManager.playSound('miss');
      
      // Reset combo
      this.combo = 0;
      this.updateComboDisplay();
      
      // Show feedback
      this.showFeedback('WRONG KEY!', '#FF0000');
      
      // Return damage result
      return {
        type: 'damage',
        amount: 5
      };
    }
    
    return null;
  }

  showFeedback(text, color) {
    this.feedbackElement.textContent = text;
    this.feedbackElement.style.color = color;
    this.feedbackElement.style.opacity = '1';
    this.feedbackElement.style.transform = 'translateX(-50%) scale(1.2)';
    
    setTimeout(() => {
      this.feedbackElement.style.opacity = '0';
      this.feedbackElement.style.transform = 'translateX(-50%) scale(1)';
    }, 500);
  }

  updateComboDisplay() {
    if (this.combo > 1) {
      this.comboElement.textContent = `${this.combo}x COMBO`;
      this.comboElement.style.fontSize = `${20 + Math.min(this.combo, 20)}px`;
      this.comboElement.style.color = this.getComboColor(this.combo);
    } else {
      this.comboElement.textContent = '';
    }
  }

  getComboColor(combo) {
    if (combo >= 20) return '#FF00FF'; // Purple for amazing combos
    if (combo >= 15) return '#FFD700'; // Gold for great combos
    if (combo >= 10) return '#FF0000'; // Red for good combos
    if (combo >= 5) return '#00FFFF'; // Cyan for decent combos
    return '#FFFFFF'; // White for small combos
  }

  isRhythmCompleted() {
    // Check if all notes have been either hit or missed
    return this.notes.every(note => note.hit || note.missed);
  }

  shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Add a method to create star burst effect
  createStarBurst(element) {
    const stars = 8;
    for (let i = 0; i < stars; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.width = '2px';
      star.style.height = '10px';
      star.style.backgroundColor = 'gold';
      star.style.top = '50%';
      star.style.left = '50%';
      star.style.transform = `rotate(${(360 / stars) * i}deg) translateY(-20px)`;
      
      // Add animation with keyframes
      const keyframes = `
        @keyframes starBurst {
          0% { transform: rotate(${(360 / stars) * i}deg) translateY(-20px) scale(1); opacity: 1; }
          100% { transform: rotate(${(360 / stars) * i}deg) translateY(-40px) scale(0); opacity: 0; }
        }
      `;
      
      const style = document.createElement('style');
      style.innerHTML = keyframes;
      document.head.appendChild(style);
      
      star.style.animation = 'starBurst 0.5s ease-out forwards';
      element.appendChild(star);
    }
  }
} 