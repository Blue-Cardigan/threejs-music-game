import * as THREE from 'three';

export class SpeechBubble {
    constructor() {
        this.width = 7;
        this.height = 5;
        this.depth = 0.1;
        
        this.createMesh();
    }
    
    createMesh() {
        // Create speech bubble group
        this.mesh = new THREE.Group();
        this.mesh.position.set(0, 5, 0); // Position above the character
        
        // Create bubble background
        const bubbleGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const bubbleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        this.bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        this.mesh.add(this.bubble);
        
        // Create bubble pointer (triangle)
        const pointerShape = new THREE.Shape();
        pointerShape.moveTo(0, 0);
        pointerShape.lineTo(0.3, -0.3);
        pointerShape.lineTo(-0.3, -0.3);
        pointerShape.lineTo(0, 0);
        
        const pointerGeometry = new THREE.ShapeGeometry(pointerShape);
        const pointerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        this.pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
        this.pointer.position.set(0, -this.height/2, 0);
        this.mesh.add(this.pointer);
        
        // Create text
        this.textCanvas = document.createElement('canvas');
        this.textCanvas.width = 256;
        this.textCanvas.height = 128;
        this.textContext = this.textCanvas.getContext('2d');
        
        this.textTexture = new THREE.CanvasTexture(this.textCanvas);
        const textMaterial = new THREE.MeshBasicMaterial({
            map: this.textTexture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const textGeometry = new THREE.PlaneGeometry(this.width * 0.9, this.height * 0.8);
        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
        this.textMesh.position.z = this.depth / 2 + 0.01;
        this.bubble.add(this.textMesh);
        
        // Set default text
        this.setText("Hello!");
    }
    
    setText(text) {
        // Clear canvas
        this.textContext.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
        
        // Set text properties
        this.textContext.fillStyle = 'black';
        this.textContext.font = '24px Arial';
        this.textContext.textAlign = 'center';
        this.textContext.textBaseline = 'middle';
        
        // Handle multi-line text
        const words = text.split(' ');
        let line = '';
        let lines = [];
        const maxWidth = this.textCanvas.width * 0.8;
        const lineHeight = 30;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.textContext.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        
        // Draw text
        const y = this.textCanvas.height / 2 - (lines.length - 1) * lineHeight / 2;
        for (let i = 0; i < lines.length; i++) {
            this.textContext.fillText(lines[i], this.textCanvas.width / 2, y + i * lineHeight);
        }
        
        // Update texture
        this.textTexture.needsUpdate = true;
    }
} 