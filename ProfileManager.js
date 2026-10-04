/* PLIK: ProfileManager.js */

import * as THREE from 'three';
import { createBaseCharacter } from './character.js';
import { SkinStorage } from './SkinStorage.js';
import { API_BASE_URL, STORAGE_KEYS } from './Config.js';
import { FriendsManager } from './FriendsManager.js';
import { MailManager } from './MailManager.js';
import { WallManager } from './WallManager.js';

// Szablon HTML dla własnego profilu
const PLAYER_PROFILE_TEMPLATE = `
    <style>
        #player-profile-panel .panel-content {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            width: auto !important;
            height: auto !important;
            max-width: none !important;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
        }
        .profile-container { width: 450px; height: 400px; background: radial-gradient(circle, #5addc5 0%, #16a085 100%); border-radius: 20px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: 'Titan One', cursive; }
        .profile-header { position: absolute; top: 15px; left: 0; right: 0; height: 50px; background-color: #0d8a72; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-shadow: 1.5px 1.5px 0 #000; z-index: 2; }
        .profile-name { font-size: 20px; text-transform: uppercase; }
        .profile-joined { font-size: 10px; opacity: 0.9; }
        .level-star-large { position: absolute; top: -10px; left: -10px; width: 90px; height: 90px; background: url('icons/icon-level.png') center/contain no-repeat; display: flex; justify-content: center; align-items: center; font-size: 32px; color: white; text-shadow: 2px 2px 0 #000; z-index: 10; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3)); }
        .profile-flag { position: absolute; top: 85px; left: 20px; width: 40px; height: 25px; background-color: #fff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; font-size: 20px; }
        #profile-preview-canvas { position: absolute; top: 65px; left: 50px; right: 80px; bottom: 50px; z-index: 1; }
        .profile-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%); z-index: 0; pointer-events: none; }
        .profile-sidebar { position: absolute; top: 15px; right: -70px; display: flex; flex-direction: column; gap: 10px; z-index: 5; }
        .sidebar-btn { width: 80px; height: 80px; background: linear-gradient(to bottom, #54a0ff, #2e86de); border: 3px solid white; border-radius: 15px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 5px 0 #1e60a3, 5px 5px 10px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.1s; }
        .sidebar-btn:active { transform: translateY(4px); box-shadow: 5px 1px 10px rgba(0,0,0,0.3); }
        .sidebar-icon { width: 40px; height: 40px; background-size: contain; background-repeat: no-repeat; background-position: center; margin-bottom: 2px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3)); }
        .sidebar-label { color: white; font-size: 12px; text-shadow: 1px 1px 0 #000; }
        .nav-arrow { position: absolute; bottom: 20px; width: 60px; height: 60px; background-color: transparent; border: none; box-shadow: none; cursor: pointer; background-repeat: no-repeat; background-position: center; background-size: contain; filter: drop-shadow(2px 4px 2px rgba(0,0,0,0.4)); transition: transform 0.1s; }
        .nav-arrow:active { transform: scale(0.9); }
        .nav-arrow.left { left: 20px; background-image: url('icons/arrow-left.png'); }
        .nav-arrow.right { right: 100px; background-image: url('icons/arrow-right.png'); } 
        @media (max-width: 600px) {
            .profile-container { width: 90vw; height: 80vw; max-height: 400px; }
            .sidebar-btn { width: 60px; height: 60px; }
            .profile-sidebar { right: -55px; } 
            .sidebar-icon { width: 30px; height: 30px; }
            .sidebar-label { font-size: 10px; }
            .level-star-large { width: 70px; height: 70px; font-size: 24px; }
            .nav-arrow { width: 40px; height: 40px; font-size: 24px; }
        }
    </style>

    <div id="player-profile-panel" class="panel-modal" style="display:none;">
        <div class="panel-content">
            <div class="profile-container">
                <div class="level-star-large"><span id="profile-level-val" style="margin-top:5px;">1</span></div>
                <div class="profile-header"><div id="profile-username" class="profile-name">PLAYER</div><div id="profile-joined-date" class="profile-joined">Członek od maj, 2024</div></div>
                <div class="profile-flag">🇵🇱</div>
                <div class="profile-glow"></div>
                <div id="profile-preview-canvas"></div>
                <div class="profile-sidebar">
                    <div id="btn-profile-wall" class="sidebar-btn">
                        <div class="sidebar-icon" style="background-image: url('icons/sciana.png');"></div>
                        <span class="sidebar-label">Ściana</span>
                    </div>
                </div>
                <div class="nav-arrow left"></div>
                <div class="nav-arrow right"></div>
            </div>
        </div>
    </div>
`;

