import * as THREE from 'three';
import { Player } from './components/Player.js';
import { Platform } from './components/Platform.js';
import { Enemy } from './components/Enemy.js';
import { RhythmGame } from './components/RhythmGame.js';

// Restructure the game state to be more organized
const gameState = {
    // Game flow
    isPlaying: false,
    gameCompleted: false,
    
    // Combat
    inCombat: false,
    currentEnemy: null,
    
    // Player stats
    playerHealth: 100,
    
    // Enemy tracking
    enemiesConverted: 0,
    totalEnemies: 0,
    
    // Map boundaries
    mapBoundaries: {
        left: 0,
        right: 0
    },
    
    // Victory condition
    musicalSymbol: null
};

// Create a GameManager to handle game state and transitions
class GameManager {
    constructor() {
        this.state = gameState;
        this.eventListeners = {};
    }
    
    // Event system for better code organization
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
    
    // Game state transitions
    startGame() {
        this.state.isPlaying = true;
        this.emit('gameStarted');
    }
    
    pauseGame() {
        this.state.isPlaying = false;
        this.emit('gamePaused');
    }
    
    resumeGame() {
        this.state.isPlaying = true;
        this.emit('gameResumed');
    }
    
    endGame(victory) {
        this.state.isPlaying = false;
        this.state.gameCompleted = true;
        this.emit('gameEnded', { victory });
    }
    
    // Combat management
    startCombat(enemy) {
        this.state.inCombat = true;
        this.state.currentEnemy = enemy;
        this.emit('combatStarted', { enemy });
    }
    
    endCombat(enemyDefeated) {
        this.state.inCombat = false;
        
        if (enemyDefeated) {
            this.state.enemiesConverted++;
            this.emit('enemyConverted', { 
                enemy: this.state.currentEnemy,
                totalConverted: this.state.enemiesConverted,
                totalEnemies: this.state.totalEnemies
            });
        }
        
        this.state.currentEnemy = null;
        this.emit('combatEnded', { enemyDefeated });
        
        // Check if all enemies are converted
        if (this.state.enemiesConverted === this.state.totalEnemies) {
            this.emit('allEnemiesConverted');
        }
    }
    
    // Player management
    damagePlayer(amount) {
        this.state.playerHealth = Math.max(0, this.state.playerHealth - amount);
        this.emit('playerDamaged', { 
            amount, 
            currentHealth: this.state.playerHealth 
        });
        
        if (this.state.playerHealth <= 0) {
            this.emit('playerDefeated');
            this.endGame(false);
        }
    }
    
    // UI updates
    updateUI() {
        document.getElementById('health').textContent = `Health: ${this.state.playerHealth}`;
        document.getElementById('enemies-converted').textContent = 
            `Enemies Converted: ${this.state.enemiesConverted}/${this.state.totalEnemies}`;
        
        this.emit('uiUpdated');
    }
}

// Create the game manager
const gameManager = new GameManager();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 15);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Game objects
let player;
let platforms = [];
let enemies = [];
let rhythmGame;

// Initialize game with the manager
function initGame() {
    // Create player
    player = new Player(gameManager);
    scene.add(player.mesh);
    
    // Create platforms
    createPlatforms();
    
    // Create enemies
    createEnemies();
    
    // Initialize rhythm game component
    rhythmGame = new RhythmGame();
    
    // Set map boundaries based on platforms
    gameState.mapBoundaries = {
        left: platforms[0].mesh.position.x - platforms[0].width/2,
        right: platforms[platforms.length-1].mesh.position.x + platforms[platforms.length-1].width/2
    };
    
    // Set up event listeners
    setupGameEvents();
    
    // Update UI
    gameManager.updateUI();
    
    // Start game
    gameManager.startGame();
    animate();
}

// Create platforms for the level
function createPlatforms() {
    // Main ground platform
    const groundPlatform = new Platform(100, 1, 10, 0x8B4513);
    groundPlatform.mesh.position.set(0, -2, 0);
    scene.add(groundPlatform.mesh);
    platforms.push(groundPlatform);
    
    // Additional platforms
    const platformPositions = [
        { x: -15, y: 0, z: 0, width: 10, height: 1, depth: 10 },
        { x: 15, y: 2, z: 0, width: 10, height: 1, depth: 10 },
        { x: 30, y: 4, z: 0, width: 10, height: 1, depth: 10 },
        { x: 45, y: 6, z: 0, width: 15, height: 1, depth: 10 }
    ];
    
    platformPositions.forEach(pos => {
        const platform = new Platform(pos.width, pos.height, pos.depth, 0x8B4513);
        platform.mesh.position.set(pos.x, pos.y, pos.z);
        scene.add(platform.mesh);
        platforms.push(platform);
    });
}

