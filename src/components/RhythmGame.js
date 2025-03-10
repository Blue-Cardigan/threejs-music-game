import { RhythmAudio } from './RhythmAudio.js';
import { PatternGenerator } from './PatternGenerator.js';
import { GameUI } from './GameUI.js';
import { GameMechanics } from './GameMechanics.js';
import { InputHandler } from './InputHandler.js';

export class RhythmGame {
    constructor() {
        // Game configuration
        this.bpm = 120; // Beats per minute
        this.beatsPerMeasure = 4; // 4/4 time signature
        this.totalMeasures = 4; // 4 measures per rhythm pattern
        
        // Timing windows for note hits (in milliseconds)
        this.timingWindows = {
            perfect: 100,  // ±50ms
            good: 150,     // ±75ms
            okay: 200      // ±100ms
        };
        
        // Note types and corresponding keys
        this.noteTypes = [
            { key: 'z', sound: 'kick', color: '#e74c3c' },    // Kick - Red
            { key: 'x', sound: 'snare', color: '#3498db' },   // Snare - Blue
            { key: 'j', sound: 'tom', color: '#2ecc71' },     // Tom - Green
            { key: 'k', sound: 'tamb', color: '#f1c40f' }     // Tambourine - Yellow
        ];
        
        // Current pattern of notes
        this.pattern = [];
        this.noteElements = [];
        
        // DOM container
        this.container = document.getElementById('rhythm-container');
        
        // Initialize components
        this.audio = new RhythmAudio();
        this.patternGenerator = new PatternGenerator(this.beatsPerMeasure, this.totalMeasures, this.noteTypes);
        this.ui = new GameUI(this.container, this.noteTypes);
        this.mechanics = new GameMechanics(this.bpm, this.beatsPerMeasure, this.totalMeasures, this.timingWindows);
        this.inputHandler = new InputHandler(this.noteTypes);
        
        // Set up input callbacks
        this.inputHandler.setKeyPressCallback(this.handleKeyPress.bind(this));
        this.inputHandler.setKeyReleaseCallback(this.handleKeyRelease.bind(this));
        
        // Animation frame ID for game loop
        this.animationFrameId = null;
    }

    startGame(callback) {
        // Generate a new pattern
        const difficulty = 3; // Medium difficulty
        this.pattern = this.patternGenerator.generatePattern(difficulty);
        
        // Set total notes in mechanics
        this.mechanics.totalNotes = this.pattern.length;
        
        // Create note elements
        this.createNoteElements();
        
        // Show intro animation
        this.showIntroAnimation(() => {
            // Start countdown
            this.showCountdown(() => {
                // Start the rhythm loop
                this.startRhythmLoop(callback);
            });
        });
    }

    showIntroAnimation(callback) {
        // Simple intro animation
        setTimeout(callback, 1000);
    }

    createNoteElements() {
        // Clear existing note elements
        this.noteElements = [];
        
        // Create elements for each note in the pattern
        this.pattern.forEach(note => {
            const noteElement = this.ui.createNoteElement(note);
            this.noteElements.push({
                note: note,
                element: noteElement
            });
        });
    }

    showCountdown(callback) {
        let count = 3;
        
        const countdown = (num) => {
            if (num > 0) {
                this.ui.showCountdown(num);
                this.audio.playSound('countdown');
                
                setTimeout(() => {
                    countdown(num - 1);
                }, 1000);
            } else {
                this.ui.hideCountdown();
                callback();
            }
        };
        
        countdown(count);
    }

