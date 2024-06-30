import * as THREE from '/node_modules/three/build/three.module.js';

export default class Asteroid extends THREE.Object3D {

    constructor(model) {
        super();
        this.type = 'asteroid';
        this.model = this.deepClone(model);
        this.asteroidSize = null;
        this.baseSize = 2;
        this.boundingBox = null;
        this.isAsteroidReady = false;

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

    // deep clone model and it's children so that multiple asteroid instances don't mess with the original model (reference by reference)
    deepClone(model) {
        const modelClone = model.clone();
        const cloneChildren = (parent, parentClone) => {
            parent.children.forEach(child => {
                const childClone = child.clone();
                parentClone.add(childClone);
                if (child.children.length > 0)
                    cloneChildren(child, childClone);
            });
        };
        cloneChildren(model, modelClone);
        return modelClone;
    }

    setupAsteroid() {
        this.axesHelper = new THREE.AxesHelper(10);
        this.add(this.axesHelper);
        this.randomizeAsteroidSize();
        this.randomizeModel();
        this.add(this.model);
        this.model.position.set(0, 0, 0);
        this.model.scale.set(this.baseSize * this.asteroidSize, this.baseSize * this.asteroidSize, this.baseSize * this.asteroidSize);
        this.isAsteroidReady = true;
    }

    randomizeModel() {
        // there are 10 different asteroid models at this.model.children[0].children[0].children[0]);
        this.randomModelNumber = Math.floor(Math.random() * (this.model.children[0].children[0].children[0].children.length));
        this.model = this.model.children[0].children[0].children[0].children[this.randomModelNumber];
    }

    randomizeAsteroidSize() {
        this.asteroidSize = Math.floor(Math.random() * 3) + 1;
    }

    move() {
        //this.position.add(this.velocity);
    }

    rotate() {
        //this.rotateOnAxis(this.rotationAxis, this.rotationSpeed);
    }

    update() {
        if (this.isAsteroidReady) {
            this.move();
            this.rotate();
        }
    }
}