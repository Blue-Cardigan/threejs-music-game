export class InputHandler {
    constructor(noteTypes) {
        this.noteTypes = noteTypes;
        
        // Player input tracking
        this.keyState = {};
        
        // Initialize key states
        this.noteTypes.forEach(type => {
            this.keyState[type.key] = { 
                pressed: false, 
                lastPressed: 0 
            };
        });
        
        // Callbacks
        this.onKeyPress = null;
        this.onKeyRelease = null;
        
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Key down event
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            
            // Check if this is a valid game key
            if (this.keyState.hasOwnProperty(key) && !this.keyState[key].pressed) {
                // Update key state
                this.keyState[key].pressed = true;
                this.keyState[key].lastPressed = performance.now();
                
                // Call key press callback if set
                if (this.onKeyPress) {
                    this.onKeyPress(key);
                }
            }
        });
        
        // Key up event
        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            
            // Check if this is a valid game key
            if (this.keyState.hasOwnProperty(key)) {
                // Update key state
                this.keyState[key].pressed = false;
                
                // Call key release callback if set
                if (this.onKeyRelease) {
                    this.onKeyRelease(key);
                }
            }
        });
        
        // Handle touch/click events for mobile compatibility
        document.addEventListener('click', (event) => {
            // Check if the click is on a key indicator
            if (event.target.closest('.key-indicator')) {
                const keyElement = event.target.closest('.key-indicator');
                const keyIndex = Array.from(keyElement.parentNode.children).indexOf(keyElement);
                
                if (keyIndex >= 0 && keyIndex < this.noteTypes.length) {
                    const key = this.noteTypes[keyIndex].key;
                    
                    // Simulate key press
                    this.keyState[key].pressed = true;
                    this.keyState[key].lastPressed = performance.now();
                    
                    if (this.onKeyPress) {
                        this.onKeyPress(key);
                    }
                    
                    // Simulate key release after a short delay
                    setTimeout(() => {
                        this.keyState[key].pressed = false;
                        
                        if (this.onKeyRelease) {
                            this.onKeyRelease(key);
                        }
                    }, 100);
                }
            }
        });
    }

    isKeyPressed(key) {
        return this.keyState[key] && this.keyState[key].pressed;
    }

    getLastPressTime(key) {
        return this.keyState[key] ? this.keyState[key].lastPressed : 0;
    }

    getKeyTypeIndex(key) {
        return this.noteTypes.findIndex(type => type.key === key);
    }

    setKeyPressCallback(callback) {
        this.onKeyPress = callback;
    }

    setKeyReleaseCallback(callback) {
        this.onKeyRelease = callback;
    }

    resetKeyStates() {
        // Reset all key states
        Object.keys(this.keyState).forEach(key => {
            this.keyState[key].pressed = false;
        });
    }
} 