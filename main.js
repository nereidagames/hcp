/* PLIK: main.js */

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'; 
import { createBaseCharacter } from './character.js';

import { API_BASE_URL, STORAGE_KEYS } from './Config.js';
import { GameCore } from './GameCore.js';
import { AuthManager } from './AuthManager.js';
import { AssetLoader } from './AssetLoader.js';
import { GameStateManager } from './GameStateManager.js';
import { IntroManager } from './IntroManager.js';

import { BlockManager } from './BlockManager.js';
import { UIManager } from './ui.js';
import { SceneManager } from './scene.js';
import { CharacterManager } from './character.js';
import { CoinManager } from './CoinManager.js';
import { MultiplayerManager } from './multiplayer.js';
import { PlayerController, ThirdPersonCameraController } from './controls.js';
import { ParkourManager } from './ParkourManager.js';

// --- IMPORTY MANAGERÓW ---
import { AudioManager } from './AudioManager.js';
import { DiggingManager } from './DiggingManager.js';

import { BuildManager } from './BuildManager.js';
import { SkinBuilderManager } from './SkinBuilderManager.js';
import { PrefabBuilderManager } from './PrefabBuilderManager.js';
import { HyperCubePartBuilderManager } from './HyperCubePartBuilderManager.js';

import { SkinStorage } from './SkinStorage.js';
import { WorldStorage } from './WorldStorage.js';

class OptimizedGameCore {
    constructor(containerId = 'gameContainer') {
        this.container = document.getElementById(containerId);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ 
            antialias: false,
            powerPreference: "high-performance",
            precision: "mediump",
            depth: true,
            stencil: false 
        });
        
        const pixelRatio = Math.min(window.devicePixelRatio, 1.5); 
        this.renderer.setPixelRatio(pixelRatio * 0.75); 
        this.renderer.setSize(this.width, this.height);
        
        this.renderer.shadowMap.enabled = false;
        
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.zIndex = '0'; 

        this.css2dRenderer = new CSS2DRenderer();
        this.css2dRenderer.setSize(this.width, this.height);
        
        this.css2dRenderer.domElement.style.position = 'absolute';
        this.css2dRenderer.domElement.style.top = '0px';
        this.css2dRenderer.domElement.style.left = '0px';
        this.css2dRenderer.domElement.style.width = '100%';
        this.css2dRenderer.domElement.style.height = '100%';
        this.css2dRenderer.domElement.style.pointerEvents = 'none'; 
        this.css2dRenderer.domElement.style.zIndex = '5000'; 
        
        if (this.container) {
            this.container.appendChild(this.renderer.domElement);
            this.container.appendChild(this.css2dRenderer.domElement);
        }

        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
        if(this.css2dRenderer) {
            this.css2dRenderer.setSize(this.width, this.height);
        }
    }

    render(activeScene) {
        const sceneToRender = activeScene || this.scene;
        this.renderer.render(sceneToRender, this.camera);
        if(this.css2dRenderer) {
            this.css2dRenderer.render(sceneToRender, this.camera);
        }
    }
}

