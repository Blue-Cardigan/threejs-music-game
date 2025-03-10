# Drummer vs Politicians

A 2D platformer game built with Three.js where you play as a drummer battling corrupt politicians in rhythm-based combat.

## Game Overview

In this game, you control a drummer navigating through platformer levels filled with corrupt politicians. When you get close to an enemy, a rhythm-based combat system is initiated where you must match the rhythm pattern shown on screen to defeat your opponents.

## Features

- 2D platformer gameplay with Three.js
- Animated character and enemy sprites
- Advanced jumping mechanics with double jump
- Rhythm-based combat system with 4/4 time signature and rests
- Visual timing indicator for precise rhythm matching
- Multiple enemy types with increasing difficulty
- XP and leveling system
- Procedurally generated levels with tile-based platforms
- Smooth camera following with parallax background

## Controls

- **Movement**: Arrow keys or WASD
  - Left/Right: Move left/right
  - Up/W/Space: Jump (hold for higher jumps, press again for double jump)
- **Combat**:
  - Enter: Start the rhythm sequence
  - Z, X, J, K: Play drum notes during combat
- **Other**:
  - P: Pause game

## Combat System

When you approach an enemy, combat is initiated. You'll see a rhythm pattern displayed on screen:

1. Press ENTER to start the rhythm sequence
2. A horizontal timing indicator will move across the screen
3. Press the corresponding keys (Z, X, J, K) when the indicator reaches each note
4. The game uses a 4/4 time signature with quarter notes, eighth notes, and rests
5. Your accuracy determines how much damage you deal to the enemy
6. If you're inaccurate, you'll take damage
7. Defeat the enemy to gain XP, with bonus XP for high accuracy

## Rhythm Difficulty

The rhythm patterns become more complex as you face stronger enemies:

- **Level 1-2**: Simple quarter and eighth note patterns
- **Level 3-4**: Mixed patterns with quarter and eighth notes
- **Level 5+**: Complex syncopated patterns with unexpected rests

## Installation and Running

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open your browser to the local server address (usually http://localhost:5173)

## Technologies Used

- Three.js for rendering
- Howler.js for audio
- Vite for bundling and development server 