import * as THREE from 'three';

export class AudioManager {
    constructor(camera) {
        this.camera = camera;
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);

        this.backgroundMusic = new THREE.Audio(this.listener);
        this.audioLoader = new THREE.AudioLoader();

        this.isMusicPlaying = false;
        this.currentTrack = null;

        // Muzyka logowania (niezależna od Web Audio)
        this.loginMusic = null;
        this.initLoginMusic();
    }

    initLoginMusic() {
        this.loginMusic = new Audio('sounds/loginscreen.mp3'); // POPRAWIONE: usunięto 'assets/'
        this.loginMusic.loop = true;
        this.loginMusic.volume = 0.5;
    }

    // --- LOGIKA EKRANU LOGOWANIA ---
    playLoginMusic() {
        if (!this.loginMusic) return;

        this.loginMusic.play().catch(e => {
            console.warn("Autoplay zablokowany. Muzyka ruszy po pierwszym kliknięciu.");
            const clickHandler = () => {
                this.loginMusic.play();
                document.removeEventListener('click', clickHandler);
            };
            document.addEventListener('click', clickHandler, { once: true });
        });
    }

    stopLoginMusic() {
        if (this.loginMusic) {
            const fadeOut = setInterval(() => {
                if (this.loginMusic.volume > 0.05) {
                    this.loginMusic.volume -= 0.05;
                } else {
                    this.loginMusic.pause();
                    this.loginMusic.currentTime = 0;
                    this.loginMusic.volume = 0.5;
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
        this.audioLoader.load('sounds/nexus.mp3', (buffer) => { // POPRAWIONE: z 'music/' na 'sounds/'
            if (this.currentTrack !== 'nexus') return;

            this.backgroundMusic.setBuffer(buffer);
            this.backgroundMusic.setLoop(true);
            this.backgroundMusic.setVolume(0.6);
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
        console.log("Audio: Stopped");
    }

    resumeContext() {
        if (this.listener.context.state === 'suspended') {
            this.listener.context.resume();
        }
    }
}