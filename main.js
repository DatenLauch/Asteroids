import * as THREE from './node_modules/three/build/three.module.js';

// Renderer 
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

// Gamelogic

// Gameloop
function update() {
    requestAnimationFrame(update);

    // Gameloop

    renderer.render(scene, camera);
}
update();