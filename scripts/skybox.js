import * as THREE from '/node_modules/three/build/three.module.js';

export default class Skybox extends THREE.Object3D {
    constructor(model) {
        super();
        this.type = 'skybox';
        this.name = 'skybox';
        this.model = model;
        this.radius = 500;
        this.spotlights = new THREE.Group();
        this.isSkyboxReady = false;
        this.lights = [
            { color: 0xbff1f5, position: new THREE.Vector3(-250, 80, -500) },
            { color: 0xe39de2, position: new THREE.Vector3(450, 200, 300) },
            { color: 0xe8c17d, position: new THREE.Vector3(225, -225, -425) },
            { color: 0x95c4fc, position: new THREE.Vector3(0, -350, 500) },
            { color: 0xf05b5b, position: new THREE.Vector3(-400, -375, 0) },
        ];
    }

    setupSkybox() {
        // this skybox has radius of around 500 (50000 x 0.0099999 in children of model)
        this.add(this.model);
        this.model.position.set(0, 0, 0);
        this.createSpotlights(this.lights);
        this.isSkyboxReady = true;
    }

    createSpotlights(lights) {
        lights.forEach(light => {
            const spotlight = new THREE.SpotLight(light.color);
            spotlight.position.set(light.position.x, light.position.y, light.position.z);
            spotlight.intensity = 2500000
            spotlight.distance = 900;
            spotlight.target = this;
            spotlight.castShadow = true;
            spotlight.angle = Math.PI / 6;
            //spotlight.decay = 0;
            this.spotlights.add(spotlight);
            //const spotlightHelper = new THREE.SpotLightHelper(spotlight);
            //this.add(spotlightHelper);
        });
        this.add(this.spotlights);
    }
}