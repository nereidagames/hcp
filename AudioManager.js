/* PLIK: AudioManager.js */

import * as THREE from 'three';
import { STORAGE_KEYS } from './Config.js';

export class AudioManager {
    constructor(camera) {
        this.camera = camera;
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.backgroundMusic = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();

        this.isMusicPlaying = false;
        this.currentTrack = null;

        // Wczytanie głośności z cache (domyślnie 70%)
        const savedVolume = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
        this.volumePercent = savedVolume !== null ? parseInt(savedVolume, 10) : 70;

        // Muzyka logowania (HTML5 Audio)
        this.loginMusic = null;
        this.initLoginMusic();
    }

    initLoginMusic() {
        this.loginMusic = new Audio('sounds/loginscreen.mp3');
        this.loginMusic.loop = true;
        this.updateLoginMusicVolume();
    }

    updateLoginMusicVolume() {
        if (this.loginMusic) {
            this.loginMusic.volume = Math.max(0, Math.min(1, 0.5 * (this.volumePercent / 100)));
        }
    }

    setVolume(percent) {
        this.volumePercent = Math.max(0, Math.min(100, parseInt(percent, 10) || 0));
        localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, this.volumePercent.toString());

        const fraction = this.volumePercent / 100;

        // Natychmiastowa zmiana głośności odtwarzanej muzyki
        if (this.loginMusic) {
            this.loginMusic.volume = 0.5 * fraction;
        }

        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(0.6 * fraction);
        }
    }

    getVolume() {
        return this.volumePercent;
    }

    // --- LOGIKA EKRANU LOGOWANIA ---
    playLoginMusic() {
        if (!this.loginMusic) return;
        this.updateLoginMusicVolume();

        this.loginMusic.play().catch(() => {
            console.warn("Autoplay zablokowany. Muzyka ruszy po pierwszym kliknięciu.");
            const clickHandler = () => {
                if (this.loginMusic) this.loginMusic.play();
                document.removeEventListener('click', clickHandler);
            };
            document.addEventListener('click', clickHandler, { once: true });
        });
    }

    stopLoginMusic() {
        if (this.loginMusic) {
            const baseTarget = 0.5 * (this.volumePercent / 100);
            const fadeOut = setInterval(() => {
                if (this.loginMusic.volume > 0.05) {
                    this.loginMusic.volume -= 0.05;
                } else {
                    this.loginMusic.pause();
                    this.loginMusic.currentTime = 0;
                    this.loginMusic.volume = baseTarget;
                    clearInterval(fadeOut);
                }
            }, 50);
        }
    }

    // --- LOGIKA MUZYKI W TLE (NEXUS) ---
    playNexusMusic() {
        if (this.isMusicPlaying && this.currentTrack === 'nexus') return;

        if (this.isMusicPlaying) {
            this.stopMusic();
        }

        console.log("Audio: Start Nexus OST");
        this.audioLoader.load('sounds/nexus.mp3', (buffer) => {
            if (this.currentTrack !== 'nexus') return;

            this.backgroundMusic.setBuffer(buffer);
            this.backgroundMusic.setLoop(true);
            this.backgroundMusic.setVolume(0.6 * (this.volumePercent / 100));
            this.backgroundMusic.play();
            this.isMusicPlaying = true;
        }, undefined, (err) => {
            console.error("Audio Error:", err);
        });

        this.currentTrack = 'nexus';
    }

    stopMusic() {
        if (this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
        }
        this.isMusicPlaying = false;
        this.currentTrack = null;
    }

    resumeContext() {
        if (this.listener.context.state === 'suspended') {
            this.listener.context.resume();
        }
    }
}