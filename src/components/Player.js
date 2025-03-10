import * as THREE from 'three';
import { createSpeechBubble } from '../utils/helpers.js';

export class Player {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.mesh = null;
    this.speechBubble = null;
    this.health = 100;
    this.maxHealth = 100;
    
    // Movement properties
    this.moveSpeed = 5;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    
    // Combat properties
    this.inCombat = false;
    this.currentEnemy = null;
    
    this.create();
    this.setupControls();
  }
  
  /**
   * Create the player mesh
   */
  create() {
    // Create a group to hold all player parts
    this.mesh = new THREE.Group();
    
    // Create the player body (a cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    this.mesh.add(body);
    
    // Create the player head (a sphere)
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xecf0f1 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.0;
    this.mesh.add(head);
    
    // Create the player's instrument (a guitar-like shape)
    const instrumentGroup = new THREE.Group();
    
    // Guitar body
    const guitarBodyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.2);
    const guitarBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const guitarBody = new THREE.Mesh(guitarBodyGeometry, guitarBodyMaterial);
    instrumentGroup.add(guitarBody);
    
    // Guitar neck
    const guitarNeckGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const guitarNeckMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const guitarNeck = new THREE.Mesh(guitarNeckGeometry, guitarNeckMaterial);
    guitarNeck.position.y = 0.9;
    instrumentGroup.add(guitarNeck);
    
    // Position the instrument
    instrumentGroup.position.set(0.6, 1.2, 0.3);
    instrumentGroup.rotation.z = Math.PI / 6;
    this.mesh.add(instrumentGroup);
    
    // Add the player to the scene
    this.scene.add(this.mesh);
    
    // Create a speech bubble (initially hidden)
    this.speechBubble = createSpeechBubble("Let's rock!", 2, 1, 0.2, 0x3498db);
    this.speechBubble.position.set(0, 2.8, 0);
    this.speechBubble.visible = false;
    this.mesh.add(this.speechBubble);
  }
  
  /**
   * Set up keyboard controls
   */
  setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.moveForward = true;
          break;
        case 'KeyS':
          this.moveBackward = true;
          break;
        case 'KeyD':
          this.moveLeft = true;
          break;
        case 'KeyA':
          this.moveRight = true;
          break;
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.moveForward = false;
          break;
        case 'KeyS':
          this.moveBackward = false;
          break;
        case 'KeyD':
          this.moveLeft = false;
          break;
        case 'KeyA':
          this.moveRight = false;
          break;
      }
    });
    
    // Mobile thumbstick controls
    this.setupThumbstickControls();
    
    // Mobile action button
    const actionButton = document.getElementById('action-button');
    if (actionButton) {
      actionButton.addEventListener('touchstart', () => {
        // Trigger action (interact with elevator, enemy, etc.)
        this.triggerAction();
      });
    }
  }
  
  /**
   * Set up thumbstick controls for mobile
   */
  setupThumbstickControls() {
    const thumbstickContainer = document.getElementById('thumbstick-container');
    const thumbstick = document.getElementById('thumbstick');
    
    if (!thumbstickContainer || !thumbstick) return;
    
    // Thumbstick state
    this.thumbstickActive = false;
    this.thumbstickStartX = 0;
    this.thumbstickStartY = 0;
    this.thumbstickCurrentX = 0;
    this.thumbstickCurrentY = 0;
    this.thumbstickMaxDistance = 40; // Maximum distance thumbstick can move from center
    
    // Touch start event
    thumbstickContainer.addEventListener('touchstart', (event) => {
      event.preventDefault();
      
      const touch = event.touches[0];
      const rect = thumbstickContainer.getBoundingClientRect();
      
      // Calculate touch position relative to container center
      this.thumbstickStartX = rect.left + rect.width / 2;
      this.thumbstickStartY = rect.top + rect.height / 2;
      this.thumbstickCurrentX = touch.clientX;
      this.thumbstickCurrentY = touch.clientY;
      
      // Activate thumbstick
      this.thumbstickActive = true;
      
      // Update thumbstick position
      this.updateThumbstickPosition();
    });
    
    // Touch move event
    thumbstickContainer.addEventListener('touchmove', (event) => {
      if (!this.thumbstickActive) return;
      
      event.preventDefault();
      
      const touch = event.touches[0];
      this.thumbstickCurrentX = touch.clientX;
      this.thumbstickCurrentY = touch.clientY;
      
      // Update thumbstick position
      this.updateThumbstickPosition();
      
      // Update movement based on thumbstick position
      this.updateMovementFromThumbstick();
    });
    
    // Touch end event
    thumbstickContainer.addEventListener('touchend', (event) => {
      event.preventDefault();
      
      // Reset thumbstick
      this.thumbstickActive = false;
      thumbstick.style.transform = 'translate(-50%, -50%)';
      
      // Reset movement
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
    });
    
    // Touch cancel event
    thumbstickContainer.addEventListener('touchcancel', (event) => {
      event.preventDefault();
      
      // Reset thumbstick
      this.thumbstickActive = false;
      thumbstick.style.transform = 'translate(-50%, -50%)';
      
      // Reset movement
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
    });
  }
  
  /**
   * Update thumbstick position based on touch
   */
  updateThumbstickPosition() {
    const thumbstick = document.getElementById('thumbstick');
    if (!thumbstick || !this.thumbstickActive) return;
    
    // Calculate distance from center
    let deltaX = this.thumbstickCurrentX - this.thumbstickStartX;
    let deltaY = this.thumbstickCurrentY - this.thumbstickStartY;
    
    // Calculate distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Limit distance to max
    if (distance > this.thumbstickMaxDistance) {
      const ratio = this.thumbstickMaxDistance / distance;
      deltaX *= ratio;
      deltaY *= ratio;
    }
    
    // Update thumbstick position
    thumbstick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
  }
  
  /**
   * Update movement based on thumbstick position
   */
  updateMovementFromThumbstick() {
    if (!this.thumbstickActive) return;
    
    // Calculate distance from center
    const deltaX = this.thumbstickCurrentX - this.thumbstickStartX;
    const deltaY = this.thumbstickCurrentY - this.thumbstickStartY;
    
    // Reset movement
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    
    // Set movement based on thumbstick position
    // Use a threshold to prevent accidental movement
    const threshold = 10;
    
    if (deltaY < -threshold) {
      this.moveForward = true;
    } else if (deltaY > threshold) {
      this.moveBackward = true;
    }
    
    if (deltaX < -threshold) {
      this.moveRight = true;
    } else if (deltaX > threshold) {
      this.moveLeft = true;
    }
  }
  
  /**
   * Trigger action (interact with elevator, enemy, etc.)
   */
  triggerAction() {
    // This will be called when the action button is pressed
    // The game logic will handle what action to perform based on the player's position
    console.log('Action button pressed');
  }
  
  /**
   * Update player position and state
   * @param {number} deltaTime - Time since last update
   * @param {THREE.Camera} camera - Camera to update
   * @param {Array} obstacles - Array of obstacle objects to check for collisions
   */
  update(deltaTime, camera, obstacles = []) {
    if (this.inCombat) return;
    
    // Calculate velocity based on input
    this.velocity.x = 0;
    this.velocity.z = 0;
    
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();
    
    // Apply camera direction to movement
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    const cameraRight = new THREE.Vector3(
      cameraDirection.z,
      0,
      -cameraDirection.x
    );
    
    this.velocity.add(
      cameraDirection.multiplyScalar(this.direction.z * this.moveSpeed * deltaTime)
    );
    this.velocity.add(
      cameraRight.multiplyScalar(this.direction.x * this.moveSpeed * deltaTime)
    );
    
    // Check for collisions with obstacles
    const nextPosition = this.mesh.position.clone().add(this.velocity);
    let collision = false;
    
    for (const obstacle of obstacles) {
      if (obstacle.checkCollision(nextPosition)) {
        collision = true;
        break;
      }
    }
    
    // Update position if no collision
    if (!collision) {
      this.mesh.position.add(this.velocity);
      
      // Update camera position to follow player
      camera.position.x = this.mesh.position.x;
      camera.position.z = this.mesh.position.z + 5;
    }
    
    // Make the player face the direction of movement
    if (this.velocity.length() > 0.01) {
      const angle = Math.atan2(this.velocity.x, this.velocity.z);
      this.mesh.rotation.y = angle;
    }
  }
  
  /**
   * Take damage
   * @param {number} amount - Amount of damage to take
   * @returns {boolean} True if the player is still alive
   */
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    // Update health bar UI
    document.getElementById('health-fill').style.width = `${(this.health / this.maxHealth) * 100}%`;
    
    // Show speech bubble with reaction
    this.showSpeechBubble("Ouch!", 1000);
    
    return this.health > 0;
  }
  
  /**
   * Heal the player
   * @param {number} amount - Amount of health to restore
   */
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    
    // Update health bar UI
    document.getElementById('health-fill').style.width = `${(this.health / this.maxHealth) * 100}%`;
    
    // Show speech bubble with reaction
    this.showSpeechBubble("That's better!", 1000);
  }
  
  /**
   * Show a speech bubble with text
   * @param {string} text - Text to display
   * @param {number} duration - Duration to show the bubble (in ms)
   */
  showSpeechBubble(text, duration = 2000) {
    // Remove existing speech bubble
    if (this.speechBubble) {
      this.mesh.remove(this.speechBubble);
    }
    
    // Create a new speech bubble
    this.speechBubble = createSpeechBubble(text, 2, 1, 0.2, 0x3498db);
    this.speechBubble.position.set(0, 2.8, 0);
    this.mesh.add(this.speechBubble);
    
    // Hide the speech bubble after duration
    setTimeout(() => {
      if (this.speechBubble) {
        this.speechBubble.visible = false;
      }
    }, duration);
  }
  
  /**
   * Start combat with an enemy
   * @param {Enemy} enemy - Enemy to fight
   */
  startCombat(enemy) {
    this.inCombat = true;
    this.currentEnemy = enemy;
    this.showSpeechBubble("Let's battle with music!");
  }
  
  /**
   * End combat
   * @param {boolean} victory - Whether the player won
   */
  endCombat(victory) {
    this.inCombat = false;
    this.currentEnemy = null;
    
    if (victory) {
      this.showSpeechBubble("I won! Music conquers all!");
    }
  }
  
  /**
   * Reset the player to initial state
   */
  reset() {
    this.health = this.maxHealth;
    document.getElementById('health-fill').style.width = '100%';
    this.inCombat = false;
    this.currentEnemy = null;
    this.mesh.position.set(0, 0, 0);
    
    if (this.speechBubble) {
      this.speechBubble.visible = false;
    }
  }
} 