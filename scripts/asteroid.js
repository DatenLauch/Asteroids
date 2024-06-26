import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

class Asteroid extends THREE.Object3D {

    constructor() {
        super();
        this.type = 'asteroid';
        //Axeshelper to keep track of object position and rotation
        this.axesHelper = new THREE.AxesHelper(5);
        this.add(this.axesHelper);

        // Mesh
        this.mesh;
        const loader = new GLTFLoader();
        loader.load('/models/asteroid/scene.gltf',
            (gltf) => {
                this.mesh = gltf.scene;

                this.mesh.position.set(0, 0, 0);
                this.mesh.scale.set(1, 1, 1);
                this.add(this.mesh);
                this.asteroidLoaded = true;
                console.log('Asteroid loaded successfully');
            },
            function (xhr) {
                const asteroidLoadingProgress = (xhr.loaded / xhr.total) * 100;
                console.log(`Loading asteroid: ${Math.round(asteroidLoadingProgress)}%`);
            },
            function (error) {
                console.error('An error happened while loading asteroid.', error);
            }
        );

        // Speed
        this.minSpeed = 0;
        this.maxSpeed = 0.1;
        this.speed = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;

        // Velocity
        this.direction = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        this.velocity = this.direction.multiplyScalar(this.speed);

        // Rotation
        this.rotationAxis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        this.rotationSpeed = Math.random() * 0.5;
        console.log(this.rotationAxis);
    }

    move() {
        this.position.add(this.velocity);
    }

    rotate() {
        this.rotateOnAxis(this.rotationAxis, this.rotationSpeed);
    }

    update(){
        if(this.asteroidLoaded){
            this.move();
            this.rotate();  
        }
    }
}
export default Asteroid;