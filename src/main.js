import * as THREE from 'three';
import { Game } from './game.js';
import { loadAssets } from './assetLoader.js';

// Initialize the game when assets are loaded
async function init() {
  try {
    // Load all game assets
    const assets = await loadAssets();
    
    // Create the game instance
    const game = new Game(assets);
    
    // Start the game loop
    game.start();
    
    // Add event listener for window resize
    window.addEventListener('resize', () => {
      game.onWindowResize();
    });
    
  } catch (error) {
    console.error('Failed to initialize the game:', error);
  }
}

// Start the game
init(); 