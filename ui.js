/* PLIK: ui.js */

import * as THREE from 'three';
import { createBaseCharacter } from './character.js';
import { SkinStorage } from './SkinStorage.js';
import { WorldStorage } from './WorldStorage.js';
import { PrefabStorage } from './PrefabStorage.js';
import { HyperCubePartStorage } from './HyperCubePartStorage.js';

import { STORAGE_KEYS } from './Config.js';

const HUD_HTML = `
    <div class="top-bar ui-element">
        <div id="player-avatar-button" class="top-bar-item">
            <div class="player-avatar">👤</div>
            <div class="player-name text-outline" id="player-name-display">player</div>
        </div>
        
        <div class="top-bar-item">
            <div class="player-avatar" style="background-image: url('icons/logo-poczta.png'); background-size: 90%; background-position: center; background-repeat: no-repeat; background-color: transparent;"></div>
            <div class="player-name text-outline">Poczta</div>
        </div>
        
        <div id="btn-friends-open" class="top-bar-item">
            <div class="player-avatar btn-friends" style="background-image: url('icons/icon-friends.png'); background-size: 90%; background-position: center; background-repeat: no-repeat; background-color: transparent;"></div>
            <div class="player-name text-outline">Przyjaciele</div>
        </div>
        
        <div id="active-friends-container"></div>
    </div>
    
    <div id="parkour-timer" class="text-outline">00:00.00</div>
    <div class="chat-container ui-element"><div class="chat-area"></div><div id="chat-toggle-button">💬</div></div>
    <form id="chat-form" class="ui-element"><input type="text" id="chat-input-field" placeholder="Napisz coś..."><button type="submit" id="chat-send-btn">Wyślij</button></form>
    
    <div class="right-ui ui-element">
        <div class="game-buttons">
            <button class="game-btn btn-zagraj"></button>
            <button class="game-btn btn-buduj"></button>
            <button class="game-btn btn-kup"></button>
            <button class="game-btn btn-odkryj"></button>
            <button class="game-btn btn-wiecej"></button>
        </div>
        <div id="level-container">
            <div class="level-star"><div id="level-value" class="text-outline">1</div></div>
            <div class="level-bar-background"><div id="level-bar-fill"></div><div id="level-text" class="text-outline">0/50</div></div>
            <div class="level-plus-btn">+</div>
        </div>
        <div id="coin-counter"><div class="coin-icon"></div><div class="coin-bar-background"><div id="coin-value" class="text-outline">0</div></div><div id="coin-add-btn" class="ui-element">+</div></div>
    </div>
    <div id="mobile-game-controls"><div id="joystick-zone"></div><button id="jump-button"></button></div>
`;

