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

        const legsRoot = new THREE.Group();
        legsRoot.name = 'character_legs_root';

        const rawMeshClone = modelScene.clone(true);
        const bootColor = options.bootColor !== undefined ? options.bootColor : 0x2c3e50;

        rawMeshClone.traverse((child) => {
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

        // 1. Postawienie modelu pionowo (-90 stopni na X usuwa leżenie plackiem z Unity)
        const rotX = options.rotX !== undefined ? options.rotX : -Math.PI / 2;
        const rotY = options.rotY !== undefined ? options.rotY : Math.PI;
        const rotZ = options.rotZ !== undefined ? options.rotZ : 0;
        
        rawMeshClone.rotation.set(rotX, rotY, rotZ);
        rawMeshClone.updateMatrixWorld(true);

        // 2. Dokładny pomiar stojącego pionowo modelu
        let box = new THREE.Box3().setFromObject(rawMeshClone);
        let size = box.getSize(new THREE.Vector3());

        // Docelowa wysokość nóg i skrzydeł (ok. 1.0 jednostki)
        const targetHeight = options.targetHeight || 1.0;
        const currentHeight = Math.max(size.y, 0.001);
        const autoScale = targetHeight / currentHeight;

        rawMeshClone.scale.setScalar(autoScale);
        rawMeshClone.updateMatrixWorld(true);

        // 3. Wycentrowanie stóp na ziemi (Y = -0.5) pod klockowym tułowiem
        box = new THREE.Box3().setFromObject(rawMeshClone);
        const center = box.getCenter(new THREE.Vector3());

        rawMeshClone.position.x = -center.x;
        rawMeshClone.position.z = -center.z;
        rawMeshClone.position.y = -box.min.y - 0.5;

        legsRoot.add(rawMeshClone);
        parentContainer.add(legsRoot);

        return legsRoot;
    }
}

export const LegsManager = new LegsManagerClass();