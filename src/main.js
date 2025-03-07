import * as THREE from 'three';
import { Game } from './components/Game.js';

// Initialize the game
const game = new Game();
game.init();

// Start the game loop
function animate() {
  requestAnimationFrame(animate);
  game.update();
  game.render();
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  game.onWindowResize();
});

// Add event listeners for restart buttons
document.getElementById('restart-button').addEventListener('click', () => {
  document.getElementById('game-over').style.display = 'none';
  game.restart();
});

document.getElementById('restart-button-win').addEventListener('click', () => {
  document.getElementById('game-win').style.display = 'none';
  game.restart();
}); 