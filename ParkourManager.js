/* PLIK: ParkourManager.js */

import * as THREE from 'three';
import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

// Szablon HTML dla ekranu zwycięstwa
const VICTORY_TEMPLATE = `
    <style>
        .bsp-overlay-bg {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: radial-gradient(circle, rgba(142,68,173,0.9) 0%, rgba(44,62,80,0.95) 100%);
            z-index: 10002;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Titan One', cursive;
        }
        .bsp-victory-container { display: flex; gap: 40px; align-items: center; transform: scale(0.9); }
        .bsp-title-header { position: absolute; top: 10%; display: flex; align-items: center; gap: 15px; }
        .bsp-cup-icon { width: 80px; height: 80px; background: url('icons/icon-level.png') center/contain no-repeat; filter: hue-rotate(45deg); }
        .bsp-gotowe-text { font-size: 80px; background: linear-gradient(to bottom, #f1c40f, #e67e22); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 4px 4px 0 #c0392b; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5)); }
        .bsp-center-circle { width: 400px; height: 400px; background: rgba(0,0,0,0.5); border-radius: 50%; border: 10px solid #555; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 50px #000; }
        .bsp-finish-flag { font-size: 30px; margin-right: 10px; }
        .bsp-main-time { font-size: 50px; color: #00cec9; text-shadow: 3px 3px 0 #000; margin-bottom: 20px; }
        .bsp-record-row { font-size: 18px; margin: 5px 0; display: flex; justify-content: space-between; width: 80%; }
        .bsp-lbl { color: #a29bfe; text-align: right; width: 55%; text-shadow: 1px 1px 0 #000; }
        .bsp-val { color: white; text-align: left; width: 40%; font-family: monospace; font-weight: bold; }
        .bsp-pb-badge { position: absolute; left: -120px; bottom: 20px; width: 150px; text-align: center; }
        .bsp-pb-icon { width: 100px; height: 100px; background: url('icons/vip_badge.png') center/contain no-repeat; margin: 0 auto; filter: hue-rotate(180deg); }
        .bsp-pb-text { color: #00cec9; font-size: 16px; text-shadow: 2px 2px 0 #000; margin-top: 5px; }
        .bsp-map-card { width: 200px; height: 280px; background: #74b9ff; border: 4px solid white; border-radius: 15px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 10px 10px 0 rgba(0,0,0,0.3); }
        .bsp-map-header { background: #0984e3; color: white; text-align: center; padding: 5px; font-size: 14px; text-shadow: 1px 1px 0 #000; }
        .bsp-map-thumb { flex: 1; background-color: #000; background-size: cover; background-position: center; }
        .bsp-map-stats { height: 40px; background: #0984e3; display: flex; justify-content: space-around; align-items: center; color: white; font-size: 14px; text-shadow: 1px 1px 0 #000; }
        .bsp-side-actions { display: flex; flex-direction: column; gap: 10px; margin-left: 10px; }
        .bsp-action-btn-sq { width: 50px; height: 50px; background: #3498db; border: 3px solid white; border-radius: 10px; box-shadow: 0 4px 0 #2980b9; display: flex; justify-content: center; align-items: center; cursor: pointer; }
        .bsp-action-btn-sq:active { transform: translateY(3px); box-shadow: none; }
        #bsp-continue-btn { position: absolute; right: 20px; bottom: 20px; width: 60px; height: 60px; background: #2ecc71; border: 3px solid white; border-radius: 10px; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 30px; color: white; }
        @media (max-width: 600px) {
            .bsp-victory-container { transform: scale(0.7); }
            .bsp-gotowe-text { font-size: 50px; }
            .bsp-center-circle { width: 280px; height: 280px; }
            .bsp-main-time { font-size: 30px; }
            .bsp-record-row { font-size: 12px; }
            .bsp-map-card { width: 150px; height: 200px; }
            .bsp-pb-badge { left: -80px; bottom: 0; transform: scale(0.7); }
        }
    </style>

    <div id="bsp-victory-screen" class="bsp-overlay-bg">
        <div class="bsp-title-header">
            <div class="bsp-cup-icon"></div>
            <div class="bsp-gotowe-text">GOTOWE!</div>
            <div class="bsp-cup-icon" style="transform: scaleX(-1);"></div>
        </div>
        <div class="bsp-victory-container">
            <div class="bsp-pb-badge" id="bsp-new-record-badge" style="display:none;">
                <div class="bsp-pb-icon"></div>
                <div class="bsp-pb-text">Nowy Osobisty Rekord</div>
            </div>
            <div class="bsp-center-circle">
                <div style="display:flex; align-items:center;">
                    <span class="bsp-finish-flag">🏁</span>
                    <span id="bsp-run-time" class="bsp-main-time">00:00:00</span>
                </div>
                <div class="bsp-record-row">
                    <span class="bsp-lbl" style="color:#d6a2e8;">Najlepszy rekord</span>
                    <span id="bsp-rec-all" class="bsp-val">--:--.--</span>
                </div>
                <div class="bsp-record-row">
                    <span class="bsp-lbl" style="color:#74b9ff;">Najlepszy dzienny</span>
                    <span id="bsp-rec-day" class="bsp-val">--:--.--</span>
                </div>
                <div class="bsp-record-row">
                    <span class="bsp-lbl" style="color:#55efc4;">Najlepszy osobisty</span>
                    <span id="bsp-rec-personal" class="bsp-val">--:--.--</span>
                </div>
                <div style="margin-top:10px; width:80px; height:120px; background:url('icons/avatar_placeholder.png') center/contain no-repeat;"></div>
            </div>
            <div style="display:flex;">
                <div class="bsp-map-card">
                    <div id="bsp-map-name" class="bsp-map-header">Parkour</div>
                    <div id="bsp-map-thumb" class="bsp-map-thumb"></div>
                    <div class="bsp-map-stats">
                        <span>👍 <span id="bsp-map-likes">0</span></span>
                        <span>🎮 <span>0</span></span>
                    </div>
                </div>
                <div class="bsp-side-actions">
                    <div class="bsp-action-btn-sq"><img src="icons/icon-like.png" style="width:30px;"></div>
                    <div class="bsp-action-btn-sq">💬</div>
                </div>
            </div>
        </div>
        <div id="bsp-continue-btn">➜</div>
    </div>
`;