// Create enemies for the level
function createEnemies() {
    const enemyPositions = [
        { x: -15, y: 2, z: 0 },
        { x: 15, y: 4, z: 0 },
        { x: 30, y: 6, z: 0 },
        { x: 45, y: 8, z: 0 }
    ];
    
    enemyPositions.forEach(pos => {
        const enemy = new Enemy();
        enemy.mesh.position.set(pos.x, pos.y, pos.z);
        scene.add(enemy.mesh);
        enemies.push(enemy);
    });
    
    gameState.totalEnemies = enemies.length;
}

// Check for collision between player and platforms
function checkPlatformCollisions() {
    let onPlatform = false;
    
    platforms.forEach(platform => {
        const playerBox = new THREE.Box3().setFromObject(player.mesh);
        const platformBox = new THREE.Box3().setFromObject(platform.mesh);
        
        // Check if player is on top of platform
        if (playerBox.intersectsBox(platformBox) && 
            player.velocity.y <= 0 && 
            player.mesh.position.y > platform.mesh.position.y) {
            player.mesh.position.y = platform.mesh.position.y + platform.height / 2 + player.height / 2;
            player.velocity.y = 0;
            player.isJumping = false;
            onPlatform = true;
        }
    });
    
    if (!onPlatform && !player.isJumping) {
        player.isJumping = true;
    }
}

// Check for collision between player and enemies
function checkEnemyCollisions() {
    if (gameState.inCombat) return;
    
    enemies.forEach(enemy => {
        // Skip defeated enemies - player can now pass through them
        if (enemy.isDefeated) {
            // If player is close to a converted enemy, have them say something friendly
            const distance = player.mesh.position.distanceTo(enemy.mesh.position);
            if (distance < 3 && Math.random() < 0.01) { // Occasional friendly message
                const friendlyPhrases = [
                    "Thanks for showing me the rhythm!",
                    "I'm with you now!",
                    "Keep up the good work!",
                    "Converting others with rhythm is the way!",
                    "Your beats are amazing!"
                ];
                const randomPhrase = friendlyPhrases[Math.floor(Math.random() * friendlyPhrases.length)];
                enemy.showSpeechBubble(randomPhrase);
            }
            return;
        }
        
        const distance = player.mesh.position.distanceTo(enemy.mesh.position);
        
        if (distance < 5) {
            startCombat(enemy);
        }
    });
}

// Start combat with an enemy
function startCombat(enemy) {
    gameManager.startCombat(enemy);
}

// Function to show damage numbers floating up from enemy
function showDamageNumber(targetMesh, amount) {
    // Create HTML element for damage number
    const damageEl = document.createElement('div');
    damageEl.className = 'damage-number';
    damageEl.textContent = amount;
    document.body.appendChild(damageEl);
    
    // Get screen position of enemy
    const enemyPosition = new THREE.Vector3();
    targetMesh.getWorldPosition(enemyPosition);
    enemyPosition.project(camera);
    
    // Convert to screen coordinates
    const x = (enemyPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(enemyPosition.y * 0.5) + 0.5) * window.innerHeight;
    
    // Position damage number
    damageEl.style.left = `${x}px`;
    damageEl.style.top = `${y}px`;
    
    // Animate and remove
    let opacity = 1;
    let posY = y;
    
    const animateDamageNumber = () => {
        opacity -= 0.02;
        posY -= 1;
        
        if (opacity <= 0) {
            document.body.removeChild(damageEl);
            return;
        }
        
        damageEl.style.opacity = opacity;
        damageEl.style.top = `${posY}px`;
        
        requestAnimationFrame(animateDamageNumber);
    };
    
    animateDamageNumber();
}

