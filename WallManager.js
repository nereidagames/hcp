/* PLIK: WallManager.js */

import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

const TEMPLATE = `
    <style>
        .wall-container {
            width: 100%;
            height: 100%;
            background-color: #0b598d;
            display: flex;
            flex-direction: column;
            position: relative;
            font-family: 'Titan One', cursive;
            overflow: hidden;
        }

        /* 1. GŁÓWNY NIEBIESKI PASEK NAWIGACJI ŚCIANY */
        .wall-header-bar {
            height: 54px;
            background: linear-gradient(to bottom, #3498db, #2475b0);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            border-bottom: 2px solid rgba(255,255,255,0.3);
            flex-shrink: 0;
            z-index: 10;
        }

        /* PRZYCISK POWROTU: Usunięto czerwoną obwódkę, tło i cienie */
        .wall-back-btn {
            width: 46px;
            height: 46px;
            background: transparent url('icons/icon-back.png') center/contain no-repeat;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            cursor: pointer;
            flex-shrink: 0;
            transition: transform 0.1s ease-out;
            padding: 0;
        }
        .wall-back-btn:active { 
            transform: scale(0.92); 
            box-shadow: none !important; 
        }

        /* ZAKŁADKI W CENTRUM (Dzieła, Kryształy, Zwierzaki, Fotki) */
        .wall-tabs {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 12px;
            height: 100%;
            margin: 0 auto;
            padding-bottom: 2px;
        }
        
        .wall-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            min-width: 68px;
            height: 48px;
            cursor: pointer;
            opacity: 0.85;
            transition: all 0.15s ease-out;
            padding: 2px 8px;
            border-radius: 8px 8px 0 0;
        }

        .wall-tab.active {
            opacity: 1;
            background: linear-gradient(to bottom, #5cb8ff, #2980b9);
            border: 2px solid #a4dbff;
            border-bottom: none;
            box-shadow: inset 0 2px 4px rgba(255,255,255,0.6);
        }
        
        .wall-tab-icon {
            width: 24px;
            height: 24px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));
        }
        
        .wall-tab-label {
            font-size: 11px;
            color: white;
            text-shadow: 1.5px 1.5px 0 #000;
            margin-top: 2px;
        }

        /* 2. CIEMNONIEBIESKI PASEK TYTUŁOWY: Ściana użytkownika [NICK] */
        .wall-sub-bar {
            height: 32px;
            background-color: #0c436b;
            display: flex;
            align-items: center;
            padding: 0 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            flex-shrink: 0;
            z-index: 9;
        }

        .wall-sub-title {
            color: white;
            font-size: 15px;
            text-shadow: 1.5px 1.5px 0 #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* 3. OBSZAR PRZEWIJANIA */
        .wall-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            background-color: #0b598d;
            padding: 12px 0 30px 0;
        }

        .wall-section {
            margin-bottom: 18px;
        }
        
        .wall-section-title {
            color: #00cec9;
            font-size: 18px;
            margin: 0 0 8px 15px;
            text-shadow: 1.5px 1.5px 0 #000;
        }

        .wall-horizontal-list {
            display: flex;
            gap: 12px;
            padding: 0 15px 8px 15px;
            overflow-x: auto;
            scrollbar-width: thin;
        }
        .wall-horizontal-list::-webkit-scrollbar { height: 6px; }
        .wall-horizontal-list::-webkit-scrollbar-thumb { background: #3498db; border-radius: 3px; }

        /* KAFELEK DŁUGOŚCIOWY BLOCKSTARPLANET */
        .wall-card {
            width: 145px;
            height: 190px;
            flex-shrink: 0;
            background-color: #00d2d3;
            border: 2px solid white;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 4px 0 rgba(0,0,0,0.3);
            transition: transform 0.1s;
        }
        .wall-card:active { transform: scale(0.96); }

        .wall-card-header {
            background-color: #01a3a4;
            color: white;
            font-size: 11px;
            padding: 4px 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 1px 1px 0 #000;
            font-weight: bold;
            text-align: center;
        }

        .wall-card-thumb {
            flex: 1;
            background-color: #63addb;
            background-image: url('icons/avatar_placeholder.png');
            background-size: contain;
            background-position: center bottom;
            background-repeat: no-repeat;
            position: relative;
        }

        .wall-card-footer {
            height: 28px;
            background-color: #01a3a4;
            display: flex;
            justify-content: space-around;
            align-items: center;
            color: white;
            font-size: 13px;
            text-shadow: 1px 1px 0 #000;
        }
        
        .stat-item { display: flex; align-items: center; gap: 4px; }
        .stat-icon { width: 16px; height: 16px; background-size: contain; background-repeat: no-repeat; }
        
        .wall-placeholder-tab {
            display: none;
            text-align: center;
            color: white;
            margin-top: 50px;
            font-size: 18px;
        }
        .wall-placeholder-tab.active { display: block; }
    </style>

    <div id="wall-panel" class="panel-modal" style="display:none;">
        <div class="panel-content">
            <div class="wall-container">
                
                <!-- GÓRNY PASEK Z PRZYCISKIEM POWROTU I ZAKŁADKAMI -->
                <div class="wall-header-bar">
                    <div id="btn-wall-close" class="wall-back-btn"></div>
                    
                    <div class="wall-tabs">
                        <div class="wall-tab active" data-tab="wall-creations">
                            <div class="wall-tab-icon" style="background-image: url('icons/icon-like.png');"></div>
                            <span class="wall-tab-label">Dzieła</span>
                        </div>
                        <div class="wall-tab" data-tab="wall-crystals">
                            <div class="wall-tab-icon" style="background-image: url('icons/icon-shop.png');"></div>
                            <span class="wall-tab-label">Kryształy</span>
                        </div>
                        <div class="wall-tab" data-tab="wall-pets">
                            <div class="wall-tab-icon" style="background-image: url('icons/icon-friends.png');"></div>
                            <span class="wall-tab-label">Zwierzaki</span>
                        </div>
                        <div class="wall-tab" data-tab="wall-photos">
                            <div class="wall-tab-icon" style="background-image: url('icons/icon-build.png');"></div>
                            <span class="wall-tab-label">Fotki</span>
                        </div>
                    </div>

                    <div style="width: 46px;"></div> <!-- Symetryczny odstęp wyrównujący nagłówek -->
                </div>

                <!-- CIEMNY PASEK TYTUŁU ŚCIANY -->
                <div class="wall-sub-bar">
                    <span id="wall-sub-title" class="wall-sub-title">Ściana użytkownika ...</span>
                </div>

                <!-- TREŚĆ GŁÓWNA -->
                <div id="wall-creations" class="wall-content active">
                    <div class="wall-section">
                        <div class="wall-section-title">Najnowsze BlockStars</div>
                        <div id="wall-list-skins" class="wall-horizontal-list"></div>
                    </div>

                    <div class="wall-section">
                        <div class="wall-section-title">Najnowsze Światy</div>
                        <div id="wall-list-worlds" class="wall-horizontal-list"></div>
                    </div>

                    <div class="wall-section">
                        <div class="wall-section-title">Najnowsze Prefabrykaty</div>
                        <div id="wall-list-prefabs" class="wall-horizontal-list"></div>
                    </div>

                    <div class="wall-section">
                        <div class="wall-section-title">Najnowsze Części</div>
                        <div id="wall-list-parts" class="wall-horizontal-list"></div>
                    </div>
                </div>

                <div id="wall-crystals" class="wall-content wall-placeholder-tab">Brak kryształów</div>
                <div id="wall-pets" class="wall-content wall-placeholder-tab">Brak zwierzaków</div>
                <div id="wall-photos" class="wall-content wall-placeholder-tab">Brak fotek</div>
            </div>
        </div>
    </div>
`;

