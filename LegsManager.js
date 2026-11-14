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
                if (c.isMesh && c.material) {
                    if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
                    else c.material.dispose();
                }
            });
        }

        const bootColor = options.bootColor !== undefined ? options.bootColor : 0x2c3e50;
        const isBuilder = options.isBuilder === true;
        const legsRoot = this.createStaticLegsGroup(modelScene, bootColor);

        // 1. Sprawdzenie orientacji: jeśli model leży plackiem (Z > Y), prostujemy go do pionu
        let box = new THREE.Box3().setFromObject(legsRoot);
        let size = box.getSize(new THREE.Vector3());

        if (size.z > size.y * 1.3) {
            legsRoot.rotation.x = -Math.PI / 2;
            legsRoot.updateMatrixWorld(true);
            box = new THREE.Box3().setFromObject(legsRoot);
            size = box.getSize(new THREE.Vector3());
        }

        // 2. Wykrywanie przodu i tyłu: buty mają być z przodu (-Z), skrzydła z tyłu (+Z)
        let bootsZ = 0;
        let wingsZ = 0;
        let foundBoots = false;
        let foundWings = false;

        legsRoot.traverse((child) => {
            if (child.isMesh) {
                const cBox = new THREE.Box3().setFromObject(child);
                const cCenter = cBox.getCenter(new THREE.Vector3());
                const matName = (child.material.name || '').toLowerCase();
                if (matName.includes('color_') || matName.includes('boot')) {
                    bootsZ = cCenter.z;
                    foundBoots = true;
                } else {
                    wingsZ = cCenter.z;
                    foundWings = true;
                }
            }
        });

        if (foundBoots && foundWings && wingsZ < bootsZ) {
            legsRoot.rotation.y += Math.PI;
            legsRoot.updateMatrixWorld(true);
        }

        // 3. Skalowanie: skrzydła w pełnej skali (1.55m w grze, 8x w kreatorze)
        box = new THREE.Box3().setFromObject(legsRoot);
        size = box.getSize(new THREE.Vector3());

        const targetHeight = isBuilder ? (1.55 * 8) : 1.55;
        const currentHeight = Math.max(size.y, 0.001);
        const scaleFactor = targetHeight / currentHeight;

        legsRoot.scale.setScalar(scaleFactor);
        legsRoot.updateMatrixWorld(true);

        // 4. Pozycjonowanie
        box = new THREE.Box3().setFromObject(legsRoot);
        const center = box.getCenter(new THREE.Vector3());

        if (isBuilder) {
            // W KREATORZE: Buty opierają się na Y = -4.8 (pod platformą),
            // a skrzydła wznoszą się z tyłu (Z = -2.5) za siatką budowania
            legsRoot.position.x = -center.x;
            legsRoot.position.z = -center.z - 2.5;
            legsRoot.position.y = -box.min.y - 4.8;
        } else {
            // W GRZE: Buty stoją na ziemi (Y = -0.375),
            // a skrzydła wznoszą się z tyłu za plecami postaci
            legsRoot.position.x = -center.x;
            legsRoot.position.z = -center.z - 0.15;
            legsRoot.position.y = -box.min.y - 0.375;
        }

        parentContainer.add(legsRoot);
        return legsRoot;
    }
}

export const LegsManager = new LegsManagerClass();