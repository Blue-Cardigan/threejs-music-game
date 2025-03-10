import * as THREE from 'three';
import { createSpeechBubble } from '../utils/helpers.js';

export class Enemy {
  constructor(scene, position, type, level) {
    this.scene = scene;
    this.position = position;
    this.type = type;
    this.level = level;
    this.mesh = null;
    this.speechBubble = null;
    this.health = 50 + (level * 10);
    this.maxHealth = this.health;
    this.isDefeated = false;
    this.isConverted = false;
    
    // Different enemy types
    this.enemyTypes = {
      manager: {
        color: 0xff5555,
        scale: 1.2,
        phrases: [
          "Music has no place in this office!",
          "Your quarterly performance is lacking!",
          "This isn't a concert hall!"
        ]
      },
      developer: {
        color: 0x55ff55,
        scale: 1.0,
        phrases: [
          "Your code is buggy!",
          "This doesn't follow our style guide!",
          "Did you even test this?"
        ]
      },
      designer: {
        color: 0x5555ff,
        scale: 1.0,
        phrases: [
          "Your design lacks harmony!",
          "The visual rhythm is all wrong!",
          "This needs more white space!"
        ]
      }
    };
    
    this.create();
  }
  
  /**
   * Create the enemy mesh
   */
  create() {
    // Create a group to hold all enemy parts
    this.mesh = new THREE.Group();
    
    const enemyType = this.enemyTypes[this.type] || this.enemyTypes.developer;
    
    // Create the enemy body (a cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: enemyType.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    this.mesh.add(body);
    
    // Create the enemy head (a sphere)
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xecf0f1 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.0;
    this.mesh.add(head);
    
    // Add some office props based on enemy type
    if (this.type === 'manager') {
      // Add a tie
      const tieGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.05);
      const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const tie = new THREE.Mesh(tieGeometry, tieMaterial);
      tie.position.set(0, 1.2, 0.3);
      this.mesh.add(tie);
    } else if (this.type === 'developer') {
      // Add glasses
      const glassesGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.05);
      const glassesMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
      const glasses = new THREE.Mesh(glassesGeometry, glassesMaterial);
      glasses.position.set(0, 2.0, 0.4);
      this.mesh.add(glasses);
    } else if (this.type === 'designer') {
      // Add a scarf
      const scarfGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.1);
      const scarfMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff });
      const scarf = new THREE.Mesh(scarfGeometry, scarfMaterial);
      scarf.position.set(0, 1.6, 0);
      this.mesh.add(scarf);
    }
    
    // Scale based on enemy type
    this.mesh.scale.set(enemyType.scale, enemyType.scale, enemyType.scale);
    
    // Position the enemy
    this.mesh.position.copy(this.position);
    
    // Add the enemy to the scene
    this.scene.add(this.mesh);
    
    // Create a speech bubble (initially hidden)
    const randomPhrase = this.getRandomPhrase();
    this.speechBubble = createSpeechBubble(randomPhrase, 2, 1, 0.2, 0xf39c12);
    this.speechBubble.position.set(0, 2.8, 0);
    this.speechBubble.visible = false;
    this.mesh.add(this.speechBubble);
  }
  
  /**
   * Get a random phrase for this enemy type
   * @returns {string} Random phrase
   */
  getRandomPhrase() {
    const enemyType = this.enemyTypes[this.type] || this.enemyTypes.developer;
    const phrases = enemyType.phrases;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  
  /**
   * Update enemy state
   * @param {number} deltaTime - Time since last update
   * @param {THREE.Vector3} playerPosition - Player position
   * @returns {boolean} True if the player is close enough to engage
   */
  update(deltaTime, playerPosition) {
    if (this.isDefeated) return false;
    
    // Make the enemy face the player
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, this.mesh.position)
      .normalize();
    
    this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
    
    // Check if player is close enough to engage
    const distance = playerPosition.distanceTo(this.mesh.position);
    const engagementDistance = 2.5;
    
    // Occasionally show speech bubble when player is nearby but not engaging
    if (distance < 5 && distance > engagementDistance && Math.random() < 0.005) {
      this.showSpeechBubble(this.getRandomPhrase(), 2000);
    }
    
    return distance < engagementDistance;
  }
  
  /**
   * Take damage
   * @param {number} amount - Amount of damage to take
   * @returns {boolean} True if the enemy is defeated
   */
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    
    // Show speech bubble with reaction
    if (this.health <= 0) {
      this.isDefeated = true;
      this.showSpeechBubble("You've won me over with your music!", 2000);
      this.convert();
      return true;
    } else {
      const healthPercentage = this.health / this.maxHealth;
      
      if (healthPercentage < 0.25) {
        this.showSpeechBubble("Maybe your music isn't so bad...", 1000);
      } else if (healthPercentage < 0.5) {
        this.showSpeechBubble("That's... actually pretty good.", 1000);
      } else {
        this.showSpeechBubble("Ouch! Stop that!", 1000);
      }
      
      return false;
    }
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
    this.speechBubble = createSpeechBubble(text, 2, 1, 0.2, 0xf39c12);
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
   * Convert the enemy to an ally
   */
  convert() {
    this.isConverted = true;
    
    // Change color to indicate conversion
    this.mesh.traverse((child) => {
      if (child.isMesh && child.material.color) {
        // Brighten the color
        const color = child.material.color;
        color.r = Math.min(1, color.r + 0.3);
        color.g = Math.min(1, color.g + 0.3);
        color.b = Math.min(1, color.b + 0.3);
      }
    });
    
    // Add a musical instrument to show conversion
    const instrumentGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const instrumentMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const instrument = new THREE.Mesh(instrumentGeometry, instrumentMaterial);
    instrument.position.set(0.6, 1.2, 0.3);
    this.mesh.add(instrument);
    
    // Make the enemy dance (simple rotation animation)
    const rotateAnimation = () => {
      this.mesh.rotation.y += 0.01;
      
      if (this.isConverted) {
        requestAnimationFrame(rotateAnimation);
      }
    };
    
    rotateAnimation();
  }
  
  /**
   * Check if a point collides with this enemy
   * @param {THREE.Vector3} point - Point to check
   * @returns {boolean} True if there is a collision
   */
  checkCollision(point) {
    if (this.isDefeated) return false;
    
    const distance = point.distanceTo(this.mesh.position);
    return distance < 1.0;
  }
  
  /**
   * Remove the enemy from the scene
   */
  remove() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
} 