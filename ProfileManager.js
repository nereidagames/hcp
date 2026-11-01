/* PLIK: ProfileManager.js */

import { SkinStorage } from './SkinStorage.js';
import { API_BASE_URL, STORAGE_KEYS } from './Config.js';
import { modalPreview } from './ModalPreview.js';

function getVipBadgeUrl(tier) {
    switch (tier) {
        case 'star_vip': return 'icons/star-vip-badge.png';
        case 'elite_vip': return 'icons/elite-vip-badge.png';
        case 'super_vip': return 'icons/super-vip-badge.png';
        case 'vip':
        default:
            return 'icons/normal-vip-badge.png';
    }
}

// Szablon HTML dla własnego profilu gracza
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

        .profile-container { 
            width: 380px; 
            height: 330px; 
            max-height: 85vh;
            background: radial-gradient(circle at center, #7ed6df 0%, #22a6b3 100%);
            border: 4px solid rgba(0,0,0,0.25);
            border-radius: 20px; 
            position: relative; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
            font-family: 'Titan One', cursive; 
            transition: background 0.3s ease;
        }

        /* ZŁOTY MOTYW DLA GRACZA Z VIP-EM */
        .profile-container.vip-theme {
            background: radial-gradient(circle at 50% 60%, #ffd32a 0%, #ff9f1a 60%, #f39c12 100%) !important;
            border: 4px solid #f1c40f !important;
            box-shadow: 0 10px 35px rgba(243, 156, 18, 0.45) !important;
        }

        .profile-header { 
            position: absolute; 
            top: 0; 
            left: 0; 
            right: 0; 
            height: 48px; 
            background: linear-gradient(to bottom, #4facfe, #00f2fe);
            border-bottom: 2px solid rgba(255,255,255,0.4);
            border-radius: 16px 16px 0 0;
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            color: white; 
            text-shadow: 1.5px 1.5px 0 #000; 
            z-index: 2; 
        }

        .profile-container.vip-theme .profile-header {
            background: linear-gradient(to bottom, #ffbe10, #e67e22) !important;
            border-bottom: 2px solid #ffd32a !important;
        }

        .profile-name { font-size: 19px; }
        .profile-joined { font-size: 10px; opacity: 0.9; }

        .level-star-large { 
            position: absolute; 
            top: -10px; 
            left: -10px; 
            width: 76px; 
            height: 76px; 
            background: url('icons/icon-level.png') center/contain no-repeat; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            font-size: 26px; 
            color: white; 
            text-shadow: 2px 2px 0 #000; 
            z-index: 10; 
            filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3)); 
            transform: rotate(-10deg);
        }

        /* FLAGA POLSKI */
        .profile-flag { 
            position: absolute; 
            top: 60px; 
            left: 16px; 
            width: 36px; 
            height: 22px; 
            background-color: #fff; 
            background-image: linear-gradient(to bottom, #fff 50%, #dc143c 50%);
            border: 2px solid white;
            border-radius: 4px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.25); 
            z-index: 10;
        }

        /* ODZNAKA VIP NAPRZECIWKO FLAGI */
        .profile-vip-badge {
            position: absolute;
            top: 54px;
            right: 16px;
            width: 60px;
            height: 38px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            cursor: pointer;
            filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4));
            z-index: 15;
            transition: transform 0.1s;
        }
        .profile-vip-badge:active { transform: scale(0.92); }

        #profile-preview-canvas { 
            position: absolute; 
            top: 48px; 
            left: 0; 
            width: 100%;
            height: calc(100% - 48px); 
            z-index: 1; 
        }

        .profile-glow { 
            position: absolute; 
            top: 60%; 
            left: 50%; 
            transform: translate(-50%, -50%); 
            width: 220px; 
            height: 220px; 
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%); 
            z-index: 0; 
            pointer-events: none; 
        }

        .profile-sidebar { 
            position: absolute; 
            top: 15px; 
            right: -80px; 
            display: flex; 
            flex-direction: column; 
            gap: 10px; 
            z-index: 15; 
        }

        .sidebar-btn { 
            width: 70px; 
            height: 60px; 
            background: linear-gradient(to bottom, #54a0ff, #2e86de); 
            border: 2.5px solid white; 
            border-radius: 12px; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            box-shadow: 0 4px 0 #1e60a3, 0 6px 8px rgba(0,0,0,0.3); 
            cursor: pointer; 
            transition: transform 0.1s; 
        }
        .sidebar-btn:active { 
            transform: translateY(3px); 
            box-shadow: 0 1px 0 #1e60a3; 
        }

        .sidebar-icon { 
            width: 28px; 
            height: 28px; 
            background-size: contain; 
            background-repeat: no-repeat; 
            background-position: center; 
            margin-bottom: 2px; 
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3)); 
        }

        .sidebar-label { 
            color: white; 
            font-size: 11px; 
            text-shadow: 1px 1px 0 #000; 
        }

        .profile-close-x {
            position: absolute;
            top: -12px;
            right: -12px;
            width: 36px;
            height: 36px;
            background: #e74c3c;
            border: 2.5px solid white;
            border-radius: 50%;
            color: white;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 20;
            box-shadow: 0 3px 5px rgba(0,0,0,0.3);
        }
        .profile-close-x:active { transform: scale(0.92); }
    </style>

    <div id="player-profile-panel" class="panel-modal" style="display:none;">
        <div class="panel-content">
            <div class="profile-container" id="my-profile-card">
                <div id="btn-player-profile-close" class="profile-close-x">X</div>
                <div class="level-star-large"><span id="profile-level-val" style="margin-top:4px;">1</span></div>
                
                <div class="profile-header">
                    <div id="profile-username" class="profile-name">player</div>
                    <div id="profile-joined-date" class="profile-joined">Członek od maj, 2024</div>
                </div>

                <div class="profile-flag"></div>
                <!-- ODZNAKA VIP NAPRZECIWKO FLAGI -->
                <div id="profile-vip-badge" class="profile-vip-badge" style="display:none;" title="Kup VIP"></div>

                <div class="profile-glow"></div>
                <div id="profile-preview-canvas"></div>

                <div class="profile-sidebar">
                    <div id="btn-profile-wall" class="sidebar-btn">
                        <div class="sidebar-icon" style="background-image: url('icons/sciana.png');"></div>
                        <span class="sidebar-label">Ściana</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// Szablon HTML dla profilu innego gracza
