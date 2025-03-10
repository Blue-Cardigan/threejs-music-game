import * as THREE from 'three';
import { Game } from './components/Game.js';
import { isMobile } from './utils/helpers.js';

// Initialize the game when the window loads
window.addEventListener('load', () => {
  // Hide loading screen
  const loadingScreen = document.getElementById('loading-screen');
  
  // Check if we're on mobile and show appropriate controls
  if (isMobile()) {
    // Show mobile movement controls
    document.getElementById('mobile-controls').style.display = 'block';
    
    // Adjust rhythm buttons for mobile
    const rhythmButtons = document.getElementById('rhythm-buttons');
    rhythmButtons.style.display = 'flex';
    
    // Add touch-friendly styles
    document.body.classList.add('mobile-device');
    
    // Prevent default touch actions to avoid scrolling while playing
    document.addEventListener('touchmove', (e) => {
      if (e.target.id === 'thumbstick-container' || 
          e.target.id === 'thumbstick' ||
          e.target.classList.contains('rhythm-button')) {
        e.preventDefault();
      }
    }, { passive: false });
  }
  
  // Create the game instance
  const game = new Game();
  
  // Start the game
  game.init().then(() => {
    loadingScreen.style.display = 'none';
    game.start();
  });
  
  // Handle restart button
  document.getElementById('restart-button').addEventListener('click', () => {
    document.getElementById('game-over').style.display = 'none';
    game.restart();
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    game.onWindowResize();
  });
}); 