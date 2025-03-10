import * as THREE from 'three';
import { Player } from './entities/player.js';
import { Platform } from './entities/platform.js';
import { Enemy } from './entities/enemy.js';
import { RhythmCombat } from './combat/rhythmCombat.js';
import { LevelGenerator } from './level/levelGenerator.js';

export class Game {
  constructor(assets) {
    // Store assets
    this.assets = assets;
    
    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.inCombat = false;
    this.gameOver = false;
    
    // Player stats
    this.playerHealth = 100;
    this.playerXP = 0;
    this.playerLevel = 1;
    
    // Camera settings
    this.cameraSmoothing = 0.1; // Lower = smoother camera
    this.cameraTargetX = 0;
    
    // Setup Three.js scene
    this.setupScene();
    
    // Create level generator
    this.levelGenerator = new LevelGenerator(this.scene, assets);
    
    // Create player
    this.player = new Player(this.scene, assets, {
      x: 0,
      y: 2,
      width: 1,
      height: 2
    });
    
    // Create platforms and enemies
    this.platforms = [];
    this.enemies = [];
    this.generateLevel();
    
    // Create rhythm combat system
    this.rhythmCombat = new RhythmCombat(assets);
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // UI elements
    this.healthElement = document.getElementById('health');
    this.xpElement = document.getElementById('xp');
    this.levelElement = document.getElementById('level');
    this.rhythmContainer = document.getElementById('rhythm-container');
    this.combatInfo = document.getElementById('combat-info');
    this.enemyNameElement = document.getElementById('enemy-name');
    this.enemyHealthElement = document.getElementById('enemy-health');
    this.accuracyElement = document.getElementById('accuracy');
    this.gameOverElement = document.getElementById('game-over');
    this.gameOverMessageElement = document.getElementById('game-over-message');
    this.finalScoreElement = document.getElementById('final-score');
    this.restartButton = document.getElementById('restart-button');
    
    // Add restart button event listener
    this.restartButton.addEventListener('click', () => this.restart());
    
    // Start background music
    this.assets.audio.background.loop(true);
    this.assets.audio.background.volume(0.5);
    this.assets.audio.background.play();
  }
  
