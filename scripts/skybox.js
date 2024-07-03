import * as THREE from '/node_modules/three/build/three.module.js';

export default class Skybox extends THREE.Object3D {
    constructor(model) {
        super();
        this.type = 'skybox';
        this.name = 'skybox';
        this.model = model;
        this.radius = 500;
        this.isSkyboxReady = false;
    }

    setupSkybox() {
        // this skybox has radius of around 500 (50000 x 0.0099999 in children of model)
        this.radius = 500;
        this.add(this.model);
        this.model.position.set(0, 0, 0);
        this.isSkyboxReady = true;
    }
}