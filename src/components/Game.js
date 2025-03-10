import * as THREE from 'three';
import { Player } from './Player.js';
import { Level } from './Level.js';
import { RhythmGame } from './RhythmGame.js';
import { AudioManager } from '../utils/AudioManager.js';

export class Game {
  constructor() {
    // Game state
    this.isInitialized = false;
    this.isRunning = false;
    this.currentLevel = 1;
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lights = [];
    
    // Game components
    this.audioManager = null;
    this.player = null;
    this.level = null;
    this.rhythmGame = null;
    
    // Animation
    this.clock = new THREE.Clock();
    this.animationFrameId = null;
  }
  
  /**
   * Initialize the game
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  async init() {
    if (this.isInitialized) return Promise.resolve();
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
    
    // Create lights
    this.createLights();
    
    // Initialize audio manager
    this.audioManager = new AudioManager();
    await this.audioManager.init();
    
    // Create player
    this.player = new Player(this.scene, this.audioManager);
    
    // Set up action button handler
    this.setupActionButton();
    
    // Create first level
    this.level = new Level(this.scene, this.currentLevel);
    
    // Update floor indicator
    document.getElementById('floor-indicator').textContent = `Floor: ${this.currentLevel}`;
    
    this.isInitialized = true;
    return Promise.resolve();
  }
  
  /**
   * Create lights for the scene
   */
  createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
    
    // Point lights for the level
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight1.position.set(5, 5, 5);
    this.scene.add(pointLight1);
    this.lights.push(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight2.position.set(-5, 5, -5);
    this.scene.add(pointLight2);
    this.lights.push(pointLight2);
  }
  
  /**
   * Set up action button handler
   */
  setupActionButton() {
    // Store reference to this for use in event handlers
    const game = this;
    
    // Override the player's triggerAction method
    this.player.triggerAction = function() {
      // Check if player is in combat
      if (this.inCombat) return;
      
      // Check for nearby enemies
      const nearbyEnemy = game.findNearbyEnemy();
      if (nearbyEnemy) {
        game.startCombat(nearbyEnemy);
        return;
      }
      
      // Check for elevator
      if (game.level && game.level.isComplete) {
        const elevatorPosition = game.level.elevator.position;
        const distance = this.mesh.position.distanceTo(elevatorPosition);
        
        if (distance < 2.5) {
          game.nextLevel();
          return;
        }
      }
      
      // No interaction available
      this.showSpeechBubble("Nothing to interact with here", 1000);
    };
  }
  
