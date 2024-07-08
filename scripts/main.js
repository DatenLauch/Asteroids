import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import Spaceship from '/scripts/spaceship.js';
import Missile from '/scripts/Missile.js';
import Asteroid from '/scripts/asteroid.js';
import Skybox from '/scripts/skybox.js';

class Main {
    constructor() {
        this.setupRenderer();
        this.setupScene();
        this.setupAudio();
        this.setupGame();
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

    setupAudio() {
        this.audioLoader = new THREE.AudioLoader();
        this.audioListener = new THREE.AudioListener();

        this.shootSound = new THREE.Audio(this.audioListener);
        this.audioLoader.load('audio/shoot.wav', (buffer) => {
            this.shootSound.setBuffer(buffer);
        });

        this.asteroidhitSound = new THREE.Audio(this.audioListener);
        this.audioLoader.load('audio/asteroidhit.wav', (buffer) => {
            this.asteroidhitSound.setBuffer(buffer);
        });

        this.asteroiddestroyedSound = new THREE.Audio(this.audioListener);
        this.audioLoader.load('audio/asteroiddestroyed.wav', (buffer) => {
            this.asteroiddestroyedSound.setBuffer(buffer);
        });

        this.spaceshipdestroyedSound = new THREE.Audio(this.audioListener);
        this.audioLoader.load('audio/spaceshipdestroyed.wav', (buffer) => {
            this.spaceshipdestroyedSound.setBuffer(buffer);
        });

        this.introMusic = new THREE.Audio(this.audioListener);
        this.audioLoader.load('audio/musicintro.ogg', (buffer) => {
            this.introMusic.setBuffer(buffer);
            this.introMusic.onEnded = () => {
                this.playSound(this.loopMusic);
            };
        });

        this.loopMusic = new THREE.Audio(this.audioListener);
        this.audioLoader.load('audio/musicloop.ogg', (buffer) => {
            this.loopMusic.setBuffer(buffer);
            this.loopMusic.setLoop(true);
        });
    }

    playSound(sound) {
        if (sound.isPlaying) {
            sound.stop();
        }
        sound.play();
    }

    async setupGame() {
        try {
            await this.loadModels();
        }
        catch (error) {
            console.error('Error while loading Models: ', error);
        }
        this.startMenu();
    }

    initGameSettings() {
        this.timerMinutes = 5;
        this.timerSeconds = 0;
        this.asteroidAmount = 10;
        this.score = 0;
    }

    startMenu() {
        this.mainMenu = document.getElementById('main-menu-screen');
        this.mainMenu.addEventListener('click', () => {
            if (!this.introMusic.isPlaying) {
                this.playSound(this.introMusic);
            }
        });
        this.mainMenu.style.display = 'flex';
        this.initGameSettings();
        this.initSkybox();
        this.initAsteroidGroup();
        this.initSpaceship();
        this.initMissileGroup();
        this.hasGameStarted = false;
        this.update();
        this.startButton = document.getElementById('start-button');
        this.startButton.addEventListener('click', () => {
            this.mainMenu.style.display = 'none';
            this.startGame();
        });
    }

    startGame() {
        this.hasGameStarted = true;
        this.scene.add(this.spaceship);
        this.initHud();
        this.startTimer();
    }

    initHud() {
        this.asteroidTextValue = document.getElementById('asteroid-counter-text-value');
        this.updateAsteroidCount(this.asteroidAmount);

        this.timeTextValue = document.getElementById('time-text-value');

        this.scoreTextValue = document.getElementById('score-text-value');
        this.updateScore(this.score);

        this.hud = document.getElementById('hud');
        this.hud.style.display = 'flex';
    }

    updateAsteroidCount(amount) {
        this.asteroidTextValue.textContent = amount;
    }

    startTimer() {
        this.endTime = Date.now() + this.timerMinutes * 60 * 1000 + this.timerSeconds * 1000;
        const timeInterval = setInterval(() => {
            this.remainingTime = this.endTime - Date.now();
            if (this.remainingTime > 0) {
                const minutes = Math.floor(this.remainingTime / 60000);
                const seconds = Math.floor((this.remainingTime % 60000) / 1000);
                const formattedMinutes = minutes.toString().padStart(2, '0');
                const formattedSeconds = seconds.toString().padStart(2, '0');
                this.formattedTime = `${formattedMinutes}:${formattedSeconds}`;
            } else {
                clearInterval(timeInterval);
                this.formattedTime = '00:00';
                if (this.spaceship.isSpaceshipReady) {
                    this.destroySpaceship();
                }
            }
            this.timeTextValue.textContent = this.formattedTime;
        }, 1000);
    }

    updateScore(amount) {
        this.score += amount;
        this.scoreTextValue.textContent = this.score;

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
        this.GLTFLoader = new GLTFLoader();
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
        this.camera.position.y = 5;
        this.camera.position.z = 15;
        this.spaceship.add(this.camera);
        this.spaceship.add(this.audioListener);
        //this.scene.add(this.spaceship);
    }

    initAsteroidGroup() {
        this.asteroidGroup = new THREE.Group();
        this.scene.add(this.asteroidGroup);
        for (let i = 0; i < this.asteroidAmount; i++) {
            let isWithinSkybox = false;
            let awayFromCenter = false;
            const maxSpawnRadius = this.skybox.radius - 50;
            const safeZoneRadius = 200;
            let x, y, z;
            while (!isWithinSkybox || !awayFromCenter) {
                x = this.randomRange(-this.skybox.radius, this.skybox.radius);
                y = this.randomRange(-this.skybox.radius, this.skybox.radius);
                z = this.randomRange(-this.skybox.radius, this.skybox.radius);
                if (x * x + y * y + z * z > safeZoneRadius * safeZoneRadius) {
                    awayFromCenter = true;
                }
                if (x * x + y * y + z * z < maxSpawnRadius * maxSpawnRadius) {
                    isWithinSkybox = true;
                }
            }
            this.asteroid = new Asteroid(this.asteroidModel);
            this.asteroid.setupAsteroid();
            this.asteroid.position.set(x, y, z);
            this.asteroidGroup.add(this.asteroid);
        }
    }

    initMissileGroup() {
        this.missileGroup = new THREE.Group();
        this.scene.add(this.missileGroup);
        this.missile = new Missile(this.missileModel);
        this.missile.setupMissile();
    }

    fireMissile() {
        this.newMissile = this.missile.clone();
        const missileForwardOffset = new THREE.Vector3(0, 0, -4);
        missileForwardOffset.applyQuaternion(this.spaceship.quaternion);
        this.newMissile.position.copy(this.spaceship.position).add(missileForwardOffset);
        this.newMissile.rotation.copy(this.spaceship.rotation);
        this.newMissile.isMissileReady = true;
        this.missileGroup.add(this.newMissile);
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    update() {
        requestAnimationFrame(() => this.update());
        if (this.spaceship) {
            this.spaceship.update();
            if (this.hasGameStarted) {
                if (this.spaceship.isShooting) {
                    this.spaceship.isShooting = false;
                    this.fireMissile();
                    this.playSound(this.shootSound);
                }
            }
        }
        if (this.skybox) {
            this.skybox.position.copy(this.spaceship.position);
        }

        if (this.missileGroup) {
            this.missileGroup.children.forEach(missile => {
                missile.update();
                this.deleteEscapingMissile(missile);
                this.asteroidGroup.children.forEach(asteroid => {
                    if (missile.checkCollision(asteroid)) {
                        this.missileGroup.remove(missile);
                        asteroid.takeDamage(missile.dealDamage());
                        this.updateScore(asteroid.getPoints());
                        if (asteroid.size > 0) {
                            this.playSound(this.asteroidhitSound);
                            this.spawnAsteroidFragment(asteroid);
                            this.updateAsteroidCount(this.asteroidGroup.children.length);
                        }
                        else {
                            this.playSound(this.asteroiddestroyedSound);
                            this.asteroidGroup.remove(asteroid);
                            this.updateAsteroidCount(this.asteroidGroup.children.length);
                        }
                    }
                });
            });
        }

        if (this.asteroidGroup) {
            for (let i = 0; i < this.asteroidGroup.children.length; i++) {
                const asteroid1 = this.asteroidGroup.children[i];
                asteroid1.update();
                if (asteroid1.checkCollision(this.spaceship))
                    if (this.spaceship.isSpaceshipReady) {
                        this.destroySpaceship();
                    }
                for (let j = i + 1; j < this.asteroidGroup.children.length; j++) {
                    const asteroid2 = this.asteroidGroup.children[j];
                    if (asteroid1.checkCollision(asteroid2)) {
                        const direction = new THREE.Vector3().subVectors(asteroid1.position, asteroid2.position).normalize();
                        let velocity1 = new THREE.Vector3().copy(direction).multiplyScalar(asteroid1.speed);
                        let velocity2 = new THREE.Vector3().copy(direction).multiplyScalar(-asteroid2.speed);
                        asteroid1.velocity.copy(velocity1);
                        asteroid2.velocity.copy(velocity2);
                    }
                    this.keepAsteroidInPlayfield(asteroid1);
                    this.keepAsteroidInPlayfield(asteroid2);
                }
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    destroySpaceship() {
        this.playSound(this.spaceshipdestroyedSound);
        this.spaceship.disableShipControls();
        this.spaceship.isSpaceshipReady = false;
        this.scene.remove(this.spaceship)
        this.hud.style.display = 'none';
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.gameOverScreen.style.display = 'flex';
    }

    keepAsteroidInPlayfield(asteroid) {
        const asteroidDistance = asteroid.position.distanceTo(this.spaceship.position);
        if (asteroidDistance > 475) {
            const direction = new THREE.Vector3();
            direction.subVectors(this.spaceship.position, asteroid.position).normalize();
            asteroid.velocity.set(direction.x, direction.y, direction.z);
            asteroid.velocity.multiplyScalar(this.spaceship.velocity.length() * 1.10);
        }
    }

    deleteEscapingMissile(missile) {
        missile.update();
        const missileDistance = missile.position.distanceTo(this.spaceship.position);
        if (missileDistance > 500) {
            this.missileGroup.remove(missile);
            return;
        }
    }

    spawnAsteroidFragment(asteroid) {
        let worldPosition = new THREE.Vector3();
        asteroid.getWorldPosition(worldPosition);
        this.newAsteroid = new Asteroid(this.asteroidModel);
        this.newAsteroid.position.set(worldPosition.x, worldPosition.y, worldPosition.z);
        this.newAsteroid.size = asteroid.size;
        this.newAsteroid.setupAsteroid();
        this.asteroidGroup.add(this.newAsteroid);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Main();
});