// Szablon HTML dla profilu innego gracza
const OTHER_PLAYER_PROFILE_TEMPLATE = `
    <style>
        #other-player-profile-panel .panel-content { background: transparent !important; box-shadow: none !important; border: none !important; padding: 0 !important; width: auto !important; height: auto !important; pointer-events: auto; display: flex; justify-content: center; align-items: center; }
        .bsp-profile-wrapper { display: flex; gap: 10px; font-family: 'Titan One', cursive; position: relative; }
        .bsp-main-card { width: 380px; height: 450px; background: radial-gradient(circle at center, #7ed6df 0%, #22a6b3 100%); border-radius: 20px; border: 4px solid rgba(0,0,0,0.2); box-shadow: 0 10px 25px rgba(0,0,0,0.5); position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; }
        .bsp-header { width: 100%; height: 60px; background: linear-gradient(to bottom, #4facfe, #00f2fe); display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-shadow: 1.5px 1.5px 0 #000; box-shadow: 0 4px 5px rgba(0,0,0,0.2); z-index: 2; border-bottom: 2px solid rgba(255,255,255,0.3); }
        .bsp-username { font-size: 22px; margin-bottom: 2px; }
        .bsp-joined { font-size: 11px; opacity: 0.9; }
        .bsp-level-star { position: absolute; top: -10px; left: -10px; width: 90px; height: 90px; background: url('icons/icon-level.png') center/contain no-repeat; display: flex; justify-content: center; align-items: center; font-size: 32px; color: white; text-shadow: 2px 2px 0 #000; z-index: 10; filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.4)); transform: rotate(-10deg); }
        .bsp-status-dot { position: absolute; top: 15px; right: 15px; width: 25px; height: 25px; background: radial-gradient(circle at 30% 30%, #2ecc71, #27ae60); border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3); z-index: 10; display: none; }
        .bsp-status-dot.offline { background: radial-gradient(circle at 30% 30%, #e74c3c, #c0392b); }
        .bsp-flag { position: absolute; top: 75px; left: 20px; width: 45px; height: 30px; background-color: #fff; background-image: linear-gradient(to bottom, #fff 50%, #dc143c 50%); border: 2px solid white; border-radius: 6px; box-shadow: 0 3px 5px rgba(0,0,0,0.2); z-index: 5; }
        #other-player-preview-canvas { position: absolute; top: 60px; left: 0; width: 100%; height: 100%; z-index: 1; }
        .bsp-corner-btn { position: absolute; bottom: 15px; width: 60px; height: 60px; border-radius: 12px; border: 3px solid white; cursor: pointer; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 5px 0 rgba(0,0,0,0.3); transition: transform 0.1s; z-index: 10; }
        .bsp-corner-btn:active { transform: translateY(4px); box-shadow: none; }
        .btn-report { left: 15px; background: #535c68; background-image: url('icons/alert.png'); background-size: 60%; background-repeat: no-repeat; background-position: center; }
        .btn-friend-action { right: 15px; background: linear-gradient(to bottom, #e74c3c, #c0392b); }
        .friend-icon-placeholder { font-size: 30px; filter: drop-shadow(1px 1px 0 #000); }
        .bsp-sidebar { display: flex; flex-direction: column; gap: 8px; padding-top: 10px; }
        .bsp-side-btn { width: 100px; height: 75px; background: linear-gradient(to bottom, #4facfe, #00f2fe); border: 3px solid white; border-radius: 15px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 5px 0 #2980b9, 0 8px 10px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.1s; position: relative; }
        .bsp-side-btn:active { transform: translateY(4px); box-shadow: 0 1px 0 #2980b9; }
        .bsp-side-btn.green { background: linear-gradient(to bottom, #2ecc71, #27ae60); box-shadow: 0 5px 0 #1e8449, 0 8px 10px rgba(0,0,0,0.3); }
        .bsp-side-btn.green:active { transform: translateY(4px); box-shadow: 0 1px 0 #1e8449; }
        .bsp-btn-icon { width: 35px; height: 35px; background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); margin-bottom: 2px; }
        .bsp-btn-label { font-size: 13px; color: white; text-shadow: 1.5px 1.5px 0 #000; font-weight: bold; }
        .bsp-close-x { position: absolute; top: -15px; right: -15px; width: 40px; height: 40px; background: #e74c3c; border: 3px solid white; border-radius: 50%; color: white; font-size: 20px; font-weight: bold; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 20; box-shadow: 0 3px 5px rgba(0,0,0,0.3); }
        @media (max-width: 600px) {
            .bsp-profile-wrapper { flex-direction: column; align-items: center; gap: 5px; transform: scale(0.9); }
            .bsp-sidebar { flex-direction: row; flex-wrap: wrap; justify-content: center; width: 380px; }
            .bsp-side-btn { width: 70px; height: 60px; }
            .bsp-btn-label { font-size: 10px; }
            .bsp-btn-icon { width: 25px; height: 25px; }
        }
    </style>

    <div id="other-player-profile-panel" class="panel-modal" style="display:none;">
        <div class="panel-content">
            <div class="bsp-profile-wrapper">
                <div class="bsp-main-card">
                    <div class="bsp-close-x" id="btn-other-profile-close">X</div>
                    <div class="bsp-level-star"><span id="other-profile-level" style="transform: rotate(10deg); margin-top:5px;">100</span></div>
                    <div id="other-profile-status" class="bsp-status-dot"></div>
                    <div class="bsp-header"><div id="other-profile-username" class="bsp-username">cybervamp</div><div id="other-profile-date" class="bsp-joined">Członek od maj, 2024</div></div>
                    <div class="bsp-flag"></div>
                    <div id="other-player-preview-canvas"></div>
                    <div class="bsp-corner-btn btn-report"></div>
                    <div id="btn-other-friend-action" class="bsp-corner-btn btn-friend-action"><div class="friend-icon-placeholder">👤🗑️</div></div>
                </div>
                <div class="bsp-sidebar">
                    <div id="btn-other-wall" class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/icon-like.png');"></div><div class="bsp-btn-label">Ściana</div></div>
                    <div id="btn-other-chat" class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/icon-chat.png');"></div><div class="bsp-btn-label">Czat</div></div>
                    <div id="btn-other-smile" class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/usmiech.png');">🎉</div><div class="bsp-btn-label">Uśmiech</div></div>
                    <div class="bsp-side-btn green"><div class="bsp-btn-icon" style="background-image: url('icons/gamepad.png');">🎮</div><div class="bsp-btn-label">Zaproś</div></div>
                    <div class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/icon-home.png');"></div><div class="bsp-btn-label">Dom</div></div>
                </div>
            </div>
        </div>
    </div>
`;