// Callback for when rhythm game completes
function onRhythmGameComplete(isVictory, stats) {
    const accuracy = stats.accuracy;
    const score = stats.score;
    console.log(`Rhythm game completed with accuracy: ${accuracy}%, score: ${score}`);
    
    // Apply final damage if not already defeated through real-time damage
    if (!gameState.currentEnemy.isDefeated) {
        // Calculate final damage based on accuracy and score
        // More weight on accuracy, but score (which includes combo) also matters
        const accuracyFactor = accuracy / 100; // 0-1 range
        const scoreFactor = Math.min(1, score / 1000); // Cap at 1000 points
        
        // Calculate damage: base damage (20-40) + bonus from accuracy and score
        const baseDamage = 20;
        const accuracyBonus = 20 * accuracyFactor;
        const scoreBonus = 10 * scoreFactor;
        const comboBonus = Math.min(10, stats.maxCombo / 5); // Up to 10 bonus damage for combos
        
        const totalDamage = Math.floor(baseDamage + accuracyBonus + scoreBonus + comboBonus);
        
        // Show damage breakdown in a temporary overlay
        const damageBreakdownOverlay = document.createElement('div');
        damageBreakdownOverlay.className = 'damage-breakdown-overlay';
        damageBreakdownOverlay.innerHTML = `
            <div class="damage-breakdown-content">
                <h2>Rhythm Performance</h2>
                <p>Accuracy: ${accuracy.toFixed(1)}%</p>
                <p>Score: ${score}</p>
                <p>Max Combo: ${stats.maxCombo}</p>
                <div class="damage-breakdown">
                    <h3>Damage Breakdown:</h3>
                    <p>Base Damage: ${baseDamage}</p>
                    <p>Accuracy Bonus: +${accuracyBonus.toFixed(1)}</p>
                    <p>Score Bonus: +${scoreBonus.toFixed(1)}</p>
                    <p>Combo Bonus: +${comboBonus.toFixed(1)}</p>
                    <p class="total-damage">Total Damage: ${totalDamage}</p>
                </div>
            </div>
        `;
        document.body.appendChild(damageBreakdownOverlay);
        
        // Apply the damage with a visual effect
        setTimeout(() => {
            // Remove the overlay
            document.body.removeChild(damageBreakdownOverlay);
            
            // Apply damage with visual effect
            showDamageNumber(gameState.currentEnemy.mesh, totalDamage);
            gameState.currentEnemy.takeDamage(totalDamage);
            
            // Play damage sound
            rhythmGame.audio.playSound('damage');
            
            // Calculate player damage (less damage with higher accuracy)
            const playerDamage = Math.floor((100 - accuracy) * 0.3);
            if (playerDamage > 0) {
                gameState.playerHealth = Math.max(0, gameState.playerHealth - playerDamage);
                showMessage(`You took ${playerDamage} damage!`);
            }
            
            // Check if enemy is defeated after damage
            const enemyDefeatedByFinalDamage = gameState.currentEnemy.isDefeated;
            
            // Handle combat end based on enemy state
            onCombatEnd(enemyDefeatedByFinalDamage);
        }, 3000);
    } else {
        // Enemy was already defeated during gameplay
        onCombatEnd(true);
    }
}

// Function to handle the end of combat
function onCombatEnd(enemyDefeated) {
    gameManager.endCombat(enemyDefeated);
}

// Function to show temporary messages to the player
function showMessage(text, duration = 3000) {
    // Create or get message container
    let messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.style.position = 'absolute';
        messageContainer.style.top = '20%';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translateX(-50%)';
        messageContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        messageContainer.style.color = 'white';
        messageContainer.style.padding = '15px 25px';
        messageContainer.style.borderRadius = '10px';
        messageContainer.style.fontSize = '18px';
        messageContainer.style.fontWeight = 'bold';
        messageContainer.style.zIndex = '1000';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.transition = 'opacity 0.3s';
        document.body.appendChild(messageContainer);
    }
    
    // Set message text
    messageContainer.textContent = text;
    messageContainer.style.opacity = '1';
    
    // Clear any existing timeout
    if (messageContainer.timeoutId) {
        clearTimeout(messageContainer.timeoutId);
    }
    
    // Hide message after duration
    messageContainer.timeoutId = setTimeout(() => {
        messageContainer.style.opacity = '0';
    }, duration);
}

// Check if the game is over
function checkGameOver() {
    // Player reached the end platform
    const endPlatform = platforms[platforms.length - 1];
    const playerBox = new THREE.Box3().setFromObject(player.mesh);
    const platformBox = new THREE.Box3().setFromObject(endPlatform.mesh);
    
    if (playerBox.intersectsBox(platformBox)) {
        gameState.isPlaying = false;
        showGameOverScreen(true);
    }
    
    // Player health is zero
    if (gameState.playerHealth <= 0) {
        gameState.isPlaying = false;
        showGameOverScreen(false);
    }
}

// Show game over screen
function showGameOverScreen(isVictory) {
    const instructionsDiv = document.getElementById('instructions');
    instructionsDiv.innerHTML = '';
    
    const title = document.createElement('h2');
    title.textContent = isVictory ? 'Level Complete!' : 'Game Over';
    
    const scoreText = document.createElement('p');
    scoreText.textContent = `Enemies Converted: ${gameState.enemiesConverted}/${gameState.totalEnemies}`;
    
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.addEventListener('click', () => {
        location.reload();
    });
    
    instructionsDiv.appendChild(title);
    instructionsDiv.appendChild(scoreText);
    instructionsDiv.appendChild(restartButton);
    instructionsDiv.style.display = 'block';
}

