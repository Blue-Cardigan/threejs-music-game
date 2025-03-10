export class GameMechanics {
    constructor(bpm, beatsPerMeasure, totalMeasures, timingWindows) {
        // Rhythm game properties
        this.bpm = bpm; // Beats per minute
        this.beatsPerMeasure = beatsPerMeasure; // 4/4 time signature
        this.totalMeasures = totalMeasures; // 4 measures per rhythm pattern
        
        // Game state
        this.isPlaying = false;
        this.isRehearsing = true;
        this.currentBeat = 0;
        this.currentMeasure = 0;
        this.beatProgress = 0;
        this.lastBeatTime = 0;
        
        // Scoring
        this.accuracy = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.missedNotes = 0;
        this.score = 0;
        
        // Timing windows for note hits (in milliseconds)
        this.timingWindows = timingWindows || {
            perfect: 100,  // ±50ms
            good: 150,     // ±75ms
            okay: 200      // ±100ms
        };
        
        // Callbacks
        this.onDamageEnemy = null;
    }

    startGame() {
        this.isPlaying = true;
        this.resetGameStats();
        this.lastBeatTime = performance.now();
    }

    stopGame() {
        this.isPlaying = false;
    }

    resetGameStats() {
        this.currentBeat = 0;
        this.currentMeasure = 0;
        this.beatProgress = 0;
        this.accuracy = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.totalNotes = 0;
        this.hitNotes = 0;
        this.missedNotes = 0;
        this.score = 0;
    }

    updateGameTime(timestamp) {
        if (!this.isPlaying) return;
        
        // Calculate time since last beat
        const beatInterval = 60000 / this.bpm; // ms per beat
        const timeSinceLastBeat = timestamp - this.lastBeatTime;
        
        // Update beat progress (0 to 1)
        this.beatProgress = timeSinceLastBeat / beatInterval;
        
        // Check if we've reached the next beat
        if (this.beatProgress >= 1) {
            // Move to next beat
            this.currentBeat++;
            this.lastBeatTime = timestamp;
            this.beatProgress = 0;
            
            // Check if we've completed a measure
            if (this.currentBeat >= this.beatsPerMeasure) {
                this.currentBeat = 0;
                this.currentMeasure++;
                
                // Check if we've completed all measures
                if (this.currentMeasure >= this.totalMeasures) {
                    this.currentMeasure = 0;
                }
            }
            
            return true; // Indicate a new beat
        }
        
        return false; // No new beat
    }

    getCurrentPosition() {
        return this.currentMeasure * this.beatsPerMeasure + this.currentBeat + this.beatProgress;
    }

    checkNoteHit(note, currentTime) {
        // Calculate timing difference
        const beatDuration = 60000 / this.bpm; // ms per beat
        const noteTiming = (note.measure * this.beatsPerMeasure + note.beat) * beatDuration;
        const currentTiming = this.getCurrentPosition() * beatDuration;
        const timingDiff = Math.abs(currentTiming - noteTiming);
        
        // Check if note is within timing windows
        let hitQuality = null;
        
        if (timingDiff <= this.timingWindows.perfect / 2) {
            hitQuality = 'perfect';
            this.score += 100 * (1 + this.combo * 0.1); // Bonus for combo
        } else if (timingDiff <= this.timingWindows.good / 2) {
            hitQuality = 'good';
            this.score += 75 * (1 + this.combo * 0.05);
        } else if (timingDiff <= this.timingWindows.okay / 2) {
            hitQuality = 'okay';
            this.score += 50;
        } else {
            // Miss
            return null;
        }
        
        // Update stats
        this.hitNotes++;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.updateAccuracy();
        
        // Trigger enemy damage if callback is set
        if (this.onDamageEnemy && hitQuality) {
            let damageAmount = 0;
            switch (hitQuality) {
                case 'perfect':
                    damageAmount = 10;
                    break;
                case 'good':
                    damageAmount = 7;
                    break;
                case 'okay':
                    damageAmount = 5;
                    break;
            }
            
            this.onDamageEnemy(damageAmount);
        }
        
        return hitQuality;
    }

    registerMiss() {
        this.missedNotes++;
        this.combo = 0; // Reset combo
        this.updateAccuracy();
        
        return 'miss';
    }

    updateAccuracy() {
        if (this.hitNotes + this.missedNotes > 0) {
            this.accuracy = (this.hitNotes / (this.hitNotes + this.missedNotes)) * 100;
        } else {
            this.accuracy = 100;
        }
    }

    getGameStats() {
        return {
            score: Math.round(this.score),
            combo: this.combo,
            maxCombo: this.maxCombo,
            accuracy: this.accuracy,
            hitNotes: this.hitNotes,
            missedNotes: this.missedNotes,
            totalNotes: this.hitNotes + this.missedNotes
        };
    }

    setDamageEnemyCallback(callback) {
        this.onDamageEnemy = callback;
    }

    isGameComplete() {
        // Check if all notes have been hit or missed
        return this.hitNotes + this.missedNotes >= this.totalNotes && this.totalNotes > 0;
    }

    isVictory() {
        // Victory condition: accuracy above 70%
        return this.accuracy >= 70;
    }
} 