const GLOBAL_MODALS_HTML = `
    <style>
        .nav-grid-container { display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: auto; gap: 15px; justify-content: center; width: 100%; padding: 20px; }
        .nav-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.1s; position: relative; }
        .nav-item:active { transform: scale(0.95); }
        .nav-btn-box { width: 110px; height: 110px; background-image: url('icons/NavigationButton.png'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; position: relative; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3)); padding-top: 15px; }
        .nav-btn-box-green { width: 110px; height: 110px; background-image: url('icons/NavigationButtonGreen.png'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; position: relative; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3)); padding-top: 15px; }
        .nav-icon { width: 55%; height: 55%; object-fit: contain; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3)); z-index: 1; }
        .nav-label { position: absolute; bottom: 12px; left: 0; width: 100%; color: white; font-size: 11px; font-family: 'Titan One', cursive; text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000; text-align: center; z-index: 2; pointer-events: none; line-height: 1; }
        .nav-badge { position: absolute; top: -5px; right: -5px; background-color: #e74c3c; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 10; }
        
        #more-options-panel .panel-content, #play-choice-panel .panel-content, #build-choice-panel .panel-content { background: rgba(0,0,0,0.6) !important; border: none !important; box-shadow: none !important; width: 95vw !important; max-width: 800px !important; display: flex; flex-direction: column; align-items: center; }
        
        /* Styl dla okna wpisywania nazwy */
        #name-input-panel-container { background: #3498db; border: 4px solid white; border-radius: 15px; padding: 20px; display: flex; flex-direction: column; gap: 15px; width: 300px; align-items: center; box-shadow: 0 10px 20px rgba(0,0,0,0.5); pointer-events: auto; }
        #name-input-field { width: 100%; height: 40px; border-radius: 8px; border: none; padding: 0 10px; font-family: 'Titan One', cursive; font-size: 16px; }
        #name-submit-btn { padding: 10px 30px; background: #2ecc71; color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; font-family: 'Titan One', cursive; font-size: 18px; }

        @media (max-width: 600px) {
            .nav-grid-container { gap: 10px; grid-template-columns: repeat(3, 1fr); }
            .nav-btn-box, .nav-btn-box-green { width: 90px; height: 90px; }
            .nav-label { font-size: 9px; bottom: 10px; }
        }
    </style>

    <div id="explore-exit-button"></div>
    
    <!-- PANELE GLOBALNE -->
    <div id="world-size-panel" class="panel-modal"><div class="panel-content"><h2>Rozmiar</h2><div class="build-choice-grid"><div id="size-choice-new-small" class="build-choice-item"><div class="build-choice-icon" style="background-image: url('icons/icon-smallworld.png');"></div><span>Mały</span></div><div id="size-choice-new-medium" class="build-choice-item"><div class="build-choice-icon" style="background-image: url('icons/icon-mediumworld.png');"></div><span>Średni</span></div><div id="size-choice-new-large" class="build-choice-item"><div class="build-choice-icon" style="background-image: url('icons/icon-bigworld.png');"></div><span>Duży</span></div></div><button class="panel-close-button">Anuluj</button></div></div>
    <div id="player-preview-panel" class="panel-modal" style="display:none;"><div class="panel-content"><h2>Podgląd</h2><div id="player-preview-renderer-container"></div><button class="panel-close-button">Zamknij</button></div></div>
    
    <!-- OKNO WPISYWANIA NAZWY -->
    <div id="name-input-panel" class="panel-modal" style="display:none;">
        <div id="name-input-panel-container">
            <h2 class="text-outline">Wpisz nazwę</h2>
            <input id="name-input-field" placeholder="Wpisz tekst..." maxlength="20">
            <button id="name-submit-btn">OK</button>
        </div>
    </div>
`;

// Import managerów
import { FriendsManager } from './FriendsManager.js';
import { MailManager } from './MailManager.js';
import { NewsManager } from './NewsManager.js';
import { HighScoresManager } from './HighScoresManager.js';
import { WallManager } from './WallManager.js'; 
import { NavigationManager } from './NavigationManager.js';
import { ShopManager } from './ShopManager.js';
import { SkinDetailsManager } from './SkinDetailsManager.js';
import { DiscoverManager } from './DiscoverManager.js';
import { ProfileManager } from './ProfileManager.js';

const API_BASE_URL = 'https://hypercubes-nexus-server.onrender.com';

