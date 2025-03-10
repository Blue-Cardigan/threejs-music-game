import * as THREE from 'three';

export class Enemy {
  constructor(scene, assets, config) {
    this.scene = scene;
    this.assets = assets;
    
    // Enemy properties
    this.width = config.width || 1;
    this.height = config.height || 2;
    this.speed = config.speed || 2;
    this.health = config.health || 100;
    this.type = config.type || 'Politician';
    this.difficulty = config.difficulty || 1;
    
    // Movement state
    this.direction = 1; // 1 for right, -1 for left
    this.patrolDistance = config.patrolDistance || 5;
    this.startX = config.x;
    this.leftBound = this.startX - this.patrolDistance / 2;
    this.rightBound = this.startX + this.patrolDistance / 2;
    
    // Animation state
    this.currentAnimation = 'idle';
    this.animationFrame = 0;
    this.animationTime = 0;
    this.animationSpeed = 0.1; // seconds per frame
    
    // Create enemy mesh
    this.createMesh(config.x, config.y);
  }
  
  createMesh(x, y) {
    // Create enemy geometry
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    
    // Create enemy material with texture
    const material = new THREE.MeshBasicMaterial({
      map: this.assets.textures.enemy.idle.frames[0],
      transparent: true,
      side: THREE.DoubleSide
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, 0);
    
    // Add to scene
    this.scene.add(this.mesh);
  }
  
  update(deltaTime, platforms) {
    // Update animation
    this.updateAnimation(deltaTime);
    
    // Move enemy based on direction
    this.mesh.position.x += this.direction * this.speed * deltaTime;
    
    // Check if enemy has reached patrol bounds
    if (this.mesh.position.x <= this.leftBound) {
      this.mesh.position.x = this.leftBound;
      this.direction = 1;
      this.mesh.scale.x = Math.abs(this.mesh.scale.x); // Face right
      
      if (this.currentAnimation !== 'run') {
        this.setAnimation('run');
      }
    } else if (this.mesh.position.x >= this.rightBound) {
      this.mesh.position.x = this.rightBound;
      this.direction = -1;
      this.mesh.scale.x = -Math.abs(this.mesh.scale.x); // Face left
      
      if (this.currentAnimation !== 'run') {
        this.setAnimation('run');
      }
    }
    
    // Check for platform collisions to ensure enemy stays on platforms
    this.checkPlatformCollisions(platforms, deltaTime);
  }
  
  setAnimation(animationName) {
    if (this.currentAnimation === animationName) return;
    
    this.currentAnimation = animationName;
    this.animationFrame = 0;
    this.animationTime = 0;
    
    // Update texture based on animation's first frame
    this.updateAnimationFrame();
  }
  
  updateAnimationFrame() {
    // Get the current animation data
    let animationData;
    switch (this.currentAnimation) {
      case 'idle':
        animationData = this.assets.textures.enemy.idle;
        break;
      case 'run':
        animationData = this.assets.textures.enemy.run;
        break;
      case 'jump':
        animationData = this.assets.textures.enemy.jump;
        break;
      case 'fall':
        animationData = this.assets.textures.enemy.fall;
        break;
      case 'hit':
        animationData = this.assets.textures.enemy.hit;
        break;
      default:
        animationData = this.assets.textures.enemy.idle;
    }
    
    // Update the texture to the current frame
    if (animationData.frames && animationData.frames.length > this.animationFrame) {
      this.mesh.material.map = animationData.frames[this.animationFrame];
      this.mesh.material.needsUpdate = true;
    }
  }
  
  updateAnimation(deltaTime) {
    // Update animation time
    this.animationTime += deltaTime;
    
    // Check if it's time to advance to the next frame
    if (this.animationTime >= this.animationSpeed) {
      this.animationTime = 0;
      
      // Get the number of frames for the current animation
      let frameCount;
      switch (this.currentAnimation) {
        case 'idle':
          frameCount = this.assets.textures.enemy.idle.frameCount;
          break;
        case 'run':
          frameCount = this.assets.textures.enemy.run.frameCount;
          break;
        case 'jump':
          frameCount = this.assets.textures.enemy.jump.frameCount;
          break;
        case 'fall':
          frameCount = this.assets.textures.enemy.fall.frameCount;
          break;
        case 'hit':
          frameCount = this.assets.textures.enemy.hit.frameCount;
          break;
        default:
          frameCount = 1;
      }
      
      // Advance to the next frame, looping back to 0 if needed
      this.animationFrame = (this.animationFrame + 1) % frameCount;
      
      // Update the texture to the new frame
      this.updateAnimationFrame();
    }
  }
  
  checkPlatformCollisions(platforms, deltaTime) {
    // Get enemy bounds
    const enemyHalfWidth = this.width / 2;
    const enemyHalfHeight = this.height / 2;
    const enemyLeft = this.mesh.position.x - enemyHalfWidth;
    const enemyRight = this.mesh.position.x + enemyHalfWidth;
    const enemyBottom = this.mesh.position.y - enemyHalfHeight;
    
    // Check if enemy is on a platform
    let isOnPlatform = false;
    
    platforms.forEach(platform => {
      // Get platform bounds
      const platformHalfWidth = platform.width / 2;
      const platformHalfHeight = platform.height / 2;
      const platformLeft = platform.mesh.position.x - platformHalfWidth;
      const platformRight = platform.mesh.position.x + platformHalfWidth;
      const platformTop = platform.mesh.position.y + platformHalfHeight;
      
      // Check if enemy is directly above platform
      if (enemyRight > platformLeft && 
          enemyLeft < platformRight && 
          Math.abs(enemyBottom - platformTop) < 0.1) {
        isOnPlatform = true;
      }
    });
    
    // If enemy is about to walk off platform, change direction
    if (!isOnPlatform) {
      this.direction *= -1;
      
      if (this.direction === 1) {
        this.mesh.scale.x = Math.abs(this.mesh.scale.x); // Face right
      } else {
        this.mesh.scale.x = -Math.abs(this.mesh.scale.x); // Face left
      }
      
      // Move enemy back onto platform
      if (this.mesh.position.x < this.startX) {
        this.mesh.position.x += this.speed * deltaTime;
      } else {
        this.mesh.position.x -= this.speed * deltaTime;
      }
      
      // Set run animation
      if (this.currentAnimation !== 'run') {
        this.setAnimation('run');
      }
    }
  }
  
  takeDamage(amount) {
    this.health -= amount;
    
    // Play hit animation
    this.setAnimation('hit');
    
    // After hit animation, go back to run or idle
    setTimeout(() => {
      if (Math.abs(this.direction) > 0) {
        this.setAnimation('run');
      } else {
        this.setAnimation('idle');
      }
    }, this.animationSpeed * this.assets.textures.enemy.hit.frameCount * 1000);
    
    return this.health <= 0;
  }
} 