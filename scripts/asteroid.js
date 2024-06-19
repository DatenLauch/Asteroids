import * as THREE from '/node_modules/three/build/three.module.js';

export class Asteroid extends THREE.Object3D {

    constructor() {
        super();
        this.type = 'asteroid';
        //Axeshelper to keep track of object position and rotation
        this.axesHelper = new THREE.AxesHelper(5);
        this.add(this.axesHelper);

        // Mesh stuff
        this.geometry = new THREE.IcosahedronGeometry(1.0, 2);
        this.material = new THREE.MeshBasicMaterial({ color: 0x4c3228 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.add(this.mesh);

        // Speed
        this.minSpeed = -0.02;
        this.maxSpeed = 0.02;
        this.speed = Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed;

        // Velocity
        this.direction = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        this.velocity = this.direction.multiplyScalar(this.speed);

        // Rotation
        this.rotationAxis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        this.rotationSpeed = Math.random() * 0.05;
        console.log(this.rotationAxis);
    }

    move() {
        this.position.add(this.velocity);
    }

    rotate() {
        this.mesh.rotateOnAxis(this.rotationAxis, this.rotationSpeed);
    }
}