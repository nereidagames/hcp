/* PLIK: GameStateManager.js */

import * as THREE from 'three';

export class GameStateManager {
    constructor(gameCore, uiManager, audioManager) {
        this.core = gameCore;
        this.ui = uiManager;
        this.audioManager = audioManager;
        
        this.currentState = 'Loading';
        
        this.managers = {
            playerController: null,
            cameraController: null,
            character: null,
            multiplayer: null,
            coin: null,
            build: null,
            skinBuild: null,
            prefabBuild: null,
            partBuild: null,
            parkour: null,
            digging: null
        };

        this.exploreScene = null;
        this.onRecreateController = null;
    }

    setManagers(managers) {
        this.managers = { ...this.managers, ...managers };
    }

    update(deltaTime) {
        if (this.currentState === 'Loading') return;

        // WSPÓLNA OBSŁUGA DLA STANÓW Z RUCHEM
        const hasMovement = ['MainMenu', 'ExploreMode', 'DiggingMode'].includes(this.currentState);
        
        if (hasMovement) {
            const { 
                playerController, 
                cameraController, 
                character, 
                multiplayer, 
                coin, 
                parkour, 
                digging 
            } = this.managers;

            // 1. Aktualizacja kamery i fizyki ruchu gracza
            if (playerController && cameraController && cameraController.update) {
                const rot = cameraController.update(deltaTime);
                if (playerController.update) {
                    playerController.update(deltaTime, rot);
                }
            }
            
            // 2. Aktualizacja wizualna postaci
            if (character && character.update) character.update(deltaTime);

            // 3. Aktualizacje modułów zależne od stanu
            if (this.currentState === 'DiggingMode') {
                // Logika kopania (oświetlenie, chunki, remote players kopalni)
                if (digging && digging.update) {
                    digging.update(deltaTime);
                }
            } else if (this.currentState === 'ExploreMode') {
                if (parkour && parkour.update) parkour.update(deltaTime);
                if (multiplayer && multiplayer.update) multiplayer.update(deltaTime);
            } else if (this.currentState === 'MainMenu') {
                if (multiplayer && multiplayer.update) multiplayer.update(deltaTime);
                if (coin && coin.update) coin.update(deltaTime);
            }

            // 4. JEDNOKROTNY RENDER WŁAŚCIWEJ SCENY
            let targetScene = this.core.scene; // domyślnie główna scena (Nexus)
            
            if (this.currentState === 'ExploreMode' && this.exploreScene) {
                targetScene = this.exploreScene;
            } else if (this.currentState === 'DiggingMode' && digging && digging.scene) {
                targetScene = digging.scene;
            }
            
            // Jedyne wywołanie renderera w klatce dla stanów z ruchem
            this.core.render(targetScene);
        }
        else if (this.currentState === 'BuildMode' && this.managers.build) {
            this.managers.build.update(deltaTime);
            this.core.render(this.managers.build.scene);
        } 
        else if (this.currentState === 'SkinBuilderMode' && this.managers.skinBuild) {
            this.managers.skinBuild.update(deltaTime);
            this.core.render(this.managers.skinBuild.scene);
        } 
        else if (this.currentState === 'PrefabBuilderMode' && this.managers.prefabBuild) {
            this.managers.prefabBuild.update(deltaTime);
            this.core.render(this.managers.prefabBuild.scene);
        } 
        else if (this.currentState === 'PartBuilderMode' && this.managers.partBuild) {
            this.managers.partBuild.update(deltaTime);
            this.core.render(this.managers.partBuild.scene);
        }
    }

    switchToDiggingMode() {
        if (this.currentState !== 'MainMenu') return;
        
        if (this.audioManager) this.audioManager.stopMusic();
        
        this.cleanUpMultiplayerEntities();
        
        this.currentState = 'DiggingMode';
        
        document.querySelector('.ui-overlay').style.display = 'none';
        
        const buttons = document.querySelector('.game-buttons');
        if (buttons) buttons.style.display = 'none';
        
        // Kontrolery kamery i gracza pozostają aktywne
        if (this.managers.cameraController) {
            this.managers.cameraController.enabled = true;
        }
        
        if (this.managers.playerController) {
            this.managers.playerController.enabled = true;
        }
        
        if (this.managers.digging) {
            this.managers.digging.startDiggingMode();
        }
        
        console.log("Switched to DiggingMode");
    }

    exitDiggingMode() {
        if (this.currentState !== 'DiggingMode') return;
        
        if (this.managers.digging) {
            this.managers.digging.cleanup();
        }
        
        document.getElementById('digging-ui-container').style.display = 'none';
        
        this.currentState = 'MainMenu';
        this.toggleGameControls(true);
        
        if (this.audioManager) this.audioManager.playNexusMusic();
        
        console.log("Exited DiggingMode");
    }

