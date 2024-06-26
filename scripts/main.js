import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import Spaceship from '/scripts/spaceship.js';
import Asteroid from '/scripts/asteroid.js';

/* Project Setup */

// Renderer 
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// Respond to windows resize
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Light
// placeholder for now
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);


// Skybox
let skybox;
const loader = new GLTFLoader();
loader.load('/models/skybox/scene.gltf',
    (gltf) => {
        skybox = gltf.scene;
        scene.add(skybox);
        //spaceship.add(skybox.scene);
        console.log('skybox loaded successfully');
    },
    function (xhr) {
        const skyboxLoadingProgress = (xhr.loaded / xhr.total) * 100;
        console.log(`Loading Skybox: ${Math.round(skyboxLoadingProgress)}%`);
    },
    function (error) {
        console.error('An error happened while loading skybox.', error);
    }
);

/* Gamelogic */

// Spaceship 
let spaceship = new Spaceship();
spaceship.add(camera);
camera.position.y = 5;
scene.add(spaceship);


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

function update() {
    requestAnimationFrame(update);

    /* Gameloop */

    // Movement
    spaceship.update();
    asteroids.forEach(asteroid => {
        asteroid.update();
    });
    // Collisions

    renderer.render(scene, camera);
}
update();