// Animation loop
function animate() {
    if (!gameState.isPlaying) return;
    
    requestAnimationFrame(animate);
    
    if (!gameState.inCombat) {
        // Update player
        player.update();
        
        // Check collisions
        checkPlatformCollisions();
        checkEnemyCollisions();
        checkMapBoundaries();
        
        // Update camera to follow player
        camera.position.x = player.mesh.position.x;
        camera.lookAt(player.mesh.position);
        
        // Add visual indicators above enemies
        updateEnemyIndicators();
    }
    
    // Update enemies
    enemies.forEach(enemy => enemy.update());
    
    // Update musical symbol if it exists
    if (gameState.musicalSymbol) {
        updateMusicalSymbol();
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Add this new function to create visual indicators
function updateEnemyIndicators() {
    enemies.forEach(enemy => {
        // Create indicator if it doesn't exist
        if (!enemy.indicator) {
            const indicatorGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const indicatorMaterial = new THREE.MeshBasicMaterial({
                color: enemy.isDefeated ? 0x2ecc71 : 0xe74c3c
            });
            enemy.indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
            enemy.indicator.position.y = enemy.height + 0.5;
            enemy.mesh.add(enemy.indicator);
        }
        
        // Update indicator color based on enemy state
        if (enemy.isDefeated && enemy.indicator.material.color.getHex() !== 0x2ecc71) {
            enemy.indicator.material.color.set(0x2ecc71);
        }
        
        // Make indicator pulse
        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        enemy.indicator.scale.set(scale, scale, scale);
    });
}

// Add boundary check in the player update method
function checkMapBoundaries() {
    // Prevent player from going beyond map boundaries
    if (player.mesh.position.x < gameState.mapBoundaries.left) {
        player.mesh.position.x = gameState.mapBoundaries.left;
        player.velocity.x = 0;
    } else if (player.mesh.position.x > gameState.mapBoundaries.right) {
        player.mesh.position.x = gameState.mapBoundaries.right;
        player.velocity.x = 0;
    }
    
    // Prevent falling off the bottom of the map
    if (player.mesh.position.y < -10) {
        // Reset player to the nearest platform
        resetPlayerToNearestPlatform();
    }
}

// Function to reset player to the nearest platform if they fall
function resetPlayerToNearestPlatform() {
    let nearestPlatform = platforms[0];
    let minDistance = Infinity;
    
    // Find the nearest platform (horizontally)
    platforms.forEach(platform => {
        const distance = Math.abs(platform.mesh.position.x - player.mesh.position.x);
        if (distance < minDistance) {
            minDistance = distance;
            nearestPlatform = platform;
        }
    });
    
    // Reset player position to above the platform
    player.mesh.position.x = nearestPlatform.mesh.position.x;
    player.mesh.position.y = nearestPlatform.mesh.position.y + nearestPlatform.height/2 + player.height/2;
    player.velocity.y = 0;
    player.velocity.x = 0;
    player.isJumping = false;
    
    // Show message
    showMessage("Careful! You almost fell off the map!");
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start button event listener
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('instructions').style.display = 'none';
    initGame();
});

// Add a function to check if all enemies are converted
function checkAllEnemiesConverted() {
    if (gameState.enemiesConverted === gameState.totalEnemies && !gameState.musicalSymbol && !gameState.gameCompleted) {
        createMusicalSymbol();
    }
}

// Create the musical symbol
function createMusicalSymbol() {
    // Create a group for the musical symbol
    const symbolGroup = new THREE.Group();
    
    // Create the main note shape
    const noteGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const noteMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xf1c40f, // Gold color
        emissive: 0xf39c12,
        emissiveIntensity: 0.5
    });
    const noteHead = new THREE.Mesh(noteGeometry, noteMaterial);
    symbolGroup.add(noteHead);
    
    // Create the stem
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
    const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xf1c40f });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(0.5, 0.75, 0);
    stem.rotation.z = Math.PI / 12; // Slight angle
    symbolGroup.add(stem);
    
    // Create a flag on the stem
    const flagGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.1);
    const flagMaterial = new THREE.MeshLambertMaterial({ color: 0xf1c40f });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(0.5, 1.4, 0);
    flag.rotation.z = Math.PI / 4;
    symbolGroup.add(flag);
    
    // Create a glow effect
    const glowGeometry = new THREE.SphereGeometry(1, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xf1c40f,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    symbolGroup.add(glow);
    
    // Position the symbol at the end platform
    const endPlatform = platforms[platforms.length - 1];
    symbolGroup.position.set(
        endPlatform.mesh.position.x,
        endPlatform.mesh.position.y + endPlatform.height/2 + 2,
        endPlatform.mesh.position.z
    );
    
    // Add to scene
    scene.add(symbolGroup);
    
    // Store in game state
    gameState.musicalSymbol = {
        mesh: symbolGroup,
        rotationSpeed: 0.02,
        bobSpeed: 0.01,
        bobHeight: 0.5,
        bobTime: 0,
        collected: false
    };
    
    // Show message to player
    showMessage("All enemies converted! Collect the musical note to complete your journey!", 5000);
}