  /**
   * Find the nearest enemy within interaction range
   * @returns {Enemy|null} The nearest enemy or null if none found
   */
  findNearbyEnemy() {
    if (!this.level || !this.player) return null;
    
    const playerPosition = this.player.mesh.position;
    const interactionRange = 2.5;
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    for (const enemy of this.level.enemies) {
      if (enemy.isDefeated) continue;
      
      const distance = enemy.mesh.position.distanceTo(playerPosition);
      
      if (distance < interactionRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    }
    
    return nearestEnemy;
  }
  
  /**
   * Start the game
   */
  start() {
    if (!this.isInitialized) {
      console.error('Game not initialized');
      return;
    }
    
    this.isRunning = true;
    this.audioManager.playBackgroundMusic();
    this.animate();
  }
  
  /**
   * Main animation loop
   */
  animate() {
    if (!this.isRunning) return;
    
    const deltaTime = this.clock.getDelta();
    
    // Update player
    if (this.player && !this.player.inCombat) {
      this.player.update(deltaTime, this.camera, this.level.obstacles);
    }
    
    // Update level
    if (this.level) {
      const levelUpdate = this.level.update(deltaTime, this.player.mesh.position);
      
      // Handle enemy engagement
      if (levelUpdate.enemyEngaged && !this.player.inCombat) {
        this.startCombat(levelUpdate.enemyEngaged);
      }
      
      // Handle heart collection
      if (levelUpdate.heartCollected) {
        this.audioManager.play('jump', 0.7);
        this.player.heal(50);
      }
      
      // Handle elevator entry
      if (levelUpdate.elevatorEntered) {
        this.nextLevel();
      }
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    // Continue animation loop
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  
  /**
   * Start combat with an enemy
   * @param {Enemy} enemy - Enemy to fight
   */
  async startCombat(enemy) {
    // Pause normal gameplay
    this.player.startCombat(enemy);
    
    // Create rhythm game with difficulty based on level and pass player reference
    this.rhythmGame = new RhythmGame(this.audioManager, this.currentLevel, this.player);
    
    // Start the rhythm game
    const result = await this.rhythmGame.start();
    
    // Show combat results
    this.showCombatResults(result);
    
    // Apply damage to enemy
    const enemyDefeated = enemy.takeDamage(result.damage);
    
    // Check if player is still alive (they might have died during rhythm game)
    if (this.player.health <= 0) {
      this.gameOver();
      return;
    }
    
    // End combat
    this.player.endCombat(enemyDefeated);
  }
  
  /**
   * Show combat results
   * @param {object} result - Combat result data
   */
  showCombatResults(result) {
    // Create a temporary results display
    const resultsElement = document.createElement('div');
    resultsElement.style.position = 'absolute';
    resultsElement.style.top = '50%';
    resultsElement.style.left = '50%';
    resultsElement.style.transform = 'translate(-50%, -50%)';
    resultsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    resultsElement.style.color = 'white';
    resultsElement.style.padding = '20px';
    resultsElement.style.borderRadius = '10px';
    resultsElement.style.textAlign = 'center';
    resultsElement.style.zIndex = '60';
    resultsElement.style.fontFamily = 'Arial, sans-serif';
    
    // Format accuracy as percentage
    const accuracyPercent = Math.round(result.accuracy * 100);
    
    // Determine rating based on accuracy
    let rating;
    let ratingColor;
    if (accuracyPercent >= 90) {
      rating = 'EXCELLENT!';
      ratingColor = '#00ff00';
    } else if (accuracyPercent >= 75) {
      rating = 'GREAT!';
      ratingColor = '#00ffff';
    } else if (accuracyPercent >= 60) {
      rating = 'GOOD';
      ratingColor = '#ffff00';
    } else if (accuracyPercent >= 40) {
      rating = 'OK';
      ratingColor = '#ff9900';
    } else {
      rating = 'POOR';
      ratingColor = '#ff0000';
    }
    
    // Create HTML content
    resultsElement.innerHTML = `
      <h2 style="margin-bottom: 15px; font-size: 24px; color: ${ratingColor}">${rating}</h2>
      <div style="font-size: 18px; margin-bottom: 10px;">Score: <span style="color: #ffff00">${result.score}</span></div>
      <div style="font-size: 18px; margin-bottom: 10px;">Max Combo: <span style="color: #00ffff">${result.maxCombo}</span></div>
      <div style="font-size: 18px; margin-bottom: 10px;">Accuracy: <span style="color: ${ratingColor}">${accuracyPercent}%</span></div>
      <div style="font-size: 18px;">Damage Dealt: <span style="color: #ff3e3e">${result.damage}</span></div>
    `;
    
    // Add to document
    document.body.appendChild(resultsElement);
    
    // Remove after a short delay
    setTimeout(() => {
      if (resultsElement.parentNode) {
        resultsElement.parentNode.removeChild(resultsElement);
      }
    }, 2000);
  }
  
  /**
   * Proceed to the next level
   */
  nextLevel() {
    // Remove current level
    if (this.level) {
      this.level.remove();
    }
    
    // Increment level number
    this.currentLevel++;
    
    // Update floor indicator
    document.getElementById('floor-indicator').textContent = `Floor: ${this.currentLevel}`;
    
    // Create new level
    this.level = new Level(this.scene, this.currentLevel);
    
    // Reset player position
    this.player.mesh.position.set(0, 0, 0);
    
    // Play sound effect
    this.audioManager.play('jump', 0.7);
  }
  
  /**
   * Handle game over
   */
  gameOver() {
    this.isRunning = false;
    this.audioManager.stopBackgroundMusic();
    
    // Show game over screen
    document.getElementById('game-over').style.display = 'flex';
  }
  
  /**
   * Restart the game
   */
  restart() {
    // Reset game state
    this.currentLevel = 1;
    
    // Remove current level
    if (this.level) {
      this.level.remove();
    }
    
    // Create new level
    this.level = new Level(this.scene, this.currentLevel);
    
    // Reset player
    this.player.reset();
    
    // Update floor indicator
    document.getElementById('floor-indicator').textContent = `Floor: ${this.currentLevel}`;
    
    // Start the game again
    this.isRunning = true;
    this.audioManager.playBackgroundMusic();
    this.animate();
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
} 