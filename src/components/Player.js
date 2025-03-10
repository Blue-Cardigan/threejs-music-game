import * as THREE from 'three';

export class Player {
    constructor(gameManager) {
        // Store reference to game manager
        this.gameManager = gameManager;
        
        // Player dimensions
        this.width = 1;
        this.height = 2;
        this.depth = 1;
        
        // Physics properties
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.gravity = -0.05;
        this.jumpForce = 0.6;
        this.moveSpeed = 0.2;
        this.isJumping = false;
        
        // Create player mesh
        this.createMesh();
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Movement control flag
        this.canMove = true;
    }
    
    createMesh() {
        // Create player body (cube)
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshLambertMaterial({ color: 0x3498db });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(0, 0, 0);
        
        // Add eyes (small spheres)
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(0.2, 0.3, 0.5);
        this.mesh.add(this.leftEye);
        
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye.position.set(-0.2, 0.3, 0.5);
        this.mesh.add(this.rightEye);
        
        // Add pupils
        const pupilGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        this.leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.leftPupil.position.set(0, 0, 0.05);
        this.leftEye.add(this.leftPupil);
        
        this.rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        this.rightPupil.position.set(0, 0, 0.05);
        this.rightEye.add(this.rightPupil);
    }
    
    setupInputHandlers() {
        // Movement keys
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        };
        
        // Key down event
        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                    this.keys.w = true;
                    break;
                case 'a':
                    this.keys.a = true;
                    break;
                case 's':
                    this.keys.s = true;
                    break;
                case 'd':
                    this.keys.d = true;
                    break;
                case ' ':
                    this.keys.space = true;
                    this.jump();
                    break;
            }
        });
        
        // Key up event
        window.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                    this.keys.w = false;
                    break;
                case 'a':
                    this.keys.a = false;
                    break;
                case 's':
                    this.keys.s = false;
                    break;
                case 'd':
                    this.keys.d = false;
                    break;
                case ' ':
                    this.keys.space = false;
                    break;
            }
        });
    }
    
    jump() {
        if (!this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
        }
    }
    
    update() {
        try {
            if (!this.canMove) return;
            
            // Apply gravity
            this.velocity.y += this.gravity;
            
            // Apply velocity to position
            this.mesh.position.y += this.velocity.y;
            
            // Handle movement based on key input
            if (this.keys.a) {
                this.mesh.position.x -= this.moveSpeed;
                this.mesh.rotation.y = -Math.PI / 2; // Rotate to face left
            }
            
            if (this.keys.d) {
                this.mesh.position.x += this.moveSpeed;
                this.mesh.rotation.y = Math.PI / 2; // Rotate to face right
            }
            
            // Prevent falling below ground
            if (this.mesh.position.y < -10) {
                this.mesh.position.y = 0;
                this.velocity.y = 0;
            }
            
            // Add boundary checks
            this.enforceBoundaries();
        } catch (error) {
            console.error("Error in player update:", error);
        }
    }
    
    // Add method to enforce boundaries
    enforceBoundaries() {
        const boundaries = this.gameManager.state.mapBoundaries;
        
        if (this.mesh.position.x < boundaries.left) {
            this.mesh.position.x = boundaries.left;
            this.velocity.x = 0;
        } else if (this.mesh.position.x > boundaries.right) {
            this.mesh.position.x = boundaries.right;
            this.velocity.x = 0;
        }
    }
    
    // Add method to take damage with visual feedback
    takeDamage(amount) {
        this.gameManager.damagePlayer(amount);
        
        // Visual effect for damage
        this.showDamageEffect();
    }
    
    // Visual effect for damage
    showDamageEffect() {
        // Flash the player red
        const originalColor = this.mesh.material.color.clone();
        this.mesh.material.color.set(0xff0000);
        
        // Reset after a short delay
        setTimeout(() => {
            this.mesh.material.color.copy(originalColor);
        }, 300);
    }
} 