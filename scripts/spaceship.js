import * as THREE from '/node_modules/three/build/three.module.js';

export default class Spaceship extends THREE.Object3D {

    constructor(model) {
        super();
        this.type = 'spaceship';
        this.name = 'spaceship';
        this.model = model;
        this.isSpaceshipReady = false;
        this.isShooting = false;
        this.boundingBox = new THREE.Box3();

        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.canvas = document.querySelector('canvas');
        this.areShipControlsEnabled = false;

        this.currentSpeed = 0;
        this.maxSpeed = 1;
        this.minSpeed = -this.maxSpeed;
        this.velocity = new THREE.Vector3();
        this.accelerationMagnitude = 0.010;
        this.isMovingForward = false;
        this.isMovingBackwards = false;
        this.attackSpeed = 0.5;

        this.rotationSpeed = 0.005;
        this.rollIncrement = 2;
        this.maxRollAngle = 30;
        this.pitchIncrement = 1;
        this.yAngleModelOffset = 180;
        this.maxPitchAngle = 5 + this.yAngleModelOffset;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.isTurningUp = false;
        this.isTurningDown = false;
    }

    setupSpaceship() {
        this.add(this.model);
        this.model.position.set(0, 0, 0);
        this.model.scale.set(0.5, 0.5, 0.5);
        this.model.rotation.y = THREE.MathUtils.degToRad(this.yAngleModelOffset);
        this.enableAimAssist();
        this.isSpaceshipReady = true;
    }

    enableAimAssist(){
        const target = new THREE.Object3D();
        target.position.set(0, -1, -2);
        this.add(target);

        const headlight = new THREE.SpotLight(0xffffff, 5);
        headlight.distance = 500;
        headlight.position.set(0, -1, -1);
        headlight.target = (target);
        headlight.angle = Math.PI / 5
        headlight.decay = 0;
        headlight.castShadow = true;
        this.add(headlight);

        const aimlight = new THREE.SpotLight(0xff0000, 10000);
        aimlight.distance = 490;
        aimlight.position.set(0, -1, -1);
        aimlight.target = (target);
        aimlight.angle = Math.PI / 300
        aimlight.decay = 0;
        aimlight.castShadow = true;
        this.add(aimlight);
    }

