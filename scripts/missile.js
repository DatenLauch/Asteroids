import * as THREE from '/node_modules/three/build/three.module.js';

export default class Missile extends THREE.Object3D {
    constructor(model) {
        super();
        this.type = 'Missile';
        this.model = model;
        this.boundingSphere = null;
        this.yAngleModelOffset = 180;
        this.velocity = (0,0,1);
        this.isMissileReady = false;
    }

    setupMissile() {
        this.model.rotation.y = THREE.MathUtils.degToRad(this.yAngleModelOffset);
        this.model.scale.set(0.05,0.05,0.05);
        this.model.position.set(10,0,-1);
        this.add(this.model);
        this.isMissileReady = true;
    }

    move() {
        let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion).normalize();
        let velocity = new THREE.Vector3();
        velocity.copy(forward);
        let speed = 1;
        velocity.multiplyScalar(speed);
        this.position.add(velocity);
    }

    update() {
        console.log(this.isMissileReady);
        if (this.isMissileReady) {
            this.move();
        }
    }
}