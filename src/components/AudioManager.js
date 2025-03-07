export class AudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isMuted = false;
    this.hasUserInteracted = false;
    
    // Load all sounds
    this.loadSounds();
    
    // Add interaction listeners for multiple events
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    
    interactionEvents.forEach(event => {
      document.addEventListener(event, () => {
        if (!this.hasUserInteracted) {
          this.hasUserInteracted = true;
          // Try playing background music again if it was attempted before interaction
          if (this.backgroundMusic && !this.isMuted && this.backgroundMusic.paused) {
            this.playBackgroundMusic();
          }
        }
      }, {once: true}); // Only need to handle first interaction
    });
  }

  loadSounds() {
    // Define sound files to load
    const soundFiles = [
      'kick',
      'snare', 
      'tom',
      'tambourine',
      'metronome',
      'jump',
      'miss',
      'good',
      'perfect'
    ];
    
    // Load each sound
    soundFiles.forEach(sound => {
      this.sounds[sound] = new Audio(`/sounds/${sound}.mp3`);
      
      // Set volume based on sound type
      if (sound === 'metronome') {
        this.sounds[sound].volume = 0.3;
      } else if (sound === 'miss') {
        this.sounds[sound].volume = 0.5;
      } else {
        this.sounds[sound].volume = 0.7;
      }
    });
    
    // Load background music
    this.backgroundMusic = new Audio('/sounds/background.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.3;
  }

  playSound(soundName) {
    if (this.isMuted || !this.sounds[soundName]) return;
    
    // Only play sounds after user interaction
    if (!this.hasUserInteracted) {
      return; // Silently fail instead of logging warning
    }
    
    // Clone the audio to allow overlapping sounds
    const sound = this.sounds[soundName].cloneNode();
    
    // Play the sound
    sound.play().catch(error => {
      console.error(`Error playing sound ${soundName}:`, error);
    });
  }

  playBackgroundMusic() {
    if (this.isMuted || !this.backgroundMusic) return;
    
    // Only play music after user interaction
    if (!this.hasUserInteracted) {
      return; // Silently fail instead of logging warning
    }
    
    this.backgroundMusic.play().catch(error => {
      console.error('Error playing background music:', error);
    });
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    // Update background music
    if (this.backgroundMusic) {
      this.backgroundMusic.muted = this.isMuted;
    }
    
    return this.isMuted;
  }
}