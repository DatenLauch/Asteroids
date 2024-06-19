import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { Spaceship } from '/scripts/spaceship.js';
import { Asteroid } from '/scripts/asteroid.js';

// Renderer 
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

// Respond to windows resize
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Skybox
const loader = new GLTFLoader();
loader.load('/models/skybox/scene.gltf',
    (gltf) => {
        scene.add(gltf.scene);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% Skybox loaded');
    },
    (error) => {
        console.error('Error while loading skybox', error);
    }
);

// Gamelogic

// helper function for easier random values
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
// Asteroids
const asteroids = [];
let asteroidAmount = 2;
for (let i = 0; i < asteroidAmount; i++) {
    const position = new THREE.Vector3(
        randomRange(-50, 50),
        randomRange(-50, 50),
        randomRange(-50, 50)
    );
    const velocity = new THREE.Vector3(
        randomRange(-0.05, 0.05),
        randomRange(-0.05, 0.05),
        randomRange(-0.05, 0.05)
    );
    const asteroid = new Asteroid(position, velocity);
    scene.add(asteroid);
    asteroids.push(asteroid);
}

// Spaceship 
const spaceship = new Spaceship;
scene.add(spaceship);


// Gameloop
function update() {
    requestAnimationFrame(update);

    // Gameloop
    asteroids.forEach(asteroid => {
        asteroid.move();
        asteroid.rotate();
    });


    // Collisions


    renderer.render(scene, camera);
}
update();