/**
 * AudioManager class to handle all game audio
 */
export class AudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isMuted = false;
  }
  
  /**
   * Initialize the audio manager
   * @returns {Promise} Promise that resolves when all sounds are loaded
   */
  async init() {
    const soundFiles = [
      'perfect',
      'good',
      'miss',
      'kick',
      'snare',
      'tom',
      'tambourine',
      'metronome',
      'jump',
      'background'
    ];
    
    const loadPromises = soundFiles.map(sound => this.loadSound(sound));
    await Promise.all(loadPromises);
    
    // Set up background music
    this.backgroundMusic = this.sounds.background;
    this.backgroundMusic.loop = true;
    
    return this;
  }
  
  /**
   * Load a sound file
   * @param {string} name - Name of the sound
   * @returns {Promise} Promise that resolves when the sound is loaded
   */
  loadSound(name) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(`sounds/${name}.mp3`);
      
      audio.addEventListener('canplaythrough', () => {
        this.sounds[name] = audio;
        resolve();
      }, { once: true });
      
      audio.addEventListener('error', (error) => {
        console.error(`Error loading sound ${name}:`, error);
        reject(error);
      });
      
      audio.load();
    });
  }
  
  /**
   * Play a sound
   * @param {string} name - Name of the sound to play
   * @param {number} volume - Volume of the sound (0-1)
   */
  play(name, volume = 1) {
    if (this.isMuted) return;
    
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound ${name} not found`);
      return;
    }
    
    // Create a clone to allow overlapping sounds
    const soundClone = sound.cloneNode();
    soundClone.volume = volume;
    soundClone.play();
  }
  
  /**
   * Play the background music
   */
  playBackgroundMusic() {
    if (this.isMuted) return;
    
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = 0.3;
      this.backgroundMusic.play();
    }
  }
  
  /**
   * Stop the background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }
  
  /**
   * Play the metronome for counting in
   * @param {number} beats - Number of beats to count in
   * @param {number} tempo - Tempo in beats per minute
   * @returns {Promise} Promise that resolves when counting is complete
   */
  countIn(beats = 4, tempo = 120) {
    return new Promise((resolve) => {
      if (this.isMuted) {
        resolve();
        return;
      }
      
      const beatInterval = 60000 / tempo; // in milliseconds
      let count = 0;
      
      // Use precise timing with performance.now() for more accurate beat timing
      const startTime = performance.now();
      
      const scheduleTick = () => {
        const nextTickTime = startTime + (count * beatInterval);
        const currentTime = performance.now();
        const timeUntilNextTick = nextTickTime - currentTime;
        
        if (timeUntilNextTick <= 0) {
          // Play the metronome sound
          this.play('metronome', 0.7);
          count++;
          
          if (count < beats) {
            // Schedule next tick
            requestAnimationFrame(scheduleTick);
          } else {
            // Play a slightly different sound for the final beat
            this.play('perfect', 0.5);
            resolve();
          }
        } else {
          // Wait until it's time for the next tick
          requestAnimationFrame(scheduleTick);
        }
      };
      
      // Start the first tick immediately
      this.play('metronome', 0.7);
      count++;
      
      // Schedule subsequent ticks
      if (count < beats) {
        requestAnimationFrame(scheduleTick);
      } else {
        resolve();
      }
    });
  }
  
  /**
   * Toggle mute state
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    
    return this.isMuted;
  }
  
  /**
   * Play a note sound based on the lane
   * @param {number} lane - Lane index (0-3)
   */
  playNoteSound(lane) {
    switch (lane) {
      case 0:
        this.play('kick', 0.7);
        break;
      case 1:
        this.play('snare', 0.7);
        break;
      case 2:
        this.play('tom', 0.7);
        break;
      case 3:
        this.play('tambourine', 0.7);
        break;
    }
  }
} 