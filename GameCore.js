/* PLIK: GameCore.js */
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export class GameCore {
    constructor(containerId = 'gameContainer') {
        this.container = document.getElementById(containerId);
        
        // Pobieramy wymiary
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.clock = new THREE.Clock();

        // SCENA
        this.scene = new THREE.Scene();
        // Kolor tła (tymczasowy, zostanie zastąpiony przez panoramę)
        this.scene.background = new THREE.Color(0x87CEEB); 

        // KAMERA
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 1000);

        // --- RENDERER (MOCNA OPTYMALIZACJA) ---
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: false, // WYŁĄCZONE WYGŁADZANIE (Kluczowe dla FPS)
            powerPreference: "high-performance", // Prośba do przeglądarki o użycie GPU
            precision: "mediump", // Mniejsza precyzja obliczeń (szybsze na starych GPU)
            depth: true,
            stencil: false // Wyłączamy bufor szablonowy (oszczędność pamięci)
        });

        // OGRANICZENIE ROZDZIELCZOŚCI
        const pixelRatio = Math.min(window.devicePixelRatio, 1.5); 
        this.renderer.setPixelRatio(pixelRatio * 0.85); 
        
        this.renderer.setSize(this.width, this.height);
        
        // CIENIE (NAJSZYBSZY TYP)
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.BasicShadowMap; // Najprostsze cienie (Minecraft style)
        this.renderer.shadowMap.autoUpdate = true;

        // CSS2D RENDERER (Nicki nad głowami)
        this.css2dRenderer = new CSS2DRenderer();
        this.css2dRenderer.setSize(this.width, this.height);
        this.css2dRenderer.domElement.style.position = 'absolute';
        this.css2dRenderer.domElement.style.top = '0px';
        this.css2dRenderer.domElement.style.pointerEvents = 'none';

        // Dodanie do DOM
        if (this.container) {
            this.container.appendChild(this.renderer.domElement);
            this.container.appendChild(this.css2dRenderer.domElement);
        }

        // NOWE: Sky Manager dla głównej sceny
        this.skyMesh = null;
        this.currentSkyId = 200; // Domyślnie Clouds
        this.textureLoader = new THREE.TextureLoader();

        // Ustaw domyślną panoramę
        this.setSky(200);

        // Obsługa zmiany rozmiaru okna
        window.addEventListener('resize', () => this.onWindowResize());
    }

    // NOWA METODA: Ustawianie panoramy nieba dla głównej sceny
    setSky(skyId) {
        // Usuń starą panoramę
        if (this.skyMesh) {
            this.scene.remove(this.skyMesh);
            if (this.skyMesh.geometry) this.skyMesh.geometry.dispose();
            if (this.skyMesh.material) {
                if (Array.isArray(this.skyMesh.material)) {
                    this.skyMesh.material.forEach(m => m.dispose());
                } else {
                    this.skyMesh.material.dispose();
                }
            }
        }

        // Dla ID 200 (Clouds) - nasza domyślna panorama
        if (skyId === 200) {
            const geometry = new THREE.SphereGeometry(500, 60, 40);
            const texture = this.textureLoader.load('textures/sky/clouds.png');
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide
            });
            this.skyMesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.skyMesh);
            this.currentSkyId = 200;
            console.log("☁️ GameCore: Ustawiono panoramę Clouds");
        }
        // Tutaj można dodać kolejne panoramy w przyszłości
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
        this.css2dRenderer.setSize(this.width, this.height);
    }

    render(activeScene) {
        const sceneToRender = activeScene || this.scene;
        this.renderer.render(sceneToRender, this.camera);
        this.css2dRenderer.render(sceneToRender, this.camera);
    }
}