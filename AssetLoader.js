/* PLIK: AssetLoader.js */

import * as THREE from 'three';
import { LOADING_TEXTS } from './Config.js';

export class AssetLoader {
    constructor(blockManager, onLoadComplete) {
        this.blockManager = blockManager;
        this.onLoadComplete = onLoadComplete; // Callback wywoływany po załadowaniu wszystkiego

        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        
        // Elementy UI - ID
        this.ui = {
            screen: document.getElementById('loading-screen'),
            bar: document.getElementById('progress-bar-fill-bsp'),
            text: document.getElementById('loading-text-bsp')
        };

        this.textInterval = null;
        this.setupManager();
    }

    setupManager() {
        // Obsługa paska postępu
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100;
            if (this.ui.bar) {
                this.ui.bar.style.width = `${progress}%`;
            }
        };

        // Obsługa zakończenia ładowania
        this.loadingManager.onLoad = () => {
            clearInterval(this.textInterval);
            if (this.ui.text) {
                this.ui.text.textContent = "Gotowe!";
            }
            
            // Ukrywanie ekranu z opóźnieniem (1 sekunda po załadowaniu assetów)
            setTimeout(() => {
                if (this.ui.screen) {
                    this.ui.screen.style.opacity = '0';
                    setTimeout(() => {
                        this.ui.screen.style.display = 'none';
                        // Wywołaj funkcję startu gry z main.js
                        if (this.onLoadComplete) {
                            this.onLoadComplete();
                        }
                    }, 500); // Czas trwania animacji css (transition)
                }
            }, 1000); // 1 sekunda oczekiwania na 100% pasku
        };

        this.startLoadingTextAnimation();
    }

    startLoadingTextAnimation() {
        // Zmieniające się śmieszne teksty
        if (this.ui.text) {
            this.textInterval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * LOADING_TEXTS.length);
                this.ui.text.textContent = LOADING_TEXTS[randomIndex];
            }, 2000);
        }
    }

    // Główna metoda wywoływana z main.js
    preload() {
        const allBlocks = this.blockManager.getAllBlockDefinitions();
        allBlocks.forEach(block => {
            if (block.texturePath) {
                this.textureLoader.load(block.texturePath);
            }
        });
    }
    
    getTextureLoader() {
        return this.textureLoader;
    }
    
    getLoadingManager() {
        return this.loadingManager;
    }
}