export class UIManager {
  constructor(onSendMessage) {
    this.onSendMessage = onSendMessage;
    this.isMobile = false;
    
    // Callbacki główne
    this.onWorldSizeSelected = null;
    this.onSkinBuilderClick = null;
    this.onPrefabBuilderClick = null;
    this.onPartBuilderClick = null;
    this.onDiscoverClick = null;
    this.onPlayClick = null;
    this.onPlayerAvatarClick = null;
    this.onToggleFPS = null;
    this.onShopOpen = null;
    this.onBuyBlock = null;
    this.onBuySky = null;
    this.onNameSubmit = null;
    this.onSkinSelect = null; 
    this.onWorldSelect = null; 
    this.onSendPrivateMessage = null;
    this.onMessageSent = null;
    this.onMessageReceived = null;
    this.onEditNexusClick = null;
    this.onEditLoginMapClick = null;
    this.onAddStarterSkinClick = null;
    this.onUsePrefab = null;
    this.onUsePart = null;
    this.onExitParkour = null;
    this.onReplayParkour = null;
    this.onOpenOtherProfile = null;
    this.onVictoryScreenOpen = null;
    
    // Callbacki dla trybu kopania
    this.onDiggingClick = null;
    this.onDiggingMove = null;
    this.onDiggingMine = null;
    this.onDiggingRedeem = null;
    this.onDiggingUpgrade = null;
    this.onDiggingUseDynamite = null;
    
    // Managerzy
    this.friendsManager = new FriendsManager(this);
    this.mailManager = new MailManager(this);
    this.newsManager = new NewsManager(this);
    this.highScoresManager = new HighScoresManager(this);
    this.wallManager = new WallManager(this); 
    this.navigationManager = new NavigationManager(this);
    this.shopManager = new ShopManager(this);
    this.skinDetailsManager = new SkinDetailsManager(this);
    this.discoverManager = new DiscoverManager(this);
    this.profileManager = new ProfileManager(this);

    this.pendingRewardData = null;
    this.pendingNewsCount = 0;
    this.activeZIndex = 20000; 
    this.myProfileData = null;

    this.sharedPreviewRenderer = null;
    this.previewScene = null;
    this.previewCamera = null;
    this.previewCharacter = null;
    this.previewAnimId = null;
  }
  
  initialize(isMobile) {
    this.isMobile = isMobile;
    try {
        this.renderUI();
        this.initSharedRenderer();

        // Inicjalizacja managerów
        if (this.friendsManager.initialize) this.friendsManager.initialize();
        if (this.mailManager.initialize) this.mailManager.initialize();
        if (this.newsManager.initialize) this.newsManager.initialize();
        if (this.highScoresManager.init) this.highScoresManager.init();
        if (this.wallManager.initialize) this.wallManager.initialize(); 
        if (this.navigationManager.initialize) this.navigationManager.initialize();
        if (this.shopManager.initialize) this.shopManager.initialize();
        if (this.skinDetailsManager.initialize) this.skinDetailsManager.initialize();
        if (this.discoverManager.initialize) this.discoverManager.initialize();
        if (this.profileManager.initialize) this.profileManager.initialize();

        // Ustaw callbacki dla managerów
        this.setupManagerCallbacks();
        
        this.setupButtonHandlers();
        this.setupChatSystem(); 
        this.loadFriendsData(); 
        
        console.log("UI Inicjalizacja zakończona sukcesem.");
    } catch (error) {
        console.error("Błąd UI:", error);
    }
  }
  
  setupManagerCallbacks() {
    // SkinDetailsManager callbacki
    this.skinDetailsManager.onSkinSelect = (skinId, skinName, thumbnail, ownerId) => {
      if (this.onSkinSelect) this.onSkinSelect(skinId, skinName, thumbnail, ownerId);
    };
    this.skinDetailsManager.onUsePrefab = (item) => {
      if (this.onUsePrefab) this.onUsePrefab(item);
    };
    this.skinDetailsManager.onUsePart = (item) => {
      if (this.onUsePart) this.onUsePart(item);
    };
    
    // DiscoverManager callbacki
    this.discoverManager.onWorldSelect = (worldItem) => {
      if (this.onWorldSelect) this.onWorldSelect(worldItem);
    };
    this.discoverManager.onItemSelect = (item, type) => {
      this.skinDetailsManager.showItemDetails(item, type, true);
    };
    
    // ProfileManager callbacki
    this.profileManager.onOpenWall = (userId, username) => {
      this.wallManager.open(userId, username);
    };
    this.profileManager.onOpenChat = (username) => {
      this.mailManager.open();
      this.mailManager.openConversation(username);
    };
    
    // NavigationManager - przekaż callbacki
    this.navigationManager.ui = this;
    
    // Aktualizuj dane profilu
    if (this.myProfileData) {
      this.profileManager.updateMyProfileData(this.myProfileData);
    }
  }
  