export class WallManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.currentUserId = null;
    }

    initialize() {
        const modalsLayer = document.getElementById('modals-layer');
        if (modalsLayer) {
            modalsLayer.insertAdjacentHTML('beforeend', TEMPLATE);
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('btn-wall-close');
        if (closeBtn) closeBtn.onclick = () => this.close();

        const tabs = document.querySelectorAll('.wall-tab');
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('#wall-panel .wall-content').forEach(c => {
                    c.style.display = 'none';
                    c.classList.remove('active');
                });

                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = 'block';
                    targetContent.classList.add('active');
                }
            };
        });
    }

    open(userId, username) {
        const panel = document.getElementById('wall-panel');
        if (!panel) return;

        this.ui.bringToFront(panel);
        panel.style.display = 'flex';
        
        this.currentUserId = userId;
        document.getElementById('wall-sub-title').textContent = `Ściana użytkownika ${username || 'Gracz'}`;
        
        const defaultTab = document.querySelector('.wall-tab[data-tab="wall-creations"]');
        if (defaultTab) defaultTab.click();

        this.loadWallData(userId);
    }

    close() {
        const panel = document.getElementById('wall-panel');
        if (panel) panel.style.display = 'none';
    }

    async loadWallData(userId) {
        ['skins', 'worlds', 'prefabs', 'parts'].forEach(type => {
            const listEl = document.getElementById(`wall-list-${type}`);
            if (listEl) listEl.innerHTML = '<p style="color:white; padding:15px;">Ładowanie...</p>';
        });

        const t = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        
        try {
            const r = await fetch(`${API_BASE_URL}/api/user/${userId}/wall`, {
                headers: t ? { 'Authorization': `Bearer ${t}` } : {}
            });
            
            if (r.ok) {
                const data = await r.json();
                this.renderSection('wall-list-skins', data.skins, 'skin');
                this.renderSection('wall-list-worlds', data.worlds, 'world');
                this.renderSection('wall-list-prefabs', data.prefabs, 'prefab');
                this.renderSection('wall-list-parts', data.parts, 'part');
            } else {
                throw new Error("Błąd serwera");
            }
        } catch (e) {
            console.error(e);
            ['skins', 'worlds', 'prefabs', 'parts'].forEach(type => {
                const listEl = document.getElementById(`wall-list-${type}`);
                if (listEl) listEl.innerHTML = '<p style="color:white; padding:15px;">Błąd pobierania.</p>';
            });
        }
    }

    renderSection(containerId, items, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (!items || items.length === 0) {
            container.innerHTML = '<div style="color:rgba(255,255,255,0.6); padding:15px; font-size:13px;">Brak elementów.</div>';
            return;
        }

        items.forEach(item => {
            const card = this.createCard(item, type);
            container.appendChild(card);
        });
    }

    createCard(item, type) {
        const div = document.createElement('div');
        div.className = 'wall-card';

        let thumbUrl = item.thumbnail || 'icons/avatar_placeholder.png';
        const likes = item.likes || 0;
        const comments = item.comments || 0;

        div.innerHTML = `
            <div class="wall-card-header">${item.name}</div>
            <div class="wall-card-thumb" style="background-image: url('${thumbUrl}');"></div>
            <div class="wall-card-footer">
                <div class="stat-item">
                    <span style="font-size:13px;">👍</span>
                    <span>${likes}</span>
                </div>
                <div class="stat-item">
                    <span style="font-size:13px;">💬</span>
                    <span>${comments}</span>
                </div>
            </div>
        `;

        div.onclick = () => this.handleItemClick(item, type);
        return div;
    }

    handleItemClick(item, type) {
        if (type === 'world') {
            if (this.ui.onWorldSelect) {
                if (confirm(`Chcesz wejść do świata "${item.name}"?`)) {
                    this.ui.closeAllPanels();
                    this.ui.onWorldSelect(item);
                }
            }
        } else {
            if (this.ui.skinDetailsManager) {
                this.ui.skinDetailsManager.showItemDetails(item, type, true); 
            }
        }
    }
}