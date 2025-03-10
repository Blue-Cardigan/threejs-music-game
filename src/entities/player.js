import * as THREE from 'three';

export class Player {
  constructor(scene, assets, config) {
    this.scene = scene;
    this.assets = assets;
    
    // Player properties
    this.width = config.width || 1;
    this.height = config.height || 2;
    this.speed = 5;
    this.jumpForce = 10;
    this.gravity = 20;
    this.maxJumpTime = 0.3; // Maximum time in seconds that jump can be held
    this.currentJumpTime = 0;
    this.canDoubleJump = true;
    
    // Physics state
    this.velocity = new THREE.Vector2(0, 0);
    this.isGrounded = false;
    this.isJumping = false;
    this.direction = 1; // 1 for right, -1 for left
    
    // Animation state
    this.currentAnimation = 'idle';
    this.animationFrame = 0;
    this.animationTime = 0;
    this.animationSpeed = 0.1; // seconds per frame
    
    // Create player mesh
    this.createMesh(config.x, config.y);
  }
  
  createMesh(x, y) {
    // Create player geometry
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    
    // Create player material with texture
    const material = new THREE.MeshBasicMaterial({
      map: this.assets.textures.player.idle.frames[0],
      transparent: true,
      side: THREE.DoubleSide
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, 0);
    
    // Add to scene
    this.scene.add(this.mesh);
  }
  
  update(deltaTime, keys, platforms) {
    // Update animation
    this.updateAnimation(deltaTime);
    
    // Handle horizontal movement
    if (keys.left) {
      this.velocity.x = -this.speed;
      this.direction = -1;
      this.mesh.scale.x = -Math.abs(this.mesh.scale.x); // Flip sprite
      
      if (this.isGrounded && this.currentAnimation !== 'run') {
        this.setAnimation('run');
      }
    } else if (keys.right) {
      this.velocity.x = this.speed;
      this.direction = 1;
      this.mesh.scale.x = Math.abs(this.mesh.scale.x); // Normal sprite
      
      if (this.isGrounded && this.currentAnimation !== 'run') {
        this.setAnimation('run');
      }
    } else {
      this.velocity.x = 0;
      
      if (this.isGrounded && this.currentAnimation !== 'idle') {
        this.setAnimation('idle');
      }
    }
    
    // Handle jumping
    if (keys.up) {
      if (this.isGrounded) {
        // Initial jump
        if (!this.isJumping) {
          this.velocity.y = this.jumpForce;
          this.isJumping = true;
          this.currentJumpTime = 0;
          this.setAnimation('jump');
          this.assets.audio.jump.play();
        } 
        // Continue jump while key is held (variable jump height)
        else if (this.currentJumpTime < this.maxJumpTime) {
          this.currentJumpTime += deltaTime;
          this.velocity.y = this.jumpForce * (1 - this.currentJumpTime / this.maxJumpTime);
        }
      } 
      // Double jump
      else if (!this.isGrounded && this.canDoubleJump && this.velocity.y < 0) {
        this.velocity.y = this.jumpForce * 0.8; // Slightly weaker double jump
        this.canDoubleJump = false;
        this.setAnimation('doubleJump');
        this.assets.audio.jump.play();
      }
    } else {
      // If jump key is released, stop adding upward force
      this.isJumping = false;
    }
    
    // Apply gravity
    this.velocity.y -= this.gravity * deltaTime;
    
    // Set falling animation if moving downward and not on ground
    if (this.velocity.y < -0.5 && !this.isGrounded && this.currentAnimation !== 'fall') {
      this.setAnimation('fall');
    }
    
    // Update position
    this.mesh.position.x += this.velocity.x * deltaTime;
    this.mesh.position.y += this.velocity.y * deltaTime;
    
    // Check for collisions with platforms
    this.checkPlatformCollisions(platforms);
  }
  
  jump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isJumping = true;
      this.currentJumpTime = 0;
      this.isGrounded = false;
      this.setAnimation('jump');
    } else if (this.canDoubleJump) {
      this.velocity.y = this.jumpForce * 0.8; // Slightly weaker double jump
      this.canDoubleJump = false;
      this.setAnimation('doubleJump');
    }
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
        animationData = this.assets.textures.player.idle;
        break;
      case 'run':
        animationData = this.assets.textures.player.run;
        break;
      case 'jump':
        animationData = this.assets.textures.player.jump;
        break;
      case 'doubleJump':
        animationData = this.assets.textures.player.doubleJump;
        break;
      case 'fall':
        animationData = this.assets.textures.player.fall;
        break;
      case 'hit':
        animationData = this.assets.textures.player.hit;
        break;
      default:
        animationData = this.assets.textures.player.idle;
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
          frameCount = this.assets.textures.player.idle.frameCount;
          break;
        case 'run':
          frameCount = this.assets.textures.player.run.frameCount;
          break;
        case 'jump':
          frameCount = this.assets.textures.player.jump.frameCount;
          break;
        case 'doubleJump':
          frameCount = this.assets.textures.player.doubleJump.frameCount;
          break;
        case 'fall':
          frameCount = this.assets.textures.player.fall.frameCount;
          break;
        case 'hit':
          frameCount = this.assets.textures.player.hit.frameCount;
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
  
