import * as THREE from 'three';
import { Howl } from 'howler';

// Function to load all game assets
export async function loadAssets() {
  const textureLoader = new THREE.TextureLoader();
  
  // Create a promise-based texture loader
  const loadTexture = (url) => {
    return new Promise((resolve, reject) => {
      textureLoader.load(url, resolve, undefined, reject);
    });
  };

  // Create a promise-based audio loader
  const loadAudio = (url) => {
    return new Promise((resolve) => {
      const sound = new Howl({
        src: [url],
        onload: () => resolve(sound)
      });
    });
  };

  // Function to load sprite sheet and split into frames
  const loadSpriteSheet = async (basePath, filename, frameCount) => {
    const texture = await loadTexture(`${basePath}/${filename}`);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    // Create an array to hold individual frame textures
    const frames = [];
    
    // Load the image to get dimensions
    const img = new Image();
    img.src = `${basePath}/${filename}`;
    
    await new Promise(resolve => {
      img.onload = () => {
        // Calculate the width of each frame
        const frameWidth = img.width / frameCount;
        const frameHeight = img.height;
        
        // Create textures for each frame
        for (let i = 0; i < frameCount; i++) {
          // Clone the texture
          const frameTexture = texture.clone();
          
          // Set the UV coordinates for this frame
          frameTexture.offset.x = i / frameCount;
          frameTexture.repeat.x = 1 / frameCount;
          frameTexture.needsUpdate = true;
          
          frames.push(frameTexture);
        }
        resolve();
      };
    });
    
    return {
      texture,
      frames,
      frameCount
    };
  };

  try {
    // Load background textures
    const backgroundTexture = await loadTexture('/src/assets/images/Backgrounds/1.png');
    
    // Load tile textures
    const [
      grassTile1,
      grassTile2,
      grassTile3,
      grassTile4,
      grassTile5,
      grassTile6,
      dirtTile1,
      dirtTile2,
      dirtTile3,
      dirtTile4,
      metalTile1,
      metalTile2,
      metalTile3,
      metalTile4,
    ] = await Promise.all([
      loadTexture('/src/assets/images/Tiles/grass1.png'),
      loadTexture('/src/assets/images/Tiles/grass2.png'),
      loadTexture('/src/assets/images/Tiles/grass3.png'),
      loadTexture('/src/assets/images/Tiles/grass4.png'),
      loadTexture('/src/assets/images/Tiles/grass5.png'),
      loadTexture('/src/assets/images/Tiles/grass6.png'),
      loadTexture('/src/assets/images/Tiles/dirt1.png'),
      loadTexture('/src/assets/images/Tiles/dirt2.png'),
      loadTexture('/src/assets/images/Tiles/dirt3.png'),
      loadTexture('/src/assets/images/Tiles/dirt4.png'),
      loadTexture('/src/assets/images/Tiles/metal1.png'),
      loadTexture('/src/assets/images/Tiles/metal2.png'),
      loadTexture('/src/assets/images/Tiles/metal3.png'),
      loadTexture('/src/assets/images/Tiles/metal4.png'),
    ]);
    
    // Load player sprite sheets
    const [
      playerIdle,
      playerRun,
      playerJump,
      playerDoubleJump,
      playerFall,
      playerWallJump,
      playerHit,
    ] = await Promise.all([
      loadSpriteSheet('/src/assets/images/Main Character', 'Idle_11.png', 11),
      loadSpriteSheet('/src/assets/images/Main Character', 'Run_12.png', 12),
      loadSpriteSheet('/src/assets/images/Main Character', 'Jump_1.png', 1),
      loadSpriteSheet('/src/assets/images/Main Character', 'Double_Jump_6.png', 6),
      loadSpriteSheet('/src/assets/images/Main Character', 'Fall_1.png', 1),
      loadSpriteSheet('/src/assets/images/Main Character', 'Wall_Jump_5.png', 5),
      loadSpriteSheet('/src/assets/images/Main Character', 'Hit_7.png', 7),
    ]);
    
    // Load enemy sprite sheets
    const [
      enemyIdle,
      enemyRun,
      enemyJump,
      enemyFall,
      enemyHit,
    ] = await Promise.all([
      loadSpriteSheet('/src/assets/images/Enemy/1', 'Idle_11.png', 11),
      loadSpriteSheet('/src/assets/images/Enemy/1', 'Run_12.png', 12),
      loadSpriteSheet('/src/assets/images/Enemy/1', 'Jump_3.png', 3),
      loadSpriteSheet('/src/assets/images/Enemy/1', 'Fall_3.png', 3),
      loadSpriteSheet('/src/assets/images/Enemy/1', 'Hit_5.png', 5),
    ]);

    // Load audio (using placeholder paths for now)
    const [
      backgroundMusic,
      jumpSound,
      hitSound,
      kickSound,
      snareSound,
      tambourineSound,
      tomSound,
    ] = await Promise.all([
      loadAudio('/src/assets/audio/background.mp3'),
      loadAudio('/src/assets/audio/jump.mp3'),
      loadAudio('/src/assets/audio/hit.mp3'),
      loadAudio('/src/assets/audio/kick.mp3'),
      loadAudio('/src/assets/audio/snare.mp3'),
      loadAudio('/src/assets/audio/tambourine.mp3'),
      loadAudio('/src/assets/audio/tom.mp3'),
    ]);

    // Return all loaded assets
    return {
      textures: {
        background: backgroundTexture,
        tiles: {
          grass: [grassTile1, grassTile2, grassTile3, grassTile4, grassTile5, grassTile6],
          dirt: [dirtTile1, dirtTile2, dirtTile3, dirtTile4],
          metal: [metalTile1, metalTile2, metalTile3, metalTile4]
        },
        player: {
          idle: playerIdle,
          run: playerRun,
          jump: playerJump,
          doubleJump: playerDoubleJump,
          fall: playerFall,
          wallJump: playerWallJump,
          hit: playerHit
        },
        enemy: {
          idle: enemyIdle,
          run: enemyRun,
          jump: enemyJump,
          fall: enemyFall,
          hit: enemyHit
        }
      },
      audio: {
        background: backgroundMusic,
        jump: jumpSound,
        hit: hitSound,
        drum: [kickSound, snareSound, tambourineSound, tomSound],
      }
    };
  } catch (error) {
    console.error('Error loading assets:', error);
    throw error;
  }
} 