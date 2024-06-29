import * as THREE from '/node_modules/three/build/three.module.js';
import Spaceship from '/scripts/spaceship.js';
import Asteroid from '/scripts/asteroid.js';
import Skybox from '/scripts/skybox.js';

class Main {
    constructor() {
        this.setupRenderer();
        this.setupScene();
        this.setupGame();
        this.update = this.update.bind(this);
        this.update();
    }

    setupRenderer() {
        this.canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.onWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.initSceneLighting();
        this.initCamera();
    }

    initSceneLighting() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(this.ambientLight);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }

    async setupGame() {
        this.initGamemode();
        await Promise.all([
            this.initSkybox(),
            this.initSpaceship(),
            this.initAsteroids(),
        ]);
        this.sceneManager = new THREE.Group();
        this.sceneManager.add(this.spaceship);
        this.sceneManager.add(this.skybox);
        this.sceneManager.add(this.asteroidsGroup);
        this.scene.add(this.sceneManager);
    }

    async initSkybox() {
        try {
            this.skyboxGLTFPath = '/models/skybox/scene.gltf';
            this.skybox = new Skybox(this.skyboxGLTFPath);
            await this.skybox.initialSetup();
        } catch (error) {
            console.error('Error initializing skybox in main.js:', error);
        }
    }

    async initSpaceship() {
        try {
            this.spaceshipGLTFPath = '/models/spaceship/scene.gltf';
            this.spaceship = new Spaceship(this.spaceshipGLTFPath);
            await this.spaceship.initialSetup();
            this.spaceship.add(this.camera);
            this.camera.position.y = 5;
            this.camera.position.z = 15;
            //this.spaceship.position.set();
        } catch (error) {
            console.error('Error initializing spaceship in main.js:', error);
        }
    }

    async initAsteroids() {
        try {
            // Loading an asteroid once and then cloning it by asteroidsAmount of times. Grouping clones together and adding them to scene.
            this.asteroidGLTFPath = '/models/asteroid/scene.gltf';
            this.asteroid = new Asteroid(this.asteroidGLTFPath);
            this.asteroidsGroup = new THREE.Group();
            this.asteroidsAmount = 20;
            await this.asteroid.initialSetup();
            for (let i = 0; i < this.asteroidsAmount; i++) {
                this.asteroidClone = this.asteroid.clone();
                this.asteroidsGroup.add(this.asteroidClone);
                this.asteroidClone.position.set(
                    this.randomRange(-this.skybox.radius, this.skybox.radius),
                    this.randomRange(-this.skybox.radius, this.skybox.radius),
                    this.randomRange(-this.skybox.radius, this.skybox.radius));
                this.asteroidClone.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2);
            }
        } catch (error) {
            console.error('Error initializing asteroids in main.js:', error);
        }
    }

    initGamemode() {
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    update() {
        requestAnimationFrame(this.update);
        if (this.spaceship) {
            this.spaceship.update();
        }
        if (this.skybox) {
            this.skybox.update();
            //this.skybox.position.copy(this.spaceship.position);
        }
        if (this.asteroidsGroup) {
            this.asteroidsGroup.children.forEach(asteroid => {
                asteroid.update();
            });
        }
        this.renderer.render(this.scene, this.camera);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new Main();
});