import * as THREE from '/node_modules/three/build/three.module.js';
import GLTFLoaderComponent from '/scripts/components/GLTFLoaderComponent.js';

export default class Skybox extends THREE.Object3D {
    constructor(GLTFPath) {
        super();
        this.type = 'Skybox';
        this.GLTFPath = GLTFPath; //'/models/skybox/scene.gltf'
        this.GLTFLoader = new GLTFLoaderComponent(this.GLTFPath);
        this.model;
        this.mesh;
        this.isSkyboxLoaded;
        this.boundingSphere;
        this.radius;
    }

    async useGLTFLoader() {
        if (!this.model)
            try {
                this.model = await this.GLTFLoader.startLoaderAsynchronously();
                this.mesh = this.GLTFLoader.findMesh();
            }
            catch (error) {
                console.error('GLTFLoaderComponent encountered an error in Skybox: ', error);
            }
    }

    async initialSetup() {
        try {
            await this.useGLTFLoader();
            this.add(this.model);
            this.model.position.set(0, 0, 0);
            // this skybox one has radius of around 500 (50000 x 0.0099999 in children)
            this.radius = 500;
            this.isSkyboxLoaded = true;
        }
        catch (error) {
            console.error('Error while setting up Skybox: ', error);
        }
    }

    update() {
        if (this.isSkyboxLoaded) {
        }
    }
}