class BlockStarPlanetGame {
  constructor() {
    console.log("Uruchamianie silnika gry (Performance Mode)...");
    this.isGameRunning = false; 
    this.levelXpRequirements = [
      0, 50, 125, 250, 400, 750, 1500, 3000, 5000, 8000, 12000, 17000, 22500, 29000, 37500, 47000, 58500, 71500, 87000, 104500, 124000, 140000, 170000, 190000, 230000, 260000, 300000, 340000, 390000, 440000, 490000, 550000, 620000, 690000, 760000, 840000, 930000, 1020000, 1120000, 1230000, 1340000, 1460000, 1590000, 1730000, 1880000, 2030000, 2190000, 2360000, 2540000, 2730000, 2930000, 3150000, 3370000, 3600000, 3850000, 4100000, 4370000, 4650000, 4940000, 5250000, 5570000, 5900000, 6250000, 6610000, 6990000, 7380000, 7790000, 8220000, 8660000, 9120000, 9590000, 10000000, 10500000, 11100000, 11600000, 12200000, 12800000, 13400000, 14000000, 14700000, 15300000, 16000000, 16700000, 17500000, 18200000, 19000000, 19800000, 20600000, 21500000, 25000000, 30000000, 40000000, 50000000, 60000000, 70000000, 80000000, 90000000, 100000000, 125000000, 150000000, 200000000, 250000000, 300000000, 350000000, 400000000, 450000000, 500000000, 550000000, 600000000, 1000000000, 1500000000, 2000000000, 2500000000, 3000000000, 5000000000, 7000000000, 10000000000, 15000000000, 20000000000, 30000000000
    ];

    // Inicjalizacja rdzenia
    this.core = new OptimizedGameCore('gameContainer');
    this.scene = this.core.scene;
    this.camera = this.core.camera;
    this.renderer = this.core.renderer;

    this.blockManager = new BlockManager();
    
    this.ui = new UIManager((msg) => {
        if (this.multiplayer) this.multiplayer.sendMessage({ type: 'chatMessage', text: msg });
    });

    // Audio Manager
    this.audioManager = new AudioManager(this.camera);

    this.stateManager = new GameStateManager(this.core, this.ui, this.audioManager);
    this.auth = new AuthManager(this.startGame.bind(this));
    this.intro = new IntroManager(this.core, this.ui, this.startGame.bind(this), this.audioManager);
    this.loader = new AssetLoader(this.blockManager, this.onAssetsLoaded.bind(this));

    this.stats = new Stats();
    this.stats.dom.style.display = 'none'; 
    document.body.appendChild(this.stats.dom);
    this.isFPSEnabled = false;
    this.setupStats();

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.clock = new THREE.Clock();

    this.previewScene = null;
    this.previewCamera = null;
    this.previewRenderer = null;
    this.previewCharacter = null;
    this.isPreviewDragging = false;
    this.previewMouseX = 0;

    // Ładowanie definicji bloków (szybkie)
    this.blockManager.load();

    // Obsługa sekwencji ekranów ładowania
    this.handleInitialLoadingSequence();
  }

  handleInitialLoadingSequence() {
      // Czekamy 1 sekundę na ekranie studia (po załadowaniu skryptów)
      setTimeout(() => {
          const studioScreen = document.getElementById('studio-screen');
          const loadingScreen = document.getElementById('loading-screen');

          // Przejście: Ukryj Studio -> Pokaż Ładowanie Gry
          if (studioScreen) {
              studioScreen.style.opacity = '0';
              setTimeout(() => {
                  studioScreen.style.display = 'none';
                  if (loadingScreen) loadingScreen.style.display = 'flex';
                  
                  // Teraz rozpoczynamy faktyczne ładowanie assetów
                  this.loader.preload();
                  
              }, 500); // Czas trwania animacji css transition
          } else {
              // Fallback gdyby coś poszło nie tak z HTML
              this.loader.preload();
          }
      }, 1000); // 1 sekunda gapienia się na logo Nereida
  }

  onAssetsLoaded() {
      if (this.isGameRunning) return;
      this.isGameRunning = true;
      if (this.emergencyTimeout) clearTimeout(this.emergencyTimeout);

      console.log("Zasoby załadowane. Inicjalizacja UI...");
      
      try {
        this.ui.initialize(this.isMobile);

        // Uruchom muzykę logowania
        this.audioManager.playLoginMusic();

        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (token) {
            this.auth.showAuthScreen = () => {
                console.log("Sesja nieważna, uruchamianie Intro.");
                this.intro.start();
            };
            this.auth.checkSession(this.ui);
        } else {
            console.log("Brak tokenu, uruchamianie Intro.");
            this.intro.start();
        }

      } catch (e) {
          console.error("Błąd init:", e);
          this.intro.start();
      }
  }

