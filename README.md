# Platform Rhythm Game

A platform game built with Three.js featuring rhythm-based combat.

## Description

In this game, you control a character that can move around a 3D environment and engage in combat with enemies. The combat system is rhythm-based, similar to Guitar Hero, where you need to hit the correct notes at the right time to deal damage to enemies.

## Features

- 3D platform gameplay with jumping and movement
- Rhythm-based combat system
- Multiple enemies with different difficulty levels
- Sound effects and background music
- Score tracking

## Controls

- **A/D**: Move left/right
- **W**: Jump
- **Combat Controls**:
  - **Z**: Kick (Red notes)
  - **X**: Snare (Green notes)
  - **J**: Tom (Blue notes)
  - **K**: Tambourine (Yellow notes)

## How to Play

1. Use A/D to move and W to jump
2. Approach an enemy to start combat
3. During combat, notes will move across the screen
4. Press the corresponding key when the note crosses the red line
5. The more accurate your timing, the more damage you deal
6. Defeat all enemies to win the game
7. Collect the music symbol that appears after defeating all enemies

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173)

## Technologies Used

- Three.js for 3D rendering
- Vite for development and building
- JavaScript for game logic

## Game Mechanics

- **Platform Movement**: The player can move left/right and jump between platforms
- **Combat System**: 
  - Notes move across the screen in 4 lanes
  - Each lane corresponds to a different instrument sound
  - The player must hit the correct key when the note crosses the red line
  - Accuracy determines damage dealt to enemies
  - Missing notes or hitting at the wrong time causes the player to take damage
- **Difficulty Scaling**: 
  - Higher level enemies have more complex rhythm patterns
  - Rhythm patterns increase in complexity with enemy level
  - Higher level enemies have more health

## Credits

Sound effects and music are included in the public/sounds directory. 