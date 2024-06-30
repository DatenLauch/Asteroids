import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import Spaceship from '/scripts/spaceship.js';
import Missile from '/scripts/Missile.js';
import Asteroid from '/scripts/asteroid.js';
import Skybox from '/scripts/skybox.js';

class Main {
    constructor() {
        this.GLTFLoader = new GLTFLoader();
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
        this.ambientLight = new THREE.AmbientLight(0xffffff, 3);
        this.scene.add(this.ambientLight);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }

    async setupGame() {
        this.initGamemode();
        try {
            await this.loadModels();
        }
        catch (error) {
            console.error('Error while loading Models: ', error);
        }
        this.initSkybox();
        this.initSpaceship();
        this.initMissile();
        this.initAsteroids();
        this.sceneManager = new THREE.Group();
        this.sceneManager.add(this.spaceship);
        this.sceneManager.add(this.skybox);
        this.sceneManager.add(this.asteroidGroup);
        this.sceneManager.add(this.missileGroup);
        this.scene.add(this.sceneManager);
    }

    initGamemode() {
    }

    async loadModels() {
        try {
            this.skyboxModel = await this.loadGLTFModel('/models/skybox/scene.gltf');
            console.log('Skybox model loaded successfully:', this.skyboxModel);

            this.spaceshipModel = await this.loadGLTFModel('/models/spaceship/scene.gltf');
            console.log('Spaceship model loaded successfully:', this.spaceshipModel);

            this.missileModel = await this.loadGLTFModel('/models/missile/scene.gltf');
            console.log('Missile model loaded successfully:', this.missileModel);

            this.asteroidModel = await this.loadGLTFModel('/models/asteroid/scene.gltf');
            console.log('Asteroid model loaded successfully:', this.asteroidModel);

        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    async loadGLTFModel(path) {
        return new Promise((resolve, reject) => {
            this.GLTFLoader.load(path,
                (gltf) => {
                    const model = gltf.scene || gltf.scenes[0];
                    resolve(model);
                },
                (xhr) => {
                    const loadingProgress = (xhr.loaded / xhr.total) * 100;
                    console.log(`Loading from path ${path}: ${Math.round(loadingProgress)}% `);
                },
                (error) => {
                    console.error('Error loading model from GLTF file:', error);
                    reject(error);
                }
            );
        });
    }

    initSkybox() {
        this.skybox = new Skybox(this.skyboxModel);
        this.skybox.setupSkybox();
        this.scene.add(this.skybox);
    }

    initSpaceship() {
        this.spaceship = new Spaceship(this.spaceshipModel);
        this.spaceship.setupSpaceship();
        this.spaceship.add(this.camera);
        this.camera.position.y = 5;
        this.camera.position.z = 15;
    }

    initAsteroids() {
        this.asteroidGroup = new THREE.Group();
        this.asteroidAmount = 10;

        for (let i = 0; i < this.asteroidAmount; i++) {
            this.asteroid = new Asteroid(this.asteroidModel);
            this.asteroid.setupAsteroid();
            this.asteroidGroup.add(this.asteroid);
            this.asteroid.position.set(
                this.randomRange(-this.skybox.radius + 50, this.skybox.radius - 50),
                this.randomRange(-this.skybox.radius + 50, this.skybox.radius - 50),
                this.randomRange(-this.skybox.radius + 50, this.skybox.radius - 50));
            this.asteroid.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2);
        }
    }

    initMissile() {
        this.missileGroup = new THREE.Group();
        this.missile = new Missile(this.missileModel);
        this.missile.setupMissile();
    }

    fireMissile() {
        this.newMissile = this.missile.clone();
        this.missileGroup.add(this.newMissile);
        const missileForwardOffset = new THREE.Vector3(0, 0, -4);
        missileForwardOffset.applyQuaternion(this.spaceship.quaternion);
        this.newMissile.position.copy(this.spaceship.position).add(missileForwardOffset);
        this.newMissile.rotation.copy(this.spaceship.rotation);

        this.newMissile.isMissileReady = true;
        console.log('Fire!');
        console.log(this.missileGroup.children.length);
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    update() {
        requestAnimationFrame(this.update);
        if (this.spaceship) {
            this.spaceship.update();
            if (this.spaceship.isShooting) {
                this.spaceship.isShooting = false;
                this.fireMissile();
            }
        }
        if (this.skybox) {
            this.skybox.update();
            //this.skybox.position.copy(this.spaceship.position);
        }

        if (this.missileGroup) {
            this.missileGroup.children.forEach(missile => {
                missile.update();
            });
        }

        if (this.asteroidGroup) {
            this.asteroidGroup.children.forEach(asteroid => {
                asteroid.update();
            });
        }
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Main();
});