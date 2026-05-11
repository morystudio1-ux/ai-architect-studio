// AI Architect Design Studio - 3D Engine with Three.js

class ThreeJSEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.lights = [];
        this.isInitialized = false;
        this.animationId = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        return new Promise((resolve, reject) => {
            try {
                // Scene setup
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x0f172a);
                this.scene.fog = new THREE.Fog(0x0f172a, 10, 50);

                // Camera setup
                const aspect = this.container.clientWidth / this.container.clientHeight;
                this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
                this.camera.position.set(10, 10, 10);
                this.camera.lookAt(0, 0, 0);

                // Renderer setup
                this.renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    alpha: true
                });
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.container.appendChild(this.renderer.domElement);

                // Controls
                this.setupControls();

                // Lighting
                this.setupLighting();

                // Environment
                this.setupEnvironment();

                // Handle resize
                window.addEventListener('resize', () => this.onResize());

                // Start animation loop
                this.animate();

                this.isInitialized = true;
                resolve(true);

            } catch (error) {
                console.error('3D Engine initialization failed:', error);
                reject(error);
            }
        });
    }

    setupControls() {
        // Simple orbit controls implementation
        this.controls = {
            isRotating: false,
            rotationSpeed: 0.005,
            lastX: 0,
            lastY: 0
        };

        // Mouse controls
        this.container.addEventListener('mousedown', (e) => {
            this.controls.isRotating = true;
            this.controls.lastX = e.clientX;
            this.controls.lastY = e.clientY;
            this.container.style.cursor = 'grabbing';
        });

        this.container.addEventListener('mousemove', (e) => {
            if (!this.controls.isRotating) return;

            const deltaX = e.clientX - this.controls.lastX;
            const deltaY = e.clientY - this.controls.lastY;

            if (this.model) {
                this.model.rotation.y += deltaX * this.controls.rotationSpeed;
                this.model.rotation.x += deltaY * this.controls.rotationSpeed;
            }

            this.controls.lastX = e.clientX;
            this.controls.lastY = e.clientY;
        });

        this.container.addEventListener('mouseup', () => {
            this.controls.isRotating = false;
            this.container.style.cursor = 'grab';
        });

        this.container.addEventListener('mouseleave', () => {
            this.controls.isRotating = false;
            this.container.style.cursor = 'grab';
        });

        // Wheel zoom
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            this.camera.position.multiplyScalar(1 + (e.deltaY > 0 ? zoomSpeed : -zoomSpeed));
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);

        // Point lights for effect
        const pointLight1 = new THREE.PointLight(0x3b82f6, 0.5, 20);
        pointLight1.position.set(-10, 10, -10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.5, 20);
        pointLight2.position.set(10, -10, 10);
        this.scene.add(pointLight2);

        this.lights = [ambientLight, directionalLight, pointLight1, pointLight2];
    }

    setupEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid helper
        const gridHelper = new THREE.GridHelper(50, 50, 0x3b82f6, 0x1e293b);
        gridHelper.position.y = -1.99;
        this.scene.add(gridHelper);
    }

    createBasicFloorPlan(width, depth) {
        if (!this.model) {
            this.model = new THREE.Group();
            this.scene.add(this.model);
        }

        // Clear existing model
        while (this.model.children.length > 0) {
            this.model.remove(this.model.children[0]);
        }

        // Create floor
        const floorGeometry = new THREE.BoxGeometry(width, 0.2, depth);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.7,
            metalness: 0.3
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -0.1;
        floor.castShadow = true;
        floor.receiveShadow = true;
        this.model.add(floor);

        // Create walls based on rooms data
        const wallHeight = 3;
        const wallThickness = 0.2;

        // Outer walls
        this.createWall(-width/2, wallHeight/2, 0, width, wallThickness, depth, 0x64748b);
        this.createWall(width/2, wallHeight/2, 0, width, wallThickness, depth, 0x64748b);
        this.createWall(0, wallHeight/2, -depth/2, wallThickness, wallHeight, depth, 0x64748b);
        this.createWall(0, wallHeight/2, depth/2, wallThickness, wallHeight, depth, 0x64748b);

        // Add some sample rooms
        this.createRoom(2, -width/2 + 2, 0, 6, 4, wallHeight, 0x3b82f6);
        this.createRoom(-2, -width/2 + 2, 5, 4, 4, wallHeight, 0x8b5cf6);
    }

    createWall(x, y, z, width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1
        });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.model.add(wall);
    }

    createRoom(x, y, z, width, depth, height, color) {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.6,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8
        });

        // Back wall
        this.createWall(x + width/2, y - height/2, z - depth/2, width, height, 0.1, color);

        // Side walls
        this.createWall(x, y - height/2, z, 0.1, height, depth, color);
        this.createWall(x + width, y - height/2, z, 0.1, height, depth, color);
    }

    createModelFromPlan(planData) {
        if (!this.model) {
            this.model = new THREE.Group();
            this.scene.add(this.model);
        }

        // Clear existing model
        while (this.model.children.length > 0) {
            this.model.remove(this.model.children[0]);
        }

        const totalArea = planData.totalArea || 100;
        const scale = Math.sqrt(totalArea) / 10;

        // Create optimized design based on AI analysis
        const design = this.generateOptimizedDesign(planData);

        // Apply design to 3D model
        design.elements.forEach(element => {
            this.createElement(element, scale);
        });

        // Add furniture and details
        this.addDesignDetails(design.style, scale);
    }

    generateOptimizedDesign(planData) {
        // Generate design based on AI analysis
        return {
            style: planData.style || 'modern',
            elements: [
                {
                    type: 'floor',
                    position: [0, -0.1, 0],
                    scale: [10 * Math.sqrt(planData.totalArea / 100), 0.2, 10 * Math.sqrt(planData.totalArea / 100)],
                    color: 0x475569
                },
                {
                    type: 'structure',
                    position: [0, 1, 0],
                    scale: [8 * Math.sqrt(planData.totalArea / 100), 2, 8 * Math.sqrt(planData.totalArea / 100)],
                    color: 0x64748b
                }
            ],
            style: planData.style,
            features: planData.recommendations || []
        };
    }

    createElement(element, scale) {
        let geometry, material, mesh;

        switch (element.type) {
            case 'floor':
                geometry = new THREE.BoxGeometry(...element.scale.map(s => s * scale));
                material = new THREE.MeshStandardMaterial({
                    color: element.color,
                    roughness: 0.7,
                    metalness: 0.2
                });
                break;
            case 'structure':
                geometry = new THREE.BoxGeometry(...element.scale.map(s => s * scale));
                material = new THREE.MeshStandardMaterial({
                    color: element.color,
                    roughness: 0.5,
                    metalness: 0.4
                });
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshStandardMaterial({ color: 0x64748b });
        }

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...element.position.map(p => p * scale));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.model.add(mesh);
    }

    addDesignDetails(style, scale) {
        // Add design elements based on style
        const detailGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);

        switch (style) {
            case 'modern':
                // Clean lines, minimal details
                const detailMaterial = new THREE.MeshStandardMaterial({
                    color: 0x3b82f6,
                    roughness: 0.3,
                    metalness: 0.7
                });
                for (let i = 0; i < 4; i++) {
                    const detail = new THREE.Mesh(detailGeometry, detailMaterial);
                    detail.position.set(
                        (Math.random() - 0.5) * 10 * scale,
                        1,
                        (Math.random() - 0.5) * 10 * scale
                    );
                    this.model.add(detail);
                }
                break;
            case 'classic':
                // Ornate details
                const ornateMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8b4513,
                    roughness: 0.6,
                    metalness: 0.3
                });
                // Add columns
                for (let i = 0; i < 2; i++) {
                    const columnGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
                    const column = new THREE.Mesh(columnGeometry, ornateMaterial);
                    column.position.set(
                        (i - 0.5) * 6 * scale,
                        1.5,
                        0
                    );
                    this.model.add(column);
                }
                break;
        }
    }

    setLightingPreset(preset) {
        switch (preset) {
            case 'natural':
                this.lights[1].intensity = 0.8; // Main sun
                this.lights[2].intensity = 0.3; // Blue light
                this.lights[3].intensity = 0.3; // Purple light
                break;
            case 'night':
                this.lights[1].intensity = 0.2; // Dim sun
                this.lights[2].intensity = 0.8; // Bright blue
                this.lights[3].intensity = 0.8; // Bright purple
                break;
            case 'studio':
                this.lights[1].intensity = 1.0; // Bright sun
                this.lights[2].intensity = 0.2; // Dim blue
                this.lights[3].intensity = 0.2; // Dim purple
                break;
            case 'custom':
                // Custom lighting would be handled by user controls
                break;
        }
    }

    setQualityLevel(level) {
        switch (level) {
            case 'draft':
                this.renderer.shadowMap.enabled = false;
                break;
            case 'standard':
                this.renderer.shadowMap.enabled = true;
                break;
            case 'high':
                this.renderer.shadowMap.enabled = true;
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.renderer.toneMappingExposure = 1;
                break;
            case 'ultra':
                this.renderer.shadowMap.enabled = true;
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.renderer.toneMappingExposure = 1.2;
                // Add anti-aliasing if available
                if (this.renderer.capabilities.isWebGL2) {
                    this.renderer.outputEncoding = THREE.sRGBEncoding;
                }
                break;
        }
    }

    async renderToImage(options = {}) {
        // Set quality
        this.setQualityLevel(options.quality || 'standard');

        // Render scene
        this.renderer.render(this.scene, this.camera);

        // Get canvas data
        const canvas = this.renderer.domElement;
        const dataURL = canvas.toDataURL('image/png');

        return {
            id: `render_${Date.now()}`,
            url: dataURL,
            width: canvas.width,
            height: canvas.height,
            format: 'png'
        };
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Auto-rotate when not interacting
        if (!this.controls.isRotating && this.model) {
            this.model.rotation.y += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        if (this.container && this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }

        this.isInitialized = false;
    }
}

// Initialize 3D engine when DOM is ready
let threeJSInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D viewer
    const viewerContainer = document.getElementById('model3dViewer');
    if (viewerContainer && !threeJSInstance) {
        threeJSInstance = new ThreeJSEngine('model3dViewer');

        // Auto-initialize after a short delay
        setTimeout(() => {
            threeJSInstance.initialize().then(() => {
                // Create sample floor plan
                threeJSInstance.createBasicFloorPlan(10, 8);
                UI.notify('3D model yüklendi', 'success');
            }).catch(error => {
                UI.notify('3D model yüklenemedi', 'error');
            });
        }, 1000);
    }
});

// Global 3D API
window.ThreeJS = {
    getViewer: () => threeJSInstance,
    createViewer: (containerId) => new ThreeJSEngine(containerId)
};