// Update the musical symbol animation
function updateMusicalSymbol() {
    const symbol = gameState.musicalSymbol;
    
    if (!symbol || symbol.collected) return;
    
    // Rotate the symbol
    symbol.mesh.rotation.y += symbol.rotationSpeed;
    
    // Bob up and down
    symbol.bobTime += symbol.bobSpeed;
    const bobOffset = Math.sin(symbol.bobTime) * symbol.bobHeight;
    symbol.mesh.position.y = platforms[platforms.length - 1].mesh.position.y + platforms[platforms.length - 1].height/2 + 2 + bobOffset;
    
    // Pulse the glow
    const glowScale = 1 + Math.sin(symbol.bobTime * 2) * 0.2;
    symbol.mesh.children[3].scale.set(glowScale, glowScale, glowScale);
    
    // Check if player collected the symbol
    if (!gameState.gameCompleted) {
        const distance = player.mesh.position.distanceTo(symbol.mesh.position);
        if (distance < 2) {
            collectMusicalSymbol();
        }
    }
}

// Handle collecting the musical symbol
function collectMusicalSymbol() {
    gameState.musicalSymbol.collected = true;
    
    // Play collection sound
    rhythmGame.audio.playSound('perfect');
    
    // Create particle effect
    createCollectionParticles(gameState.musicalSymbol.mesh.position);
    
    // Remove the symbol with a fade out effect
    const fadeOutSymbol = () => {
        if (gameState.musicalSymbol.mesh.scale.x > 0.1) {
            gameState.musicalSymbol.mesh.scale.multiplyScalar(0.95);
            requestAnimationFrame(fadeOutSymbol);
        } else {
            scene.remove(gameState.musicalSymbol.mesh);
        }
    };
    fadeOutSymbol();
    
    // Show victory screen
    gameState.gameCompleted = true;
    gameState.isPlaying = false;
    showVictoryScreen();
}

// Create particles for collection effect
function createCollectionParticles(position) {
    const particleCount = 50;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0xf1c40f,
                transparent: true,
                opacity: 0.8
            })
        );
        
        // Random position around the collection point
        particle.position.set(
            position.x + (Math.random() - 0.5) * 2,
            position.y + (Math.random() - 0.5) * 2,
            position.z + (Math.random() - 0.5) * 2
        );
        
        // Random velocity
        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        // Random lifetime
        particle.userData.lifetime = 1 + Math.random() * 2;
        particle.userData.age = 0;
        
        particles.add(particle);
    }
    
    scene.add(particles);
    
    // Animate particles
    const animateParticles = (deltaTime = 0.016) => {
        let allParticlesRemoved = true;
        
        particles.children.forEach((particle, index) => {
            // Update position based on velocity
            particle.position.add(particle.userData.velocity);
            
            // Add gravity
            particle.userData.velocity.y -= 0.005;
            
            // Age the particle
            particle.userData.age += deltaTime;
            
            // Fade out based on age
            const opacity = 1 - (particle.userData.age / particle.userData.lifetime);
            particle.material.opacity = opacity;
            
            if (opacity > 0) {
                allParticlesRemoved = false;
                // Scale down as it ages
                const scale = 1 - (particle.userData.age / particle.userData.lifetime) * 0.5;
                particle.scale.set(scale, scale, scale);
            } else {
                // Remove particle if it's too old
                particles.remove(particle);
            }
        });
        
        if (!allParticlesRemoved) {
            requestAnimationFrame(() => animateParticles());
        } else {
            scene.remove(particles);
        }
    };
    
    animateParticles();
}

// Show victory screen
function showVictoryScreen() {
    // Create a victory overlay
    const victoryOverlay = document.createElement('div');
    victoryOverlay.className = 'victory-overlay';
    victoryOverlay.innerHTML = `
        <div class="victory-content">
            <h1>Victory!</h1>
            <p>You've converted all enemies and collected the musical symbol!</p>
            <p class="stats">Enemies Converted: ${gameState.enemiesConverted}/${gameState.totalEnemies}</p>
            <button id="restart-button">Play Again</button>
        </div>
    `;
    document.body.appendChild(victoryOverlay);
    
    // Add event listener to restart button
    document.getElementById('restart-button').addEventListener('click', () => {
        location.reload();
    });
    
    // Play victory music
    rhythmGame.audio.playSound('success');
    
    // Create celebratory particles
    createVictoryParticles();
}

