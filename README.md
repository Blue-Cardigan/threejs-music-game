# 3D Rhythm Platformer

A 3D platformer rhythm game built with Three.js where you navigate through platforms and battle enemies with rhythm-based combat.

## Game Features

- 3D platformer gameplay with WASD movement and space to jump
- Rhythm-based combat system when encountering enemies
- Enemies display speech bubbles when combat begins
- Guitar Hero-style rhythm game with Z, X, J, K keys
- Rehearsal mode to practice the rhythm before playing
- Accuracy-based damage system
- Enemies change color instead of disappearing when defeated
- Score based on how many enemies you convert

## Controls

- **Movement**: WASD keys
- **Jump**: Space bar
- **Rhythm Combat**: Z, X, J, K keys (hit when notes reach the target line)

## How to Play

1. Navigate the platforms using WASD and Space
2. When you get close to an enemy, combat begins automatically
3. In combat, you'll first hear the rhythm pattern once (rehearsal mode)
4. Then you need to play the pattern by pressing the corresponding keys when the notes reach the target line
5. Your accuracy determines how much damage you deal to the enemy
6. Defeat all enemies and reach the end platform to complete the level

## Running the Game

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Technologies Used

- Three.js for 3D rendering
- Howler.js for audio
- Vite for bundling and development server

## Development

This game was built as a demonstration of combining platformer mechanics with rhythm-based gameplay. The assets are generated programmatically using simple geometric shapes with colors to distinguish different elements.

Feel free to modify and extend the game!

## Sound Assets

The game uses sound files for the rhythm game component. To download the sound files:

1. Run the download script:
   ```
   node src/utils/downloadSounds.js
   ```

2. This will download the necessary sound files to the `public/sounds` directory.

Alternatively, you can manually download sound files and place them in the `public/sounds` directory with the following names:
- kick.mp3
- snare.mp3
- tom.mp3
- tambourine.mp3
- metronome.mp3
- perfect.mp3
- good.mp3
- miss.mp3 