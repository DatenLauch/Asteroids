import * as THREE from '/node_modules/three/build/three.module.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

class Skybox extends THREE.Object3D {
    constructor(scene, skyBoxGLTFPath) {
        super();
        this.type = 'Skybox';
        this.scene = scene;
        this.skyBoxGLTFPath = skyBoxGLTFPath; //'/models/skybox/scene.gltf'
        this.skyBox;
        this.skyBoxLoaded = false;
        this.boundingSphere;
        this.loadSkybox();
    }

    loadSkybox() {
        const loader = new GLTFLoader();
        loader.load(this.skyBoxGLTFPath,
            (gltf) => {
                this.skybox = gltf.scene;
                console.log('Skybox loaded successfully.');
                this.scene.add(this.skybox);
                this.createBoundingSphere();
            },
            function (xhr) {
                const skyboxLoadingProgress = (xhr.loaded / xhr.total) * 100;
                console.log(`Loading Skybox: ${Math.round(skyboxLoadingProgress)}%`);
            },
            function (error) {
                console.error('An error happened while loading skybox.', error);
            }
        );
    }

    createBoundingSphere() {
        {
            this.skybox.traverse((child) => {
                if (child.isMesh) {
                    this.boundingSphere = child.geometry.computeBoundingSphere();
                }
            });
        }
    }

    update() {
        if (this.skyBoxLoaded);
    }

}
export default Skybox;