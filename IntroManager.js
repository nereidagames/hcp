/* PLIK: IntroManager.js */

import * as THREE from 'three';
import { STARTER_SKINS } from './StarterSkins.js';
import { createBaseCharacter } from './character.js';
import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

// Szablon HTML dla ekranu logowania
const AUTH_HTML = `
<style>
    /* --- BSP LOGIN STYLE --- */
    #auth-screen {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: transparent;
        z-index: 99998;
        display: none; /* ZMIANA: Domyślnie ukryte, włączane dopiero w metodzie start() */
        flex-direction: column; justify-content: space-between;
        font-family: 'Titan One', cursive;
        pointer-events: none;
    }

    .bsp-interactive { pointer-events: auto !important; }

    #bsp-welcome-screen {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; justify-content: space-between;
        padding: 10px;
        pointer-events: none;
    }

    .bsp-top-header {
        text-align: center; margin-top: 10px;
        text-shadow: 2px 2px 0 #000; color: white; font-size: 24px;
        pointer-events: auto;
    }

    .bsp-right-buttons {
        position: absolute; right: 20px; top: 50%; transform: translateY(-60%);
        display: flex; flex-direction: column; gap: 15px;
        align-items: flex-end;
        z-index: 100;
        pointer-events: none; 
    }

    .bsp-big-btn {
        width: 180px;
        height: 90px;
        border: 3px solid white; 
        border-radius: 15px;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        cursor: pointer; transition: transform 0.1s;
        box-shadow: 0 6px 10px rgba(0,0,0,0.5);
        color: white; text-shadow: 2px 2px 0 #000;
        font-size: 18px;
        text-align: center; line-height: 1.1;
        pointer-events: auto;
    }
    .bsp-big-btn:active { transform: scale(0.95); }

    .btn-new-user { background: linear-gradient(to bottom, #8ede13 0%, #5ba806 100%); }
    .btn-login-big { background: linear-gradient(to bottom, #4facfe 0%, #0072ff 100%); }

    .bsp-bottom-bar {
        display: flex; justify-content: space-between; align-items: flex-end;
        width: 100%; padding-bottom: 10px;
        pointer-events: none;
    }

    .bsp-left-icon {
        width: 80px;
        height: 80px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .bsp-left-icon:active {
        transform: scale(0.95);
    }
    .bsp-left-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .bsp-tip-box {
        background-color: #3498db;
        border: 2px solid white; border-radius: 10px;
        padding: 5px 10px; color: white; font-size: 11px;
        max-width: 250px; position: relative;
        box-shadow: 0 3px 5px rgba(0,0,0,0.3);
        pointer-events: auto;
        margin-right: 10px;
    }
    .bsp-tip-box::after {
        content: ''; position: absolute; bottom: -10px; right: 20px;
        border-width: 10px 10px 0; border-style: solid;
        border-color: white transparent transparent transparent;
    }

    .btn-privacy {
        background: linear-gradient(to bottom, #f39c12, #d35400);
        border: 2px solid white; border-radius: 8px;
        padding: 8px 15px; color: white; font-size: 12px;
        cursor: pointer; box-shadow: 0 3px 0 #a04000;
        pointer-events: auto;
    }

    #bsp-login-modal {
        position: absolute; right: 50px; top: 50%; transform: translateY(-50%);
        width: 320px;
        background: #3498db;
        border: 4px solid white; border-radius: 20px;
        padding: 20px; display: none;
        flex-direction: column; gap: 10px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        pointer-events: auto;
        z-index: 101;
    }
    
    .bsp-modal-title { font-size: 24px; color: white; text-align: center; text-shadow: 2px 2px 0 #000; margin-bottom: 5px; }
    
    .bsp-input {
        width: 100%; height: 45px;
        border-radius: 10px; border: none;
        padding: 0 15px; font-family: 'Titan One', cursive; font-size: 16px;
        box-shadow: inset 0 3px 5px rgba(0,0,0,0.2);
    }
    
    .bsp-checkbox-row { display: flex; align-items: center; gap: 10px; color: white; text-shadow: 1px 1px 0 #000; font-size: 14px; }
    .bsp-checkbox { width: 20px; height: 20px; cursor: pointer; }

    .bsp-btn-row { display: flex; gap: 10px; margin-top: 10px; }
    .bsp-btn-small {
        flex: 1; height: 45px;
        border: 3px solid white; border-radius: 10px;
        font-size: 18px; color: white; cursor: pointer;
        display: flex; justify-content: center; align-items: center;
        box-shadow: 0 4px 0 rgba(0,0,0,0.3);
    }
    .btn-red { background: #e74c3c; box-shadow: 0 4px 0 #c0392b; }
    .btn-green { background: #2ecc71; box-shadow: 0 4px 0 #27ae60; }
    .btn-red:active, .btn-green:active { transform: translateY(3px); box-shadow: none; }

    .server-pl-icon {
        width: 35px;
        height: 22px;
        background-image: url('icons/ServerPL.png');
        background-size: cover;
        background-position: center;
        border-radius: 3px;
        border: 1px solid rgba(255,255,255,0.5);
    }

    #bsp-register-screen {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: none;
        pointer-events: none;
    }

    .bsp-register-panel {
        position: absolute; right: 20px; top: 50%; transform: translateY(-50%);
        width: 300px;
        background: #8ede13;
        border: 4px solid white;
        border-radius: 20px;
        padding: 15px; display: flex; flex-direction: column; gap: 8px;
        pointer-events: auto;
        z-index: 101;
    }

    .bsp-register-header { text-align: center; margin-bottom: 5px; }
    .bsp-register-header img { width: 120px; }

    .bsp-skin-selector {
        position: absolute; left: 40px; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 15px;
        pointer-events: auto;
    }

    .selector-row { display: flex; align-items: center; gap: 10px; }
    .selector-icon {
        width: 60px; height: 60px;
        background: #34495e; border: 3px solid white; border-radius: 10px;
        display: flex; justify-content: center; align-items: center;
    }
    .selector-icon img { width: 80%; }
    
    .selector-arrow {
        width: 45px; height: 45px;
        background: linear-gradient(to bottom, #fff, #eee);
        border: 3px solid #3498db; border-radius: 10px;
        display: flex; justify-content: center; align-items: center;
        font-size: 28px; color: #3498db; cursor: pointer;
        box-shadow: 0 4px 0 #2980b9;
    }
    .selector-arrow:active { transform: translateY(3px); box-shadow: none; }
    
    @media (max-width: 600px) {
        .bsp-big-btn { width: 150px; height: 80px; font-size: 16px; box-shadow: 0 5px 10px rgba(0,0,0,0.5); }
        .bsp-right-buttons { right: 10px; transform: translateY(-55%); }
        #bsp-login-modal, .bsp-register-panel { width: 90%; right: 5%; }
        .bsp-skin-selector { left: 10px; transform: scale(0.8) translateY(-50%); }
        .bsp-left-icon { width: 50px; height: 50px; }
        .bsp-tip-box { max-width: 180px; font-size: 9px; }
    }
</style>

<div id="auth-screen">
    <div id="bsp-welcome-screen">
        <div class="bsp-top-header bsp-interactive">Witaj na <span style="color:#f1c40f; text-shadow: 2px 2px 0 #000;">HyperCubesPlanet</span></div>
        <div class="bsp-right-buttons">
            <div id="btn-show-register" class="bsp-big-btn btn-new-user">Nowy<br>Użytkownik</div>
            <div id="btn-show-login" class="bsp-big-btn btn-login-big">Zaloguj</div>
        </div>
        <div class="bsp-bottom-bar">
            <div class="bsp-left-icon">
                <img src="icons/DexMcFly.png" alt="DexMcFly" onerror="this.style.display='none'">
            </div>
            <div class="bsp-tip-box text-outline">WSKAZÓWKA: Możesz się zalogować jako użytkownik: BlockStarPlanet, MovieStarPlanet.</div>
            <div class="btn-privacy text-outline">Polityka Prywatności</div>
        </div>
    </div>
    <div id="bsp-login-modal">
        <div class="bsp-modal-title">Zaloguj tutaj</div>
        <form id="login-form" style="display:flex; flex-direction:column; gap:10px;">
            <input id="login-username" class="bsp-input" type="text" placeholder="Nazwa użytkownika" required>
            <input id="login-password" class="bsp-input" type="password" placeholder="Wprowadź hasło" required>
            <div class="bsp-checkbox-row">
                <input type="checkbox" class="bsp-checkbox" id="login-remember">
                <label for="login-remember">Zapisz moje hasło</label>
            </div>
            <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin: 5px 0;">
                <div class="server-pl-icon"></div>
                <span style="font-size:12px; color:white; text-shadow:1px 1px 0 #000;">Polska</span>
            </div>
            <div class="bsp-btn-row">
                <div id="btn-login-cancel" class="bsp-btn-small btn-red">Anuluj</div>
                <button type="submit" class="bsp-btn-small btn-green">Ok</button>
            </div>
            <div style="text-align:center; font-size:12px; color:white; margin-top:5px; cursor:pointer; text-decoration:underline;">Nie pamiętasz hasła?</div>
        </form>
        <div id="auth-message" style="color:yellow; text-align:center; text-shadow:1px 1px 0 #000; font-size:12px; margin-top:5px;"></div>
    </div>
    <div id="bsp-register-screen">
        <div class="bsp-skin-selector">
            <div class="selector-row">
                <div id="skin-prev" class="selector-arrow bsp-interactive">⬅</div>
                <div class="selector-icon"><img src="icons/icon-newhypercube.png" onerror="this.src='icons/icon-build.png'"></div>
                <div id="skin-next" class="selector-arrow bsp-interactive">➡</div>
            </div>
            <div class="selector-row" style="opacity:0.5; filter:grayscale(1);">
                <div class="selector-arrow">⬅</div>
                <div class="selector-icon"><img src="icons/icon-jump.png"></div>
                <div class="selector-arrow">➡</div>
            </div>
        </div>
        <div class="bsp-register-panel">
            <div class="bsp-register-header"><div class="text-outline" style="font-size:22px; color:white;">Nowy</div><img src="icons/favicon.png" style="height:35px; object-fit:contain;"></div>
            <form id="register-form" style="display:flex; flex-direction:column; gap:8px;">
                <input id="register-username" class="bsp-input" type="text" placeholder="Wprowadź nick" required minlength="3" maxlength="15">
                <input id="register-password" class="bsp-input" type="password" placeholder="Wprowadź hasło" required minlength="6">
                <input id="register-password-confirm" class="bsp-input" type="password" placeholder="Powtórz hasło" required>
                <div class="bsp-checkbox-row"><input type="checkbox" class="bsp-checkbox" id="reg-hide-pass"><label for="reg-hide-pass">Ukryć hasło?</label></div>
                <div style="display:flex; justify-content:center; align-items:center; gap:8px;">
                    <div class="server-pl-icon"></div>
                    <span style="font-size:12px; color:white; text-shadow:1px 1px 0 #000;">Polska</span>
                </div>
                <div class="bsp-btn-row"><div id="btn-register-cancel" class="bsp-btn-small btn-red">Anuluj</div><button type="submit" class="bsp-btn-small btn-green">Ok</button></div>
            </form>
            <div style="background:#3498db; color:white; font-size:10px; text-align:center; padding:4px; border-radius:5px; margin-top:2px; border:2px solid white;">Warunki Korzystania</div>
             <div class="btn-privacy text-outline" style="font-size:10px; padding:4px; text-align:center;">Polityka Prywatności</div>
        </div>
    </div>
</div>
`;

