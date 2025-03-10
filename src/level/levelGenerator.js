export class LevelGenerator {
  constructor(scene, assets) {
    this.scene = scene;
    this.assets = assets;
  }
  
  generateLevel(playerLevel) {
    // If it's the first level, create a predefined level
    if (playerLevel === 1) {
      return this.generateFirstLevel();
    }
    
    // Otherwise, generate a procedural level
    return this.generateProceduralLevel(playerLevel);
  }
  
  generateFirstLevel() {
    // Level data to return
    const levelData = {
      platforms: [],
      enemies: []
    };
    
    // Create ground platforms with grass tiles
    // Main ground
    levelData.platforms.push({
      x: 0,
      y: -2,
      width: 20,
      height: 1,
      type: 'grass',
      tileIndex: 0
    });
    
    // Extended ground to the right
    levelData.platforms.push({
      x: 15,
      y: -2,
      width: 10,
      height: 1,
      type: 'grass',
      tileIndex: 1
    });
    
    // Extended ground to the left
    levelData.platforms.push({
      x: -15,
      y: -2,
      width: 10,
      height: 1,
      type: 'grass',
      tileIndex: 2
    });
    
    // Create elevated platforms
    // Left elevated platform
    levelData.platforms.push({
      x: -8,
      y: 0,
      width: 5,
      height: 1,
      type: 'dirt',
      tileIndex: 0
    });
    
    // Middle elevated platform
    levelData.platforms.push({
      x: 0,
      y: 2,
      width: 6,
      height: 1,
      type: 'metal',
      tileIndex: 0
    });
    
    // Right elevated platform
    levelData.platforms.push({
      x: 8,
      y: 0,
      width: 5,
      height: 1,
      type: 'dirt',
      tileIndex: 1
    });
    
    // Highest platform
    levelData.platforms.push({
      x: 0,
      y: 4,
      width: 3,
      height: 1,
      type: 'metal',
      tileIndex: 2
    });
    
    // Add enemies
    // Enemy on left platform
    levelData.enemies.push({
      x: -8,
      y: 1,
      width: 1,
      height: 2,
      health: 100,
      type: 'Corrupt Politician',
      difficulty: 1,
      speed: 1.5,
      patrolDistance: 4
    });
    
    // Enemy on right platform
    levelData.enemies.push({
      x: 8,
      y: 1,
      width: 1,
      height: 2,
      health: 100,
      type: 'Lobbyist',
      difficulty: 1,
      speed: 1.5,
      patrolDistance: 4
    });
    
    // Enemy on middle platform
    levelData.enemies.push({
      x: 0,
      y: 3,
      width: 1,
      height: 2,
      health: 150,
      type: 'Corporate Shill',
      difficulty: 2,
      speed: 2,
      patrolDistance: 5
    });
    
    // Enemy on ground
    levelData.enemies.push({
      x: 5,
      y: -1,
      width: 1,
      height: 2,
      health: 80,
      type: 'Tax Evader',
      difficulty: 1,
      speed: 1,
      patrolDistance: 8
    });
    
    return levelData;
  }
  
  generateProceduralLevel(playerLevel) {
    // Level data to return
    const levelData = {
      platforms: [],
      enemies: []
    };
    
    // Adjust difficulty based on player level
    const difficulty = Math.max(1, playerLevel);
    
    // Generate ground platform
    levelData.platforms.push({
      x: 0,
      y: -2,
      width: 20,
      height: 1,
      type: 'grass',
      tileIndex: Math.floor(Math.random() * 6)
    });
    
    // Generate additional platforms
    const numPlatforms = 5 + Math.min(5, Math.floor(difficulty / 2));
    
    for (let i = 0; i < numPlatforms; i++) {
      // Generate platform position
      const x = (Math.random() * 30) - 15; // -15 to 15
      const y = Math.random() * 6 - 1; // -1 to 5
      
      // Generate platform size
      const width = 3 + Math.random() * 5; // 3 to 8
      const height = 0.5 + Math.random() * 0.5; // 0.5 to 1
      
      // Determine platform type
      let type;
      const typeRoll = Math.random();
      if (typeRoll < 0.4) {
        type = 'grass';
      } else if (typeRoll < 0.7) {
        type = 'dirt';
      } else {
        type = 'metal';
      }
      
      // Add platform
      levelData.platforms.push({
        x,
        y,
        width,
        height,
        type,
        tileIndex: Math.floor(Math.random() * 6) // Random tile index
      });
    }
    
    // Generate enemies
    const numEnemies = Math.min(10, Math.max(2, Math.floor(difficulty * 1.5)));
    const enemyTypes = [
      'Corrupt Politician',
      'Lobbyist',
      'Corporate Shill',
      'Tax Evader',
      'Filibuster'
    ];
    
    for (let i = 0; i < numEnemies; i++) {
      // Select a platform for the enemy
      const platformIndex = Math.floor(Math.random() * levelData.platforms.length);
      const platform = levelData.platforms[platformIndex];
      
      // Calculate enemy position
      const x = platform.x + (Math.random() * platform.width) - (platform.width / 2);
      const y = platform.y + (platform.height / 2) + 1; // Place on top of platform
      
      // Calculate enemy difficulty
      const enemyDifficulty = Math.max(1, Math.min(5, Math.floor(difficulty * (0.5 + Math.random() * 0.5))));
      
      // Select enemy type
      const typeIndex = Math.min(enemyTypes.length - 1, Math.floor(enemyDifficulty) - 1);
      const type = enemyTypes[typeIndex];
      
      // Calculate enemy health
      const health = 50 + (enemyDifficulty * 25);
      
      // Add enemy
      levelData.enemies.push({
        x,
        y,
        width: 1,
        height: 2,
        health,
        type,
        difficulty: enemyDifficulty,
        speed: 1 + (enemyDifficulty * 0.5),
        patrolDistance: 3 + Math.random() * 3
      });
    }
    
    return levelData;
  }
} 