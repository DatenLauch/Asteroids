import * as THREE from '/node_modules/three/build/three.module.js';

export default class Missile extends THREE.Object3D {
    constructor(model) {
        super();
        this.type = 'missile';
        this.name = 'missile';
        this.model = model;
        this.boundingSphere = null;
        this.yAngleModelOffset = 180;
        this.speed = 2;
        this.velocity = (0, 0, 1);
        this.damage = 3;
        this.boundingBox = new THREE.Box3();
        this.isMissileReady = false;
    }

    setupMissile() {
        this.model.rotation.y = THREE.MathUtils.degToRad(this.yAngleModelOffset);
        this.model.scale.set(0.05, 0.05, 0.05);
        this.model.position.set(10, 0, -1);
        this.add(this.model);
        this.isMissileReady = true;
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

    dealDamage(){
        return this.damage;
    }

    move() {
        let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion).normalize();
        this.velocity = forward;
        this.velocity.multiplyScalar(this.speed);
        this.position.add(this.velocity);
    }

    update() {
        if (this.isMissileReady) {
            this.move();
            this.updateBoundingBox();
        }
    }
}