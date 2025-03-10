import * as THREE from 'three';

export class Platform {
  constructor(scene, assets, config) {
    this.scene = scene;
    this.assets = assets;
    
    // Platform properties
    this.width = config.width || 5;
    this.height = config.height || 1;
    this.type = config.type || 'grass'; // grass, dirt, or metal
    this.tileIndex = config.tileIndex !== undefined ? config.tileIndex : Math.floor(Math.random() * 6); // Random tile index
    
    // Create platform mesh
    this.createMesh(config.x, config.y);
  }
  
  createMesh(x, y) {
    // Calculate how many tiles we need based on width
    const tileSize = 1; // Each tile is 1 unit wide
    const numTiles = Math.ceil(this.width / tileSize);
    
    // Create a group to hold all tiles
    this.mesh = new THREE.Group();
    this.mesh.position.set(x, y, 0);
    
    // Select texture array based on type
    let textureArray;
    switch (this.type) {
      case 'grass':
        textureArray = this.assets.textures.tiles.grass;
        break;
      case 'dirt':
        textureArray = this.assets.textures.tiles.dirt;
        break;
      case 'metal':
        textureArray = this.assets.textures.tiles.metal;
        break;
      default:
        textureArray = this.assets.textures.tiles.grass;
    }
    
    // Create individual tiles and place them side by side
    for (let i = 0; i < numTiles; i++) {
      // Calculate position for this tile
      const tileX = (i * tileSize) - (this.width / 2) + (tileSize / 2);
      
      // Select texture for this tile (can vary or be the same)
      const tileIndex = (this.tileIndex + i) % textureArray.length;
      const texture = textureArray[tileIndex];
      
      // Create tile geometry and material
      const tileGeometry = new THREE.PlaneGeometry(tileSize, this.height);
      const tileMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      // Create tile mesh
      const tileMesh = new THREE.Mesh(tileGeometry, tileMaterial);
      tileMesh.position.set(tileX, 0, 0);
      
      // Add tile to group
      this.mesh.add(tileMesh);
    }
    
    // Add group to scene
    this.scene.add(this.mesh);
  }
} 