// Szablon HTML dla ekranu nagród
const REWARD_TEMPLATE = `
    <style>
        .bsp-reward-container { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; }
        .bsp-reward-title { font-size: 40px; color: white; text-shadow: 3px 3px 0 #000; margin-bottom: 20px; }
        .bsp-reward-boxes { display: flex; gap: 20px; justify-content: center; }
        .bsp-reward-box { width: 250px; height: 180px; border-radius: 15px; border: 4px solid white; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
        .bsp-reward-box.blue { background: #74b9ff; }
        .bsp-reward-box.gold { background: #f1c40f; position: relative; }
        .bsp-box-header { text-align: center; color: white; padding: 8px; font-size: 16px; text-shadow: 1px 1px 0 rgba(0,0,0,0.3); font-weight: bold; }
        .bsp-reward-box.blue .bsp-box-header { background: #0984e3; }
        .bsp-reward-box.gold .bsp-box-header { background: #f39c12; }
        .bsp-box-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; color: white; font-size: 24px; text-shadow: 2px 2px 0 rgba(0,0,0,0.2); }
        .bsp-vip-promo { position: absolute; right: -10px; top: 40%; background: #f39c12; border: 2px solid white; border-radius: 8px; padding: 5px; transform: rotate(-10deg); box-shadow: 2px 2px 5px rgba(0,0,0,0.3); text-align: center; font-size: 10px; color: white; text-shadow: 1px 1px 0 #000; cursor: pointer; }
        .bsp-progress-wrapper { width: 600px; height: 50px; position: relative; display: flex; align-items: center; justify-content: center; margin-top: 20px; }
        .bsp-star-badge { width: 70px; height: 70px; background: url('icons/icon-level.png') center/contain no-repeat; display: flex; justify-content: center; align-items: center; font-size: 24px; color: white; text-shadow: 2px 2px 0 #000; z-index: 2; }
        .bsp-bar-frame { flex: 1; height: 40px; background: rgba(0,0,0,0.5); border: 3px solid #3498db; border-radius: 20px; margin: 0 -15px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .bsp-bar-fill { position: absolute; left: 0; top: 0; bottom: 0; background: #2ecc71; width: 0%; transition: width 1s ease-out; }
        .bsp-bar-text { position: relative; z-index: 1; color: white; font-size: 14px; text-shadow: 1px 1px 0 #000; }
        .bsp-nav-row { display: flex; gap: 20px; margin-top: 30px; }
        .bsp-nav-btn { width: 90px; height: 90px; border: 4px solid rgba(0,0,0,0.2); border-radius: 15px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: transform 0.1s; box-shadow: 0 8px 0 rgba(0,0,0,0.3); }
        .bsp-nav-btn:active { transform: translateY(5px); box-shadow: 0 3px 0 rgba(0,0,0,0.3); }
        .btn-home { background-color: #c0392b; }
        .btn-replay { background-color: #3498db; }
        .btn-next { background-color: #7bed9f; }
        .bsp-icon-large { width: 60%; height: 60%; background-size: contain; background-repeat: no-repeat; background-position: center; }
        @media (max-width: 600px) {
            .bsp-reward-title { font-size: 24px; }
            .bsp-reward-box { width: 150px; height: 120px; }
            .bsp-box-content { font-size: 16px; }
            .bsp-progress-wrapper { width: 90vw; transform: scale(0.9); }
            .bsp-nav-btn { width: 60px; height: 60px; }
        }
    </style>

    <div id="bsp-reward-screen" class="bsp-overlay-bg">
        <h1 class="bsp-reward-title">Otrzymujesz:</h1>
        <div class="bsp-reward-boxes">
            <div class="bsp-reward-box blue">
                <div class="bsp-box-header">Bez VIP</div>
                <div class="bsp-box-content">
                    <div>+<span id="bsp-rew-xp">0</span> ⭐</div>
                    <div>+<span id="bsp-rew-coins">0</span> 🟡</div>
                </div>
            </div>
            <div class="bsp-reward-box gold">
                <div class="bsp-box-header">Z VIP</div>
                <div class="bsp-box-content">
                    <div>+<span id="bsp-vip-xp">0</span> ⭐</div>
                    <div>+<span id="bsp-vip-coins">0</span> 🟡</div>
                </div>
                <div class="bsp-vip-promo">Zostań<br><b>VIP</b><br>teraz!</div>
            </div>
        </div>
        <div class="bsp-progress-wrapper">
            <div class="bsp-star-badge" id="bsp-lvl-cur">1</div>
            <div class="bsp-bar-frame">
                <div id="bsp-xp-fill" class="bsp-bar-fill"></div>
                <span id="bsp-xp-text" class="bsp-bar-text">0/100</span>
            </div>
            <div class="bsp-star-badge" id="bsp-lvl-next">2</div>
        </div>
        <div class="bsp-nav-row">
            <div id="bsp-btn-home" class="bsp-nav-btn btn-home"><div class="bsp-icon-large" style="background-image:url('icons/icon-home.png')"></div></div>
            <div id="bsp-btn-replay" class="bsp-nav-btn btn-replay"><div class="bsp-icon-large" style="background-image:url('icons/icon-restart.png')"></div></div>
            <div id="bsp-btn-next" class="bsp-nav-btn btn-next"><div class="bsp-icon-large" style="background-image:url('icons/icon-next.png')"></div></div>
        </div>
    </div>
`;