export class IntroManager {
    constructor(gameCore, uiManager, onLoginSuccess, audioManager) {
        this.core = gameCore;
        this.ui = uiManager;
        this.onLoginSuccess = onLoginSuccess; 
        this.audioManager = audioManager;

        this.scene = gameCore.scene;
        this.camera = gameCore.camera;
        this.renderer = gameCore.renderer;

        this.currentSkinIndex = 0;
        this.previewCharacter = null;
        this.introAnimId = null;
        this.isIntroActive = false;

        this.screens = {};

        this.mapGroup = new THREE.Group();
        
        this.textureLoader = new THREE.TextureLoader();
        this.materials = {};
        this.sharedGeometry = new THREE.BoxGeometry(1, 1, 1);

        this.defaultCamPos = new THREE.Vector3(0, 5.0, 10.0); 
        this.defaultLookAt = new THREE.Vector3(0, 2.0, 0); 
        this.zoomedCamPos = new THREE.Vector3(0, 2.0, 3.5);
        this.zoomedLookAt = new THREE.Vector3(0, 1.5, 0); 
        this.targetCamPos = this.defaultCamPos.clone();
        this.currentLookAt = this.defaultLookAt.clone();
        this.targetLookAt = this.defaultLookAt.clone();
        
        this.skyMesh = null;
        
        // Wstrzykujemy HTML tylko RAZ
        this.injectAuthHTML();
    }
    