  setupScene() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera
    this.camera = new THREE.OrthographicCamera(
      -10, 10, 
      5, -5, 
      0.1, 1000
    );
    this.camera.position.z = 10;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87CEEB); // Sky blue background
    
    // Add renderer to DOM
    document.getElementById('game-container').appendChild(this.renderer.domElement);
    
    // Create repeating background
    this.createBackground();
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }
  
  createBackground() {
    // Set texture to repeat
    this.assets.textures.background.wrapS = THREE.RepeatWrapping;
    this.assets.textures.background.wrapT = THREE.RepeatWrapping;
    this.assets.textures.background.repeat.set(5, 3); // Repeat the texture
    
    // Create a large background plane
    const backgroundGeometry = new THREE.PlaneGeometry(100, 50);
    const backgroundMaterial = new THREE.MeshBasicMaterial({ 
      map: this.assets.textures.background,
      transparent: true
    });
    this.background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    this.background.position.z = -1;
    this.scene.add(this.background);
  }
  
  setupInputHandlers() {
    // Keyboard state
    this.keys = {
      left: false,
      right: false,
      up: false,
      z: false,
      x: false,
      j: false,
      k: false,
      enter: false,
      space: false,
      h: false
    };
    
    // Keyboard event listeners
    window.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          this.keys.left = true;
          break;
        case 'arrowright':
        case 'd':
          this.keys.right = true;
          break;
        case 'arrowup':
        case 'w':
          this.keys.up = true;
          if (!this.inCombat) {
            this.player.jump();
            this.assets.audio.jump.play();
          }
          break;
        case ' ':
          this.keys.space = true;
          if (!this.inCombat) {
            this.player.jump();
            this.assets.audio.jump.play();
          } else if (!this.rhythmCombat.isPlaying && !this.rhythmCombat.isPlayingDemo) {
            // Start rehearsal mode
            this.rhythmCombat.startRehearsal();
          }
          break;
        case 'z':
          this.keys.z = true;
          if (this.inCombat) this.rhythmCombat.pressKey('z');
          break;
        case 'x':
          this.keys.x = true;
          if (this.inCombat) this.rhythmCombat.pressKey('x');
          break;
        case 'j':
          this.keys.j = true;
          if (this.inCombat) this.rhythmCombat.pressKey('j');
          break;
        case 'k':
          this.keys.k = true;
          if (this.inCombat) this.rhythmCombat.pressKey('k');
          break;
        case 'h':
          this.keys.h = true;
          if (this.inCombat && !this.rhythmCombat.isPlaying && !this.rhythmCombat.isPlayingDemo && !this.rhythmCombat.isRehearsing) {
            // Play the pattern demo
            this.rhythmCombat.playPatternDemo();
          }
          break;
        case 'enter':
          this.keys.enter = true;
          if (this.inCombat && !this.rhythmCombat.isPlaying && !this.rhythmCombat.isPlayingDemo) {
            this.rhythmCombat.startRhythm();
          }
          break;
        case 'p':
          this.togglePause();
          break;
      }
    });
    
    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          this.keys.left = false;
          break;
        case 'arrowright':
        case 'd':
          this.keys.right = false;
          break;
        case 'arrowup':
        case 'w':
          this.keys.up = false;
          break;
        case ' ':
          this.keys.space = false;
          break;
        case 'z':
          this.keys.z = false;
          break;
        case 'x':
          this.keys.x = false;
          break;
        case 'j':
          this.keys.j = false;
          break;
        case 'k':
          this.keys.k = false;
          break;
        case 'h':
          this.keys.h = false;
          break;
        case 'enter':
          this.keys.enter = false;
          break;
      }
    });
  }
  
  generateLevel() {
    // Clear existing level
    this.platforms.forEach(platform => this.scene.remove(platform.mesh));
    this.enemies.forEach(enemy => this.scene.remove(enemy.mesh));
    this.platforms = [];
    this.enemies = [];
    
    // Generate new level
    const levelData = this.levelGenerator.generateLevel(this.playerLevel);
    
    // Create platforms
    levelData.platforms.forEach(platformData => {
      const platform = new Platform(this.scene, this.assets, platformData);
      this.platforms.push(platform);
    });
    
    // Create enemies
    levelData.enemies.forEach(enemyData => {
      const enemy = new Enemy(this.scene, this.assets, enemyData);
      this.enemies.push(enemy);
    });
  }
  
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animate();
    }
  }
  
  animate() {
    if (!this.isRunning) return;
    
    requestAnimationFrame(() => this.animate());
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;
    
    if (!this.isPaused && !this.inCombat) {
      this.update(deltaTime);
    }
    
    this.render();
  }
  
  update(deltaTime) {
    // Update player
    this.player.update(deltaTime, this.keys, this.platforms);
    
    // Update camera to follow player with smoothing
    this.cameraTargetX = this.player.mesh.position.x;
    this.camera.position.x += (this.cameraTargetX - this.camera.position.x) * this.cameraSmoothing;
    
    // Update background position to create parallax effect
    this.background.position.x = this.camera.position.x * 0.5;
    
    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.platforms);
      
      // Check for combat initiation
      if (!this.inCombat && 
          Math.abs(enemy.mesh.position.x - this.player.mesh.position.x) < 2 &&
          Math.abs(enemy.mesh.position.y - this.player.mesh.position.y) < 2) {
        this.startCombat(enemy);
      }
    });
    
    // Check if player fell off the level
    if (this.player.mesh.position.y < -10) {
      this.playerHealth = 0;
      this.endGame(false);
    }
    
    // Update UI
    this.updateUI();
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  startCombat(enemy) {
    this.inCombat = true;
    this.currentEnemy = enemy;
    
    // Show rhythm UI
    this.rhythmContainer.style.display = 'block';
    this.combatInfo.style.display = 'block';
    
    // Update enemy info
    this.enemyNameElement.textContent = `Enemy: ${enemy.type}`;
    this.enemyHealthElement.textContent = `Health: ${enemy.health}`;
    
    // Generate rhythm pattern based on enemy difficulty
    this.rhythmCombat.generatePattern(enemy.difficulty);
    
    // Set up combat result callback
    this.rhythmCombat.onCombatComplete = (result) => {
      this.processCombatResult(result);
    };
    
    // Automatically play the pattern demo after a short delay
    setTimeout(() => {
      this.rhythmCombat.playPatternDemo();
    }, 1000);
  }
  
  processCombatResult(result) {
    // Update accuracy display
    this.accuracyElement.textContent = `Accuracy: ${Math.round(result.accuracy * 100)}%`;
    
    // Calculate damage based on accuracy
    const playerDamage = Math.round((1 - result.accuracy) * 20);
    const enemyDamage = Math.round(result.accuracy * 30);
    
    // Apply damage
    this.playerHealth = Math.max(0, this.playerHealth - playerDamage);
    const enemyDefeated = this.currentEnemy.takeDamage(enemyDamage);
    
    // Update UI
    this.healthElement.textContent = `Health: ${this.playerHealth}`;
    this.enemyHealthElement.textContent = `Health: ${this.currentEnemy.health}`;
    
    // Play hit sound
    this.assets.audio.hit.play();
    
    // Check if combat is over
    if (enemyDefeated) {
      // Enemy defeated
      this.endCombat(true);
    } else if (this.playerHealth <= 0) {
      // Player defeated
      this.endGame(false);
    } else {
      // Continue combat with a new pattern after a short delay
      setTimeout(() => {
        this.rhythmCombat.generatePattern(this.currentEnemy.difficulty);
      }, 1000);
    }
  }
  
  endCombat(victory) {
    this.inCombat = false;
    
    // Hide rhythm UI
    this.rhythmContainer.style.display = 'none';
    this.combatInfo.style.display = 'none';
    
    if (victory) {
      // Remove defeated enemy
      const enemyIndex = this.enemies.indexOf(this.currentEnemy);
      if (enemyIndex !== -1) {
        this.scene.remove(this.currentEnemy.mesh);
        this.enemies.splice(enemyIndex, 1);
      }
      
      // Award XP based on enemy difficulty and accuracy
      const xpGained = Math.round(this.currentEnemy.difficulty * 50 * 
                                 (1 + this.rhythmCombat.lastAccuracy));
      this.playerXP += xpGained;
      
      // Check for level up
      this.checkLevelUp();
      
      // Check if all enemies are defeated
      if (this.enemies.length === 0) {
        this.playerLevel++;
        this.generateLevel();
      }
    }
    
    this.currentEnemy = null;
  }
  
  checkLevelUp() {
    const xpNeeded = this.playerLevel * 100;
    
    if (this.playerXP >= xpNeeded) {
      this.playerXP -= xpNeeded;
      this.playerLevel++;
      this.playerHealth = Math.min(100, this.playerHealth + 20); // Heal on level up
      
      // Update UI
      this.updateUI();
    }
  }
  
  updateUI() {
    this.healthElement.textContent = `Health: ${this.playerHealth}`;
    this.xpElement.textContent = `XP: ${this.playerXP}`;
    this.levelElement.textContent = `Level: ${this.playerLevel}`;
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
  }
  
  endGame(victory) {
    this.isRunning = false;
    this.gameOver = true;
    
    // Show game over screen
    this.gameOverElement.style.display = 'block';
    
    if (victory) {
      this.gameOverMessageElement.textContent = 'Victory!';
    } else {
      this.gameOverMessageElement.textContent = 'Game Over';
    }
    
    this.finalScoreElement.textContent = `Your final score: ${this.playerXP} XP`;
  }
  
  restart() {
    // Reset game state
    this.isRunning = true;
    this.isPaused = false;
    this.inCombat = false;
    this.gameOver = false;
    
    // Reset player stats
    this.playerHealth = 100;
    this.playerXP = 0;
    this.playerLevel = 1;
    
    // Reset player position
    this.player.reset();
    
    // Generate new level
    this.generateLevel();
    
    // Hide game over screen
    this.gameOverElement.style.display = 'none';
    
    // Update UI
    this.updateUI();
    
    // Restart animation loop
    this.lastTime = performance.now();
    this.animate();
  }
  
  onWindowResize() {
    // Get new window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update camera
    this.camera.left = -10;
    this.camera.right = 10;
    this.camera.top = 5;
    this.camera.bottom = -5;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(width, height);
  }
} 