export class ParkourManager {
    constructor(game, uiManager) {
        this.game = game;
        this.ui = uiManager;
        this.isRunning = false;
        this.elapsedTime = 0;
        
        this.startPositions = [];
        this.metaPositions = [];
        this.currentWorldId = null;
        
        this.pendingRewardData = null;
        
        // Callbacki dla UI
        this.onVictoryScreenOpen = null;
        this.onExitParkour = null;
        this.onReplayParkour = null;
    }
    
    initialize() {
        // Wstrzyknij UI do modals-layer
        const modalsLayer = document.getElementById('modals-layer');
        if (modalsLayer) {
            modalsLayer.insertAdjacentHTML('beforeend', VICTORY_TEMPLATE);
            modalsLayer.insertAdjacentHTML('beforeend', REWARD_TEMPLATE);
        }
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const continueBtn = document.getElementById('bsp-continue-btn');
        if (continueBtn) {
            continueBtn.onclick = () => {
                const victoryScreen = document.getElementById('bsp-victory-screen');
                if (victoryScreen) {
                    victoryScreen.style.display = 'none';
                    this.showRewardScreen(this.pendingRewardData);
                }
            };
        }
        
        const homeBtn = document.getElementById('bsp-btn-home');
        if (homeBtn) homeBtn.onclick = () => {
            const rewardScreen = document.getElementById('bsp-reward-screen');
            if (rewardScreen) rewardScreen.style.display = 'none';
            if (this.onExitParkour) this.onExitParkour();
        };
        
        const replayBtn = document.getElementById('bsp-btn-replay');
        if (replayBtn) replayBtn.onclick = () => {
            const rewardScreen = document.getElementById('bsp-reward-screen');
            if (rewardScreen) rewardScreen.style.display = 'none';
            if (this.onReplayParkour) this.onReplayParkour();
        };
        
        const nextBtn = document.getElementById('bsp-btn-next');
        if (nextBtn) nextBtn.onclick = () => {
            const rewardScreen = document.getElementById('bsp-reward-screen');
            if (rewardScreen) rewardScreen.style.display = 'none';
            if (this.onExitParkour) this.onExitParkour();
        };
    }
    
