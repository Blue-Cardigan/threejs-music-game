# Musician's Office Adventure

A ThreeJS rhythm game where you play as a musician navigating through an office building, converting enemies with the power of music.

## Game Description

In this game, you are a musician who must navigate through different floors (departments) of an office building. Each floor is filled with office workers who are resistant to your musical influence. Your goal is to defeat all enemies on each floor using rhythm-based combat, and then proceed to the elevator to reach the next level.

### Features

- 3D navigation through office environments using WASD keys or mobile controls
- Rhythm-based combat system using keys Z, X, C, V or on-screen buttons on mobile
- Progressively more difficult rhythms as you advance through floors
- Enemies are converted to music lovers when defeated
- Speech bubbles for player and enemies
- Health system with heart pickups on higher floors
- Game over screen with restart option

## How to Play

### Movement Controls
- **W**: Move forward
- **A**: Move left
- **S**: Move backward
- **D**: Move right

### Combat Controls
- **Z**: Hit notes in the first lane
- **X**: Hit notes in the second lane
- **C**: Hit notes in the third lane
- **V**: Hit notes in the fourth lane

### Gameplay
1. Navigate the office floor using WASD keys
2. Approach enemies to engage them in musical combat
3. During combat, hit the notes as they cross the target line
4. More accurate hits deal more damage to enemies
5. Missing notes or hitting them inaccurately will cause you to take damage
6. After defeating all enemies on a floor, find the elevator to proceed to the next level
7. On higher floors, look for heart pickups to restore health

## Installation and Running

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to the local server address (usually http://localhost:5173)

## Technologies Used

- Three.js for 3D rendering
- JavaScript for game logic
- HTML/CSS for UI elements
- Vite for development and building

## Credits

All sound effects are located in the `public/sounds/` directory.

## License

This project is open source and available under the MIT License. 