/* PLIK: ModalPreview.js */

import * as THREE from 'three';
import { createBaseCharacter } from './character.js';

class ModalPreviewRenderer {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.character = null;
        this.skinGroup = null;
        this.textureLoader = new THREE.TextureLoader();
        
        this.animId = null;
        this.isAnimating = false;
        this.currentContainer = null;
        
        this.isDragging = false;
        this.previousX = 0;
        this.sharedBoxGeo = new THREE.BoxGeometry(1, 1, 1);

        this.init();
    }

    init() {
        if (typeof window === 'undefined') return;

        // Pojedynczy, zoptymalizowany renderer dla okien modalnych
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: 'low-power'
        });
        this.renderer.setSize(300, 300);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.camera.position.set(0, 1, 6);
        this.camera.lookAt(0, 0.5, 0);

        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 0.6);
        directional.position.set(2, 5, 3);
        this.scene.add(directional);

        this.character = new THREE.Group();
        createBaseCharacter(this.character);
        this.scene.add(this.character);

        this.skinGroup = new THREE.Group();
        this.skinGroup.scale.setScalar(0.125);
        this.skinGroup.position.y = 0.5;
        this.character.add(this.skinGroup);

        this.setupDragEvents();
    }

    setupDragEvents() {
        const onDown = (clientX) => {
            this.isDragging = true;
            this.previousX = clientX;
        };
        const onMove = (clientX) => {
            if (!this.isDragging || !this.character) return;
            const delta = clientX - this.previousX;
            this.character.rotation.y += delta * 0.015;
            this.previousX = clientX;
        };
        const onUp = () => {
            this.isDragging = false;
        };

        const dom = this.renderer.domElement;
        dom.addEventListener('mousedown', (e) => onDown(e.clientX));
        window.addEventListener('mousemove', (e) => onMove(e.clientX));
        window.addEventListener('mouseup', onUp);

        dom.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) onDown(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) onMove(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchend', onUp);
    }

    attachTo(containerId, characterYOffset = 0, scale = 1) {
        const container = document.getElementById(containerId);
        if (!container || !this.renderer) return;

        container.innerHTML = '';
        this.currentContainer = container;

        const width = container.clientWidth || 300;
        const height = container.clientHeight || 300;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        container.appendChild(this.renderer.domElement);

        this.character.position.y = characterYOffset;
        this.character.scale.setScalar(scale);
        this.character.rotation.y = 0;

        this.clearSkin();
        this.start();
    }

    applySkin(blocksData) {
        this.clearSkin();
        if (!blocksData || !Array.isArray(blocksData)) return;

        blocksData.forEach(b => {
            if (!b.texturePath) return;
            const tex = this.textureLoader.load(b.texturePath);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            const mat = new THREE.MeshBasicMaterial({ map: tex });
            const mesh = new THREE.Mesh(this.sharedBoxGeo, mat);
            mesh.position.set(b.x, b.y, b.z);
            this.skinGroup.add(mesh);
        });

        this.renderOnce();
    }

    clearSkin() {
        while (this.skinGroup.children.length > 0) {
            const child = this.skinGroup.children[0];
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
            this.skinGroup.remove(child);
        }
    }

    renderOnce() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    start() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const loop = () => {
            if (!this.isAnimating) return;
            this.animId = requestAnimationFrame(loop);

            if (this.currentContainer && this.currentContainer.offsetParent !== null) {
                if (!this.isDragging) {
                    this.character.rotation.y += 0.008;
                }
                this.renderer.render(this.scene, this.camera);
            }
        };
        this.animId = requestAnimationFrame(loop);
    }

    stop() {
        this.isAnimating = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        this.clearSkin();
        if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        this.currentContainer = null;
    }
}

export const modalPreview = new ModalPreviewRenderer();