export class ProfileManager {
    constructor(uiManager) {
        this.ui = uiManager;
        
        // Elementy DOM
        this.playerProfilePanel = null;
        this.otherProfilePanel = null;
        
        // Preview 3D
        this.sharedPreviewRenderer = null;
        this.previewScene = null;
        this.previewCamera = null;
        this.previewCharacter = null;
        this.previewAnimId = null;
        
        // Dane profilu
        this.myProfileData = null;
        
        // Callbacki
        this.onOpenWall = null;
        this.onOpenChat = null;
        this.onSendSmile = null;
        this.onFriendAction = null;
        
        // Bindowanie
        this.closePlayerProfile = this.closePlayerProfile.bind(this);
        this.closeOtherProfile = this.closeOtherProfile.bind(this);
    }
    
    initialize() {
        const modalsLayer = document.getElementById('modals-layer');
        if (modalsLayer) {
            modalsLayer.insertAdjacentHTML('beforeend', PLAYER_PROFILE_TEMPLATE);
            modalsLayer.insertAdjacentHTML('beforeend', OTHER_PLAYER_PROFILE_TEMPLATE);
        }
        
        this.playerProfilePanel = document.getElementById('player-profile-panel');
        this.otherProfilePanel = document.getElementById('other-player-profile-panel');
        
        this.initPreviewRenderer();
        this.setupEventListeners();
    }
    