    switchToExploreMode(scene) {
        if (this.audioManager) this.audioManager.stopMusic();

        if (this.ui) this.ui.clearChat();
        this.exploreScene = scene;
        this.currentState = 'ExploreMode';
        document.querySelector('.ui-overlay').style.display = 'block';
        const buttons = document.querySelector('.game-buttons');
        if (buttons) buttons.style.display = 'none';
        this.ui.toggleMobileControls(true);
        const joystickZone = document.getElementById('joystick-zone');
        if (joystickZone) joystickZone.style.display = 'block'; 
    }

    cleanUpMultiplayerEntities() {
        if (this.managers.multiplayer) {
            this.managers.multiplayer.removeAllRemotePlayers();
        }
        const bubbles = document.querySelectorAll('.chat-bubble');
        bubbles.forEach(b => b.remove());
    }

    switchToBuildMode(size, isNexusMode = false, isLoginMapMode = false) {
        if (this.currentState !== 'MainMenu') return;
        
        if (this.audioManager) this.audioManager.stopMusic();
        
        this.cleanUpMultiplayerEntities();
        
        this.currentState = 'BuildMode';
        this.toggleGameControls(false);
        if (this.managers.build) {
            this.managers.build.enterBuildMode(size, isNexusMode, isLoginMapMode);
        }
    }

    switchToSkinBuilder() { 
        if (this.currentState !== 'MainMenu') return;
        if (this.audioManager) this.audioManager.stopMusic();
        this.cleanUpMultiplayerEntities();
        this.currentState = 'SkinBuilderMode'; 
        this.toggleGameControls(false); 
        if (this.managers.skinBuild) this.managers.skinBuild.enterBuildMode(); 
    }
    
    switchToPrefabBuilder() { 
        if (this.currentState !== 'MainMenu') return;
        if (this.audioManager) this.audioManager.stopMusic();
        this.cleanUpMultiplayerEntities();
        this.currentState = 'PrefabBuilderMode'; 
        this.toggleGameControls(false); 
        if (this.managers.prefabBuild) this.managers.prefabBuild.enterBuildMode(); 
    }
    
    switchToPartBuilder() { 
        if (this.currentState !== 'MainMenu') return;
        if (this.audioManager) this.audioManager.stopMusic();
        this.cleanUpMultiplayerEntities();
        this.currentState = 'PartBuilderMode'; 
        this.toggleGameControls(false); 
        if (this.managers.partBuild) this.managers.partBuild.enterBuildMode(); 
    }

    switchToMainMenu() {
        if (this.currentState === 'DiggingMode') {
            this.exitDiggingMode();
            return;
        }

        if (this.currentState === 'MainMenu') return;

        if (this.currentState === 'ExploreMode') {
            if (this.ui) this.ui.clearChat();
            if (this.managers.multiplayer) {
                this.managers.multiplayer.joinWorld('nexus');
                this.managers.multiplayer.setScene(this.core.scene);
            }
            if (this.managers.parkour) {
                this.managers.parkour.cleanup();
            }

            if (this.managers.character && this.managers.character.character) {
                this.core.scene.add(this.managers.character.character);
                if (this.managers.character.shadow) {
                    this.core.scene.add(this.managers.character.shadow);
                }
            }

            const exitBtn = document.getElementById('explore-exit-button');
            if (exitBtn) exitBtn.style.display = 'none';
            
            this.currentState = 'MainMenu';
            this.toggleGameControls(true);
            this.exploreScene = null; 

            if (this.onRecreateController) {
                this.onRecreateController(null);
            }

            if (this.audioManager) this.audioManager.playNexusMusic();
        } 
        else {
            if (this.currentState === 'BuildMode') this.managers.build.exitBuildMode();
            else if (this.currentState === 'SkinBuilderMode') this.managers.skinBuild.exitBuildMode();
            else if (this.currentState === 'PrefabBuilderMode') this.managers.prefabBuild.exitBuildMode();
            else if (this.currentState === 'PartBuilderMode') this.managers.partBuild.exitBuildMode();

            this.currentState = 'MainMenu';
            this.toggleGameControls(true);
            
            if (this.managers.multiplayer) {
                 this.managers.multiplayer.joinWorld('nexus');
            }

            if (this.onRecreateController) {
                this.onRecreateController(null);
            }

            if (this.audioManager) this.audioManager.playNexusMusic();
        }
    }

    toggleGameControls(visible) {
        const overlay = document.querySelector('.ui-overlay');
        if (overlay) overlay.style.display = visible ? 'block' : 'none';
        const buttons = document.querySelector('.game-buttons');
        if (buttons) buttons.style.display = visible ? 'flex' : 'none';
        
        if (this.managers.cameraController) {
            this.managers.cameraController.enabled = visible;
            if (visible && this.managers.cameraController.reset) {
                this.managers.cameraController.reset(); 
            }
        }
        
        if (this.managers.playerController) {
            this.managers.playerController.enabled = visible;
        }
        
        this.ui.toggleMobileControls(visible);
        
        const joystickZone = document.getElementById('joystick-zone');
        if (joystickZone && visible && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            joystickZone.style.display = 'block';
        }
    }
}