    injectAuthHTML() {
        const authLayer = document.getElementById('auth-layer');
        if (authLayer && authLayer.innerHTML.trim() === '') {
            authLayer.innerHTML = AUTH_HTML;
        } else if (!authLayer) {
            const newAuthLayer = document.createElement('div');
            newAuthLayer.id = 'auth-layer';
            newAuthLayer.style.display = 'block';
            newAuthLayer.style.position = 'relative';
            newAuthLayer.style.zIndex = '99998';
            document.body.appendChild(newAuthLayer);
            newAuthLayer.innerHTML = AUTH_HTML;
        }
    }

    refreshElements() {
        this.screens = {
            main: document.getElementById('auth-screen'),
            welcome: document.getElementById('bsp-welcome-screen'),
            login: document.getElementById('bsp-login-modal'),
            register: document.getElementById('bsp-register-screen')
        };
    }

    start() {
        this.isIntroActive = true;
        
        // ZMIANA: Pokazujemy główny kontener ekranu logowania dopiero w tym momencie
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) authScreen.style.display = 'flex';

        this.refreshElements();
        this.setupScene();
        this.setupEvents();
        this.showScreen('welcome');
        this.updateSkinPreview();

        this.setupSky();

        if (this.audioManager) {
            this.audioManager.playLoginMusic();
        }

