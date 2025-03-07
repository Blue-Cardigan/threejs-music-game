import * as THREE from 'three';

export class Enemy {
  constructor(color, level) {
    this.level = level;
    this.health = level * 50; // Health scales with level
    this.color = color;
    this.movementRange = 2;
    this.movementSpeed = 1 + (level * 0.2); // Speed increases with level
    this.initialPosition = new THREE.Vector3();
    this.direction = 1;
    
    // Create enemy mesh
    this.createMesh();
  }

  createMesh() {
    // Create enemy body
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Create enemy head
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1, 0);
    head.castShadow = true;
    head.receiveShadow = true;
    this.mesh.add(head);
    
    // Create enemy eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 0.1, 0.3);
    head.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 0.1, 0.3);
    head.add(rightEye);
    
    // Create enemy arms
    const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const armMaterial = new THREE.MeshStandardMaterial({ color: this.color });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 0, 0);
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;
    this.mesh.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 0, 0);
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;
    this.mesh.add(rightArm);
    
    // Create enemy legs
    const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -1, 0);
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;
    this.mesh.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -1, 0);
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;
    this.mesh.add(rightLeg);
    
    // Create a simple level indicator using a sprite
    const levelIndicator = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xFFFFFF })
    );
    levelIndicator.scale.set(0.5, 0.5, 1);
    levelIndicator.position.set(0, 1.5, 0);
    this.mesh.add(levelIndicator);
  }

  update(deltaTime) {
    // Store initial position if not already set
    if (this.initialPosition.length() === 0) {
      this.initialPosition.copy(this.mesh.position);
    }
    
    // Move enemy back and forth
    this.mesh.position.x += this.direction * this.movementSpeed * deltaTime;
    
    // Check if enemy has reached the end of its movement range
    if (Math.abs(this.mesh.position.x - this.initialPosition.x) >= this.movementRange) {
      this.direction *= -1; // Reverse direction
      
      // Rotate to face the new direction
      if (this.direction > 0) {
        this.mesh.rotation.y = Math.PI / 2;
      } else {
        this.mesh.rotation.y = -Math.PI / 2;
      }
    }
    
    // Animate enemy (simple bobbing motion)
    this.mesh.position.y = this.initialPosition.y + Math.sin(Date.now() * 0.003) * 0.1;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
    
    // Visual feedback for taking damage
    this.mesh.children[0].material.color.setHex(0xFF0000); // Turn head red
    
    // Reset head color after a short delay
    setTimeout(() => {
      if (this.mesh.children[0]) {
        this.mesh.children[0].material.color.setHex(0x333333);
      }
    }, 200);
  }
}