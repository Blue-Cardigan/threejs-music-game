import * as THREE from 'three';

export class Platform {
  constructor(width, height, depth, color) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;
    
    // Create platform mesh
    this.createMesh();
    
    // Create collision box
    this.createCollisionBox();
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshStandardMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Add some texture to the platform
    this.addTexture();
  }

  createCollisionBox() {
    // Create a slightly larger invisible box for better collision detection
    this.collisionBox = new THREE.Box3();
    
    // Update the collision box whenever the mesh position changes
    this.updateCollisionBox();
  }

  updateCollisionBox() {
    // Update the collision box to match the mesh position
    this.collisionBox.setFromObject(this.mesh);
    
    // Expand the box slightly for more forgiving collisions
    this.collisionBox.min.y -= 0.1;
    this.collisionBox.max.y += 0.1;
  }

  addTexture() {
    // Create a simple grid pattern on top of the platform
    const gridSize = Math.min(this.width, this.depth) / 2;
    const gridGeometry = new THREE.PlaneGeometry(this.width, this.depth);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.1,
      wireframe: true
    });
    
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = this.height / 2 + 0.01; // Slightly above the platform
    
    this.mesh.add(grid);
  }
  
  // Helper method to get the top Y position of the platform
  getTopY() {
    return this.mesh.position.y + (this.height / 2);
  }
} 