  // --- UI KOPANIA ---
  showDiggingMode() {
    document.getElementById('digging-ui-container').style.display = 'block';
    const overlay = document.querySelector('.ui-overlay');
    if (overlay) overlay.style.display = 'none';
    const gameButtons = document.querySelector('.game-buttons');
    if (gameButtons) gameButtons.style.display = 'none';
    const joystickZone = document.getElementById('joystick-zone');
    if (joystickZone) joystickZone.style.display = 'none';
    const jumpButton = document.getElementById('jump-button');
    if (jumpButton) jumpButton.style.display = 'block';
  }
  
  hideDiggingMode() {
    document.getElementById('digging-ui-container').style.display = 'none';
    document.querySelector('.ui-overlay').style.display = 'block';
    document.querySelector('.game-buttons').style.display = 'flex';
    if (this.isMobile) {
        const joystickZone = document.getElementById('joystick-zone');
        if (joystickZone) joystickZone.style.display = 'block';
    }
    const jumpButton = document.getElementById('jump-button');
    if (jumpButton) {
        jumpButton.style.display = this.isMobile ? 'block' : 'none';
    }
  }
  
  showCrystalFound(crystal) {
    this.showMessage(`Znaleziono: ${crystal.name} (${crystal.value} Zoins)`, 'success');
  }
  
  // --- METODY POMOCNICZE ---
  async askForInput(title, defaultValue = "") {
      return new Promise((resolve) => {
          const panel = document.getElementById('name-input-panel');
          const input = document.getElementById('name-input-field');
          const btn = document.getElementById('name-submit-btn');
          const titleEl = document.querySelector('#name-input-panel-container h2');

          if (!panel || !input || !btn) {
              console.error("Brak elementów panelu wpisywania!");
              resolve(null);
              return;
          }

          if (titleEl) titleEl.textContent = title;
          input.value = defaultValue;
          
          this.bringToFront(panel);
          panel.style.display = 'flex';
          input.focus();

          const cleanup = () => {
              btn.onclick = null;
              input.onkeydown = null;
              panel.onclick = null;
          };

          const submit = () => {
              const val = input.value.trim();
              if (val) {
                  panel.style.display = 'none';
                  cleanup();
                  resolve(val);
              } else {
                  this.showMessage("Nazwa nie może być pusta!", "error");
              }
          };

          btn.onclick = submit;

          input.onkeydown = (e) => {
              if (e.key === 'Enter') {
                  submit();
              }
          };
          
          panel.onclick = (e) => {
              if (e.target === panel) {
                  panel.style.display = 'none';
                  cleanup();
                  resolve(null);
              }
          };
      });
  }
  
  showMessage(message, type = 'info') {
      const div = document.createElement('div');
      div.textContent = message;
      
      div.style.position = 'fixed';
      div.style.top = '15%'; 
      div.style.left = '50%';
      div.style.transform = 'translate(-50%, -50%) scale(0.8)';
      div.style.padding = '12px 24px';
      div.style.borderRadius = '12px';
      div.style.color = 'white';
      div.style.fontFamily = "'Titan One', cursive";
      div.style.fontSize = '18px';
      div.style.textShadow = '1.5px 1.5px 0 #000';
      div.style.zIndex = '100000'; 
      div.style.pointerEvents = 'none'; 
      div.style.boxShadow = '0 5px 15px rgba(0,0,0,0.4)';
      div.style.border = '3px solid white';
      div.style.opacity = '0';
      div.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

      if (type === 'error') {
          div.style.backgroundColor = '#e74c3c'; 
          div.style.borderColor = '#c0392b';
      } else if (type === 'success') {
          div.style.backgroundColor = '#2ecc71'; 
          div.style.borderColor = '#27ae60';
      } else {
          div.style.backgroundColor = '#3498db'; 
          div.style.borderColor = '#2980b9';
      }

      document.body.appendChild(div);

      requestAnimationFrame(() => {
          div.style.opacity = '1';
          div.style.transform = 'translate(-50%, -50%) scale(1)';
          div.style.top = '20%'; 
      });

      setTimeout(() => {
          div.style.opacity = '0';
          div.style.top = '15%'; 
          div.style.transform = 'translate(-50%, -50%) scale(0.8)';
          
          setTimeout(() => {
              if (div.parentNode) div.parentNode.removeChild(div);
          }, 300);
      }, 2500);
  }
  
