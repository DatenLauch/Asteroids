import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

export default class GLTFLoaderComponent {
    constructor(path) {
        this.path = path;
        this.model;
        this.mesh;
        this.GLTFLoader = new GLTFLoader();
    }

    async startLoaderAsynchronously() {
        if (this.model) {
            return this.model;
        }
        try {
            this.model = await this.loadGLTFModel();
            return this.model;
        } catch (error) {
            console.error('Error loading the model asynchronously with path: ' + this.path + ': ', error);
            throw error;
        }
    }

    loadGLTFModel() {
        return new Promise((resolve, reject) => {
            this.GLTFLoader.load(this.path,
                (gltf) => {
                    this.model = gltf.scene || gltf.scenes[0];
                    resolve(this.model);
                },
                (xhr) => {
                    const loadingProgress = (xhr.loaded / xhr.total) * 100;
                    console.log(`Loading from path ${this.path}: ${Math.round(loadingProgress)}% `);
                },
                (error) => {
                    console.error('Error loading model from GLTF file:', error);
                    reject(error);
                }
            );
        });
    }

    findMesh() {
        this.model.traverse((child) => {
            if (child.isMesh && !this.mesh) {
                this.mesh = child;
                return this.mesh;
            }
        });
    }
}