const OTHER_PLAYER_PROFILE_TEMPLATE = `
    <style>
        #other-player-profile-panel .panel-content { 
            background: transparent !important; 
            box-shadow: none !important; 
            border: none !important; 
            padding: 0 !important; 
            width: auto !important; 
            height: auto !important; 
            pointer-events: auto; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
        }

        .bsp-profile-wrapper { 
            display: flex; 
            gap: 10px; 
            font-family: 'Titan One', cursive; 
            position: relative; 
        }

        .bsp-main-card { 
            width: 380px; 
            height: 330px; 
            max-height: 85vh;
            background: radial-gradient(circle at center, #7ed6df 0%, #22a6b3 100%); 
            border-radius: 20px; 
            border: 4px solid rgba(0,0,0,0.25); 
            box-shadow: 0 10px 25px rgba(0,0,0,0.5); 
            position: relative; 
            overflow: hidden; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            transition: background 0.3s ease;
        }

        /* ZŁOTY MOTYW DLA INNEGO GRACZA Z VIP-EM */
        .bsp-main-card.vip-theme {
            background: radial-gradient(circle at 50% 60%, #ffd32a 0%, #ff9f1a 60%, #f39c12 100%) !important;
            border: 4px solid #f1c40f !important;
            box-shadow: 0 10px 35px rgba(243, 156, 18, 0.45) !important;
        }

        .bsp-header { 
            width: 100%; 
            height: 48px; 
            background: linear-gradient(to bottom, #4facfe, #00f2fe); 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            color: white; 
            text-shadow: 1.5px 1.5px 0 #000; 
            box-shadow: 0 3px 5px rgba(0,0,0,0.2); 
            z-index: 2; 
            border-bottom: 2px solid rgba(255,255,255,0.4); 
        }

        .bsp-main-card.vip-theme .bsp-header {
            background: linear-gradient(to bottom, #ffbe10, #e67e22) !important;
            border-bottom: 2px solid #ffd32a !important;
        }

        .bsp-username { font-size: 19px; margin-bottom: 1px; }
        .bsp-joined { font-size: 10px; opacity: 0.9; }

        .bsp-level-star { 
            position: absolute; 
            top: -10px; 
            left: -10px; 
            width: 76px; 
            height: 76px; 
            background: url('icons/icon-level.png') center/contain no-repeat; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            font-size: 26px; 
            color: white; 
            text-shadow: 2px 2px 0 #000; 
            z-index: 10; 
            filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.4)); 
            transform: rotate(-10deg); 
        }

        .bsp-status-dot { 
            position: absolute; 
            top: 12px; 
            right: 14px; 
            width: 20px; 
            height: 20px; 
            background: radial-gradient(circle at 30% 30%, #2ecc71, #27ae60); 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.3); 
            z-index: 10; 
            display: none; 
        }
        .bsp-status-dot.offline { background: radial-gradient(circle at 30% 30%, #e74c3c, #c0392b); }

        /* FLAGA POLSKI */
        .bsp-flag { 
            position: absolute; 
            top: 60px; 
            left: 16px; 
            width: 36px; 
            height: 22px; 
            background-color: #fff; 
            background-image: linear-gradient(to bottom, #fff 50%, #dc143c 50%); 
            border: 2px solid white; 
            border-radius: 4px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.25); 
            z-index: 10; 
        }

        /* ODZNAKA VIP NAPRZECIWKO FLAGI */
        .bsp-vip-badge {
            position: absolute;
            top: 54px;
            right: 16px;
            width: 60px;
            height: 38px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            cursor: pointer;
            filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4));
            z-index: 15;
            transition: transform 0.1s;
        }
        .bsp-vip-badge:active { transform: scale(0.92); }

        #other-player-preview-canvas { 
            position: absolute; 
            top: 48px; 
            left: 0; 
            width: 100%; 
            height: calc(100% - 48px); 
            z-index: 1; 
        }

        .bsp-corner-btn { 
            position: absolute; 
            bottom: 12px; 
            width: 48px; 
            height: 48px; 
            border-radius: 12px; 
            border: 3px solid white; 
            cursor: pointer; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            box-shadow: 0 4px 0 rgba(0,0,0,0.3); 
            transition: transform 0.1s; 
            z-index: 10; 
        }
        .bsp-corner-btn:active { transform: translateY(3px); box-shadow: none; }
        .btn-report { left: 14px; background: #535c68 url('icons/alert.png') center/60% no-repeat; }
        .btn-friend-action { right: 14px; background: linear-gradient(to bottom, #e74c3c, #c0392b); }

        .bsp-sidebar { 
            display: flex; 
            flex-direction: column; 
            gap: 6px; 
            padding-top: 5px; 
        }

        .bsp-side-btn { 
            width: 82px; 
            height: 56px; 
            background: linear-gradient(to bottom, #4facfe, #00f2fe); 
            border: 2.5px solid white; 
            border-radius: 12px; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            box-shadow: 0 4px 0 #2980b9, 0 6px 8px rgba(0,0,0,0.3); 
            cursor: pointer; 
            transition: transform 0.1s; 
            position: relative; 
        }
        .bsp-side-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #2980b9; }
        .bsp-side-btn.green { background: linear-gradient(to bottom, #2ecc71, #27ae60); box-shadow: 0 4px 0 #1e8449, 0 6px 8px rgba(0,0,0,0.3); }
        .bsp-side-btn.green:active { transform: translateY(3px); box-shadow: 0 1px 0 #1e8449; }
        
        .bsp-btn-icon { width: 26px; height: 26px; background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); margin-bottom: 1px; }
        .bsp-btn-label { font-size: 11px; color: white; text-shadow: 1.5px 1.5px 0 #000; font-weight: bold; }

        .bsp-close-x { 
            position: absolute; 
            top: -12px; 
            right: -12px; 
            width: 36px; 
            height: 36px; 
            background: #e74c3c; 
            border: 2.5px solid white; 
            border-radius: 50%; 
            color: white; 
            font-size: 18px; 
            font-weight: bold; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            cursor: pointer; 
            z-index: 20; 
            box-shadow: 0 3px 5px rgba(0,0,0,0.3); 
        }
        .bsp-close-x:active { transform: scale(0.92); }
    </style>

    <div id="other-player-profile-panel" class="panel-modal" style="display:none;">
        <div class="panel-content">
            <div class="bsp-profile-wrapper">
                <div class="bsp-main-card" id="other-profile-card">
                    <div class="bsp-close-x" id="btn-other-profile-close">X</div>
                    <div class="bsp-level-star"><span id="other-profile-level" style="transform: rotate(10deg); margin-top:4px;">1</span></div>
                    <div id="other-profile-status" class="bsp-status-dot"></div>
                    
                    <div class="bsp-header">
                        <div id="other-profile-username" class="bsp-username">player</div>
                        <div id="other-profile-date" class="bsp-joined">Członek od maj, 2024</div>
                    </div>

                    <div class="bsp-flag"></div>
                    <!-- ODZNAKA VIP NAPRZECIWKO FLAGI -->
                    <div id="other-profile-vip-badge" class="bsp-vip-badge" style="display:none;" title="Kup VIP"></div>

                    <div id="other-player-preview-canvas"></div>
                    
                    <div class="bsp-corner-btn btn-report"></div>
                    <div id="btn-other-friend-action" class="bsp-corner-btn btn-friend-action"><div style="font-size:24px;">👤</div></div>
                </div>

                <div class="bsp-sidebar">
                    <div id="btn-other-wall" class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/sciana.png');"></div><div class="bsp-btn-label">Ściana</div></div>
                    <div id="btn-other-chat" class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/icon-chat.png');"></div><div class="bsp-btn-label">Czat</div></div>
                    <div id="btn-other-smile" class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/usmiech.png');"></div><div class="bsp-btn-label">Uśmiech</div></div>
                    <div class="bsp-side-btn"><div class="bsp-btn-icon" style="background-image: url('icons/icon-home.png');"></div><div class="bsp-btn-label">Dom</div></div>
                </div>
            </div>
        </div>
    </div>
`;