    startRhythmLoop(callback) {
        // Start game mechanics
        this.mechanics.startGame();
        
        // Start background music
        this.audio.startBGM();
        
        // Game loop
        const animate = (timestamp) => {
            // Update game time
            const newBeat = this.mechanics.updateGameTime(timestamp);
            
            // Play beat sound on new beats
            if (newBeat) {
                this.audio.playSound('hihat', 0.3);
            }
            
            // Update note positions
            this.updateNotePositions();
            
            // Update UI
            this.updateUI();
            
            // Check for game end
            if (this.mechanics.isGameComplete()) {
                this.endGame(callback);
                return;
            }
            
            // Continue animation loop
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        // Start animation loop
        this.animationFrameId = requestAnimationFrame(animate);
    }

    updateNotePositions() {
        const currentPosition = this.mechanics.getCurrentPosition();
        const highwayHeight = this.ui.elements.highway.offsetHeight;
        const targetY = this.ui.elements.targetZone.offsetTop;
        
        // Update each note position
        this.noteElements.forEach(({ note, element }) => {
            // Calculate note position
            const notePosition = (note.measure * this.beatsPerMeasure) + note.beat;
            const distance = notePosition - currentPosition;
            
            // Position in pixels (notes come from top to bottom)
            const pixelPosition = targetY - (distance * highwayHeight / 4);
            
            // Update element position
            this.ui.updateNotePosition(element, pixelPosition);
            
            // Check if note is missed (passed target zone)
            if (!note.hit && pixelPosition > targetY + 50) {
                note.hit = true;
                this.mechanics.registerMiss();
                this.ui.showHitFeedback('miss');
                this.ui.removeNoteElement(element);
            }
        });
    }

    handleKeyPress(key) {
        // Get key type index
        const keyTypeIndex = this.inputHandler.getKeyTypeIndex(key);
        
        // Play sound
        this.audio.playSound(this.noteTypes[keyTypeIndex].sound);
        
        // Update key animation
        this.ui.updateKeyAnimation(keyTypeIndex, true);
        
        // Check for note hit
        this.checkNoteHit(key);
    }

    handleKeyRelease(key) {
        // Get key type index
        const keyTypeIndex = this.inputHandler.getKeyTypeIndex(key);
        
        // Update key animation
        this.ui.updateKeyAnimation(keyTypeIndex, false);
    }

    checkNoteHit(key) {
        // Get current time position
        const currentPosition = this.mechanics.getCurrentPosition();
        const keyTypeIndex = this.inputHandler.getKeyTypeIndex(key);
        
        // Find closest unhit note of the matching type
        let closestNote = null;
        let closestDistance = Infinity;
        let closestNoteIndex = -1;
        
        this.noteElements.forEach(({ note, element }, index) => {
            if (!note.hit && note.type === keyTypeIndex) {
                const notePosition = (note.measure * this.beatsPerMeasure) + note.beat;
                const distance = Math.abs(notePosition - currentPosition);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestNote = note;
                    closestNoteIndex = index;
                }
            }
        });
        
        // Check if note is within timing window
        if (closestNote) {
            const hitQuality = this.mechanics.checkNoteHit(closestNote);
            
            if (hitQuality) {
                // Mark note as hit
                closestNote.hit = true;
                
                // Show hit feedback
                this.ui.showHitFeedback(hitQuality, this.noteTypes[keyTypeIndex].color);
                
                // Create particle effect at hit position
                const noteElement = this.noteElements[closestNoteIndex].element;
                const rect = noteElement.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                this.ui.createParticleEffect(x, y, this.noteTypes[keyTypeIndex].color);
                
                // Remove note element
                this.ui.removeNoteElement(noteElement);
                
                return true;
            }
        }
        
        return false;
    }

    updateUI() {
        // Get current game stats
        const stats = this.mechanics.getGameStats();
        
        // Update UI elements
        this.ui.updateScore(stats.score);
        this.ui.updateCombo(stats.combo);
        this.ui.updateAccuracy(stats.accuracy);
        
        // Update beat indicator
        this.ui.updateBeatIndicator(this.mechanics.beatProgress);
    }

    endGame(callback) {
        // Stop game mechanics
        this.mechanics.stopGame();
        
        // Stop animation loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Stop background music
        this.audio.stopBGM();
        
        // Get final stats
        const stats = this.mechanics.getGameStats();
        const isVictory = this.mechanics.isVictory();
        
        // Play victory/defeat sound
        this.audio.playSound(isVictory ? 'success' : 'fail');
        
        // Show end game screen
        const retryButton = this.ui.showEndGameScreen(
            stats.accuracy, 
            stats.score, 
            isVictory
        );
        
        // Add event listener to retry button
        retryButton.addEventListener('click', () => {
            this.ui.hideEndGameScreen();
            this.resetGame();
            this.startGame(callback);
        });
        
        // Call callback if provided
        if (callback) {
            callback(isVictory, stats);
        }
    }

    resetGame() {
        // Reset game mechanics
        this.mechanics.resetGameStats();
        
        // Reset input handler
        this.inputHandler.resetKeyStates();
        
        // Clear notes
        this.pattern = [];
        this.noteElements = [];
    }

    setDamageEnemyCallback(callback) {
        this.mechanics.setDamageEnemyCallback(callback);
    }

    endGameEarly(callback) {
        if (this.mechanics.isPlaying) {
            this.endGame(callback);
        }
    }
} 