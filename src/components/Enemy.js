import * as THREE from 'three';
import { SpeechBubble } from './SpeechBubble.js';

export class Enemy {
    constructor() {
        // Enemy properties
        this.width = 1;
        this.height = 2;
        this.depth = 1;
        this.health = 100;
        this.isDefeated = false;
        this.originalColor = 0xe74c3c; // Red
        this.defeatedColor = 0x2ecc71; // Green
        
        // Create enemy mesh
        this.createMesh();
        
        // Create speech bubble
        this.speechBubble = new SpeechBubble();
        this.mesh.add(this.speechBubble.mesh);
        this.speechBubble.mesh.visible = false;
        
        // Animation properties
        this.bobHeight = 0.2;
        this.bobSpeed = 0.02;
        this.bobTime = Math.random() * Math.PI * 2; // Random start phase
        
        // Damage animation properties
        this.isDamaged = false;
        this.damageTime = 0;
        this.damageDuration = 0.3; // seconds
    }
    
    createMesh() {
        // Create enemy body (cube)
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshLambertMaterial({ color: this.originalColor });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
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
        
        // Add angry eyebrows
        const browGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
        const browMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        this.leftBrow = new THREE.Mesh(browGeometry, browMaterial);
        this.leftBrow.position.set(0.2, 0.45, 0.5);
        this.leftBrow.rotation.z = Math.PI / 6;
        this.mesh.add(this.leftBrow);
        
        this.rightBrow = new THREE.Mesh(browGeometry, browMaterial);
        this.rightBrow.position.set(-0.2, 0.45, 0.5);
        this.rightBrow.rotation.z = -Math.PI / 6;
        this.mesh.add(this.rightBrow);
    }
    
    showSpeechBubble(text) {
        this.speechBubble.setText(text);
        this.speechBubble.mesh.visible = true;
        
        // Hide speech bubble after 5 seconds
        setTimeout(() => {
            this.speechBubble.mesh.visible = false;
        }, 5000);
    }
    
    takeDamage(amount) {
        // Only take damage if not already defeated
        if (this.isDefeated) return;
        
        // Reduce health
        this.health -= amount;
        console.log(`Enemy took ${amount} damage. Health: ${this.health}/100`);
        
        // Check if defeated
        if (this.health <= 0) {
            this.health = 0;
            this.defeat();
        } else {
            // Show damage animation
            this.showDamageAnimation();
            
            // Show speech bubble with random damage phrase
            const damagePhrases = [
                "Ouch!",
                "That hurt!",
                "My rhythm!",
                "Not bad...",
                "You've got moves!"
            ];
            const randomPhrase = damagePhrases[Math.floor(Math.random() * damagePhrases.length)];
            this.showSpeechBubble(randomPhrase);
        }
    }
    
    showDamageAnimation() {
        // Flash red
        this.isDamaged = true;
        this.damageTime = 0;
        
        // Store original color
        this.originalMaterialColor = this.mesh.material.color.clone();
        
        // Set to damage color (bright white)
        this.mesh.material.color.set(0xffffff);
        
        // Shake the enemy
        this.mesh.position.x += (Math.random() - 0.5) * 0.2;
        this.mesh.position.z += (Math.random() - 0.5) * 0.2;
    }
    
    defeat() {
        this.isDefeated = true;
        
        // Change color to indicate defeat
        this.mesh.material.color.set(this.defeatedColor);
        
        // Change eyebrows to happy
        this.leftBrow.rotation.z = -Math.PI / 6;
        this.rightBrow.rotation.z = Math.PI / 6;
        
        // Show speech bubble
        this.showSpeechBubble("You've converted me with your rhythm!");
        
        // Emit particles for defeat effect
        this.createDefeatParticles();
        
        // Make the enemy slightly transparent to indicate conversion
        this.mesh.material.transparent = true;
        this.mesh.material.opacity = 0.8;
        
        // Add a friendly glow effect
        const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.defeatedColor,
            transparent: true,
            opacity: 0.3
        });
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glowMesh);
        
        // Allow player to pass through by updating collision detection
        // This is handled in the checkEnemyCollisions function
    }
    
    createDefeatParticles() {
        // Create a particle system for the defeat effect
        const particleCount = 50;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshBasicMaterial({ color: this.defeatedColor })
            );
            
            // Random position within the enemy
            particle.position.set(
                (Math.random() - 0.5) * this.width,
                (Math.random() - 0.5) * this.height,
                (Math.random() - 0.5) * this.depth
            );
            
            // Random velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.1
            );
            
            // Random lifetime
            particle.userData.lifetime = 1 + Math.random() * 2;
            particle.userData.age = 0;
            
            particles.add(particle);
        }
        
        this.mesh.add(particles);
        this.defeatParticles = particles;
    }
    
    update(deltaTime = 0.016) {
        // Bob up and down
        this.bobTime += this.bobSpeed;
        const bobOffset = Math.sin(this.bobTime) * this.bobHeight;
        this.mesh.position.y += bobOffset * 0.01;
        
        // If defeated, spin slowly
        if (this.isDefeated) {
            this.mesh.rotation.y += 0.01;
            
            // Update defeat particles if they exist
            if (this.defeatParticles) {
                this.defeatParticles.children.forEach((particle, index) => {
                    // Update position based on velocity
                    particle.position.add(particle.userData.velocity);
                    
                    // Add gravity
                    particle.userData.velocity.y -= 0.001;
                    
                    // Age the particle
                    particle.userData.age += deltaTime;
                    
                    // Fade out based on age
                    const opacity = 1 - (particle.userData.age / particle.userData.lifetime);
                    if (opacity <= 0) {
                        // Remove particle if it's too old
                        this.defeatParticles.remove(particle);
                    } else {
                        // Scale down as it ages
                        const scale = 1 - (particle.userData.age / particle.userData.lifetime) * 0.5;
                        particle.scale.set(scale, scale, scale);
                    }
                });
            }
        }
        
        // Handle damage animation
        if (this.isDamaged) {
            this.damageTime += deltaTime;
            
            // Reset after damage duration
            if (this.damageTime >= this.damageDuration) {
                this.isDamaged = false;
                // Reset to original color if not defeated
                if (!this.isDefeated) {
                    this.mesh.material.color.copy(this.originalMaterialColor);
                }
                // Reset position from shake
                this.mesh.position.x = Math.round(this.mesh.position.x * 10) / 10;
                this.mesh.position.z = Math.round(this.mesh.position.z * 10) / 10;
            }
        }
    }
} 