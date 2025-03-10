import * as THREE from 'three';

export class Platform {
    constructor(width = 10, height = 1, depth = 10, color = 0x8B4513) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        
        this.createMesh();
    }
    
    createMesh() {
        // Create platform geometry
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = new THREE.MeshLambertMaterial({ color: this.color });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        
        // Add some visual details to the platform
        this.addDetails();
    }
    
    addDetails() {
        // Add a grid pattern on top of the platform
        const gridSize = Math.min(this.width, this.depth) / 2;
        const gridGeometry = new THREE.PlaneGeometry(this.width, this.depth);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        
        const grid = new THREE.Mesh(gridGeometry, gridMaterial);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = this.height / 2 + 0.01; // Slightly above the platform
        
        this.mesh.add(grid);
    }
} 