  checkPlatformCollisions(platforms) {
    // Store previous grounded state
    const wasGrounded = this.isGrounded;
    
    // Reset grounded state
    this.isGrounded = false;
    
    // Get player bounds
    const playerHalfWidth = this.width / 2;
    const playerHalfHeight = this.height / 2;
    const playerLeft = this.mesh.position.x - playerHalfWidth;
    const playerRight = this.mesh.position.x + playerHalfWidth;
    const playerBottom = this.mesh.position.y - playerHalfHeight;
    const playerTop = this.mesh.position.y + playerHalfHeight;
    
    // Check each platform
    platforms.forEach(platform => {
      // Get platform bounds
      const platformHalfWidth = platform.width / 2;
      const platformHalfHeight = platform.height / 2;
      const platformLeft = platform.mesh.position.x - platformHalfWidth;
      const platformRight = platform.mesh.position.x + platformHalfWidth;
      const platformBottom = platform.mesh.position.y - platformHalfHeight;
      const platformTop = platform.mesh.position.y + platformHalfHeight;
      
      // Check for collision
      if (playerRight > platformLeft && 
          playerLeft < platformRight && 
          playerBottom < platformTop && 
          playerTop > platformBottom) {
        
        // Calculate overlap on each axis
        const overlapX = Math.min(playerRight - platformLeft, platformRight - playerLeft);
        const overlapY = Math.min(playerTop - platformBottom, platformTop - playerBottom);
        
        // Resolve collision based on smallest overlap
        if (overlapX < overlapY) {
          // Horizontal collision
          if (this.mesh.position.x < platform.mesh.position.x) {
            // Collision from left
            this.mesh.position.x = platformLeft - playerHalfWidth;
          } else {
            // Collision from right
            this.mesh.position.x = platformRight + playerHalfWidth;
          }
          this.velocity.x = 0;
        } else {
          // Vertical collision
          if (this.mesh.position.y > platform.mesh.position.y) {
            // Collision from above
            this.mesh.position.y = platformTop + playerHalfHeight;
            this.velocity.y = 0;
          } else {
            // Collision from below
            this.mesh.position.y = platformBottom - playerHalfHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
            
            // Reset double jump when landing
            this.canDoubleJump = true;
            
            // Set idle animation if not moving horizontally
            if (Math.abs(this.velocity.x) < 0.1 && this.currentAnimation !== 'idle') {
              this.setAnimation('idle');
            } else if (Math.abs(this.velocity.x) > 0.1 && this.currentAnimation !== 'run') {
              this.setAnimation('run');
            }
          }
        }
      }
    });
    
    // If player just landed, play landing effect
    if (!wasGrounded && this.isGrounded) {
      // Could add a landing effect here
    }
  }
  
  reset() {
    // Reset position
    this.mesh.position.set(0, 2, 0);
    
    // Reset velocity
    this.velocity.set(0, 0);
    
    // Reset direction
    this.direction = 1;
    this.mesh.scale.x = Math.abs(this.mesh.scale.x);
    
    // Reset jump state
    this.isJumping = false;
    this.canDoubleJump = true;
    
    // Reset animation
    this.setAnimation('idle');
  }
} 