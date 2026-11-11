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

    createStaticLegsGroup(sourceScene, bootColor) {
        const root = new THREE.Group();
        root.name = 'character_legs_root';

        sourceScene.updateMatrixWorld(true);

        sourceScene.traverse((child) => {
            if (child.isMesh) {
                const geo = child.geometry.clone();
                const mat = child.material.clone();
                mat.castShadow = false;
                mat.receiveShadow = false;

                const matName = (mat.name || '').toLowerCase();
                if (matName.includes('color_') || matName.includes('tint') || matName.includes('boot')) {
                    mat.color.set(bootColor);
                }

                const staticMesh = new THREE.Mesh(geo, mat);
                
                child.updateWorldMatrix(true, false);
                staticMesh.applyMatrix4(child.matrixWorld);

                root.add(staticMesh);
            }
        });

        return root;
    }

    attachLegs(parentContainer, modelScene, options = {}) {
        const oldLegs = parentContainer.getObjectByName('character_legs_root');
        if (oldLegs) {
            parentContainer.remove(oldLegs);
            oldLegs.traverse((c) => {
                if (c.isMesh) {
                    if (c.geometry) c.geometry.dispose();
                    if (c.material) {
                        if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
                        else c.material.dispose();
                    }
                }
            });
        }

        const bootColor = options.bootColor !== undefined ? options.bootColor : 0x2c3e50;
        const legsRoot = this.createStaticLegsGroup(modelScene, bootColor);

        // 1. Sprawdzenie czy model leży plackiem (jeśli głębokość Z jest większa niż wysokość Y)
        let box = new THREE.Box3().setFromObject(legsRoot);
        let size = box.getSize(new THREE.Vector3());

        if (size.z > size.y * 1.2) {
            legsRoot.rotation.x = -Math.PI / 2;
            legsRoot.rotation.y = Math.PI;
            legsRoot.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(legsRoot);
            size = box.getSize(new THREE.Vector3());
        }

        // 2. Skalowanie do wzrostu nóg postaci (ok. 0.85 jednostki)
        const targetHeight = options.targetHeight || 0.85;
        const currentHeight = Math.max(size.y, 0.001);
        const scaleFactor = targetHeight / currentHeight;

        legsRoot.scale.setScalar(scaleFactor);
        legsRoot.updateMatrixWorld(true);

        // 3. Wyśrodkowanie pod postacią i oparcie butów o podłoże (Y = -0.5)
        box = new THREE.Box3().setFromObject(legsRoot);
        const center = box.getCenter(new THREE.Vector3());

        legsRoot.position.x = -center.x;
        legsRoot.position.z = -center.z;
        legsRoot.position.y = -box.min.y - 0.5;

        parentContainer.add(legsRoot);
        return legsRoot;
    }
}

export const LegsManager = new LegsManagerClass();