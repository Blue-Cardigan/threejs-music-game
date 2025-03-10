export class GameUI {
    constructor(container, noteTypes) {
        this.container = container;
        this.noteTypes = noteTypes;
        this.elements = {};
        this.createUI();
    }

    createUI() {
        // Clear any existing UI
        this.container.innerHTML = '';
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'rhythm-game';
        this.container.appendChild(gameContainer);
        
        // Create note highway
        const highway = document.createElement('div');
        highway.className = 'note-highway';
        gameContainer.appendChild(highway);
        this.elements.highway = highway;
        
        // Create target zone
        const targetZone = document.createElement('div');
        targetZone.className = 'target-zone';
        highway.appendChild(targetZone);
        this.elements.targetZone = targetZone;
        
        // Create beat indicator
        const beatIndicator = document.createElement('div');
        beatIndicator.className = 'beat-indicator';
        highway.appendChild(beatIndicator);
        this.elements.beatIndicator = beatIndicator;
        
        // Create key indicators
        const keyContainer = document.createElement('div');
        keyContainer.className = 'key-container';
        gameContainer.appendChild(keyContainer);
        
        this.elements.keys = [];
        for (let i = 0; i < this.noteTypes.length; i++) {
            const keyType = this.noteTypes[i];
            
            const keyElement = document.createElement('div');
            keyElement.className = 'key-indicator';
            keyElement.style.backgroundColor = keyType.color;
            keyElement.innerHTML = `<span>${keyType.key}</span>`;
            keyContainer.appendChild(keyElement);
            
            this.elements.keys.push(keyElement);
        }
        
        // Create score display
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'score-container';
        gameContainer.appendChild(scoreContainer);
        
        const scoreLabel = document.createElement('div');
        scoreLabel.className = 'score-label';
        scoreLabel.textContent = 'Score';
        scoreContainer.appendChild(scoreLabel);
        
        const scoreValue = document.createElement('div');
        scoreValue.className = 'score-value';
        scoreValue.textContent = '0';
        scoreContainer.appendChild(scoreValue);
        this.elements.score = scoreValue;
        
        // Create combo display
        const comboContainer = document.createElement('div');
        comboContainer.className = 'combo-container';
        gameContainer.appendChild(comboContainer);
        
        const comboLabel = document.createElement('div');
        comboLabel.className = 'combo-label';
        comboLabel.textContent = 'Combo';
        comboContainer.appendChild(comboLabel);
        
        const comboValue = document.createElement('div');
        comboValue.className = 'combo-value';
        comboValue.textContent = '0';
        comboContainer.appendChild(comboValue);
        this.elements.combo = comboValue;
        
        // Create accuracy display
        const accuracyContainer = document.createElement('div');
        accuracyContainer.className = 'accuracy-container';
        gameContainer.appendChild(accuracyContainer);
        
        const accuracyLabel = document.createElement('div');
        accuracyLabel.className = 'accuracy-label';
        accuracyLabel.textContent = 'Accuracy';
        accuracyContainer.appendChild(accuracyLabel);
        
        const accuracyValue = document.createElement('div');
        accuracyValue.className = 'accuracy-value';
        accuracyValue.textContent = '100%';
        accuracyContainer.appendChild(accuracyValue);
        this.elements.accuracy = accuracyValue;
        
        // Create feedback display
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'feedback-container';
        gameContainer.appendChild(feedbackContainer);
        this.elements.feedback = feedbackContainer;
        
        // Create countdown display
        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'countdown-container';
        countdownContainer.style.display = 'none';
        gameContainer.appendChild(countdownContainer);
        this.elements.countdown = countdownContainer;
        
        // Create end game overlay
        const endGameOverlay = document.createElement('div');
        endGameOverlay.className = 'end-game-overlay';
        endGameOverlay.style.display = 'none';
        gameContainer.appendChild(endGameOverlay);
        this.elements.endGameOverlay = endGameOverlay;
    }

    updateScore(score) {
        this.elements.score.textContent = score;
    }

    updateCombo(combo) {
        this.elements.combo.textContent = combo;
    }

    updateAccuracy(accuracy) {
        this.elements.accuracy.textContent = `${Math.round(accuracy)}%`;
    }

    showHitFeedback(quality, noteColor = '#ffffff') {
        const feedback = document.createElement('div');
        feedback.className = 'hit-feedback';
        
        // Set text and color based on hit quality
        switch (quality) {
            case 'perfect':
                feedback.textContent = 'PERFECT!';
                feedback.style.color = '#ffcc00';
                break;
            case 'good':
                feedback.textContent = 'GOOD';
                feedback.style.color = '#00cc00';
                break;
            case 'okay':
                feedback.textContent = 'OKAY';
                feedback.style.color = '#0099ff';
                break;
            case 'miss':
                feedback.textContent = 'MISS';
                feedback.style.color = '#ff3333';
                break;
        }
        
        // Add to feedback container
        this.elements.feedback.appendChild(feedback);
        
        // Animate and remove after animation
        setTimeout(() => {
            feedback.classList.add('fade-out');
            setTimeout(() => {
                feedback.remove();
            }, 500);
        }, 500);
    }

    createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.style.backgroundColor = this.noteTypes[note.type].color;
        noteElement.dataset.measure = note.measure;
        noteElement.dataset.beat = note.beat;
        noteElement.dataset.type = note.type;
        
        this.elements.highway.appendChild(noteElement);
        return noteElement;
    }

    updateNotePosition(noteElement, position) {
        noteElement.style.top = `${position}px`;
    }

    removeNoteElement(noteElement) {
        noteElement.remove();
    }

    updateKeyAnimation(keyIndex, isPressed) {
        if (isPressed) {
            this.elements.keys[keyIndex].classList.add('pressed');
        } else {
            this.elements.keys[keyIndex].classList.remove('pressed');
        }
    }

    updateBeatIndicator(progress) {
        // Update beat indicator position or animation
        const pulseSize = 0.8 + (Math.sin(progress * Math.PI * 2) * 0.2);
        this.elements.beatIndicator.style.transform = `scale(${pulseSize})`;
    }

    showCountdown(number) {
        this.elements.countdown.style.display = 'flex';
        this.elements.countdown.textContent = number;
        
        // Animate countdown
        this.elements.countdown.classList.add('countdown-animation');
        setTimeout(() => {
            this.elements.countdown.classList.remove('countdown-animation');
        }, 900);
    }

    hideCountdown() {
        this.elements.countdown.style.display = 'none';
    }

    showEndGameScreen(accuracy, score, isVictory) {
        const overlay = this.elements.endGameOverlay;
        overlay.style.display = 'flex';
        overlay.innerHTML = '';
        
        // Create result container
        const resultContainer = document.createElement('div');
        resultContainer.className = 'result-container';
        overlay.appendChild(resultContainer);
        
        // Show victory/defeat message
        const resultTitle = document.createElement('h2');
        resultTitle.className = 'result-title';
        if (isVictory) {
            resultTitle.textContent = 'VICTORY!';
            resultTitle.style.color = '#ffcc00';
            this.createVictoryEffects(overlay);
        } else {
            resultTitle.textContent = 'DEFEAT';
            resultTitle.style.color = '#ff3333';
        }
        resultContainer.appendChild(resultTitle);
        
        // Show stats
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        resultContainer.appendChild(statsContainer);
        
        // Score
        const scoreElement = document.createElement('div');
        scoreElement.className = 'result-stat';
        scoreElement.innerHTML = `<span>Score:</span> ${score}`;
        statsContainer.appendChild(scoreElement);
        
        // Accuracy
        const accuracyElement = document.createElement('div');
        accuracyElement.className = 'result-stat';
        accuracyElement.innerHTML = `<span>Accuracy:</span> ${Math.round(accuracy)}%`;
        statsContainer.appendChild(accuracyElement);
        
        // Retry button
        const retryButton = document.createElement('button');
        retryButton.className = 'retry-button';
        retryButton.textContent = 'Play Again';
        resultContainer.appendChild(retryButton);
        
        return retryButton; // Return the button so event listeners can be attached
    }

    hideEndGameScreen() {
        this.elements.endGameOverlay.style.display = 'none';
    }

    createVictoryEffects(overlay) {
        // Create confetti effect
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random position, color, and animation delay
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            
            overlay.appendChild(confetti);
        }
    }

    createParticleEffect(x, y, color) {
        // Create particles at hit position
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = color;
            
            // Position at hit location
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            particle.dataset.vx = Math.cos(angle) * speed;
            particle.dataset.vy = Math.sin(angle) * speed;
            
            this.container.appendChild(particle);
            
            // Animate and remove
            let frameCount = 0;
            const animateParticle = () => {
                const vx = parseFloat(particle.dataset.vx);
                const vy = parseFloat(particle.dataset.vy);
                
                const currentX = parseFloat(particle.style.left);
                const currentY = parseFloat(particle.style.top);
                
                particle.style.left = `${currentX + vx}px`;
                particle.style.top = `${currentY + vy}px`;
                
                // Add gravity
                particle.dataset.vy = vy + 0.1;
                
                // Fade out
                particle.style.opacity = 1 - (frameCount / 30);
                
                frameCount++;
                if (frameCount < 30) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
    }

    getRandomColor() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#1abc9c'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
} 