    init(worldData) {
        this.startPositions = [];
        this.metaPositions = [];
        this.isRunning = false;
        this.elapsedTime = 0;
        
        // Zapisujemy ID świata, aby wiedzieć, do której mapy przypisać rekord
        this.currentWorldId = worldData.id || null;
        
        if (worldData && worldData.blocks) {
            worldData.blocks.forEach(block => {
                if (block.name === 'Parkour Start') {
                    this.startPositions.push(new THREE.Vector3(block.x, block.y + 1.0, block.z));
                }
                if (block.name === 'Parkour Meta') {
                    this.metaPositions.push(new THREE.Vector3(block.x, block.y + 1.0, block.z));
                }
            });
        }
        
        if (this.startPositions.length > 0) {
            this.ui.setParkourTimerVisible(true);
            this.ui.updateParkourTimer("00:00.00");
        } else {
            this.ui.setParkourTimerVisible(false);
        }
    }
    
    restartParkour() {
        this.isRunning = false;
        this.elapsedTime = 0;
        this.ui.updateParkourTimer("00:00.00");
        this.hideVictory();
        
        if (this.startPositions.length > 0 && this.game.characterManager.character) {
            const start = this.startPositions[0];
            // Teleportuj gracza +0.5 wyżej żeby nie utknął w bloku
            this.game.characterManager.character.position.set(start.x, start.y + 0.5, start.z);
            
            // Reset prędkości w kontrolerze
            if (this.game.playerController) {
                this.game.playerController.velocity.set(0, 0, 0);
            }
        }
    }
    
    update(deltaTime) {
        if (this.startPositions.length === 0) return;
        
        const playerPos = this.game.characterManager.character.position;
        
        // Sprawdź czy gracz jest na STARCIE (reset czasu)
        let onStart = false;
        for (const startPos of this.startPositions) {
            const dx = Math.abs(playerPos.x - startPos.x);
            const dz = Math.abs(playerPos.z - startPos.z);
            const dy = Math.abs(playerPos.y - startPos.y);
            
            if (dx < 0.8 && dz < 0.8 && dy < 2.0) {
                onStart = true;
                break;
            }
        }
        
        if (onStart) {
            if (this.isRunning || this.elapsedTime > 0) {
                this.isRunning = false;
                this.elapsedTime = 0;
                this.ui.updateParkourTimer("00:00.00");
            }
            return;
        }
        
        // Jeśli zszedł ze startu, zacznij liczyć
        if (!this.isRunning && this.elapsedTime === 0) {
            this.isRunning = true;
        }
        
        if (this.isRunning) {
            this.elapsedTime += deltaTime;
            this.ui.updateParkourTimer(this.formatTime(this.elapsedTime));
            
            // Sprawdź czy gracz jest na MECIE
            for (const metaPos of this.metaPositions) {
                const distance = playerPos.distanceTo(metaPos);
                if (distance < 1.5) {
                    this.finishRun();
                    break;
                }
            }
        }
    }
    
