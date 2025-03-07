import * as THREE from 'three';
import { Player } from './Player.js';
import { Platform } from './Platform.js';
import { Enemy } from './Enemy.js';
import { RhythmCombat } from './RhythmCombat.js';
import { AudioManager } from './AudioManager.js';

export class Game {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.player = null;
    this.platforms = [];
    this.enemies = [];
    this.musicSymbol = null;
    this.inCombat = false;
    this.currentEnemy = null;
    this.rhythmCombat = null;
    this.audioManager = null;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.clock = new THREE.Clock();
    this.keys = {
      a: false,
      d: false,
      w: false,
      z: false,
      x: false,
      j: false,
      k: false
    };
  }

  init() {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
    
    // Initialize lighting
    this.setupLighting();
    
    // Initialize audio manager
    this.audioManager = new AudioManager();
    
    // Initialize rhythm combat
    this.rhythmCombat = new RhythmCombat(this.audioManager);
    
    // Initialize player
    this.player = new Player(this.audioManager);
    this.scene.add(this.player.mesh);
    
    // Create platforms
    this.createPlatforms();
    
    // Create enemies
    this.createEnemies();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start background music
    this.audioManager.playBackgroundMusic();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    this.scene.add(directionalLight);
  }

  createPlatforms() {
    // Ground platform
    const groundPlatform = new Platform(30, 1, 10, 0x8B4513);
    groundPlatform.mesh.position.set(0, -0.5, 0);
    this.scene.add(groundPlatform.mesh);
    this.platforms.push(groundPlatform);
    
    // Additional platforms
    const platform1 = new Platform(5, 0.5, 3, 0x8B4513);
    platform1.mesh.position.set(-8, 2, 0);
    this.scene.add(platform1.mesh);
    this.platforms.push(platform1);
    
    const platform2 = new Platform(5, 0.5, 3, 0x8B4513);
    platform2.mesh.position.set(8, 2, 0);
    this.scene.add(platform2.mesh);
    this.platforms.push(platform2);
    
    const platform3 = new Platform(5, 0.5, 3, 0x8B4513);
    platform3.mesh.position.set(0, 4, 0);
    this.scene.add(platform3.mesh);
    this.platforms.push(platform3);
  }

  createEnemies() {
    // Create enemies on different platforms
    const enemy1 = new Enemy(0x00FF00, 1);
    enemy1.mesh.position.set(-8, 3.5, 0);
    this.scene.add(enemy1.mesh);
    this.enemies.push(enemy1);
    
    const enemy2 = new Enemy(0xFF0000, 2);
    enemy2.mesh.position.set(8, 3.5, 0);
    this.scene.add(enemy2.mesh);
    this.enemies.push(enemy2);
    
    const enemy3 = new Enemy(0x0000FF, 3);
    enemy3.mesh.position.set(0, 5.5, 0);
    this.scene.add(enemy3.mesh);
    this.enemies.push(enemy3);
  }

  setupEventListeners() {
    // Keyboard event listeners
    document.addEventListener('keydown', (event) => {
      if (this.gameOver || this.gameWon) return;
      
      switch (event.key.toLowerCase()) {
        case 'a':
          this.keys.a = true;
          break;
        case 'd':
          this.keys.d = true;
          break;
        case 'w':
          this.keys.w = true;
          break;
        case 'z':
          if (this.inCombat) {
            this.rhythmCombat.handleKeyPress('z');
          }
          break;
        case 'x':
          if (this.inCombat) {
            this.rhythmCombat.handleKeyPress('x');
          }
          break;
        case 'j':
          if (this.inCombat) {
            this.rhythmCombat.handleKeyPress('j');
          }
          break;
        case 'k':
          if (this.inCombat) {
            this.rhythmCombat.handleKeyPress('k');
          }
          break;
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.key.toLowerCase()) {
        case 'a':
          this.keys.a = false;
          break;
        case 'd':
          this.keys.d = false;
          break;
        case 'w':
          this.keys.w = false;
          break;
      }
    });
  }

  startCombat(enemy) {
    if (this.inCombat) return;
    
    this.inCombat = true;
    this.currentEnemy = enemy;
    
    // Show combat UI
    document.getElementById('rhythm-container').style.display = 'block';
    document.getElementById('combat-ui').style.display = 'block';
    document.getElementById('enemy-name').textContent = `Enemy Level ${enemy.level}`;
    document.getElementById('enemy-health').textContent = `Health: ${enemy.health}`;
    
    // Start rhythm combat
    this.rhythmCombat.startCombat(enemy.level);
    
    // Pause player movement
    this.player.canMove = false;
  }

  endCombat(success) {
    this.inCombat = false;
    
    // Hide combat UI
    document.getElementById('rhythm-container').style.display = 'none';
    document.getElementById('combat-ui').style.display = 'none';
    
    // End rhythm combat
    this.rhythmCombat.endCombat();
    
    // Resume player movement
    this.player.canMove = true;
    
    if (success) {
      // Remove enemy from scene and array
      this.scene.remove(this.currentEnemy.mesh);
      const index = this.enemies.indexOf(this.currentEnemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
      
      // Update score
      this.score += this.currentEnemy.level * 100;
      document.getElementById('score').textContent = `Score: ${this.score}`;
      
      // Check if all enemies are defeated
      if (this.enemies.length === 0) {
        this.createMusicSymbol();
      }
    }
    
    this.currentEnemy = null;
  }

  createMusicSymbol() {
    // Create a music note symbol
    const geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    this.musicSymbol = new THREE.Mesh(geometry, material);
    this.musicSymbol.position.set(0, 7, 0);
    this.musicSymbol.castShadow = true;
    this.musicSymbol.receiveShadow = true;
    this.scene.add(this.musicSymbol);
    
    // Add a stem to make it look like a music note
    const stemGeometry = new THREE.BoxGeometry(0.3, 2, 0.3);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(0.8, -1, 0);
    stem.castShadow = true;
    stem.receiveShadow = true;
    this.musicSymbol.add(stem);
  }

  checkCollisions() {
    // Check platform collisions
    let onPlatform = false;
    
    // First update player position
    this.player.update(this.clock.getDelta(), this.keys);
    
    // Then check collisions with all platforms
    for (const platform of this.platforms) {
      if (this.player.checkPlatformCollision(platform)) {
        onPlatform = true;
      }
    }
    
    // Update player's ground state based on platform collisions
    if (onPlatform) {
      this.player.onGround = true;
    }
    
    // Check enemy collisions
    if (!this.inCombat) {
      for (const enemy of this.enemies) {
        if (this.player.checkEnemyCollision(enemy)) {
          this.startCombat(enemy);
          break;
        }
      }
    }
    
    // Check music symbol collision
    if (this.musicSymbol && this.player.checkMusicSymbolCollision(this.musicSymbol)) {
      this.winGame();
    }
  }

  winGame() {
    this.gameWon = true;
    document.getElementById('game-win').style.display = 'block';
    this.player.canMove = false;
  }

  gameOverCheck() {
    if (this.player.health <= 0 && !this.gameOver) {
      this.gameOver = true;
      document.getElementById('game-over').style.display = 'block';
      this.player.canMove = false;
    }
  }

  restart() {
    // Remove all objects from scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    
    // Reset game state
    this.platforms = [];
    this.enemies = [];
    this.musicSymbol = null;
    this.inCombat = false;
    this.currentEnemy = null;
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    
    // Reinitialize game
    this.init();
    
    // Reset UI
    document.getElementById('score').textContent = `Score: ${this.score}`;
    document.getElementById('player-health').textContent = `Player Health: ${this.player.health}`;
  }

  update() {
    if (this.gameOver || this.gameWon) return;
    
    const deltaTime = this.clock.getDelta();
    
    // Update player
    if (!this.inCombat) {
      this.player.update(deltaTime, this.keys);
    }
    
    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(deltaTime);
    }
    
    // Update music symbol if it exists
    if (this.musicSymbol) {
      this.musicSymbol.rotation.y += deltaTime;
    }
    
    // Update rhythm combat
    if (this.inCombat) {
      const combatResult = this.rhythmCombat.update(deltaTime);
      
      if (combatResult) {
        if (combatResult.type === 'damage') {
          // Player takes damage on mistake
          this.player.takeDamage(5);
          document.getElementById('player-health').textContent = `Player Health: ${this.player.health}`;
        } else if (combatResult.type === 'complete') {
          // Apply damage to enemy
          const damage = combatResult.damage;
          this.currentEnemy.takeDamage(damage);
          document.getElementById('enemy-health').textContent = `Health: ${this.currentEnemy.health}`;
          
          // Check if enemy is defeated
          if (this.currentEnemy.health <= 0) {
            this.endCombat(true);
          } else {
            // Generate new rhythm if enemy still alive
            this.rhythmCombat.generateRhythm(this.currentEnemy.level);
          }
        }
      }
    }
    
    // Check collisions
    this.checkCollisions();
    
    // Check game over condition
    this.gameOverCheck();
    
    // Update camera position to follow player
    this.camera.position.x = this.player.mesh.position.x;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
} 