    initPreviewRenderer() {
        this.sharedPreviewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
        this.sharedPreviewRenderer.setSize(300, 300);
        this.sharedPreviewRenderer.setPixelRatio(window.devicePixelRatio);
        
        this.previewScene = new THREE.Scene();
        this.previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.previewCamera.position.set(0, 1, 6);
        this.previewCamera.lookAt(0, 0.5, 0);
        
        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        this.previewScene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 0.6);
        directional.position.set(2, 5, 3);
        this.previewScene.add(directional);
        
        this.previewCharacter = new THREE.Group();
        if (typeof createBaseCharacter !== 'undefined') {
            createBaseCharacter(this.previewCharacter);
        }
        this.previewScene.add(this.previewCharacter);
        
        const animate = () => {
            this.previewAnimId = requestAnimationFrame(animate);
            if (this.previewCharacter && this.sharedPreviewRenderer.domElement.parentNode) {
                this.previewCharacter.rotation.y += 0.01;
                this.sharedPreviewRenderer.render(this.previewScene, this.previewCamera);
            }
        };
        animate();
    }
    
    setupEventListeners() {
        // Zamknięcie własnego profilu
        if (this.playerProfilePanel) {
            this.playerProfilePanel.addEventListener('click', (e) => {
                if (e.target === this.playerProfilePanel) this.closePlayerProfile();
            });
            
            const closeBtn = this.playerProfilePanel.querySelector('.nav-arrow.left');
            if (closeBtn) closeBtn.onclick = this.closePlayerProfile;
            
            // Przycisk ściany
            const wallBtn = document.getElementById('btn-profile-wall');
            if (wallBtn) {
                wallBtn.onclick = () => {
                    this.closePlayerProfile();
                    if (this.onOpenWall) {
                        const myId = parseInt(localStorage.getItem(STORAGE_KEYS.USER_ID) || "0");
                        const myName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || "Gracz";
                        this.onOpenWall(myId, myName);
                    }
                };
            }
        }
        
        // Zamknięcie profilu innego gracza
        if (this.otherProfilePanel) {
            this.otherProfilePanel.addEventListener('click', (e) => {
                if (e.target === this.otherProfilePanel) this.closeOtherProfile();
            });
            
            const closeBtn = document.getElementById('btn-other-profile-close');
            if (closeBtn) closeBtn.onclick = this.closeOtherProfile;
        }
    }
    
    attachPreviewTo(containerId, characterYOffset = 0, scale = 1) {
        const container = document.getElementById(containerId);
        if (!container || !this.sharedPreviewRenderer) return;
        
        container.innerHTML = '';
        
        const width = container.clientWidth || 300;
        const height = container.clientHeight || 300;
        this.sharedPreviewRenderer.setSize(width, height);
        this.previewCamera.aspect = width / height;
        this.previewCamera.updateProjectionMatrix();
        
        container.appendChild(this.sharedPreviewRenderer.domElement);
        
        this.previewCharacter.position.y = characterYOffset;
        this.previewCharacter.scale.setScalar(scale);
        this.previewCharacter.rotation.y = 0;
        
        // Usuń stare skiny
        for (let i = this.previewCharacter.children.length - 1; i >= 0; i--) {
            const child = this.previewCharacter.children[i];
            if (child.type === 'Group') {
                this.previewCharacter.remove(child);
            }
        }
    }
    
    applySkinToPreview(blocksData) {
        // Usuń stare skiny
        for (let i = this.previewCharacter.children.length - 1; i >= 0; i--) {
            const child = this.previewCharacter.children[i];
            if (child.type === 'Group') {
                this.previewCharacter.remove(child);
            }
        }
        
        if (!blocksData) return;
        
        const loader = new THREE.TextureLoader();
        const blockGroup = new THREE.Group();
        blockGroup.scale.setScalar(0.125);
        blockGroup.position.y = 0.5;
        
        blocksData.forEach(b => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ map: loader.load(b.texturePath) });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(b.x, b.y, b.z);
            blockGroup.add(mesh);
        });
        
        this.previewCharacter.add(blockGroup);
    }
    
    disposePreview() {
        if (this.previewCharacter) {
            for (let i = this.previewCharacter.children.length - 1; i >= 0; i--) {
                const child = this.previewCharacter.children[i];
                if (child.type === 'Group') {
                    this.previewCharacter.remove(child);
                }
            }
        }
    }
    
    formatMemberSince(dateString) {
        const date = dateString ? new Date(dateString) : new Date();
        const monthNames = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
        return `Członek od ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
    }
    
    async openPlayerProfile() {
        if (!this.playerProfilePanel) return;
        
        this.ui.bringToFront(this.playerProfilePanel);
        this.playerProfilePanel.style.display = 'flex';
        
        this.attachPreviewTo('profile-preview-canvas', -1, 1.5);
        
        const nameEl = document.getElementById('profile-username');
        const lvlEl = document.getElementById('profile-level-val');
        const dateEl = document.getElementById('profile-joined-date');
        
        if (this.myProfileData) {
            if (nameEl) nameEl.textContent = this.myProfileData.username || "PLAYER";
            if (lvlEl) lvlEl.textContent = this.myProfileData.level || 1;
        }
        
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (token) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data && data.user && data.user.created_at && dateEl) {
                    dateEl.textContent = this.formatMemberSince(data.user.created_at);
                }
            } catch (error) {
                console.error("Profile error:", error);
            }
        }
        
        const skinId = SkinStorage.getLastUsedSkinId();
        if (skinId) {
            const blocks = await SkinStorage.loadSkinData(skinId);
            this.applySkinToPreview(blocks);
        }
    }
    
    closePlayerProfile() {
        if (this.playerProfilePanel) {
            this.playerProfilePanel.style.display = 'none';
        }
        this.disposePreview();
    }
    
    async openOtherPlayerProfile(username) {
        const myName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
        if (username === myName) {
            this.openPlayerProfile();
            return;
        }
        
        if (!this.otherProfilePanel) return;
        
        this.ui.bringToFront(this.otherProfilePanel);
        this.otherProfilePanel.style.display = 'flex';
        
        this.attachPreviewTo('other-player-preview-canvas', -1.2, 1.5);
        
        document.getElementById('other-profile-username').textContent = username;
        document.getElementById('other-profile-level').textContent = "...";
        document.getElementById('other-profile-date').textContent = "Ładowanie...";
        const statusDot = document.getElementById('other-profile-status');
        if (statusDot) statusDot.classList.remove('offline');
        
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/profile/${username}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const user = await response.json();
                const userId = user.id;
                
                document.getElementById('other-profile-level').textContent = user.level || 1;
                document.getElementById('other-profile-date').textContent = this.formatMemberSince(user.created_at);
                
                this.updateFriendStatusUI(userId);
                this.setupOtherProfileButtons(userId, username);
                await this.loadSkinForPreview(userId);
            } else {
                document.getElementById('other-profile-date').textContent = "Nie znaleziono gracza";
                const statusDot = document.getElementById('other-profile-status');
                if (statusDot) statusDot.style.display = 'none';
            }
        } catch (error) {
            console.error("Profile error:", error);
            document.getElementById('other-profile-date').textContent = "Błąd sieci";
        }
    }
    
    closeOtherProfile() {
        if (this.otherProfilePanel) {
            this.otherProfilePanel.style.display = 'none';
        }
        this.disposePreview();
    }
    
    async loadSkinForPreview(userId) {
        try {
            const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
            const response = await fetch(`${API_BASE_URL}/api/user/${userId}/wall`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const wallData = await response.json();
                if (wallData.skins && wallData.skins.length > 0) {
                    const skinId = wallData.skins[0].id;
                    const blocks = await SkinStorage.loadSkinData(skinId);
                    this.applySkinToPreview(blocks);
                }
            }
        } catch (error) {
            console.error("Load skin error:", error);
        }
    }
    
    updateFriendStatusUI(userId) {
        // Ta metoda będzie aktualizowana z zewnątrz przez przyjaźni
        // Placeholder - zostanie nadpisany przez callback
        const statusDot = document.getElementById('other-profile-status');
        const actionBtn = document.getElementById('btn-other-friend-action');
        
        if (this.ui.friendsManager) {
            const { isFriend, isOnline } = this.ui.friendsManager.getFriendStatus(userId);
            
            if (isFriend) {
                if (statusDot) {
                    statusDot.style.display = 'block';
                    if (isOnline) {
                        statusDot.classList.remove('offline');
                    } else {
                        statusDot.classList.add('offline');
                    }
                }
                if (actionBtn) {
                    actionBtn.style.background = 'linear-gradient(to bottom, #e74c3c, #c0392b)';
                    actionBtn.innerHTML = '<div style="font-size:30px;">🗑️</div>';
                    actionBtn.onclick = () => {
                        if (confirm("Czy na pewno chcesz usunąć tego gracza ze znajomych?")) {
                            this.ui.friendsManager.removeFriend(userId).then(success => {
                                if (success) this.updateFriendStatusUI(userId);
                            });
                        }
                    };
                }
            } else {
                if (statusDot) statusDot.style.display = 'none';
                if (actionBtn) {
                    actionBtn.style.background = 'linear-gradient(to bottom, #2ecc71, #27ae60)';
                    actionBtn.innerHTML = '<div style="font-size:30px; font-weight:bold; color:white;">+</div>';
                    actionBtn.onclick = () => {
                        this.ui.friendsManager.sendFriendRequest(userId);
                        actionBtn.style.opacity = '0.5';
                    };
                }
            }
        }
    }
    
    setupOtherProfileButtons(userId, username) {
        const btnWall = document.getElementById('btn-other-wall');
        if (btnWall) {
            btnWall.onclick = () => {
                this.closeOtherProfile();
                if (this.onOpenWall) this.onOpenWall(userId, username);
            };
        }
        
        const btnChat = document.getElementById('btn-other-chat');
        if (btnChat) {
            btnChat.onclick = () => {
                this.closeOtherProfile();
                if (this.onOpenChat) this.onOpenChat(username);
            };
        }
        
        const btnSmile = document.getElementById('btn-other-smile');
        if (btnSmile) {
            btnSmile.onclick = async () => {
                const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
                if (!token) return;
                
                btnSmile.style.transform = 'scale(0.95)';
                setTimeout(() => btnSmile.style.transform = 'scale(1)', 100);
                
                try {
                    const response = await fetch(`${API_BASE_URL}/api/user/${userId}/smile`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    
                    if (response.ok) {
                        this.ui.showMessage("Wysłano uśmiech!", "success");
                    } else {
                        this.ui.showMessage(data.message || "Błąd wysyłania.", "error");
                    }
                } catch (error) {
                    this.ui.showMessage("Błąd sieci.", "error");
                }
            };
        }
    }
    
    updateMyProfileData(data) {
        this.myProfileData = data;
    }
    
    cleanup() {
        if (this.previewAnimId) {
            cancelAnimationFrame(this.previewAnimId);
        }
        if (this.sharedPreviewRenderer) {
            this.sharedPreviewRenderer.dispose();
        }
        if (this.playerProfilePanel) this.playerProfilePanel.remove();
        if (this.otherProfilePanel) this.otherProfilePanel.remove();
    }
}