// Create victory particles
function createVictoryParticles() {
    // Create particles at random positions on screen
    setInterval(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        const particle = document.createElement('div');
        particle.className = 'victory-particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.backgroundColor = getRandomColor();
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(particle);
        }, 2000);
    }, 200);
}

// Helper function for random colors
function getRandomColor() {
    const colors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', 
        '#1abc9c', '#e67e22', '#34495e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Add CSS for victory screen
const style = document.createElement('style');
style.textContent = `
    .victory-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 1s ease-in-out;
    }
    
    .victory-content {
        background-color: rgba(40, 40, 40, 0.9);
        color: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        border: 4px solid #f1c40f;
        box-shadow: 0 0 30px rgba(241, 196, 15, 0.8);
        animation: pulse 1.5s infinite alternate;
    }
    
    .victory-content h1 {
        font-size: 48px;
        margin: 0 0 20px 0;
        color: #f1c40f;
        text-shadow: 0 0 15px rgba(241, 196, 15, 0.8);
    }
    
    .victory-content button {
        margin-top: 20px;
        padding: 15px 30px;
        background-color: #f1c40f;
        border: none;
        border-radius: 8px;
        color: #333;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .victory-content button:hover {
        background-color: #f39c12;
        transform: scale(1.1);
    }
    
    .victory-particle {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        pointer-events: none;
        animation: particleFall 2s ease-in-out;
    }
    
    @keyframes particleFall {
        0% { transform: translateY(0) scale(0); opacity: 0; }
        10% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(100vh) scale(0.5); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Update the setupGameEvents function to properly handle the events

function setupGameEvents() {
    // Combat events
    gameManager.on('combatStarted', (data) => {
        // Restrict player movement
        player.canMove = false;
        
        // Show battle start UI
        showBattleStartUI(data.enemy);
    });
    
    gameManager.on('enemyConverted', (data) => {
        // Show conversion UI
        showConversionUI(data);
    });
    
    gameManager.on('allEnemiesConverted', () => {
        // Create musical symbol when all enemies are converted
        if (!gameState.musicalSymbol) {
            createMusicalSymbol();
        }
    });
    
    gameManager.on('combatEnded', (data) => {
        // If enemy was not defeated, show retry overlay
        if (!data.enemyDefeated) {
            // Enemy not defeated - show retry overlay
            const retryOverlay = document.createElement('div');
            retryOverlay.className = 'retry-overlay';
            retryOverlay.innerHTML = `
                <div class="retry-content">
                    <h2>Enemy Weakened!</h2>
                    <p>You've dealt damage, but the enemy is still standing.</p>
                    <p class="enemy-health">Enemy Health: ${gameState.currentEnemy.health}/100</p>
                    <p>Continue your rhythm attack to convert them!</p>
                    <button id="continue-battle">Continue Battle</button>
                    <button id="retreat">Retreat</button>
                </div>
            `;
            document.body.appendChild(retryOverlay);
            
            // Add event listeners to buttons
            document.getElementById('continue-battle').addEventListener('click', () => {
                // Remove overlay
                document.body.removeChild(retryOverlay);
                
                // Hide rhythm game UI temporarily
                document.getElementById('rhythm-container').style.display = 'none';
                
                // Show message
                showMessage("Prepare for the next rhythm pattern!");
                
                // Wait a moment before starting the next rhythm pattern
                setTimeout(() => {
                    // Show rhythm game UI again
                    document.getElementById('rhythm-container').style.display = 'block';
                    
                    // Reset and restart the rhythm game with a new pattern
                    rhythmGame.resetGame();
                    const difficulty = Math.min(3, Math.ceil((100 - gameState.currentEnemy.health) / 25) + 1); // Increase difficulty as enemy health decreases
                    rhythmGame.startGame(onRhythmGameComplete);
                }, 2000);
            });
            
            document.getElementById('retreat').addEventListener('click', () => {
                // Remove overlay
                document.body.removeChild(retryOverlay);
                
                // Hide rhythm game UI
                document.getElementById('rhythm-container').style.display = 'none';
                
                // Reset camera position
                camera.position.set(0, 5, 15);
                camera.lookAt(0, 0, 0);
                
                // Allow player to continue moving
                player.canMove = true;
                
                // Show message
                showMessage("You've retreated from battle. The enemy remains unconverted.");
                
                // Update UI
                gameManager.updateUI();
            });
        }
    });
    
    // Player events
    gameManager.on('playerDamaged', (data) => {
        // Show damage effect
        showPlayerDamageEffect(data.amount);
    });
    
    gameManager.on('playerDefeated', () => {
        // Show game over screen
        showGameOverScreen(false);
    });
}

// Add global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Show error message to user in development
    if (process.env.NODE_ENV !== 'production') {
        showMessage(`Error: ${event.error.message}. Check console for details.`, 5000);
    }
});

// Add debug mode
const DEBUG = {
    enabled: false,
    showColliders: false,
    invincible: false,
    logEvents: false
};

// Add debug UI if in development
if (process.env.NODE_ENV !== 'production') {
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.innerHTML = `
        <h3>Debug Panel</h3>
        <label><input type="checkbox" id="debug-enable"> Enable Debug</label><br>
        <label><input type="checkbox" id="debug-colliders"> Show Colliders</label><br>
        <label><input type="checkbox" id="debug-invincible"> Invincible</label><br>
        <label><input type="checkbox" id="debug-log"> Log Events</label><br>
        <button id="debug-convert-all">Convert All Enemies</button>
    `;
    debugPanel.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 1000;
        display: none;
    `;
    document.body.appendChild(debugPanel);
    
    // Add keyboard shortcut to toggle debug panel (Ctrl+D)
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            const panel = document.getElementById('debug-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    // Add event listeners for debug controls
    document.getElementById('debug-enable').addEventListener('change', (e) => {
        DEBUG.enabled = e.target.checked;
    });
    
    document.getElementById('debug-colliders').addEventListener('change', (e) => {
        DEBUG.showColliders = e.target.checked;
        toggleColliderVisibility(e.target.checked);
    });
    
    document.getElementById('debug-invincible').addEventListener('change', (e) => {
        DEBUG.invincible = e.target.checked;
    });
    
    document.getElementById('debug-log').addEventListener('change', (e) => {
        DEBUG.logEvents = e.target.checked;
    });
    
    document.getElementById('debug-convert-all').addEventListener('click', () => {
        convertAllEnemies();
    });
}

// Debug function to show colliders
function toggleColliderVisibility(show) {
    // Add wireframe to all collidable objects
    platforms.forEach(platform => {
        if (!platform.debugMesh && show) {
            const geometry = new THREE.BoxGeometry(
                platform.width, platform.height, platform.depth
            );
            const material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: 0x00ff00
            });
            platform.debugMesh = new THREE.Mesh(geometry, material);
            platform.mesh.add(platform.debugMesh);
        } else if (platform.debugMesh) {
            platform.debugMesh.visible = show;
        }
    });
    
    enemies.forEach(enemy => {
        if (!enemy.debugMesh && show) {
            const geometry = new THREE.BoxGeometry(
                enemy.width, enemy.height, enemy.depth
            );
            const material = new THREE.MeshBasicMaterial({
                wireframe: true,
                color: enemy.isDefeated ? 0x00ff00 : 0xff0000
            });
            enemy.debugMesh = new THREE.Mesh(geometry, material);
            enemy.mesh.add(enemy.debugMesh);
        } else if (enemy.debugMesh) {
            enemy.debugMesh.visible = show;
        }
    });
}

