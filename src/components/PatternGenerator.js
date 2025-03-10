export class PatternGenerator {
    constructor(beatsPerMeasure, totalMeasures, noteTypes) {
        this.beatsPerMeasure = beatsPerMeasure;
        this.totalMeasures = totalMeasures;
        this.noteTypes = noteTypes;
    }

    generatePattern(difficulty = 1) {
        // Initialize empty pattern
        const pattern = [];
        
        // Basic rhythm patterns for each instrument
        const kickPatterns = {
            basic: [
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // Four on the floor
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], // Four on the floor with pickup
                [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]  // Syncopated
            ],
            variation: [
                [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], // Syncopated variation
                [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], // Triplet feel
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0]  // Double hit
            ]
        };
        
        const snarePatterns = {
            basic: [
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Backbeat
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], // Backbeat with pickup
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0]  // Backbeat with syncopation
            ],
            variation: [
                [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0], // Ghost note
                [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], // Syncopated
                [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0]  // Complex
            ]
        };
        
        const tomPatterns = {
            basic: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], // Simple accent
                [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Sparse
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1]  // End fill
            ],
            variation: [
                [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0], // Triplet
                [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1], // Double hits
                [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0]  // Complex fill
            ]
        };
        
        const tambPatterns = {
            basic: [
                [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // Steady eighths
                [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], // Steady offbeats
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1]  // End accent
            ],
            variation: [
                [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0], // Syncopated
                [0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1], // Complex
                [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1]  // Build up
            ]
        };
        
        const rhythmPatterns = {
            kick: kickPatterns,
            snare: snarePatterns,
            tom: tomPatterns,
            tamb: tambPatterns
        };
        
        // Generate a pattern for each instrument
        for (let i = 0; i < this.noteTypes.length; i++) {
            const instrument = this.noteTypes[i].sound;
            
            // Select pattern based on difficulty
            const useVariation = Math.random() < (difficulty * 0.2); // Higher chance with higher difficulty
            const selectedPattern = this.selectPatternByDifficulty(
                instrument, 
                rhythmPatterns, 
                difficulty, 
                useVariation
            );
            
            // Add notes to the pattern
            for (let measure = 0; measure < this.totalMeasures; measure++) {
                for (let beat = 0; beat < this.beatsPerMeasure; beat++) {
                    // Each beat has 4 sixteenth notes
                    for (let sixteenth = 0; sixteenth < 4; sixteenth++) {
                        const patternIndex = (beat * 4 + sixteenth) % selectedPattern.length;
                        
                        if (selectedPattern[patternIndex]) {
                            pattern.push({
                                measure: measure,
                                beat: beat + (sixteenth / 4),
                                type: i,
                                hit: false
                            });
                        }
                    }
                }
            }
        }
        
        // Add filler notes based on difficulty
        if (difficulty >= 2) {
            for (let measure = 0; measure < this.totalMeasures; measure++) {
                const fillerCount = Math.floor(Math.random() * difficulty) + 1;
                this.addFillerNotes(pattern, measure, fillerCount, difficulty);
            }
        }
        
        // Add musical flourishes for higher difficulties
        if (difficulty >= 3) {
            this.addMusicalFlourishes(pattern, difficulty);
        }
        
        // Add additional challenge patterns for highest difficulties
        if (difficulty >= 4) {
            this.addChallengePatterns(pattern, difficulty);
        }
        
        // Sort pattern by measure and beat
        pattern.sort((a, b) => {
            if (a.measure !== b.measure) {
                return a.measure - b.measure;
            }
            return a.beat - b.beat;
        });
        
        return pattern;
    }

    selectPatternByDifficulty(instrument, rhythmPatterns, difficulty, useVariation) {
        const patterns = rhythmPatterns[instrument];
        let patternSet = useVariation ? patterns.variation : patterns.basic;
        
        // Select pattern based on difficulty
        let patternIndex;
        if (difficulty <= 2) {
            // For easier difficulties, prefer simpler patterns
            patternIndex = Math.floor(Math.random() * Math.min(2, patternSet.length));
        } else if (difficulty <= 4) {
            // For medium difficulties, use any pattern
            patternIndex = Math.floor(Math.random() * patternSet.length);
        } else {
            // For hardest difficulties, prefer complex patterns
            patternIndex = Math.floor(Math.random() * patternSet.length);
            if (patternIndex === 0 && patternSet.length > 1) {
                patternIndex = 1 + Math.floor(Math.random() * (patternSet.length - 1));
            }
        }
        
        return patternSet[patternIndex];
    }

    addFillerNotes(pattern, measure, count, difficulty) {
        for (let i = 0; i < count; i++) {
            // Random beat position
            const beat = Math.floor(Math.random() * this.beatsPerMeasure);
            const sixteenth = Math.floor(Math.random() * 4);
            const beatPosition = beat + (sixteenth / 4);
            
            // Random instrument (note type)
            const typeIndex = Math.floor(Math.random() * this.noteTypes.length);
            
            // Check if there's already a note at this position
            const existingNote = pattern.find(note => 
                note.measure === measure && 
                Math.abs(note.beat - beatPosition) < 0.1
            );
            
            // Only add if there's no note already
            if (!existingNote) {
                pattern.push({
                    measure: measure,
                    beat: beatPosition,
                    type: typeIndex,
                    hit: false
                });
            }
        }
    }

    addMusicalFlourishes(pattern, difficulty) {
        // Add a drum fill at the end of measures
        const fillMeasure = Math.floor(Math.random() * (this.totalMeasures - 1));
        const fillBeat = 3; // Last beat of the measure
        
        // Number of notes in the fill depends on difficulty
        const fillNotes = Math.min(difficulty, 4);
        
        for (let i = 0; i < fillNotes; i++) {
            const sixteenth = i;
            const beatPosition = fillBeat + (sixteenth / 4);
            
            // Alternate between tom and snare for the fill
            const typeIndex = (i % 2 === 0) ? 2 : 1; // Tom or snare
            
            pattern.push({
                measure: fillMeasure,
                beat: beatPosition,
                type: typeIndex,
                hit: false
            });
        }
    }

    addChallengePatterns(pattern, difficulty) {
        // Add a challenging pattern based on difficulty
        
        // 1. Add a fast roll (multiple consecutive notes of the same type)
        const rollMeasure = Math.floor(Math.random() * this.totalMeasures);
        const rollBeat = Math.floor(Math.random() * (this.beatsPerMeasure - 1));
        const rollType = Math.floor(Math.random() * this.noteTypes.length);
        
        // Number of notes in the roll depends on difficulty
        const rollNotes = Math.min(difficulty, 4);
        
        for (let i = 0; i < rollNotes; i++) {
            const sixteenth = i * (4 / rollNotes);
            const beatPosition = rollBeat + (sixteenth / 4);
            
            pattern.push({
                measure: rollMeasure,
                beat: beatPosition,
                type: rollType,
                hit: false
            });
        }
        
        // 2. Add a polyrhythm (notes of different types close together)
        if (difficulty >= 5) {
            const polyMeasure = (rollMeasure + 1) % this.totalMeasures;
            const polyBeat = Math.floor(Math.random() * (this.beatsPerMeasure - 1));
            
            // Create a 3-against-2 polyrhythm
            const firstType = Math.floor(Math.random() * this.noteTypes.length);
            let secondType = (firstType + 1) % this.noteTypes.length;
            
            // First rhythm (2 notes)
            for (let i = 0; i < 2; i++) {
                const beatPosition = polyBeat + (i * 0.5);
                
                pattern.push({
                    measure: polyMeasure,
                    beat: beatPosition,
                    type: firstType,
                    hit: false
                });
            }
            
            // Second rhythm (3 notes)
            for (let i = 0; i < 3; i++) {
                const beatPosition = polyBeat + (i * 0.33);
                
                pattern.push({
                    measure: polyMeasure,
                    beat: beatPosition,
                    type: secondType,
                    hit: false
                });
            }
        }
    }
} 