import * as THREE from 'three';

export class Player {
  constructor(audioManager) {
    this.health = 100;
    this.speed = 5;
    this.jumpForce = 15;
    this.gravity = 30;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.onGround = false;
    this.canMove = true;
    this.audioManager = audioManager;
    this.jumpPressed = false;
    this.jumpCooldown = 0;
    this.debugMode = true;
    
    // Create player mesh
    this.createMesh();
  }

  createMesh() {
    // Create player body
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
    this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.mesh.position.set(0, 1, 0);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Create player head
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFE4C4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1, 0);
    head.castShadow = true;
    head.receiveShadow = true;
    this.mesh.add(head);
    
    // Create player arms
    const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
    
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
    
    // Create player legs
    const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
    
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
  }

  update(deltaTime, keys) {
    if (!this.canMove) return;
    
    if (this.debugMode) {
      console.log(`deltaTime: ${deltaTime}, Jump key: ${keys.w}, onGround: ${this.onGround}, velocity.y: ${this.velocity.y}, position.y: ${this.mesh.position.y}`);
    }
    
    // Handle horizontal movement
    this.velocity.x = 0;
    if (keys.a) {
      this.velocity.x = -this.speed;
      this.mesh.rotation.y = Math.PI / 2; // Rotate to face left
    }
    if (keys.d) {
      this.velocity.x = this.speed;
      this.mesh.rotation.y = -Math.PI / 2; // Rotate to face right
    }
    
    // Handle jumping - only apply jump force when first pressing the key while on ground
    if (keys.w && !this.jumpPressed && this.onGround && this.jumpCooldown <= 0) {
      // Apply a strong initial upward velocity
      this.velocity.y = this.jumpForce;
      this.onGround = false;
      this.jumpCooldown = 0.3;
      this.audioManager.playSound('jump');
      
      // Trigger jump animation (visual only)
      this.animateJump();
      
      if (this.debugMode) {
        console.log("JUMP INITIATED! Setting velocity.y to " + this.jumpForce);
      }
    }
    
    this.jumpPressed = keys.w;
    
    // Update jump cooldown
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }
    
    // Apply gravity - make sure it's properly scaled by deltaTime
    if (!this.onGround) {
      this.velocity.y -= this.gravity * deltaTime;
      
      if (this.debugMode) {
        console.log(`Applying gravity: ${this.gravity * deltaTime}, new velocity.y: ${this.velocity.y}`);
      }
    } else {
      this.velocity.y = 0;
    }
    
    // Update position - make sure deltaTime is reasonable
    const cappedDeltaTime = Math.min(deltaTime, 0.1); // Cap deltaTime to prevent huge jumps
    const yMovement = this.velocity.y * cappedDeltaTime;
    
    this.mesh.position.x += this.velocity.x * cappedDeltaTime;
    this.mesh.position.y += yMovement;
    
    if (this.debugMode) {
      console.log(`Moving Y by: ${yMovement}, new position.y: ${this.mesh.position.y}`);
    }
    
    // Prevent falling below ground
    if (this.mesh.position.y < 1) {
      this.mesh.position.y = 1;
      this.onGround = true;
      
      // Only animate landing if we had significant downward velocity
      if (this.velocity.y < -2) {
        this.animateLand();
      }
      
      this.velocity.y = 0;
    }
  }

  animateJump() {
    // Only apply visual squash and stretch effects without modifying position
    
    // Squash before jumping
    this.mesh.scale.set(1.2, 0.8, 1.2);
    
    // Then stretch when jumping up
    setTimeout(() => {
      this.mesh.scale.set(0.8, 1.2, 0.8);
      
      // Return to normal scale after a short time
      setTimeout(() => {
        this.mesh.scale.set(1, 1, 1);
      }, 150);
    }, 50);
    
    // Animate legs for jump
    if (this.mesh.children.length >= 5) {
      const leftLeg = this.mesh.children[3];
      const rightLeg = this.mesh.children[4];
      
      // Bend legs back for jump
      leftLeg.rotation.x = -Math.PI / 4;
      rightLeg.rotation.x = -Math.PI / 4;
      
      // Return legs to normal position after jump animation
      setTimeout(() => {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
      }, 300);
    }
  }

  animateLand() {
    this.mesh.scale.set(1.3, 0.7, 1.3);
    
    setTimeout(() => {
      this.mesh.scale.set(1, 1, 1);
    }, 150);
    
    if (this.mesh.children.length >= 5) {
      const leftLeg = this.mesh.children[3];
      const rightLeg = this.mesh.children[4];
      
      leftLeg.rotation.x = Math.PI / 6;
      rightLeg.rotation.x = Math.PI / 6;
      
      setTimeout(() => {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
      }, 200);
    }
  }

  checkPlatformCollision(platform) {
    const playerBox = new THREE.Box3().setFromObject(this.mesh);
    const platformBox = new THREE.Box3().setFromObject(platform.mesh);
    
    // Check if player is above platform and falling
    if (this.velocity.y <= 0 && 
        playerBox.min.y <= platformBox.max.y && 
        playerBox.min.y >= platformBox.max.y - 0.5 &&
        playerBox.max.x > platformBox.min.x && 
        playerBox.min.x < platformBox.max.x && 
        playerBox.max.z > platformBox.min.z && 
        playerBox.min.z < platformBox.max.z) {
      
      this.mesh.position.y = platformBox.max.y + 0.75;
      this.onGround = true;
      this.velocity.y = 0;
      
      if (this.debugMode) {
        console.log("LANDED ON PLATFORM");
      }
      
      return true;
    }
    
    if (playerBox.intersectsBox(platformBox) &&
        playerBox.min.y < platformBox.max.y - 0.5 &&
        playerBox.max.y > platformBox.min.y) {
      
      if (this.velocity.x > 0 && playerBox.max.x > platformBox.min.x && 
          playerBox.min.x < platformBox.min.x) {
        this.mesh.position.x = platformBox.min.x - (playerBox.max.x - this.mesh.position.x) - 0.1;
      } else if (this.velocity.x < 0 && playerBox.min.x < platformBox.max.x && 
                playerBox.max.x > platformBox.max.x) {
        this.mesh.position.x = platformBox.max.x + (this.mesh.position.x - playerBox.min.x) + 0.1;
      }
    }
    
    return false;
  }

  checkEnemyCollision(enemy) {
    const playerBox = new THREE.Box3().setFromObject(this.mesh);
    const enemyBox = new THREE.Box3().setFromObject(enemy.mesh);
    
    return playerBox.intersectsBox(enemyBox);
  }

  checkMusicSymbolCollision(musicSymbol) {
    const playerBox = new THREE.Box3().setFromObject(this.mesh);
    const symbolBox = new THREE.Box3().setFromObject(musicSymbol);
    
    return playerBox.intersectsBox(symbolBox);
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) {
      this.health = 0;
    }
  }
} 