    async finishRun() {
        this.isRunning = false;
        const finalTime = this.formatTime(this.elapsedTime);
        const timeMs = Math.floor(this.elapsedTime * 1000);
        
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        let rewardData = null;
        
        // Jeśli mamy token i ID świata, wysyłamy wynik na serwer
        if (token && this.currentWorldId) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/parkour/complete`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                        timeMs: timeMs,
                        worldId: this.currentWorldId 
                    })
                });
                // Serwer zwraca obiekt z rekordami (allTime, daily, personal), nagrodami i danymi mapy
                rewardData = await response.json();
            } catch (e) {
                console.error("Błąd nagrody parkour:", e);
            }
        }
        
        this.showVictoryScreen(finalTime, rewardData);
    }
    
    showVictoryScreen(timeStr, rewardData) {
        if (this.onVictoryScreenOpen) this.onVictoryScreenOpen();
        
        const victoryScreen = document.getElementById('bsp-victory-screen');
        if (victoryScreen) {
            this.ui.bringToFront(victoryScreen);
            victoryScreen.style.display = 'flex';
            
            if (rewardData && rewardData.records) {
                document.getElementById('bsp-run-time').textContent = rewardData.records.formattedTime;
                document.getElementById('bsp-rec-all').textContent = rewardData.records.allTime;
                document.getElementById('bsp-rec-day').textContent = rewardData.records.daily;
                document.getElementById('bsp-rec-personal').textContent = rewardData.records.personal;
                
                const badge = document.getElementById('bsp-new-record-badge');
                if (badge) badge.style.display = rewardData.records.isNewPb ? 'block' : 'none';
            } else {
                document.getElementById('bsp-run-time').textContent = timeStr;
            }
            
            if (rewardData && rewardData.map) {
                document.getElementById('bsp-map-name').textContent = rewardData.map.name;
                if (rewardData.map.thumbnail) {
                    document.getElementById('bsp-map-thumb').style.backgroundImage = `url(${rewardData.map.thumbnail})`;
                }
            }
        }
        
        this.pendingRewardData = rewardData;
    }
    
    showRewardScreen(rewardData) {
        const rewardScreen = document.getElementById('bsp-reward-screen');
        if (!rewardScreen) return;
        
        this.ui.bringToFront(rewardScreen);
        rewardScreen.style.display = 'flex';
        
        if (rewardData) {
            document.getElementById('bsp-rew-xp').textContent = rewardData.rewards.standard.xp;
            document.getElementById('bsp-rew-coins').textContent = rewardData.rewards.standard.coins;
            document.getElementById('bsp-vip-xp').textContent = rewardData.rewards.vip.xp;
            document.getElementById('bsp-vip-coins').textContent = rewardData.rewards.vip.coins;
            
            const lvl = rewardData.newLevel;
            const xp = rewardData.newXp;
            const max = rewardData.maxXp;
            
            document.getElementById('bsp-lvl-cur').textContent = lvl;
            document.getElementById('bsp-lvl-next').textContent = lvl + 1;
            document.getElementById('bsp-xp-text').textContent = `${xp}/${max}`;
            
            setTimeout(() => {
                const percent = Math.min(100, Math.max(0, (xp / max) * 100));
                document.getElementById('bsp-xp-fill').style.width = `${percent}%`;
            }, 100);
            
            if (this.ui.updateCoinCounter) {
                this.ui.updateCoinCounter(rewardData.newCoins);
            }
            if (this.ui.updateLevelInfo) {
                this.ui.updateLevelInfo(lvl, xp, max);
            }
        }
    }
    
    hideVictory() {
        const victoryScreen = document.getElementById('bsp-victory-screen');
        const rewardScreen = document.getElementById('bsp-reward-screen');
        if (victoryScreen) victoryScreen.style.display = 'none';
        if (rewardScreen) rewardScreen.style.display = 'none';
        this.pendingRewardData = null;
    }
    
    cleanup() {
        this.isRunning = false;
        this.ui.setParkourTimerVisible(false);
        this.hideVictory();
    }
    
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds * 100) % 100);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
}