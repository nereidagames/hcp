import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class LegsManagerClass {
    constructor() {
        this.loader = new GLTFLoader();
        this.modelCache = new Map();
        this.defaultModelPath = 'models/legs/Legs_bee_wings.glb';
    }

    async preloadDefaultModel() {
        return this.getModel(this.defaultModelPath);
    }

    async getModel(path) {
        if (this.modelCache.has(path)) {
            return this.modelCache.get(path);
        }

        return new Promise((resolve, reject) => {
            this.loader.load(
                path,
                (gltf) => {
                    this.modelCache.set(path, gltf.scene);
                    resolve(gltf.scene);
                },
                undefined,
                (error) => {
                    console.error(`Błąd wczytywania modelu nóg (${path}):`, error);
                    reject(error);
                }
            );
        });
    }

    attachLegs(parentContainer, modelScene, options = {}) {
        const oldLegs = parentContainer.getObjectByName('character_legs_root');
        if (oldLegs) {
            parentContainer.remove(oldLegs);
            oldLegs.traverse((c) => {
                if (c.isMesh && c.material) {
                    if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
                    else c.material.dispose();
                }
            });
        }

        const legsClone = modelScene.clone(true);
        legsClone.name = 'character_legs_root';

        const bootColor = options.bootColor !== undefined ? options.bootColor : 0x2c3e50;
        const scale = options.scale !== undefined ? options.scale : 1.0;
        const posY = options.posY !== undefined ? options.posY : -0.5;

        legsClone.scale.setScalar(scale);
        legsClone.position.set(0, posY, 0);

        legsClone.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.castShadow = false;
                child.receiveShadow = false;

                const matName = (child.material.name || '').toLowerCase();

                if (matName.includes('color_') || matName.includes('tint')) {
                    child.material.color.set(bootColor);
                }
            }
        });

        parentContainer.add(legsClone);
        return legsClone;
    }
}

export const LegsManager = new LegsManagerClass();