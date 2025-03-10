import { generateRhythm, calculateScore } from '../utils/helpers.js';

export class RhythmGame {
  constructor(audioManager, difficulty = 1, player) {
    this.audioManager = audioManager;
    this.difficulty = difficulty;
    this.player = player; // Store reference to player for immediate damage
    this.notes = [];
    this.activeNotes = [];
    this.tempo = 90 + (difficulty * 5); // BPM (beats per minute)
    this.isPlaying = false;
    this.score = 0;
    this.hitCount = 0;
    this.missCount = 0;
    this.totalDamage = 0;
    this.combo = 0;
    this.maxCombo = 0;
    
    // Damage settings
    this.missDamage = 5; // Base damage for missing a note
    
    // DOM elements
    this.container = document.getElementById('rhythm-container');
    this.track = document.getElementById('rhythm-track');
    this.targetLine = document.getElementById('target-line');
    
    // Timing variables
    this.startTime = 0;
    this.lastFrameTime = 0;
    this.noteSpeed = 300; // pixels per second
    
    // Visual feedback elements
    this.comboDisplay = null;
    this.scoreDisplay = null;
    this.healthDisplay = null;
    
    // Key bindings
    this.keyBindings = {
      'KeyZ': 0,
      'KeyX': 1,
      'KeyC': 2,
      'KeyV': 3
    };
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for key presses and mobile buttons
   */
  setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      if (!this.isPlaying) return;
      
      const lane = this.keyBindings[event.code];
      if (lane !== undefined) {
        this.handleNoteHit(lane);
      }
    });
    
    // Mobile controls
    const buttons = [
      document.getElementById('z-button'),
      document.getElementById('x-button'),
      document.getElementById('c-button'),
      document.getElementById('v-button')
    ];
    
    buttons.forEach((button, index) => {
      if (button) {
        button.addEventListener('touchstart', () => {
          if (!this.isPlaying) return;
          this.handleNoteHit(index);
        });
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.isPlaying) {
        this.handleResize();
      }
    });
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Recalculate positions for all notes
    const notes = this.track.querySelectorAll('.note');
    const trackHeight = this.track.clientHeight;
    
    notes.forEach((noteElement) => {
      const lane = parseInt(noteElement.dataset.lane);
      const laneHeight = trackHeight / 4;
      const lanePosition = (lane * laneHeight) + (laneHeight / 2);
      noteElement.style.top = `${lanePosition - 15}px`;
    });
    
    // Reposition visual feedback elements
    if (this.comboDisplay) {
      this.comboDisplay.style.left = `${this.targetLine.offsetLeft + 30}px`;
    }
    
    if (this.scoreDisplay) {
      this.scoreDisplay.style.left = `${this.targetLine.offsetLeft + 30}px`;
    }
  }
  
  /**
   * Create visual feedback elements
   */
  createVisualFeedback() {
    // Create combo display
    this.comboDisplay = document.createElement('div');
    this.comboDisplay.className = 'combo-display';
    this.comboDisplay.style.position = 'absolute';
    this.comboDisplay.style.left = `${this.targetLine.offsetLeft + 30}px`;
    this.comboDisplay.style.top = '10px';
    this.comboDisplay.style.color = '#ffff00';
    this.comboDisplay.style.fontSize = '18px';
    this.comboDisplay.style.fontWeight = 'bold';
    this.comboDisplay.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
    this.comboDisplay.style.zIndex = '3';
    this.comboDisplay.textContent = 'Combo: 0';
    this.track.appendChild(this.comboDisplay);
    
    // Create score display
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.className = 'score-display';
    this.scoreDisplay.style.position = 'absolute';
    this.scoreDisplay.style.left = `${this.targetLine.offsetLeft + 30}px`;
    this.scoreDisplay.style.top = '35px';
    this.scoreDisplay.style.color = '#ffffff';
    this.scoreDisplay.style.fontSize = '16px';
    this.scoreDisplay.style.fontWeight = 'bold';
    this.scoreDisplay.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
    this.scoreDisplay.style.zIndex = '3';
    this.scoreDisplay.textContent = 'Score: 0';
    this.track.appendChild(this.scoreDisplay);
    
    // Create health display
    this.healthDisplay = document.createElement('div');
    this.healthDisplay.className = 'health-display';
    this.healthDisplay.style.position = 'absolute';
    this.healthDisplay.style.left = `${this.targetLine.offsetLeft + 30}px`;
    this.healthDisplay.style.top = '60px';
    this.healthDisplay.style.color = '#ff3e3e';
    this.healthDisplay.style.fontSize = '16px';
    this.healthDisplay.style.fontWeight = 'bold';
    this.healthDisplay.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.8)';
    this.healthDisplay.style.zIndex = '3';
    this.healthDisplay.textContent = `Health: ${this.player ? this.player.health : 100}`;
    this.track.appendChild(this.healthDisplay);
  }
  
  /**
   * Update visual feedback elements
   */
  updateVisualFeedback() {
    if (this.comboDisplay) {
      this.comboDisplay.textContent = `Combo: ${this.combo}`;
      
      // Change color based on combo
      if (this.combo >= 10) {
        this.comboDisplay.style.color = '#ff00ff';
        this.comboDisplay.style.fontSize = '20px';
      } else if (this.combo >= 5) {
        this.comboDisplay.style.color = '#00ffff';
        this.comboDisplay.style.fontSize = '19px';
      } else {
        this.comboDisplay.style.color = '#ffff00';
        this.comboDisplay.style.fontSize = '18px';
      }
    }
    
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `Score: ${this.score}`;
    }
    
    if (this.healthDisplay && this.player) {
      this.healthDisplay.textContent = `Health: ${this.player.health}`;
      
      // Change color based on health
      if (this.player.health < 30) {
        this.healthDisplay.style.color = '#ff0000';
      } else if (this.player.health < 60) {
        this.healthDisplay.style.color = '#ff9900';
      } else {
        this.healthDisplay.style.color = '#ff3e3e';
      }
    }
  }
  
  /**
   * Apply damage to the player
   * @param {number} amount - Amount of damage to apply
   * @returns {boolean} True if the player is still alive
   */
  applyPlayerDamage(amount) {
    if (!this.player) return true;
    
    // Apply damage to player
    const playerAlive = this.player.takeDamage(amount);
    
    // Update health display
    this.updateVisualFeedback();
    
    // Show damage indicator
    this.showDamageIndicator(amount);
    
    return playerAlive;
  }
  
  /**
   * Show damage indicator
   * @param {number} amount - Amount of damage
   */
  showDamageIndicator(amount) {
    // Create damage indicator element
    const damageIndicator = document.createElement('div');
    damageIndicator.className = 'damage-indicator';
    damageIndicator.style.position = 'absolute';
    damageIndicator.style.left = '50%';
    damageIndicator.style.top = '50%';
    damageIndicator.style.transform = 'translate(-50%, -50%)';
    damageIndicator.style.color = '#ff0000';
    damageIndicator.style.fontSize = '32px';
    damageIndicator.style.fontWeight = 'bold';
    damageIndicator.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    damageIndicator.style.zIndex = '5';
    damageIndicator.style.opacity = '1';
    damageIndicator.style.transition = 'opacity 0.5s, transform 0.5s';
    damageIndicator.textContent = `-${amount}`;
    
    // Add to container
    this.container.appendChild(damageIndicator);
    
    // Animate and remove
    setTimeout(() => {
      damageIndicator.style.opacity = '0';
      damageIndicator.style.transform = 'translate(-50%, -100%)';
      
      setTimeout(() => {
        if (damageIndicator.parentNode) {
          damageIndicator.parentNode.removeChild(damageIndicator);
        }
      }, 500);
    }, 100);
  }
  
  /**
   * Start the rhythm game
   * @returns {Promise} Promise that resolves when the game is complete
   */
  async start() {
    return new Promise(async (resolve) => {
      // Generate rhythm pattern based on difficulty
      this.notes = generateRhythm(this.difficulty);
      this.activeNotes = [...this.notes];
      
      // Reset game state
      this.score = 0;
      this.hitCount = 0;
      this.missCount = 0;
      this.totalDamage = 0;
      this.combo = 0;
      this.maxCombo = 0;
      
      // Show the rhythm container
      this.container.style.display = 'block';
      
      // Clear any existing notes
      const existingNotes = this.track.querySelectorAll('.note');
      existingNotes.forEach(note => note.remove());
      
      // Create visual feedback elements
      this.createVisualFeedback();
      
      // Create visual notes before starting the countdown
      this.createVisualNotes();
      
      // Start pre-animation of notes during countdown
      this.startPreAnimation();
      
      // Count in with metronome
      await this.audioManager.countIn(4, this.tempo);
      
      // Start the game
      this.isPlaying = true;
      this.startTime = performance.now() + (1 * 60000 / this.tempo); // Adjust start time to account for countdown
      this.lastFrameTime = performance.now();
      
      // Start the game loop
      this.gameLoop();
      
      // Set a timeout to end the game based on the last note
      const lastNoteTime = this.notes[this.notes.length - 1].time;
      const beatDuration = 60000 / this.tempo;
      const gameDuration = (lastNoteTime * beatDuration) + 2000; // Add 2 seconds buffer
      
      setTimeout(() => {
        this.isPlaying = false;
        this.container.style.display = 'none';
        
        // Clean up visual feedback elements
        if (this.comboDisplay && this.comboDisplay.parentNode) {
          this.comboDisplay.parentNode.removeChild(this.comboDisplay);
        }
        
        if (this.scoreDisplay && this.scoreDisplay.parentNode) {
          this.scoreDisplay.parentNode.removeChild(this.scoreDisplay);
        }
        
        if (this.healthDisplay && this.healthDisplay.parentNode) {
          this.healthDisplay.parentNode.removeChild(this.healthDisplay);
        }
        
        resolve({
          score: this.score,
          damage: this.totalDamage,
          accuracy: this.hitCount / (this.hitCount + this.missCount),
          maxCombo: this.maxCombo
        });
      }, gameDuration);
    });
  }
  
  /**
   * Start pre-animation of notes during countdown
   */
  startPreAnimation() {
    // Calculate how long the countdown will take
    const countdownDuration = 4 * 60000 / this.tempo; // 4 beats at current tempo
    const startTime = performance.now();
    const targetLineX = this.targetLine.offsetLeft + (this.targetLine.offsetWidth / 2);
    
    // Create a countdown indicator
    const countdownIndicator = document.createElement('div');
    countdownIndicator.className = 'countdown-indicator';
    countdownIndicator.style.position = 'absolute';
    countdownIndicator.style.left = '50%';
    countdownIndicator.style.top = '50%';
    countdownIndicator.style.transform = 'translate(-50%, -50%)';
    countdownIndicator.style.color = '#ffffff';
    countdownIndicator.style.fontSize = '64px';
    countdownIndicator.style.fontWeight = 'bold';
    countdownIndicator.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.8)';
    countdownIndicator.style.zIndex = '10';
    countdownIndicator.textContent = '4';
    this.container.appendChild(countdownIndicator);
    
    // Animation function for the countdown
    const animateCountdown = () => {
      const elapsed = performance.now() - startTime;
      
      if (elapsed >= countdownDuration) {
        // Countdown complete, remove indicator
        if (countdownIndicator.parentNode) {
          countdownIndicator.parentNode.removeChild(countdownIndicator);
        }
        return;
      }
      
      // Update countdown number
      const beatsRemaining = 4 - Math.floor(elapsed / (60000 / this.tempo));
      if (beatsRemaining > 0) {
        countdownIndicator.textContent = beatsRemaining.toString();
      } else {
        countdownIndicator.textContent = 'GO!';
      }
      
      // Animate notes during countdown
      const elapsedBeats = elapsed / (60000 / this.tempo);
      const notes = this.track.querySelectorAll('.note');
      
      notes.forEach((noteElement) => {
        const noteTime = parseFloat(noteElement.dataset.time) + 4; // Add 4 beats for countdown
        const timeUntilHit = noteTime - elapsedBeats;
        
        // Calculate horizontal position based on time until hit
        const position = targetLineX + (timeUntilHit * this.noteSpeed);
        
        // Only update notes that would be visible during countdown
        if (position < this.track.clientWidth + 30) {
          noteElement.style.left = `${position - 15}px`; // 15px is half the note width
        }
      });
      
      requestAnimationFrame(animateCountdown);
    };
    
    // Start the animation
    animateCountdown();
  }
  
  /**
   * Create visual representations of notes
   */
  createVisualNotes() {
    const beatDuration = 60000 / this.tempo; // Duration of one beat in ms
    const trackHeight = this.track.clientHeight;
    
    this.notes.forEach((note) => {
      // Create note element
      const noteElement = document.createElement('div');
      noteElement.className = 'note';
      noteElement.dataset.lane = note.lane;
      noteElement.dataset.time = note.time;
      
      // Position note vertically based on lane
      const laneHeight = trackHeight / 4;
      const lanePosition = (note.lane * laneHeight) + (laneHeight / 2);
      noteElement.style.top = `${lanePosition - 15}px`; // 15px is half the note height
      
      // Position note horizontally (off-screen initially, to the right)
      noteElement.style.left = `${this.track.clientWidth + 30}px`;
      
      // Add note to track
      this.track.appendChild(noteElement);
    });
  }
  
  /**
   * Main game loop
   */
  gameLoop() {
    if (!this.isPlaying) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // in seconds
    this.lastFrameTime = currentTime;
    
    // Calculate elapsed time in beats
    const elapsedMs = currentTime - this.startTime;
    const beatDuration = 60000 / this.tempo;
    const elapsedBeats = elapsedMs / beatDuration;
    
    // Update note positions
    const notes = this.track.querySelectorAll('.note');
    const targetLineX = this.targetLine.offsetLeft + (this.targetLine.offsetWidth / 2);
    
    notes.forEach((noteElement) => {
      const noteTime = parseFloat(noteElement.dataset.time);
      const timeUntilHit = noteTime - elapsedBeats;
      
      // Calculate horizontal position based on time until hit
      // Notes move from right to left
      const trackWidth = this.track.clientWidth;
      const position = targetLineX + (timeUntilHit * this.noteSpeed);
      
      noteElement.style.left = `${position - 15}px`; // 15px is half the note width
      
      // Check for missed notes
      if (position < targetLineX - 50 && !noteElement.classList.contains('hit') && !noteElement.classList.contains('missed')) {
        noteElement.classList.add('missed');
        this.handleMissedNote(noteElement);
      }
    });
    
    // Continue the game loop
    requestAnimationFrame(() => this.gameLoop());
  }
  
  /**
   * Handle a missed note
   * @param {Element} noteElement - DOM element for the missed note
   */
  handleMissedNote(noteElement) {
    // Play miss sound
    this.audioManager.play('miss', 0.5);
    
    // Update game stats
    this.missCount++;
    
    // Reset combo
    this.combo = 0;
    this.updateVisualFeedback();
    
    // Calculate damage based on difficulty
    const damage = Math.ceil(this.missDamage * (1 + (this.difficulty * 0.1)));
    
    // Apply damage to player immediately
    const playerAlive = this.applyPlayerDamage(damage);
    
    // Show miss rating
    this.showRating(noteElement, 'Miss');
    
    // Check if player is dead
    if (!playerAlive && this.isPlaying) {
      // End the game early if player dies
      this.endGameEarly();
    }
  }
  
  /**
   * End the game early (when player dies)
   */
  endGameEarly() {
    this.isPlaying = false;
    
    // Clean up visual feedback elements
    if (this.comboDisplay && this.comboDisplay.parentNode) {
      this.comboDisplay.parentNode.removeChild(this.comboDisplay);
    }
    
    if (this.scoreDisplay && this.scoreDisplay.parentNode) {
      this.scoreDisplay.parentNode.removeChild(this.scoreDisplay);
    }
    
    if (this.healthDisplay && this.healthDisplay.parentNode) {
      this.healthDisplay.parentNode.removeChild(this.healthDisplay);
    }
    
    // Hide the rhythm container
    this.container.style.display = 'none';
  }
  
  /**
   * Show a rating label for a note
   * @param {Element} noteElement - DOM element for the note
   * @param {string} rating - Rating text
   */
  showRating(noteElement, rating) {
    const ratingElement = document.createElement('div');
    ratingElement.className = 'rating';
    ratingElement.textContent = rating;
    ratingElement.style.position = 'absolute';
    ratingElement.style.left = this.targetLine.offsetLeft + 'px';
    ratingElement.style.top = noteElement.style.top;
    ratingElement.style.color = rating === 'Perfect' ? '#00ff00' : 
                               rating === 'Good' ? '#ffff00' : 
                               rating === 'OK' ? '#ff9900' : '#ff0000';
    
    this.track.appendChild(ratingElement);
    
    // Remove after animation
    setTimeout(() => {
      if (ratingElement.parentNode) {
        ratingElement.parentNode.removeChild(ratingElement);
      }
    }, 1000);
  }
  
  /**
   * Handle a note hit attempt
   * @param {number} lane - Lane index (0-3)
   */
  handleNoteHit(lane) {
    // Play the sound for this lane
    this.audioManager.playNoteSound(lane);
    
    // Calculate elapsed time in beats
    const currentTime = performance.now();
    const elapsedMs = currentTime - this.startTime;
    const beatDuration = 60000 / this.tempo;
    const elapsedBeats = elapsedMs / beatDuration;
    
    // Find the closest note in this lane
    let closestNote = null;
    let closestDistance = Infinity;
    
    this.activeNotes.forEach((note) => {
      if (note.lane === lane) {
        const distance = Math.abs(note.time - elapsedBeats);
        if (distance < closestDistance && distance < 0.5) { // Within half a beat
          closestDistance = distance;
          closestNote = note;
        }
      }
    });
    
    if (closestNote) {
      // Remove the note from active notes
      this.activeNotes = this.activeNotes.filter(note => note !== closestNote);
      
      // Find the corresponding visual note
      const notes = this.track.querySelectorAll('.note');
      notes.forEach((noteElement) => {
        if (
          parseInt(noteElement.dataset.lane) === closestNote.lane &&
          parseFloat(noteElement.dataset.time) === closestNote.time &&
          !noteElement.classList.contains('hit') &&
          !noteElement.classList.contains('missed')
        ) {
          // Mark the note as hit
          noteElement.classList.add('hit');
          
          // Calculate score based on timing accuracy
          const timeDifference = closestNote.time - elapsedBeats;
          const scoreResult = calculateScore(timeDifference * beatDuration / 1000);
          
          // Update game stats
          this.score += scoreResult.points;
          this.totalDamage += scoreResult.damage;
          this.hitCount++;
          
          // Update combo
          if (scoreResult.rating !== 'Miss') {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
          } else {
            this.combo = 0;
            
            // Apply damage for a "Miss" rating
            const damage = Math.ceil(this.missDamage * 0.5); // Half damage for a "Miss" rating vs. completely missing
            this.applyPlayerDamage(damage);
          }
          
          // Update visual feedback
          this.updateVisualFeedback();
          
          // Play appropriate sound based on accuracy
          if (scoreResult.rating === 'Perfect') {
            this.audioManager.play('perfect', 0.5);
          } else if (scoreResult.rating === 'Good') {
            this.audioManager.play('good', 0.5);
          }
          
          // Show rating
          this.showRating(noteElement, scoreResult.rating);
        }
      });
    } else {
      // No note found - this is a miss
      this.combo = 0;
      this.updateVisualFeedback();
      
      // Apply a small damage penalty for random key presses
      const damage = Math.ceil(this.missDamage * 0.3);
      this.applyPlayerDamage(damage);
      
      // Show "Miss" rating at the target line for the current lane
      const trackHeight = this.track.clientHeight;
      const laneHeight = trackHeight / 4;
      const lanePosition = (lane * laneHeight) + (laneHeight / 2);
      
      const missElement = document.createElement('div');
      missElement.className = 'rating';
      missElement.textContent = 'Miss';
      missElement.style.position = 'absolute';
      missElement.style.left = this.targetLine.offsetLeft + 'px';
      missElement.style.top = `${lanePosition - 10}px`;
      missElement.style.color = '#ff0000';
      
      this.track.appendChild(missElement);
      
      // Remove after animation
      setTimeout(() => {
        if (missElement.parentNode) {
          missElement.parentNode.removeChild(missElement);
        }
      }, 1000);
    }
  }
} 