        this.animate();
    }

    setupSky() {
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

        const geometry = new THREE.SphereGeometry(500, 60, 40);
        const texture = this.textureLoader.load('textures/sky/clouds.png');
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        this.skyMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.skyMesh);
        console.log("☁️ Intro: Ustawiono panoramę Clouds");
    }

    setupScene() {
        // NIE czyścimy całej sceny! Tylko dodajemy elementy
        
        this.camera.position.copy(this.defaultCamPos);
        this.camera.lookAt(this.defaultLookAt);
        this.targetCamPos.copy(this.defaultCamPos);
        this.currentLookAt.copy(this.defaultLookAt);
        this.targetLookAt.copy(this.defaultLookAt);

        // Dodajemy tylko to co potrzebujemy, nie usuwamy istniejących elementów UI
        // Usuwamy tylko poprzednie elementy 3D (mapGroup, previewCharacter, skyMesh)
        if (this.mapGroup.parent) this.scene.remove(this.mapGroup);
        if (this.previewCharacter) this.scene.remove(this.previewCharacter);
        if (this.skyMesh) this.scene.remove(this.skyMesh);

        // Dodajemy grupę mapy
        this.scene.add(this.mapGroup);

        // Światła - dodajemy tylko jeśli nie istnieją
        let amb = this.scene.children.find(c => c instanceof THREE.AmbientLight);
        if (!amb) {
            amb = new THREE.AmbientLight(0xffffff, 0.7);
            this.scene.add(amb);
        }
        
        let dir = this.scene.children.find(c => c instanceof THREE.DirectionalLight);
        if (!dir) {
            dir = new THREE.DirectionalLight(0xffffff, 0.8);
            dir.position.set(10, 20, 10);
            dir.castShadow = true;
            dir.shadow.mapSize.width = 512;
            dir.shadow.mapSize.height = 512;
            this.scene.add(dir);
        }

        // Postać
        this.previewCharacter = new THREE.Group();
        this.scene.add(this.previewCharacter);
        createBaseCharacter(this.previewCharacter);
        this.previewCharacter.position.y = 1; 

        // Ładuj mapę i skiny
        this.loadLoginMap();
        this.fetchStarterSkins();
    }

    async fetchStarterSkins() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/starter-skins`);
            if(res.ok) {
                const data = await res.json();
                if(Array.isArray(data) && data.length > 0) {
                    this.serverStarterSkins = data.map(s => ({
                        name: s.name,
                        blocks: s.blocks_data 
                    }));
                }
            }
        } catch(e) {}
    }

    async loadLoginMap() {
        // Czyścimy tylko mapGroup, nie całą scenę
        while(this.mapGroup.children.length > 0) {
            const child = this.mapGroup.children[0];
            this.mapGroup.remove(child);
        }

        try {
            console.log("Ładowanie mapy logowania...");
            const res = await fetch(`${API_BASE_URL}/api/login-map`);
            let blocksData =[];
            
            if (res.ok) {
                blocksData = await res.json();
            }

            if (!Array.isArray(blocksData) || blocksData.length === 0) {
                console.log("Mapa logowania pusta, generuję domyślną.");
                this.createDefaultFloor();
                return;
            }

            const blocksByTexture = {};
            let highestYAtCenter = -100;

            blocksData.forEach(block => {
                if (block.id !== undefined && !block.texturePath) {
                    block.texturePath = `textures/block_${block.id}.png`;
                }
                
                if (!block.texturePath) return;
                
                if (!blocksByTexture[block.texturePath]) {
                    blocksByTexture[block.texturePath] =[];
                }
                blocksByTexture[block.texturePath].push(block);

                if (Math.abs(block.x) < 0.6 && Math.abs(block.z) < 0.6) {
                    if (block.y > highestYAtCenter) {
                        highestYAtCenter = block.y;
                    }
                }
            });

            if (highestYAtCenter > -100) {
                const charY = highestYAtCenter + 1.0;
                this.previewCharacter.position.y = charY;
                this.defaultLookAt.y = charY + 1.0;
                this.zoomedLookAt.y = charY + 0.8;
                this.defaultCamPos.y = charY + 2.5;
                this.zoomedCamPos.y = charY + 1.0;
                this.targetCamPos.copy(this.defaultCamPos);
                this.targetLookAt.copy(this.defaultLookAt);
            }

            const dummy = new THREE.Object3D();

            for (const [texturePath, blocks] of Object.entries(blocksByTexture)) {
                let material = this.materials[texturePath];
                if (!material) {
                    const tex = this.textureLoader.load(texturePath);
                    tex.magFilter = THREE.NearestFilter;
                    tex.minFilter = THREE.NearestFilter; 
                    material = new THREE.MeshBasicMaterial({ map: tex });
                    this.materials[texturePath] = material;
                }

                const instancedMesh = new THREE.InstancedMesh(this.sharedGeometry, material, blocks.length);
                instancedMesh.castShadow = true;
                instancedMesh.receiveShadow = true;

                blocks.forEach((block, index) => {
                    dummy.position.set(block.x, block.y, block.z);
                    dummy.updateMatrix();
                    instancedMesh.setMatrixAt(index, dummy.matrix);
                });

                instancedMesh.instanceMatrix.needsUpdate = true;
                this.mapGroup.add(instancedMesh);
            }

        } catch (e) {
            console.warn("Błąd mapy logowania:", e);
            this.createDefaultFloor();
        }
    }

    createDefaultFloor() {
        const tex = this.textureLoader.load('textures/trawa.png');
        tex.magFilter = THREE.NearestFilter;
        const mat = new THREE.MeshLambertMaterial({ map: tex });
        
        const size = 10;
        const instancedMesh = new THREE.InstancedMesh(this.sharedGeometry, mat, size * size);
        const dummy = new THREE.Object3D();
        
        let i = 0;
        for(let x = -size/2; x < size/2; x++) {
            for(let z = -size/2; z < size/2; z++) {
                dummy.position.set(x, 0, z);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i++, dummy.matrix);
            }
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        this.mapGroup.add(instancedMesh);
        this.previewCharacter.position.y = 1.5;
    }

    zoomIn() {
        this.targetCamPos.copy(this.zoomedCamPos);
        this.targetLookAt.copy(this.zoomedLookAt);
    }

    zoomOut() {
        this.targetCamPos.copy(this.defaultCamPos);
        this.targetLookAt.copy(this.defaultLookAt);
    }

    setupEvents() {
        const btnShowLogin = document.getElementById('btn-show-login');
        const btnShowRegister = document.getElementById('btn-show-register');

        if(btnShowLogin) btnShowLogin.onclick = () => { 
            this.showScreen('login');
            this.zoomOut(); 
        };
        
        if(btnShowRegister) btnShowRegister.onclick = () => { 
            this.showScreen('register');
            this.zoomIn();
        };

        const btnLoginCancel = document.getElementById('btn-login-cancel');
        if(btnLoginCancel) btnLoginCancel.onclick = () => {
            this.showScreen('welcome');
            this.zoomOut();
        };

        const formLogin = document.getElementById('login-form');
        if(formLogin) {
            formLogin.onsubmit = (e) => {
                e.preventDefault();
                this.handleLogin();
            };
        }

        const btnRegCancel = document.getElementById('btn-register-cancel');
        if(btnRegCancel) btnRegCancel.onclick = () => {
            this.showScreen('welcome');
            this.zoomOut();
        };

        const formReg = document.getElementById('register-form');
        const arrowLeft = document.getElementById('skin-prev');
        const arrowRight = document.getElementById('skin-next');

        if(arrowLeft) arrowLeft.onclick = () => this.cycleSkin(-1);
        if(arrowRight) arrowRight.onclick = () => this.cycleSkin(1);

        if(formReg) {
            formReg.onsubmit = (e) => {
                e.preventDefault();
                this.handleRegister();
            };
        }
    }

    showScreen(screenName) {
        if(this.screens.welcome) this.screens.welcome.style.display = 'none';
        if(this.screens.login) this.screens.login.style.display = 'none';
        if(this.screens.register) this.screens.register.style.display = 'none';

        if (screenName === 'welcome' && this.screens.welcome) this.screens.welcome.style.display = 'flex';
        if (screenName === 'login' && this.screens.login) this.screens.login.style.display = 'flex';
        if (screenName === 'register' && this.screens.register) this.screens.register.style.display = 'block';
    }

    cycleSkin(dir) {
        const skinsList = this.serverStarterSkins || STARTER_SKINS;
        
        this.currentSkinIndex += dir;
        if (this.currentSkinIndex < 0) this.currentSkinIndex = skinsList.length - 1;
        if (this.currentSkinIndex >= skinsList.length) this.currentSkinIndex = 0;
        this.updateSkinPreview();
    }

    updateSkinPreview() {
        if (!this.previewCharacter) return;

        for (let i = this.previewCharacter.children.length - 1; i >= 0; i--) {
            const child = this.previewCharacter.children[i];
            if (child.type === 'Group') {
                this.previewCharacter.remove(child);
            }
        }

        const skinsList = this.serverStarterSkins || STARTER_SKINS;
        const skinData = skinsList[this.currentSkinIndex];
        if (!skinData) return;

        const skinGroup = new THREE.Group();
        skinGroup.scale.setScalar(0.125); 
        skinGroup.position.y = 0.5;

        const loader = new THREE.TextureLoader();

        skinData.blocks.forEach(b => {
            const geo = new THREE.BoxGeometry(1, 1, 1);
            const tex = loader.load(b.texturePath);
            tex.magFilter = THREE.NearestFilter;
            const mat = new THREE.MeshLambertMaterial({ map: tex });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(b.x, b.y, b.z);
            skinGroup.add(mesh);
        });

        this.previewCharacter.add(skinGroup);
    }

    animate() {
        if (!this.isIntroActive) return;

        this.introAnimId = requestAnimationFrame(() => this.animate());

        if (this.previewCharacter) {
            this.previewCharacter.rotation.y += 0.005;
        }

        const speed = 0.05;
        this.camera.position.lerp(this.targetCamPos, speed);
        this.currentLookAt.lerp(this.targetLookAt, speed);
        this.camera.lookAt(this.currentLookAt);

        this.core.render(this.scene);
    }

    async handleLogin() {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const msg = document.getElementById('auth-message');

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (!username || !password) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                this.dispose();
                this.onLoginSuccess(data.user, data.token, data.thumbnail);
            } else {
                if (msg) msg.textContent = data.message || "Błąd logowania";
            }
        } catch (e) {
            console.error(e);
            if (msg) msg.textContent = "Błąd połączenia";
        }
    }

    async handleRegister() {
        const uInput = document.getElementById('register-username');
        const pInput = document.getElementById('register-password');
        const pcInput = document.getElementById('register-password-confirm');

        if (pInput.value !== pcInput.value) {
            alert("Hasła nie są takie same!");
            return;
        }

        const skinsList = this.serverStarterSkins || STARTER_SKINS;
        const selectedSkinData = skinsList[this.currentSkinIndex];

        try {
            const res = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: uInput.value,
                    password: pInput.value,
                    starterSkin: selectedSkinData
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Konto utworzone! Możesz się zalogować.");
                this.showScreen('login');
                this.zoomOut();
            } else {
                alert("Błąd: " + data.message);
            }
        } catch (e) {
            alert("Błąd sieci: " + e.message);
        }
    }

    dispose() {
        this.isIntroActive = false;
        if (this.introAnimId) cancelAnimationFrame(this.introAnimId);
        
        // Nie usuwamy auth-screen, tylko je chowamy
        const authScreen = document.getElementById('auth-screen');
        if (authScreen) {
            authScreen.style.display = 'none';
        }

        if (this.previewCharacter) {
            this.scene.remove(this.previewCharacter);
            this.previewCharacter = null;
        }

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
            this.skyMesh = null;
        }

        if (this.mapGroup) {
            this.scene.remove(this.mapGroup);
            while(this.mapGroup.children.length > 0) {
                const child = this.mapGroup.children[0];
                if(child.geometry) child.geometry.dispose();
                this.mapGroup.remove(child);
            }
        }
        
        const ids =['btn-show-login', 'btn-show-register', 'btn-login-cancel', 'btn-register-cancel', 'skin-prev', 'skin-next'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.onclick = null;
        });

        if (this.audioManager) {
            this.audioManager.stopLoginMusic();
        }
    }
}