  bringToFront(element) {
      if (element) {
          this.activeZIndex++;
          element.style.zIndex = this.activeZIndex;
      }
  }
  
  renderUI() {
      const uiLayer = document.getElementById('ui-layer');
      const modalsLayer = document.getElementById('modals-layer');

      // Zostawiamy authLayer w spokoju, zarządza nim teraz IntroManager!
      
      if (uiLayer) uiLayer.innerHTML = `<div class="ui-overlay">${HUD_HTML}</div>`;
      if (modalsLayer) {
          modalsLayer.innerHTML = GLOBAL_MODALS_HTML;
      }
  }
  
  initSharedRenderer() {
      this.sharedPreviewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
      this.sharedPreviewRenderer.setSize(300, 300);
      this.sharedPreviewRenderer.setPixelRatio(window.devicePixelRatio);

      this.previewScene = new THREE.Scene();
      this.previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      this.previewCamera.position.set(0, 1, 6);
      this.previewCamera.lookAt(0, 0.5, 0);

      const amb = new THREE.AmbientLight(0xffffff, 0.9);
      this.previewScene.add(amb);
      const dir = new THREE.DirectionalLight(0xffffff, 0.6);
      dir.position.set(2, 5, 3);
      this.previewScene.add(dir);

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
  
  attachRendererTo(containerId, characterYOffset = 0, scale = 1) {
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
      
      const children = this.previewCharacter.children;
      for (let i = children.length - 1; i >= 0; i--) {
          const child = children[i];
          if (child.type === 'Group') {
              this.previewCharacter.remove(child);
          }
      }
  }
  
  applySkinToPreview(blocksData) {
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
          const geo = new THREE.BoxGeometry(1, 1, 1);
          const mat = new THREE.MeshLambertMaterial({ map: loader.load(b.texturePath) });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(b.x, b.y, b.z);
          blockGroup.add(mesh);
      });
      this.previewCharacter.add(blockGroup);
  }
  
  disposeCurrentPreview() {
      if (this.previewCharacter) {
          for (let i = this.previewCharacter.children.length - 1; i >= 0; i--) {
              const child = this.previewCharacter.children[i];
              if (child.type === 'Group') {
                  this.previewCharacter.remove(child);
              }
          }
      }
  }
  
  // --- HUD UPDATE ---
  updatePlayerName(name) { 
      const nameDisplay = document.getElementById('player-name-display'); 
      if (nameDisplay) nameDisplay.textContent = name;
      
      if (!this.myProfileData) this.myProfileData = {};
      this.myProfileData.username = name;
      if (this.profileManager) this.profileManager.updateMyProfileData(this.myProfileData);
  }
  
  updatePlayerAvatar(thumbnail) { 
      const avatarEl = document.querySelector('#player-avatar-button .player-avatar'); 
      if (!avatarEl) return; 
      
      if (!this.myProfileData) this.myProfileData = {};
      this.myProfileData.thumbnail = thumbnail;

      if (thumbnail) { 
          avatarEl.textContent = ''; 
          avatarEl.style.backgroundImage = `url(${thumbnail})`; 
          avatarEl.style.backgroundSize = 'cover'; 
          avatarEl.style.backgroundPosition = 'center'; 
          avatarEl.style.backgroundColor = 'transparent'; 
      } else { 
          avatarEl.style.backgroundImage = 'none'; 
          avatarEl.textContent = '👤'; 
          avatarEl.style.backgroundColor = 'rgba(255,255,255,0.1)'; 
      } 
  }
  
  updateLevelInfo(level, xp, maxXp) {
      const lvlVal = document.getElementById('level-value');
      const lvlText = document.getElementById('level-text');
      const lvlFill = document.getElementById('level-bar-fill');
      
      if (!this.myProfileData) this.myProfileData = {};
      this.myProfileData.level = level;
      if (this.profileManager) this.profileManager.updateMyProfileData(this.myProfileData);
      
      if (lvlVal) lvlVal.textContent = level;
      if (lvlText) lvlText.textContent = `${xp}/${maxXp}`;
      if (lvlFill) { 
          const percent = Math.min(100, Math.max(0, (xp / maxXp) * 100)); 
          lvlFill.style.width = `${percent}%`; 
      }
  }
  
  updateCoinCounter(val) { 
      const e = document.getElementById('coin-value'); 
      if(e) e.textContent = val; 
  }
  
  updateFPSToggleText(e) { 
      const f = document.getElementById('fps-status'); 
      if(f) f.textContent = e ? 'Włączony' : 'Wyłączony'; 
  }
  
  toggleMobileControls(s) { 
      const m = document.getElementById('mobile-game-controls'); 
      if(m) m.style.display = s ? 'block' : 'none'; 
  }
  
  updatePendingRewards(count) {
      if (this.newsManager) {
          this.pendingNewsCount = parseInt(count) || 0;
          const badge = document.getElementById('rewards-badge');
          if (badge) {
              if (this.pendingNewsCount > 0) {
                  badge.textContent = this.pendingNewsCount;
                  badge.style.display = 'flex'; 
              } else {
                  badge.style.display = 'none';
              }
          }
      }
  }
  
  // --- CHAT ---
  setupChatSystem() { this.setupChatInput(); }
  
  addChatMessage(m, senderName = null) { 
      const c = document.querySelector('.chat-area'); 
      if(c) { 
          const el = document.createElement('div'); 
          el.className = 'chat-message text-outline'; 
          if (senderName && m.startsWith(senderName)) {
               const parts = m.split(':');
               const nick = parts[0];
               const rest = parts.slice(1).join(':');
               const nickSpan = document.createElement('span');
               nickSpan.textContent = nick;
               nickSpan.style.cursor = 'pointer';
               nickSpan.style.color = '#f1c40f'; 
               nickSpan.style.textDecoration = 'underline';
               nickSpan.onclick = () => this.openOtherPlayerProfile(nick);
               el.appendChild(nickSpan);
               el.appendChild(document.createTextNode(':' + rest));
          } else { el.textContent = m; }
          c.appendChild(el); c.scrollTop = c.scrollHeight; 
      } 
  }
  
  clearChat() { const c = document.querySelector('.chat-area'); if(c) c.innerHTML = ''; }
  
  handleChatClick() { 
      const f = document.getElementById('chat-form'); 
      if(f) f.style.display='flex'; 
      document.getElementById('chat-input-field').focus(); 
  }
  
  setupChatInput() { 
      const f = document.getElementById('chat-form'); 
      if(!f)return; 
      f.addEventListener('submit', e=>{ 
          e.preventDefault(); 
          const i = document.getElementById('chat-input-field'); 
          const v = i.value.trim(); 
          if(v && this.onSendMessage) this.onSendMessage(v); 
          i.value = ''; 
          f.style.display = 'none'; 
      }); 
  }
  
  // --- PARKOUR (przekierowanie do ParkourManager) ---
  setParkourTimerVisible(visible) {
      const timer = document.getElementById('parkour-timer');
      if (timer) timer.style.display = visible ? 'block' : 'none';
  }
  
  updateParkourTimer(timeString) {
      const timer = document.getElementById('parkour-timer');
      if (timer) timer.textContent = timeString;
  }
  
  // --- PRZYCISKI I PANELE ---
  checkAdminPermissions(username) {
      const admins = ['nixox2', 'admin'];
      if (admins.includes(username)) {
          const checkExist = setInterval(() => {
              const grid = document.querySelector('#more-options-panel .nav-grid-container');
              if (grid) {
                  clearInterval(checkExist);
                  
                  if (!document.getElementById('admin-edit-nexus-btn')) {
                       const adminDiv = document.createElement('div');
                       adminDiv.className = 'nav-item';
                       adminDiv.id = 'admin-edit-nexus-btn';
                       adminDiv.innerHTML = `<div class="nav-btn-box" style="filter: hue-rotate(180deg) drop-shadow(0 4px 4px rgba(0,0,0,0.3));"><img src="icons/tworzenie.png" onerror="this.src='icons/icon-build.png'" class="nav-icon"><span class="nav-label">Edytuj Nexus</span></div>`;
                       adminDiv.onclick = () => {
                           this.navigationManager.closePanel('more-options-panel');
                           if (this.onEditNexusClick) this.onEditNexusClick();
                       };
                       grid.insertBefore(adminDiv, grid.firstChild);
                  }

                  if (!document.getElementById('admin-edit-login-map-btn')) {
                      const loginEditDiv = document.createElement('div');
                      loginEditDiv.className = 'nav-item';
                      loginEditDiv.id = 'admin-edit-login-map-btn';
                      loginEditDiv.innerHTML = `<div class="nav-btn-box" style="filter: hue-rotate(280deg) drop-shadow(0 4px 4px rgba(0,0,0,0.3));"><img src="icons/tworzenie.png" onerror="this.src='icons/icon-build.png'" class="nav-icon"><span class="nav-label">Login Map</span></div>`;
                      loginEditDiv.onclick = () => {
                          this.navigationManager.closePanel('more-options-panel');
                          if (this.onEditLoginMapClick) this.onEditLoginMapClick();
                      };
                      grid.insertBefore(loginEditDiv, grid.firstChild);
                 }
        
                 if (!document.getElementById('admin-add-starter-skin-btn')) {
                    const starterSkinDiv = document.createElement('div');
                    starterSkinDiv.className = 'nav-item';
                    starterSkinDiv.id = 'admin-add-starter-skin-btn';
                    starterSkinDiv.innerHTML = `<div class="nav-btn-box" style="filter: hue-rotate(90deg) drop-shadow(0 4px 4px rgba(0,0,0,0.3));"><img src="icons/tworzenie.png" class="nav-icon"><span class="nav-label">Starter Skin</span></div>`;
                    starterSkinDiv.onclick = () => {
                        this.navigationManager.closePanel('more-options-panel');
                        if (this.onAddStarterSkinClick) this.onAddStarterSkinClick();
                    };
                    grid.insertBefore(starterSkinDiv, grid.firstChild);
                }
              }
          }, 500);
      }
  }
  
  async openOtherPlayerProfile(username) {
      await this.profileManager.openOtherPlayerProfile(username);
  }
  
  async openPlayerProfile() {
      await this.profileManager.openPlayerProfile();
  }
  
  setupButtonHandlers() {
      document.querySelectorAll('.panel-close-button').forEach(btn => {
          btn.onclick = () => { 
              const p = btn.closest('.panel-modal') || btn.closest('#skin-comments-panel'); 
              if(p) p.style.display = 'none'; 
          };
      });['more-options-panel','player-profile-panel','play-choice-panel','build-choice-panel','other-player-profile-panel'].forEach(id=>{
          const e=document.getElementById(id); 
          if(e) e.addEventListener('click', ev=>{ 
              if(ev.target.id===id){ 
                  e.style.display='none'; 
              } 
          });
      });
      
      document.querySelectorAll('.game-btn').forEach(btn => { 
          const t = this.getButtonType(btn); 
          btn.onclick = () => this.handleButtonClick(t, btn); 
      });
      
      const pBtn = document.getElementById('player-avatar-button'); 
      if (pBtn) pBtn.onclick = () => { this.openPlayerProfile(); };
      
      const friendsBtn = document.getElementById('btn-friends-open'); 
      if (friendsBtn) friendsBtn.onclick = () => { this.friendsManager.open(); }; 
      
      const topBarItems = document.querySelectorAll('.top-bar-item'); 
      topBarItems.forEach(item => { 
          if (item.textContent.includes('Poczta')) { 
              item.onclick = () => { this.mailManager.open(); }; 
          } 
      });
      
      const chatToggle = document.getElementById('chat-toggle-button'); 
      if (chatToggle) chatToggle.addEventListener('click', () => this.handleChatClick());
      
      const setClick = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; }; 
      
      setClick('size-choice-new-small', () => { this.closePanel('world-size-panel'); if(this.onWorldSizeSelected) this.onWorldSizeSelected(64); }); 
      setClick('size-choice-new-medium', () => { this.closePanel('world-size-panel'); if(this.onWorldSizeSelected) this.onWorldSizeSelected(128); }); 
      setClick('size-choice-new-large', () => { this.closePanel('world-size-panel'); if(this.onWorldSizeSelected) this.onWorldSizeSelected(256); });
      setClick('name-submit-btn', () => { const i=document.getElementById('name-input-field'); const v=i.value.trim(); if(v&&this.onNameSubmit){ this.onNameSubmit(v); document.getElementById('name-input-panel').style.display='none'; } else alert('Nazwa!'); });
      setClick('btn-open-news', () => { this.newsManager.open(); });
      setClick('btn-open-highscores', () => { this.highScoresManager.open(); });
      setClick('btn-nav-options', () => { if(this.onToggleFPS) { this.onToggleFPS(); this.showMessage("Przełączono FPS", "info"); } });
      setClick('logout-btn', () => { localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN); window.location.reload(); });
      setClick('btn-news-claim-all', () => { this.newsManager.claimReward(null); });
  }
  
  getButtonType(b) { 
      if(b.classList.contains('btn-zagraj')) return 'zagraj'; 
      if(b.classList.contains('btn-buduj')) return 'buduj'; 
      if(b.classList.contains('btn-kup')) return 'kup'; 
      if(b.classList.contains('btn-odkryj')) return 'odkryj'; 
      if(b.classList.contains('btn-wiecej')) return 'wiecej'; 
      return 'unknown'; 
  }
  
  handleButtonClick(t, b) { 
      b.style.transform='translateY(-1px) scale(0.95)'; 
      setTimeout(() => b.style.transform='', 150);
      if(t==='zagraj') this.navigationManager.openPanel('play-choice-panel');
      if(t==='buduj') this.navigationManager.openPanel('build-choice-panel');
      if(t==='odkryj') this.discoverManager.openChoicePanel();
      if(t==='wiecej') this.navigationManager.openPanel('more-options-panel');
      if(t==='kup' && this.onShopOpen) this.onShopOpen();
  }
  
  loadFriendsData() { this.friendsManager.loadFriendsData(); }
  
  showDiscoverPanel(type, category = null) {
      if (this.discoverManager && typeof this.discoverManager.showDiscoverPanel === 'function') {
          return this.discoverManager.showDiscoverPanel(type, category);
      }
      if (this.onDiscoverClick) {
          return this.onDiscoverClick(type, category);
      }
      console.warn('Discover panel handler is not available.');
      return null;
  }
  
  openPanel(id) { 
      const p = document.getElementById(id); 
      if(p){ 
          this.bringToFront(p); 
          p.style.display='flex'; 
          if(id==='friends-panel') this.friendsManager.loadFriendsData(); 
      } 
  }
  
  closePanel(id) { const p = document.getElementById(id); if(p) p.style.display='none'; }
  
  closeAllPanels() { 
      this.disposeCurrentPreview(); 
      document.querySelectorAll('.panel-modal').forEach(p => p.style.display='none'); 
      this.newsManager.close(); 
      this.mailManager.close(); 
      this.friendsManager.close(); 
      this.highScoresManager.close(); 
      this.wallManager.close(); 
      this.shopManager.close(); 
  }
  
  populateShop(blocks, isOwnedCallback, isSkyOwnedCallback = null) { 
      this.shopManager.open(blocks, isOwnedCallback, isSkyOwnedCallback); 
  }
  
  formatMemberSince(dateString) { 
      return this.profileManager.formatMemberSince(dateString);
  }
  
  showRewardPanel(data = null) { 
      console.log("showRewardPanel - należy przekierować do ParkourManager");
  }
}