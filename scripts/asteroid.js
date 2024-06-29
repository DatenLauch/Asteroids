import * as THREE from '/node_modules/three/build/three.module.js';
import GLTFLoaderComponent from '/scripts/components/GLTFLoaderComponent.js';

export default class Asteroid extends THREE.Object3D {

    constructor(GLTFPath) {
        super();
        this.type = 'asteroid';

        // Model and Mesh
        this.GLTFPath = GLTFPath; //'/models/asteroid/scene.gltf'
        this.GLTFLoader = new GLTFLoaderComponent(this.GLTFPath);
        this.model = null;
        this.mesh = null;
        this.isAsteroidLoaded = false;

        //Axeshelper to keep track of object position and rotation
        this.axesHelper = new THREE.AxesHelper(5);
        this.add(this.axesHelper);

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
    }

    async useGLTFLoader() {
        if (!this.model)
            try {
                this.model = await this.GLTFLoader.startLoaderAsynchronously();
                this.mesh = this.GLTFLoader.findMesh();
            }
            catch (error) {
                console.error('GLTFLoaderComponent encountered an error in Asteroid: ', error);
            }
    }

    async initialSetup(){
        try {
            await this.useGLTFLoader();
            this.add(this.model);
            this.model.position.set(0, 0, 0);
            this.model.scale.set(0.5, 0.5, 0.5);
            this.isAsteroidLoaded = true;
        }
        catch (error) {
            console.error('Error while setting up Asteroid: ', error);
        }
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