// Debug function to convert all enemies
function convertAllEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.isDefeated) {
            enemy.defeat();
            gameState.enemiesConverted++;
        }
    });
    
    gameManager.updateUI();
    
    if (gameState.enemiesConverted === gameState.totalEnemies) {
        createMusicalSymbol();
    }
}

// Add event logging if debug is enabled
if (DEBUG.logEvents) {
    const originalEmit = gameManager.emit;
    gameManager.emit = function(event, data) {
        console.log(`[EVENT] ${event}`, data);
        return originalEmit.call(this, event, data);
    };
}

// Show battle start UI
function showBattleStartUI(enemy) {
    // Show battle start UI overlay
    const battleStartOverlay = document.createElement('div');
    battleStartOverlay.className = 'battle-start-overlay';
    battleStartOverlay.innerHTML = `
        <div class="battle-start-content">
            <h2>Battle Start!</h2>
            <p>Convert the enemy with your rhythm skills!</p>
        </div>
    `;
    document.body.appendChild(battleStartOverlay);
    
    // Play battle start sound
    rhythmGame.audio.playSound('battleStart');
    
    // Show speech bubble
    enemy.showSpeechBubble("Let's battle with rhythm!");
    
    // Animate camera to focus on enemy
    const originalCameraPosition = { ...camera.position };
    const targetPosition = {
        x: enemy.mesh.position.x,
        y: enemy.mesh.position.y + 2,
        z: enemy.mesh.position.z + 8
    };
    
    // Simple animation
    let progress = 0;
    const animateCameraToEnemy = () => {
        progress += 0.02;
        if (progress >= 1) {
            // Animation complete, remove overlay and start game
            setTimeout(() => {
                document.body.removeChild(battleStartOverlay);
                
                // Show rhythm game UI
                document.getElementById('rhythm-container').style.display = 'block';
                
                // Set up damage callback for real-time feedback
                rhythmGame.setDamageEnemyCallback((amount) => {
                    // Play damage sound
                    rhythmGame.audio.playSound('damage');
                    
                    // Show damage number
                    showDamageNumber(enemy.mesh, amount);
                    
                    // Apply damage to enemy
                    enemy.takeDamage(amount);
                    
                    // Check if enemy was defeated by this hit
                    if (enemy.isDefeated) {
                        // Play convert sound
                        rhythmGame.audio.playSound('convert');
                        
                        // End the rhythm game early if enemy is defeated during gameplay
                        rhythmGame.endGameEarly(() => {
                            onCombatEnd(true);
                        });
                    }
                });
                
                // Start rhythm game
                rhythmGame.startGame(onRhythmGameComplete);
            }, 500);
            return;
        }
        
        // Interpolate camera position
        camera.position.x = originalCameraPosition.x + (targetPosition.x - originalCameraPosition.x) * progress;
        camera.position.y = originalCameraPosition.y + (targetPosition.y - originalCameraPosition.y) * progress;
        camera.position.z = originalCameraPosition.z + (targetPosition.z - originalCameraPosition.z) * progress;
        
        // Look at enemy
        camera.lookAt(enemy.mesh.position);
        
        requestAnimationFrame(animateCameraToEnemy);
    };
    
    // Start animation
    animateCameraToEnemy();
}

