import * as THREE from 'three';
import { Enemy } from './Enemy.js';
import { random } from '../utils/helpers.js';

export class Level {
  constructor(scene, levelNumber) {
    this.scene = scene;
    this.levelNumber = levelNumber;
    this.mesh = null;
    this.enemies = [];
    this.obstacles = [];
    this.heart = null;
    this.elevator = null;
    this.isComplete = false;
    
    // Level dimensions
    this.width = 20;
    this.depth = 20;
    
    // Level properties based on level number
    this.enemyCount = Math.min(2 + Math.floor(levelNumber / 2), 8);
    this.obstacleCount = Math.min(3 + Math.floor(levelNumber / 3), 10);
    
    this.create();
  }
  
  /**
   * Create the level environment
   */
  create() {
    // Create a group to hold all level objects
    this.mesh = new THREE.Group();
    
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(this.width, this.depth);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xcccccc,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    this.mesh.add(floor);
    
    // Create walls
    this.createWalls();
    
    // Create office furniture as obstacles
    this.createObstacles();
    
    // Create enemies
    this.createEnemies();
    
    // Create elevator
    this.createElevator();
    
    // Create heart (chance increases with level)
    if (this.levelNumber > 3 && Math.random() < 0.3 + (this.levelNumber * 0.05)) {
      this.createHeart();
    }
    
    // Add level to scene
    this.scene.add(this.mesh);
  }
  