export class ProfileManager {
    constructor(uiManager) {
        this.ui = uiManager;
        
        this.playerProfilePanel = null;
        this.otherProfilePanel = null;
        this.myProfileData = null;
        
        this.onOpenWall = null;
        this.onOpenChat = null;
        this.onSendSmile = null;
        this.onFriendAction = null;
        
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
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        if (this.playerProfilePanel) {
            this.playerProfilePanel.addEventListener('click', (e) => {
                if (e.target === this.playerProfilePanel) this.closePlayerProfile();
            });

            const closeBtn = document.getElementById('btn-player-profile-close');
            if (closeBtn) closeBtn.onclick = this.closePlayerProfile;
            
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

            // Kliknięcie w odznakę VIP we własnym profilu otwiera sklep VIP
            const vipBadge = document.getElementById('profile-vip-badge');
            if (vipBadge) {
                vipBadge.onclick = () => {
                    if (this.ui.vipManager) {
                        this.ui.vipManager.open();
                    }
                };
            }
        }
        
        if (this.otherProfilePanel) {
            this.otherProfilePanel.addEventListener('click', (e) => {
                if (e.target === this.otherProfilePanel) this.closeOtherProfile();
            });
            
            const closeBtn = document.getElementById('btn-other-profile-close');
            if (closeBtn) closeBtn.onclick = this.closeOtherProfile;

            // Kliknięcie w odznakę VIP w czyimś profilu otwiera sklep VIP
            const otherVipBadge = document.getElementById('other-profile-vip-badge');
            if (otherVipBadge) {
                otherVipBadge.onclick = () => {
                    if (this.ui.vipManager) {
                        this.ui.vipManager.open();
                    }
                };
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
        
        modalPreview.attachTo('profile-preview-canvas', -0.7, 1.25);
        
        const cardEl = document.getElementById('my-profile-card');
        const nameEl = document.getElementById('profile-username');
        const lvlEl = document.getElementById('profile-level-val');
        const dateEl = document.getElementById('profile-joined-date');
        const vipBadgeEl = document.getElementById('profile-vip-badge');
        
        if (this.myProfileData) {
            if (nameEl) nameEl.textContent = this.myProfileData.username || "PLAYER";
            if (lvlEl) lvlEl.textContent = this.myProfileData.level || 1;
        }

        // Weryfikacja rangi VIP własnego konta
        const isVip = this.ui.vipManager ? this.ui.vipManager.isVipActive() : false;
        const vipTier = this.ui.vipManager?.vipTier || this.myProfileData?.vipTier || 'none';

        if (cardEl) {
            if (isVip) {
                cardEl.classList.add('vip-theme');
            } else {
                cardEl.classList.remove('vip-theme');
            }
        }

        if (vipBadgeEl) {
            if (isVip && vipTier !== 'none') {
                vipBadgeEl.style.backgroundImage = `url('${getVipBadgeUrl(vipTier)}')`;
                vipBadgeEl.style.display = 'block';
            } else {
                vipBadgeEl.style.display = 'none';
            }
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
            modalPreview.applySkin(blocks);
        }
    }
    
    closePlayerProfile() {
        if (this.playerProfilePanel) {
            this.playerProfilePanel.style.display = 'none';
        }
        modalPreview.stop();
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
        
        modalPreview.attachTo('other-player-preview-canvas', -0.7, 1.25);
        
        const cardEl = document.getElementById('other-profile-card');
        const vipBadgeEl = document.getElementById('other-profile-vip-badge');
        
        document.getElementById('other-profile-username').textContent = username;
        document.getElementById('other-profile-level').textContent = "...";
        document.getElementById('other-profile-date').textContent = "Ładowanie...";
        
        if (cardEl) cardEl.classList.remove('vip-theme');
        if (vipBadgeEl) vipBadgeEl.style.display = 'none';

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
                
                // Sprawdzenie czy gracz posiada aktywny status VIP
                const isOtherVip = Boolean(user.isVip || (user.vipTier && user.vipTier !== 'none'));
                
                if (cardEl) {
                    if (isOtherVip) {
                        cardEl.classList.add('vip-theme');
                    } else {
                        cardEl.classList.remove('vip-theme');
                    }
                }

                if (vipBadgeEl) {
                    if (isOtherVip) {
                        vipBadgeEl.style.backgroundImage = `url('${getVipBadgeUrl(user.vipTier)}')`;
                        vipBadgeEl.style.display = 'block';
                    } else {
                        vipBadgeEl.style.display = 'none';
                    }
                }

                this.updateFriendStatusUI(userId);
                this.setupOtherProfileButtons(userId, username);
                await this.loadSkinForPreview(userId);
            } else {
                document.getElementById('other-profile-date').textContent = "Nie znaleziono gracza";
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
        modalPreview.stop();
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
                    modalPreview.applySkin(blocks);
                }
            }
        } catch (error) {
            console.error("Load skin error:", error);
        }
    }
    
    updateFriendStatusUI(userId) {
        const statusDot = document.getElementById('other-profile-status');
        const actionBtn = document.getElementById('btn-other-friend-action');
        
        if (this.ui.friendsManager) {
            const { isFriend, isOnline } = this.ui.friendsManager.getFriendStatus(userId);
            
            if (isFriend) {
                if (statusDot) {
                    statusDot.style.display = 'block';
                    if (isOnline) statusDot.classList.remove('offline');
                    else statusDot.classList.add('offline');
                }
                if (actionBtn) {
                    actionBtn.style.background = 'linear-gradient(to bottom, #e74c3c, #c0392b)';
                    actionBtn.innerHTML = '<div style="font-size:24px;">🗑️</div>';
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
                    actionBtn.innerHTML = '<div style="font-size:26px; font-weight:bold; color:white;">+</div>';
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
        modalPreview.stop();
        if (this.playerProfilePanel) this.playerProfilePanel.remove();
        if (this.otherProfilePanel) this.otherProfilePanel.remove();
    }
}