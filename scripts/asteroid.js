import * as THREE from '/node_modules/three/build/three.module.js';

export default class Asteroid extends THREE.Object3D {

    constructor(model) {
        super();
        this.type = 'asteroid';
        this.name = 'asteroid';
        this.size = 9;
        this.model = this.deepClone(model);
        this.boundingBox = new THREE.Box3()
        this.isAsteroidReady = false;

        this.speed = 1;
        this.direction = new THREE.Vector3();
        this.velocity = new THREE.Vector3();

        this.rotationAxis = new THREE.Vector3();
        this.rotationSpeed = 0.5 / this.size;
    }

    setupAsteroid() {
        this.setRandomModel();
        this.setRandomVelocity();
        this.setRandomRotation();
        this.add(this.model);
        this.model.scale.set(this.size, this.size, this.size);
        this.isAsteroidReady = true;
    }

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

    setRandomModel() {
        // there are 10 different asteroid models at this.model.children[0].children[0].children[0]);
        const randomModel = Math.floor(Math.random() * this.model.children[0].children[0].children[0].children.length);
        this.model = this.model.children[0].children[0].children[0].children[randomModel];
        this.model.position.set(0, 0, 0);
    }

    setRandomRotation(){
        this.rotationAxis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    }

    setRandomVelocity() {
        this.speed = this.speed * 3 / this.size;
        this.direction = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
        this.velocity = this.direction.multiplyScalar(this.speed);
    }

    takeDamage(damage) {
        if (damage >= this.size) {
            this.size = 0;
        }
        else {
            this.size = this.size - damage;
            this.model.scale.set(this.size, this.size, this.size);
            this.setRandomVelocity();
        }
    }

    updateBoundingBox() {
        //const boxSize = new THREE.Vector3(10, 10, 10);
        const boundingBoxPosition = this.position.clone();
        this.getWorldPosition(boundingBoxPosition);
        this.boundingBox.setFromObject(this);
        //this.boundingBox.setFromCenterAndSize(this.position, boxSize);
    }

    checkCollision(collider) {
        if (this.boundingBox.intersectsBox(collider.boundingBox)) {
            return true;
        }
        return false;
    }

    move() {
        this.position.add(this.velocity);
    }

    rotate() {
        const rotation = new THREE.Quaternion();
        rotation.setFromAxisAngle(this.rotationAxis, this.rotationSpeed);
        this.quaternion.multiply(rotation);
    }

    update() {
        if (this.isAsteroidReady) {
            this.move();
            this.rotate();
            this.updateBoundingBox();
        }
    }
}