  getLevelProgressFromTotalXp(totalXp) {
      let level = 1;
      while (level < this.levelXpRequirements.length && totalXp >= this.levelXpRequirements[level]) {
          level += 1;
      }

      const previousThreshold = this.levelXpRequirements[level - 1] || 0;
      const xpInCurrentLevel = Math.max(0, totalXp - previousThreshold);
      const xpToNextLevel = level < this.levelXpRequirements.length
          ? Math.max(0, this.levelXpRequirements[level] - previousThreshold)
          : 0;

      return { level, xp: xpInCurrentLevel, maxXp: xpToNextLevel };
  }

  async startGame(user, token, thumbnail) {
      console.log("Start gry dla:", user.username);
      
      // Zatrzymaj muzykę logowania i włącz nexus
      this.audioManager.stopLoginMusic();
      this.audioManager.playNexusMusic();

      if (this.intro) {
          this.intro.dispose();
      }
      
      while(this.scene.children.length > 0){ 
          this.scene.remove(this.scene.children[0]); 
      }
      
      localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, user.username);
      localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);

      this.ui.updatePlayerName(user.username);
      if (thumbnail) this.ui.updatePlayerAvatar(thumbnail);
      this.ui.checkAdminPermissions(user.username);
      this.ui.loadFriendsData();

      if (user) {
          const totalXp = parseInt(user.totalXp || user.total_xp || 0);
          const progress = this.getLevelProgressFromTotalXp(totalXp);
          const level = totalXp > 0 ? progress.level : (parseInt(user.level) || 1);
          const xp = totalXp > 0 ? progress.xp : (parseInt(user.xp) || 0);
          const maxXp = totalXp > 0 ? progress.maxXp : (parseInt(user.maxXp) || 100);
          this.ui.updateLevelInfo(level, xp, maxXp || 100);
      }
      if (user.pendingXp) this.ui.updatePendingRewards(user.pendingXp);
      if (user.ownedBlocks) this.blockManager.setOwnedBlocks(user.ownedBlocks);
      
      // Ustaw posiadane panoramy
      if (user.ownedSkies) {
          this.blockManager.setOwnedSkies(user.ownedSkies);
      }

      document.querySelector('.ui-overlay').style.display = 'block';

      this.sceneManager = new SceneManager(this.scene, this.loader.getLoadingManager(), this.blockManager);
      try { await this.sceneManager.initialize(); } catch(e) {}

      this.characterManager = new CharacterManager(this.scene);
      this.characterManager.loadCharacter();
      
      const safeY = this.sceneManager.getSafeY(0, 0);
      this.characterManager.character.position.set(0, safeY + 2.0, 0);

      if (user.currentSkinId) {
          SkinStorage.loadSkinData(user.currentSkinId).then(data => { if(data) this.characterManager.applySkin(data); });
      } else {
          const lastSkinId = SkinStorage.getLastUsedSkinId();
          if (lastSkinId) SkinStorage.loadSkinData(lastSkinId).then(data => { if(data) this.characterManager.applySkin(data); });
      }

      this.coinManager = new CoinManager(this.scene, this.ui, this.characterManager.character, user.coins);
      this.multiplayer = new MultiplayerManager(this.scene, this.ui, this.sceneManager, this.characterManager.materialsCache, this.coinManager);
      
      this.multiplayer.setLocalCharacter(this.characterManager.character);
      this.multiplayer.initialize(token);
      this.setupMultiplayerCallbacks();

      this.recreatePlayerController(this.sceneManager.collidableObjects, this.sceneManager.collisionMap);
      
      this.cameraController = new ThirdPersonCameraController(
          this.camera, 
          this.characterManager.character, 
          this.core.renderer.domElement, 
          this.sceneManager.collidableObjects, 
          { distance: 2.5, height: 2, floorY: this.sceneManager.FLOOR_TOP_Y }
      );
      this.cameraController.setIsMobile(this.isMobile);

      const loadingManager = this.loader.getLoadingManager();
      this.buildManager = new BuildManager(this, loadingManager, this.blockManager);
      this.skinBuilderManager = new SkinBuilderManager(this, loadingManager, this.blockManager);
      this.prefabBuilderManager = new PrefabBuilderManager(this, loadingManager, this.blockManager);
      this.partBuilderManager = new HyperCubePartBuilderManager(this, loadingManager, this.blockManager);
      this.parkourManager = new ParkourManager(this, this.ui);
      
      // DiggingManager
      this.diggingManager = new DiggingManager(this, this.ui);

      this.stateManager.setManagers({
          playerController: this.playerController,
          cameraController: this.cameraController,
          character: this.characterManager,
          multiplayer: this.multiplayer,
          coin: this.coinManager,
          build: this.buildManager,
          skinBuild: this.skinBuilderManager,
          prefabBuild: this.prefabBuilderManager,
          partBuild: this.partBuilderManager,
          parkour: this.parkourManager,
          digging: this.diggingManager
      });

      this.stateManager.onRecreateController = (collidables) => {
          const targetCollidables = collidables || this.sceneManager.collidableObjects;
          const targetMap = collidables ? null : this.sceneManager.collisionMap;
          this.recreatePlayerController(targetCollidables, targetMap);
          this.stateManager.setManagers({ playerController: this.playerController });
      };

      this.setupCharacterPreview();
      this.setupUIActions();
      this.stateManager.switchToMainMenu();
      this.animate();
      this.setupPositionUpdateLoop();
  }

  setupCharacterPreview() { 
      const container = document.getElementById('player-preview-renderer-container'); 
      if (!container) return; 
      
      const previewScene = new THREE.Scene(); 
      previewScene.background = new THREE.Color(0x333333); 
      const previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100); 
      previewCamera.position.set(0, 1, 4); 
      previewCamera.lookAt(0, 0, 0); 
      
      const previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, precision: "mediump" }); 
      previewRenderer.setSize(300, 300); 
      previewRenderer.setPixelRatio(0.8); 
      
      container.innerHTML = ''; 
      container.appendChild(previewRenderer.domElement); 
      
      const rect = container.getBoundingClientRect(); 
      if(rect.width > 0) { 
          previewRenderer.setSize(rect.width, rect.height); 
          previewCamera.aspect = rect.width / rect.height; 
          previewCamera.updateProjectionMatrix(); 
      } 
      
      const ambLight = new THREE.AmbientLight(0xffffff, 0.8); 
      previewScene.add(ambLight); 
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5); 
      dirLight.position.set(2, 5, 3); 
      previewScene.add(dirLight); 
      
      this.previewCharacter = new THREE.Group(); 
      createBaseCharacter(this.previewCharacter); 
      this.previewCharacter.position.y = -1; 
      previewScene.add(this.previewCharacter); 
      
      const onStart = (x) => { this.isPreviewDragging = true; this.previewMouseX = x; }; 
      const onMove = (x) => { if (this.isPreviewDragging && this.previewCharacter) { const delta = x - this.previewMouseX; this.previewCharacter.rotation.y += delta * 0.01; this.previewMouseX = x; } }; 
      const onEnd = () => { this.isPreviewDragging = false; }; 
      
      container.addEventListener('mousedown', (e) => onStart(e.clientX)); 
      window.addEventListener('mousemove', (e) => onMove(e.clientX)); 
      window.addEventListener('mouseup', onEnd); 
      container.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), {passive: false}); 
      window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), {passive: false}); 
      window.addEventListener('touchend', onEnd);

      this.previewScene = previewScene;
      this.previewCamera = previewCamera;
      this.previewRenderer = previewRenderer;
  }

  setupStats() { 
      const fpsPref = localStorage.getItem(STORAGE_KEYS.FPS_ENABLED) === 'true'; 
      if (fpsPref) { this.isFPSEnabled = true; this.stats.dom.style.display = 'block'; } 
      
      this.ui.onToggleFPS = () => { 
          this.isFPSEnabled = !this.isFPSEnabled; 
          this.stats.dom.style.display = this.isFPSEnabled ? 'block' : 'none'; 
          if(this.ui.updateFPSToggleText) this.ui.updateFPSToggleText(this.isFPSEnabled); 
          localStorage.setItem(STORAGE_KEYS.FPS_ENABLED, this.isFPSEnabled.toString()); 
      }; 
      
      if(this.ui.updateFPSToggleText) this.ui.updateFPSToggleText(this.isFPSEnabled); 
  }

  setupMultiplayerCallbacks() { 
      this.ui.onSendPrivateMessage = (recipient, text) => this.multiplayer.sendPrivateMessage(recipient, text); 
      
      this.coinManager.onCollect = () => {}; 
      
      const originalHandle = this.multiplayer.handleMessage.bind(this.multiplayer); 
      this.multiplayer.handleMessage = (msg) => { 
          originalHandle(msg); 
          if (msg.type === 'friendRequestReceived') { this.ui.showMessage(`Zaproszenie od ${msg.from}!`, 'info'); this.ui.loadFriendsData(); } 
          if (msg.type === 'friendRequestAccepted') { this.ui.showMessage(`${msg.by} przyjął zaproszenie!`, 'success'); this.ui.loadFriendsData(); } 
          if (msg.type === 'friendStatusChange') this.ui.loadFriendsData(); 
          if (msg.type === 'privateMessageSent' && this.ui.onMessageSent) this.ui.onMessageSent(msg); 
          if (msg.type === 'privateMessageReceived' && this.ui.onMessageReceived) this.ui.onMessageReceived(msg); 
      }; 
  }

  setupUIActions() {
      this.ui.onWorldSizeSelected = (size) => this.stateManager.switchToBuildMode(size);
      this.ui.onSkinBuilderClick = () => this.stateManager.switchToSkinBuilder();
      this.ui.onPrefabBuilderClick = () => this.stateManager.switchToPrefabBuilder();
      this.ui.onPartBuilderClick = () => this.stateManager.switchToPartBuilder();
      this.ui.onDiscoverClick = () => this.ui.openPanel('discover-choice-panel'); 
      this.ui.onPlayClick = () => this.ui.openPanel('play-choice-panel'); 
      this.ui.onOpenOtherProfile = (username) => this.ui.openOtherPlayerProfile(username);
      
      // Callback dla trybu kopania
      this.ui.onDiggingClick = () => this.stateManager.switchToDiggingMode();

      // Callbacki dla akcji w trybie kopania
      this.ui.onDiggingMove = (direction) => {
          if (this.diggingManager) this.diggingManager.movePlayer(direction);
      };
      
      this.ui.onDiggingMine = () => {
          if (this.diggingManager) this.diggingManager.startMining();
      };
      
      this.ui.onDiggingRedeem = () => {
          if (this.diggingManager) this.diggingManager.redeemCrystals();
      };
      
      this.ui.onDiggingUpgrade = (type) => {
          if (this.diggingManager) {
              if (type === 'laser') this.diggingManager.upgradeLaser();
              else if (type === 'storage') this.diggingManager.upgradeStorage();
          }
      };
      
      this.ui.onDiggingUseDynamite = () => {
          if (this.diggingManager) this.diggingManager.useDynamite();
      };

      // Callback dla zakupu panoram
      this.ui.onBuySky = async (skyItem) => {
          const result = await this.blockManager.buySky(skyItem.id, skyItem.name, skyItem.cost);
          if(result.success) {
              if(this.ui.showMessage) this.ui.showMessage(`Kupiono panoramę: ${skyItem.name}!`, 'success');
              this.coinManager.updateBalance(result.newBalance);
              return true;
          } else {
              if(this.ui.showMessage) this.ui.showMessage(result.message, 'error');
              return false;
          }
      };

      // BLOKADA STEROWANIA PRZY WYGRANEJ
      this.ui.onVictoryScreenOpen = () => {
          if (this.playerController) {
              this.playerController.enabled = false;
              this.playerController.keys = {}; 
              this.playerController.velocity.set(0, 0, 0); 
          }
          if (this.cameraController) {
              this.cameraController.enabled = false;
              this.cameraController.isDragging = false;
          }
          this.ui.toggleMobileControls(false); 
      };

      this.ui.onReplayParkour = () => {
          this.parkourManager.restartParkour(); 
          
          if (this.playerController) {
              this.playerController.reset(); 
          }
          
          if (this.cameraController) {
              this.cameraController.reset(); 
          }

          if (this.isMobile) {
              this.ui.toggleMobileControls(true); 
              const joy = document.getElementById('joystick-zone');
              if (joy) joy.style.display = 'block';
          }
      };

      this.ui.onExitParkour = () => this.stateManager.switchToMainMenu();

      this.ui.onPlayerAvatarClick = () => { 
          if (this.previewCharacter) { 
              while(this.previewCharacter.children.length > 4) { 
                  this.previewCharacter.remove(this.previewCharacter.children[this.previewCharacter.children.length-1]); 
              } 
              if (this.characterManager.skinContainer) { 
                  const skinClone = this.characterManager.skinContainer.clone(); 
                  this.previewCharacter.add(skinClone); 
              } 
          } 
      };

      this.ui.onWorldSelect = async (worldItem) => { 
          if (!worldItem.id) return; 
          const worldData = await WorldStorage.loadWorldData(worldItem.id); 
          if (worldData) { 
              worldData.id = worldItem.id; 
              this.loadAndExploreWorld(worldData); 
          } else { 
              this.ui.showMessage("Błąd świata.", "error"); 
          } 
      };

      this.ui.onBuyBlock = async (block) => { 
          const result = await this.blockManager.buyBlock(block.name, block.cost); 
          if(result.success) { 
              if(this.ui.showMessage) this.ui.showMessage(`Kupiono: ${block.name}!`, 'success'); 
              this.coinManager.updateBalance(result.newBalance); 
              return true;
          } else { 
              if(this.ui.showMessage) this.ui.showMessage(result.message, 'error'); 
              return false;
          } 
      };

      this.ui.onSkinSelect = async (skinId, skinName, thumbnail, ownerId) => { 
          const myId = parseInt(localStorage.getItem(STORAGE_KEYS.USER_ID) || "0"); 
          if (ownerId && ownerId !== myId) { 
              this.ui.showMessage("Nie możesz ubrać cudzego skina!", "error"); 
              return; 
          } 
          const data = await SkinStorage.loadSkinData(skinId); 
          if (data) { 
              this.characterManager.applySkin(data); 
              this.ui.updatePlayerAvatar(thumbnail); 
              this.multiplayer.sendMessage({ type: 'mySkin', skinData: data }); 
              this.ui.showMessage(`Założono: ${skinName}`, 'success'); 

              try {
                  const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
                  await fetch(`${API_BASE_URL}/api/user/equip`, {
                      method: 'POST',
                      headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}` 
                      },
                      body: JSON.stringify({ skinId, thumbnail })
                  });
              } catch (e) {
                  console.error("Błąd zapisu skina na serwerze", e);
              }
          } 
      };
      
      this.ui.onUsePrefab = async (item) => {
          this.stateManager.switchToPrefabBuilder();
          setTimeout(async () => {
              await this.prefabBuilderManager.selectPrefab(item.id);
          }, 100);
      };

      this.ui.onUsePart = async (item) => {
          this.stateManager.switchToPartBuilder();
          setTimeout(async () => {
              await this.partBuilderManager.selectPart(item.id);
          }, 100);
      };

      this.ui.onEditNexusClick = () => {
           this.stateManager.switchToBuildMode(64, true, false);
      };
      
      this.ui.onEditLoginMapClick = () => {
           this.stateManager.switchToBuildMode(64, false, true);
      };

      this.ui.onAddStarterSkinClick = () => {
          this.stateManager.managers.skinBuild.enterBuildMode(true);
          this.stateManager.currentState = 'SkinBuilderMode';
          this.stateManager.toggleGameControls(false);
      };

      this.ui.onShopOpen = () => {
          const blocks = this.blockManager.getAllBlockDefinitions();
          // Przekazujemy callback dla panoram
          this.ui.populateShop(blocks, 
              (name) => this.blockManager.isOwned(name),
              (skyId) => this.blockManager.isSkyOwned(skyId)
          );
      };
  }

  recreatePlayerController(collidables, collisionMap = null) { 
      if(this.playerController) this.playerController.destroy(); 
      
      const map = collisionMap || this.sceneManager.collisionMap;

      this.playerController = new PlayerController(
          this.characterManager.character, 
          collidables, 
          map, 
          { moveSpeed: 8, jumpForce: 18, gravity: 50, groundRestingY: this.sceneManager.FLOOR_TOP_Y }
      ); 
      this.playerController.setIsMobile(this.isMobile); 
  }

  setupPositionUpdateLoop() { 
      if (this.positionUpdateInterval) clearInterval(this.positionUpdateInterval); 
      this.positionUpdateInterval = setInterval(() => { 
          if ((this.stateManager.currentState === 'MainMenu' || this.stateManager.currentState === 'ExploreMode') && this.characterManager && this.characterManager.character) { 
              if(this.multiplayer) { 
                  this.multiplayer.sendMyPosition(this.characterManager.character.position, this.characterManager.character.quaternion); 
              } 
          } 
      }, 50); 
  }

  loadAndExploreWorld(worldData) {
      const worldBlocksData = Array.isArray(worldData) ? worldData : (worldData.blocks || []);
      const worldSize = Array.isArray(worldData) ? 64 : (worldData.size || 64);
      
      const exploreScene = new THREE.Scene();
      exploreScene.background = new THREE.Color(0x87CEEB);
      
      // Dodaj panoramę nieba dla świata
      const skyMesh = new THREE.Mesh(
          new THREE.SphereGeometry(500, 60, 40),
          new THREE.MeshBasicMaterial({
              map: new THREE.TextureLoader().load('textures/sky/clouds.png'),
              side: THREE.BackSide
          })
      );
      exploreScene.add(skyMesh);
      
      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      exploreScene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(20, 40, 20);
      exploreScene.add(dirLight);

      const globalCollidables = [];
      const loader = this.loader.getTextureLoader();
      const materials = {};

      const floorGeo = new THREE.BoxGeometry(worldSize, 1, worldSize);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0x559022 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.position.y = -0.5;
      exploreScene.add(floor);
      globalCollidables.push(floor);
      
      const barrierHeight = 100;
      const half = worldSize / 2;
      const barrierMat = new THREE.MeshBasicMaterial({ visible: false });
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(worldSize, barrierHeight, 1), barrierMat); w1.position.set(0, 50, half); exploreScene.add(w1); globalCollidables.push(w1);
      const w2 = new THREE.Mesh(new THREE.BoxGeometry(worldSize, barrierHeight, 1), barrierMat); w2.position.set(0, 50, -half); exploreScene.add(w2); globalCollidables.push(w2);
      const w3 = new THREE.Mesh(new THREE.BoxGeometry(1, barrierHeight, worldSize), barrierMat); w3.position.set(half, 50, 0); exploreScene.add(w3); globalCollidables.push(w3);
      const w4 = new THREE.Mesh(new THREE.BoxGeometry(1, barrierHeight, worldSize), barrierMat); w4.position.set(-half, 50, 0); exploreScene.add(w4); globalCollidables.push(w4);

      const tempCollisionMap = new Map();
      const blocksByTexture = {};

      worldBlocksData.forEach(data => {
          if (data.id !== undefined && !data.texturePath) {
              data.texturePath = this.blockManager.getTextureById(data.id);
              if (!data.name) {
                  data.name = this.blockManager.getBlockNameById(data.id);
              }
          }

          if(data.texturePath) {
              if (!blocksByTexture[data.texturePath]) {
                  blocksByTexture[data.texturePath] = [];
              }
              blocksByTexture[data.texturePath].push(data);
          }
      });
      
      const dummy = new THREE.Object3D();
      
      for (const [texturePath, blocks] of Object.entries(blocksByTexture)) {
          let mat = materials[texturePath];
          if(!mat) {
              const tex = loader.load(texturePath);
              tex.magFilter = THREE.NearestFilter;
              tex.minFilter = THREE.NearestFilter;
              mat = new THREE.MeshBasicMaterial({ map: tex });
              materials[texturePath] = mat;
          }
          
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const instancedMesh = new THREE.InstancedMesh(geometry, mat, blocks.length);
          instancedMesh.castShadow = false;
          instancedMesh.receiveShadow = false;
          
          blocks.forEach((data, index) => {
              dummy.position.set(data.x, data.y, data.z);
              dummy.updateMatrix();
              instancedMesh.setMatrixAt(index, dummy.matrix);
              
              const key = `${Math.floor(data.x)},${Math.floor(data.y)},${Math.floor(data.z)}`;
              tempCollisionMap.set(key, {
                  isBlock: true,
                  boundingBox: new THREE.Box3().setFromCenterAndSize(
                      new THREE.Vector3(data.x, data.y, data.z),
                      new THREE.Vector3(1, 1, 1)
                  )
              });
          });
          
          instancedMesh.instanceMatrix.needsUpdate = true;
          exploreScene.add(instancedMesh);
          globalCollidables.push(instancedMesh);
      }

      exploreScene.add(this.characterManager.character);
      if (worldData.spawnPoint) {
          this.characterManager.character.position.set(worldData.spawnPoint.x, worldData.spawnPoint.y, worldData.spawnPoint.z);
      } else {
          this.characterManager.character.position.set(0, 5, 0);
      }

      this.stateManager.exploreScene = exploreScene;
      this.multiplayer.setScene(exploreScene);
      
      this.multiplayer.joinWorld(worldData.id, worldData.spawnPoint); 
      
      this.stateManager.switchToExploreMode(exploreScene);
      
      const exitBtn = document.getElementById('explore-exit-button');
      if(exitBtn) {
          exitBtn.style.display = 'flex'; 
          exitBtn.onclick = () => { this.stateManager.switchToMainMenu(); };
      }

      if (this.parkourManager) {
          const fixedWorldData = { ...worldData, blocks: worldBlocksData };
          this.parkourManager.init(fixedWorldData);
      }

      this.recreatePlayerController(globalCollidables, tempCollisionMap);
      this.stateManager.setManagers({ playerController: this.playerController });
      
      if(this.cameraController) this.cameraController.destroy();
      this.cameraController = new ThirdPersonCameraController(
          this.camera, 
          this.characterManager.character, 
          this.core.renderer.domElement, 
          globalCollidables, 
          { distance: 2.5, height: 2, floorY: -0.5 }
      );
      this.cameraController.setIsMobile(this.isMobile);
      this.cameraController.enabled = true;
      this.stateManager.managers.cameraController = this.cameraController;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.isFPSEnabled) this.stats.update();
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.stateManager.update(delta);

    const previewPanel = document.getElementById('player-preview-panel');
    if (this.previewRenderer && previewPanel && previewPanel.style.display === 'flex') {
      if (this.previewCharacter && !this.isPreviewDragging) { this.previewCharacter.rotation.y += 0.005; }
      this.previewRenderer.render(this.previewScene, this.previewCamera);
    }
    
    if (this.characterManager && this.cameraController && this.cameraController.enabled) {
        this.characterManager.updateTransparency(this.camera);
    }
  }
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => new BlockStarPlanetGame()); } else { new BlockStarPlanetGame(); }