    enableShipControls() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.requestPointerLock();
        this.areShipControlsEnabled = true;
        this.canFire = true;
    }

    disableShipControls() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.exitPointerLock();
        this.areShipControlsEnabled = false;
    }

    isCursorLocked() {
        return (document.pointerLockElement === canvas);
    }

    mouseMoveHandler(event) {
        if (this.isCursorLocked) {
            const deltaX = event.movementX;
            const deltaY = event.movementY;
            this.rotateWithMouse(deltaX, deltaY);
        }
    }

    rotateWithMouse(deltaX, deltaY) {
        if (deltaX < 0) {
            this.isTurningRight = false;
            this.isTurningLeft = true;
        }
        else if (deltaX > 0) {
            this.isTurningLeft = false;
            this.isTurningRight = true;
        }
        /*else if (deltaX === 0) {
            this.isTurningRight = false;
            this.isTurningLeft = false;
        }*/
        if (deltaY < 0) {
            this.isTurningDown = false;
            this.isTurningUp = true;
        }
        else if (deltaY > 0) {
            this.isTurningUp = false;
            this.isTurningDown = true;
        }
        /*else if (deltaY === 0) {
            this.isTurningUp = false;
            this.isTurningDown = false;
        }*/
        const deltaYaw = -deltaX * this.rotationSpeed;
        const deltaPitch = -deltaY * this.rotationSpeed;
        const quaternionYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaYaw);
        const quaternionPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaPitch);
        this.quaternion.multiply(quaternionYaw).multiply(quaternionPitch);

        clearTimeout(this.mouseMoveTimeout);
        this.mouseMoveTimeout = setTimeout(() => {
            this.isTurningLeft = false;
            this.isTurningRight = false;
            this.isTurningUp = false;
            this.isTurningDown = false;
        }, 30);
    }

    rotateSpaceship() {
        // roll = left and right (one wing goes up and other down)
        this.rollAngle = THREE.MathUtils.radToDeg(this.model.rotation.z);
        this.rollAngle = Math.round(this.rollAngle);

        if (this.isTurningRight) {
            if (this.rollAngle < this.maxRollAngle) {
                this.rollAngle += this.rollIncrement;
                this.rollAngle = Math.min(this.rollAngle, this.maxRollAngle);
            }
        }
        else if (this.isTurningLeft) {
            if (this.rollAngle > -this.maxRollAngle) {
                this.rollAngle -= this.rollIncrement;
                this.rollAngle = Math.max(this.rollAngle, -this.maxRollAngle);
            }
        }
        else if (!this.isTurningRight && !this.isTurningLeft) {
            if (this.rollAngle > 0) {
                this.rollAngle -= this.rollIncrement;
                this.rollAngle = Math.max(this.rollAngle, -this.maxRollAngle);
            }
            else if (this.rollAngle < 0) {
                this.rollAngle += this.rollIncrement;
                this.rollAngle = Math.min(this.rollAngle, this.maxRollAngle);
            }
        }
        this.model.rotation.z = THREE.MathUtils.degToRad(this.rollAngle);

        // pitch = up and down (nose and tail)
        this.pitchAngle = THREE.MathUtils.radToDeg(this.model.rotation.x);
        this.pitchAngle = Math.round(this.pitchAngle);

        if (this.isTurningUp) {
            if ((this.pitchAngle + this.yAngleModelOffset) < this.maxPitchAngle) {
                this.pitchAngle += this.pitchIncrement;
                this.pitchAngle = Math.min(this.pitchAngle, this.maxPitchAngle);
            }
        }

        else if (this.isTurningDown) {
            if ((this.pitchAngle - this.yAngleModelOffset) > (-this.maxPitchAngle - 15)) {
                this.pitchAngle -= this.pitchIncrement;
                this.rollAngle = Math.max(this.rollAngle, -this.maxRollAngle);
            }
        }

        else if (!this.isTurningUp && !this.isTurningDown) {
            if (this.pitchAngle > 0) {
                this.pitchAngle -= this.rollIncrement;
                this.pitchAngle = Math.max(this.pitchAngle, -this.maxPitchAngle);
            }
            else if (this.pitchAngle < 0) {
                this.pitchAngle += this.pitchIncrement;
                this.pitchAngle = Math.min(this.pitchAngle, this.maxPitchAngle);
            }
        }
        this.model.rotation.x = THREE.MathUtils.degToRad(this.pitchAngle);
    }

    keydownHandler(event) {
        if (this.areShipControlsEnabled) {
            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    if (!this.isCursorLocked())
                        this.canvas.requestPointerLock();
                    this.isMovingBackwards = false;
                    this.isMovingForward = true;
                    break;

                case 's':
                case 'ArrowDown':
                    if (!this.isCursorLocked())
                        this.canvas.requestPointerLock();
                    this.isMovingForward = false;
                    this.isMovingBackwards = true;
                    break;

                case ' ':
                    if (!this.isSpacebarDown) {
                        if (this.canFire) {
                            this.isSpacebarDown = true;
                            this.isShooting = true;
                            this.canFire = false;
                            setTimeout(() => {
                                this.canFire = true;
                            }, (this.attackSpeed * 1000));
                        }
                    }
                    break;
            }
        }
    }

    keyupHandler(event) {
        if (this.areShipControlsEnabled) {
            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    this.isMovingForward = false;
                    break;

                case 's':
                case 'ArrowDown':
                    this.isMovingBackwards = false;
                    break;

                case ' ':
                    this.isShooting = false;
                    this.isSpacebarDown = false;
                    break;
            }
        }
    }

    positionSpaceship() {
        if (this.isMovingForward || this.isMovingBackwards) {
            if (this.currentSpeed > this.maxSpeed)
                this.currentSpeed = this.maxSpeed;
            else if (this.currentSpeed < this.minSpeed)
                this.currentSpeed = this.minSpeed;

            else if (this.isMovingForward) {
                if (this.currentSpeed < this.maxSpeed)
                    this.currentSpeed = this.currentSpeed + this.accelerationMagnitude;
            }
            else if (this.isMovingBackwards) {
                if (this.currentSpeed > this.minSpeed)
                    this.currentSpeed = this.currentSpeed - this.accelerationMagnitude;
            }
        }
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.quaternion).normalize();
        this.velocity.copy(forward);
        this.velocity.multiplyScalar(this.currentSpeed);
        this.position.add(this.velocity);
    }

    updateBoundingBox() {
        const boxSize = new THREE.Vector3(10, 4, 10);
        const boundingBoxPosition = this.position;
        this.boundingBox.setFromCenterAndSize(boundingBoxPosition, boxSize);
    }

    checkCollision(collider) {
        if (this.boundingBox.intersectsBox(collider.boundingBox)) {
            return true;
        }
        return false;
    }

    update() {
        if (this.isSpaceshipReady) {
            this.positionSpaceship();
            this.rotateSpaceship();
            this.updateBoundingBox();
        }
    }
}