  /**
   * Create walls around the level
   */
  createWalls() {
    const wallHeight = 3;
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x999999 });
    
    // North wall
    const northWallGeometry = new THREE.BoxGeometry(this.width, wallHeight, 0.2);
    const northWall = new THREE.Mesh(northWallGeometry, wallMaterial);
    northWall.position.set(0, wallHeight / 2, -this.depth / 2);
    this.mesh.add(northWall);
    this.obstacles.push({
      position: northWall.position.clone(),
      size: new THREE.Vector3(this.width, wallHeight, 0.2),
      checkCollision: (point) => {
        return (
          point.x > northWall.position.x - this.width / 2 - 0.5 &&
          point.x < northWall.position.x + this.width / 2 + 0.5 &&
          point.z > northWall.position.z - 0.6 &&
          point.z < northWall.position.z + 0.6
        );
      }
    });
    
    // South wall
    const southWallGeometry = new THREE.BoxGeometry(this.width, wallHeight, 0.2);
    const southWall = new THREE.Mesh(southWallGeometry, wallMaterial);
    southWall.position.set(0, wallHeight / 2, this.depth / 2);
    this.mesh.add(southWall);
    this.obstacles.push({
      position: southWall.position.clone(),
      size: new THREE.Vector3(this.width, wallHeight, 0.2),
      checkCollision: (point) => {
        return (
          point.x > southWall.position.x - this.width / 2 - 0.5 &&
          point.x < southWall.position.x + this.width / 2 + 0.5 &&
          point.z > southWall.position.z - 0.6 &&
          point.z < southWall.position.z + 0.6
        );
      }
    });
    
    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(0.2, wallHeight, this.depth);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(this.width / 2, wallHeight / 2, 0);
    this.mesh.add(eastWall);
    this.obstacles.push({
      position: eastWall.position.clone(),
      size: new THREE.Vector3(0.2, wallHeight, this.depth),
      checkCollision: (point) => {
        return (
          point.z > eastWall.position.z - this.depth / 2 - 0.5 &&
          point.z < eastWall.position.z + this.depth / 2 + 0.5 &&
          point.x > eastWall.position.x - 0.6 &&
          point.x < eastWall.position.x + 0.6
        );
      }
    });
    
    // West wall
    const westWallGeometry = new THREE.BoxGeometry(0.2, wallHeight, this.depth);
    const westWall = new THREE.Mesh(westWallGeometry, wallMaterial);
    westWall.position.set(-this.width / 2, wallHeight / 2, 0);
    this.mesh.add(westWall);
    this.obstacles.push({
      position: westWall.position.clone(),
      size: new THREE.Vector3(0.2, wallHeight, this.depth),
      checkCollision: (point) => {
        return (
          point.z > westWall.position.z - this.depth / 2 - 0.5 &&
          point.z < westWall.position.z + this.depth / 2 + 0.5 &&
          point.x > westWall.position.x - 0.6 &&
          point.x < westWall.position.x + 0.6
        );
      }
    });
  }
  
  /**
   * Create office furniture as obstacles
   */
  createObstacles() {
    const obstacleTypes = [
      {
        name: 'desk',
        geometry: new THREE.BoxGeometry(2, 0.8, 1),
        material: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
        collisionSize: new THREE.Vector3(2, 0.8, 1)
      },
      {
        name: 'cabinet',
        geometry: new THREE.BoxGeometry(1, 1.5, 0.8),
        material: new THREE.MeshLambertMaterial({ color: 0x696969 }),
        collisionSize: new THREE.Vector3(1, 1.5, 0.8)
      },
      {
        name: 'plant',
        geometry: new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8),
        material: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
        collisionSize: new THREE.Vector3(0.8, 1.2, 0.8)
      }
    ];
    
    for (let i = 0; i < this.obstacleCount; i++) {
      // Choose a random obstacle type
      const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      // Create the obstacle mesh
      const obstacle = new THREE.Mesh(obstacleType.geometry, obstacleType.material);
      
      // Position randomly, but not too close to the center (player spawn)
      let x, z;
      do {
        x = random(-this.width / 2 + 2, this.width / 2 - 2);
        z = random(-this.depth / 2 + 2, this.depth / 2 - 2);
      } while (Math.sqrt(x * x + z * z) < 3); // Keep away from center
      
      obstacle.position.set(x, obstacleType.geometry.parameters.height / 2, z);
      
      // Add to level
      this.mesh.add(obstacle);
      
      // Add collision data
      this.obstacles.push({
        position: obstacle.position.clone(),
        size: obstacleType.collisionSize,
        checkCollision: (point) => {
          return (
            point.x > obstacle.position.x - obstacleType.collisionSize.x / 2 - 0.5 &&
            point.x < obstacle.position.x + obstacleType.collisionSize.x / 2 + 0.5 &&
            point.z > obstacle.position.z - obstacleType.collisionSize.z / 2 - 0.5 &&
            point.z < obstacle.position.z + obstacleType.collisionSize.z / 2 + 0.5
          );
        }
      });
    }
  }
  
  /**
   * Create enemies for the level
   */
  createEnemies() {
    const enemyTypes = ['manager', 'developer', 'designer'];
    
    for (let i = 0; i < this.enemyCount; i++) {
      // Choose a random enemy type
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      
      // Position randomly, but not too close to the center (player spawn)
      let x, z;
      do {
        x = random(-this.width / 2 + 3, this.width / 2 - 3);
        z = random(-this.depth / 2 + 3, this.depth / 2 - 3);
      } while (Math.sqrt(x * x + z * z) < 5); // Keep away from center
      
      // Create the enemy
      const enemy = new Enemy(
        this.scene,
        new THREE.Vector3(x, 0, z),
        enemyType,
        this.levelNumber
      );
      
      // Add to enemies array
      this.enemies.push(enemy);
    }
  }
  
  /**
   * Create the elevator to the next level
   */
  createElevator() {
    // Create elevator platform
    const platformGeometry = new THREE.BoxGeometry(2, 0.2, 2);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    
    // Position in a corner
    platform.position.set(this.width / 2 - 2, 0.1, this.depth / 2 - 2);
    
    // Create elevator doors
    const doorGeometry = new THREE.BoxGeometry(1.8, 2, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, -0.9);
    
    // Create elevator frame
    const frameGeometry = new THREE.BoxGeometry(2, 2, 0.1);
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 1, -1);
    
    // Create elevator group
    this.elevator = new THREE.Group();
    this.elevator.add(platform);
    this.elevator.add(door);
    this.elevator.add(frame);
    
    // Position the elevator
    this.elevator.position.copy(platform.position);
    platform.position.set(0, 0, 0);
    
    // Add to level
    this.mesh.add(this.elevator);
    
    // Initially disable the elevator (until all enemies are defeated)
    this.elevator.visible = false;
  }
  
  /**
   * Create a heart pickup for health restoration
   */
  createHeart() {
    // Create heart shape
    const heartShape = new THREE.Shape();
    
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.5, -1, -0.5, -1, 0.5);
    heartShape.bezierCurveTo(-1, 1, 0, 1.5, 0, 2);
    heartShape.bezierCurveTo(0, 1.5, 1, 1, 1, 0.5);
    heartShape.bezierCurveTo(1, -0.5, 0, -0.5, 0, 0);
    
    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    });
    
    const heartMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.heart = new THREE.Mesh(heartGeometry, heartMaterial);
    
    // Scale and rotate
    this.heart.scale.set(0.5, 0.5, 0.5);
    this.heart.rotation.x = Math.PI;
    
    // Position randomly, but not too close to enemies or obstacles
    let validPosition = false;
    let x, z;
    
    while (!validPosition) {
      x = random(-this.width / 2 + 3, this.width / 2 - 3);
      z = random(-this.depth / 2 + 3, this.depth / 2 - 3);
      
      // Check distance from center (player spawn)
      if (Math.sqrt(x * x + z * z) < 3) continue;
      
      // Check distance from enemies
      let tooCloseToEnemy = false;
      for (const enemy of this.enemies) {
        const distance = enemy.mesh.position.distanceTo(new THREE.Vector3(x, 0, z));
        if (distance < 3) {
          tooCloseToEnemy = true;
          break;
        }
      }
      
      if (tooCloseToEnemy) continue;
      
      // Check distance from obstacles
      let tooCloseToObstacle = false;
      for (const obstacle of this.obstacles) {
        const distance = obstacle.position.distanceTo(new THREE.Vector3(x, 0, z));
        if (distance < 2) {
          tooCloseToObstacle = true;
          break;
        }
      }
      
      if (tooCloseToObstacle) continue;
      
      validPosition = true;
    }
    
    this.heart.position.set(x, 1, z);
    
    // Add floating animation
    const floatAnimation = () => {
      if (!this.heart) return;
      
      this.heart.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.2;
      this.heart.rotation.y += 0.01;
      
      requestAnimationFrame(floatAnimation);
    };
    
    floatAnimation();
    
    // Add to level
    this.mesh.add(this.heart);
  }
  
  /**
   * Update the level state
   * @param {number} deltaTime - Time since last update
   * @param {THREE.Vector3} playerPosition - Player position
   * @returns {object} Interaction data
   */
  update(deltaTime, playerPosition) {
    const result = {
      enemyEngaged: null,
      heartCollected: false,
      elevatorEntered: false
    };
    
    // Check for enemy engagement
    if (!this.isComplete) {
      for (const enemy of this.enemies) {
        if (!enemy.isDefeated && enemy.update(deltaTime, playerPosition)) {
          result.enemyEngaged = enemy;
          break;
        }
      }
    }
    
    // Check if all enemies are defeated
    if (!this.isComplete && this.enemies.every(enemy => enemy.isDefeated)) {
      this.isComplete = true;
      this.elevator.visible = true;
    }
    
    // Check for heart collection
    if (this.heart && !this.heart.userData.collected) {
      const distance = this.heart.position.distanceTo(playerPosition);
      if (distance < 1.5) {
        this.heart.userData.collected = true;
        this.heart.visible = false;
        result.heartCollected = true;
      }
    }
    
    // Check for elevator entry
    if (this.isComplete) {
      const distance = this.elevator.position.distanceTo(playerPosition);
      if (distance < 1.5) {
        result.elevatorEntered = true;
      }
    }
    
    return result;
  }
  
  /**
   * Remove the level from the scene
   */
  remove() {
    // Remove enemies
    for (const enemy of this.enemies) {
      enemy.remove();
    }
    
    // Remove level mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
  }
} 