// Show conversion UI
function showConversionUI(data) {
    // Create conversion effect overlay
    const conversionOverlay = document.createElement('div');
    conversionOverlay.className = 'conversion-overlay';
    conversionOverlay.innerHTML = `
        <div class="conversion-content">
            <h2>Enemy Converted!</h2>
            <p>You've successfully converted the enemy with your rhythm!</p>
            <p class="stats">Enemies Converted: ${data.totalConverted}/${data.totalEnemies}</p>
        </div>
    `;
    document.body.appendChild(conversionOverlay);
    
    // Show success message
    showMessage("Enemy converted! You can continue your journey.");
    
    // Animate overlay and remove after delay
    setTimeout(() => {
        conversionOverlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(conversionOverlay);
            
            // Reset camera position
            camera.position.set(0, 5, 15);
            camera.lookAt(0, 0, 0);
            
            // Hide rhythm game UI
            document.getElementById('rhythm-container').style.display = 'none';
            
            // Reset combat state (already handled by gameManager)
            
            // Play success sound
            rhythmGame.audio.playSound('success');
            
            // Allow player to continue moving
            player.canMove = true;
            
            // Update UI
            gameManager.updateUI();
            
            // Check if game is over
            checkGameOver();
        }, 1000);
    }, 3000);
}

// Show player damage effect
function showPlayerDamageEffect(amount) {
    // Create HTML element for damage number
    const damageEl = document.createElement('div');
    damageEl.className = 'player-damage-number';
    damageEl.textContent = `-${amount}`;
    document.body.appendChild(damageEl);
    
    // Position at player
    const playerPosition = new THREE.Vector3();
    player.mesh.getWorldPosition(playerPosition);
    playerPosition.project(camera);
    
    // Convert to screen coordinates
    const x = (playerPosition.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(playerPosition.y * 0.5) + 0.5) * window.innerHeight;
    
    // Position damage number
    damageEl.style.left = `${x}px`;
    damageEl.style.top = `${y}px`;
    
    // Animate and remove
    let opacity = 1;
    let posY = y;
    
    const animateDamageNumber = () => {
        opacity -= 0.02;
        posY -= 1;
        
        if (opacity <= 0) {
            document.body.removeChild(damageEl);
            return;
        }
        
        damageEl.style.opacity = opacity;
        damageEl.style.top = `${posY}px`;
        
        requestAnimationFrame(animateDamageNumber);
    };
    
    animateDamageNumber();
    
    // Flash player red
    if (player.mesh && player.mesh.material) {
        const originalColor = player.mesh.material.color.clone();
        player.mesh.material.color.set(0xff0000);
        
        setTimeout(() => {
            player.mesh.material.color.copy(originalColor);
        }, 300);
    }
} 