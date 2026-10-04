/* PLIK: DiscoverManager.js */

import { SkinStorage } from './SkinStorage.js';
import { PrefabStorage } from './PrefabStorage.js';
import { HyperCubePartStorage } from './HyperCubePartStorage.js';
import { WorldStorage } from './WorldStorage.js';

// Szablon HTML dla panelu odkrywania
const DISCOVER_CHOICE_TEMPLATE = `
    <div id="discover-choice-panel" class="panel-modal">
        <div class="panel-content">
            <h1 class="text-outline" style="color: white; font-size: 48px; margin-bottom: 30px;">Odkryj</h1>
            <div class="nav-grid-container" style="grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div class="nav-item" id="btn-disc-blockstars"><div class="nav-btn-box"><img src="icons/icon-newhypercube.png" class="nav-icon"><span class="nav-label">BlockStars</span></div></div>
                <div class="nav-item" id="btn-disc-worlds"><div class="nav-btn-box"><img src="icons/icon-newworld.png" class="nav-icon"><span class="nav-label">Światy</span></div></div>
                <div class="nav-item" id="btn-disc-parts"><div class="nav-btn-box"><img src="icons/icon-newhypercubepart.png" class="nav-icon"><span class="nav-label">Skórki</span></div></div>
                <div class="nav-item" id="btn-disc-prefabs"><div class="nav-btn-box"><img src="icons/icon-newprefab.png" class="nav-icon"><span class="nav-label">Prefabrykaty</span></div></div>
                <div class="nav-item" id="btn-disc-photos"><div class="nav-btn-box"><img src="icons/icon-more.png" class="nav-icon"><span class="nav-label">Fotki</span></div></div>
                <div class="nav-item" id="btn-disc-homes"><div class="nav-btn-box"><img src="icons/icon-home.png" class="nav-icon"><span class="nav-label">Domy</span></div></div>
            </div>
        </div>
    </div>
`;

const DISCOVER_PANEL_TEMPLATE = `
    <style>
        #discover-panel .panel-content {
            background: rgba(0,0,0,0.6) !important;
            border: none !important;
            box-shadow: none !important;
            width: 95vw !important;
            max-width: 900px !important;
            display: flex;
            flex-direction: column;
            align-items: center;
            pointer-events: auto;
        }
        
        #discover-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
            width: 100%;
            padding: 10px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .skin-list-item {
            background-color: #3498db;
            border: 3px solid white;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: transform 0.1s;
            box-shadow: 0 4px 0 #2980b9;
            height: 140px;
        }
        .skin-list-item:active {
            transform: translateY(3px);
            box-shadow: 0 1px 0 #2980b9;
        }
        .skin-list-item div:first-child {
            width: 80px !important;
            height: 80px !important;
            margin-right: 0 !important;
            margin-bottom: 5px;
            border: 2px solid white;
            border-radius: 8px;
            background-color: #000;
        }
        .skin-list-item span {
            color: white;
            font-size: 12px !important;
            text-align: center;
            line-height: 1.1;
            text-shadow: 1px 1px 0 #000;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        #discover-tabs {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 15px;
            width: 100%;
        }
        #discover-tabs .friends-tab {
            padding: 8px 20px;
            background: #bdc3c7;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            color: #555;
            border: 2px solid white;
        }
        #discover-tabs .friends-tab.active {
            background: #2ecc71;
            color: white;
            box-shadow: 0 4px 0 #27ae60;
        }
    </style>

    <div id="discover-panel" class="panel-modal" style="display:none;">
        <div class="panel-content">
            <h2 id="discover-panel-title" class="text-outline" style="margin-bottom: 15px;">Odkryj</h2>
            
            <div id="discover-tabs" class="friends-tabs" style="display: flex; gap: 10px; margin-bottom: 15px;">
                <div class="friends-tab active" data-tab="all" style="padding: 5px 15px; background: #3498db; border-radius: 10px; cursor: pointer; border: 2px solid white;">Wszystkie</div>
                <div class="friends-tab" data-tab="mine" style="padding: 5px 15px; background: #3498db; border-radius: 10px; cursor: pointer; border: 2px solid white;">Moje</div>
            </div>

            <div id="discover-list"></div>
            
            <button class="panel-close-button">Zamknij</button>
        </div>
    </div>
`;

export class DiscoverManager {
    constructor(uiManager) {
        this.ui = uiManager;
        
        // Elementy DOM
        this.choicePanel = null;
        this.discoverPanel = null;
        this.discoverList = null;
        this.discoverTabs = null;
        
        // Stan
        this.currentType = null;
        this.currentMode = 'all';
        
        // Callbacki
        this.onWorldSelect = null;
        this.onItemSelect = null;
        
        // Bindowanie
        this.closeChoicePanel = this.closeChoicePanel.bind(this);
        this.closeDiscoverPanel = this.closeDiscoverPanel.bind(this);
    }
    
    initialize() {
        const modalsLayer = document.getElementById('modals-layer');
        if (modalsLayer) {
            modalsLayer.insertAdjacentHTML('beforeend', DISCOVER_CHOICE_TEMPLATE);
            modalsLayer.insertAdjacentHTML('beforeend', DISCOVER_PANEL_TEMPLATE);
        }
        
        this.choicePanel = document.getElementById('discover-choice-panel');
        this.discoverPanel = document.getElementById('discover-panel');
        this.discoverList = document.getElementById('discover-list');
        this.discoverTabs = document.getElementById('discover-tabs');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Zamknięcie panelu wyboru
        if (this.choicePanel) {
            this.choicePanel.addEventListener('click', (e) => {
                if (e.target === this.choicePanel) this.closeChoicePanel();
            });
        }
        
        // Zamknięcie panelu odkrywania
        if (this.discoverPanel) {
            this.discoverPanel.addEventListener('click', (e) => {
                if (e.target === this.discoverPanel) this.closeDiscoverPanel();
            });
            
            const closeBtn = this.discoverPanel.querySelector('.panel-close-button');
            if (closeBtn) closeBtn.onclick = this.closeDiscoverPanel;
        }
        
        // Przyciski kategorii
        this.bindChoiceButton('btn-disc-blockstars', 'skin');
        this.bindChoiceButton('btn-disc-worlds', 'world');
        this.bindChoiceButton('btn-disc-parts', 'part');
        this.bindChoiceButton('btn-disc-prefabs', 'prefab');
        this.bindChoiceButton('btn-disc-photos', 'photo');
        this.bindChoiceButton('btn-disc-homes', 'home');
    }
    
    bindChoiceButton(buttonId, type) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.onclick = () => {
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 100);
                this.closeChoicePanel();
                
                if (type === 'skin') this.showDiscoveryPanel('skin');
                else if (type === 'world') this.showWorldsPanel();
                else if (type === 'part') this.showDiscoveryPanel('part');
                else if (type === 'prefab') this.showDiscoveryPanel('prefab');
                else this.ui.showMessage("Ta sekcja pojawi się wkrótce!", "info");
            };
        }
    }
    
    openChoicePanel() {
        if (this.choicePanel) {
            this.ui.bringToFront(this.choicePanel);
            this.choicePanel.style.display = 'flex';
        }
    }
    
    closeChoicePanel() {
        if (this.choicePanel) this.choicePanel.style.display = 'none';
    }
    
    closeDiscoverPanel() {
        if (this.discoverPanel) this.discoverPanel.style.display = 'none';
    }
    
    async showWorldsPanel(category = null) {
        if (!this.discoverPanel) return;
        
        const title = document.getElementById('discover-panel-title');
        const tabs = document.getElementById('discover-tabs');
        
        if (title) title.textContent = category === 'parkour' ? 'Wybierz Parkour' : 'Wybierz Świat';
        if (tabs) tabs.style.display = 'none';
        
        this.discoverList.innerHTML = '<p class="text-outline" style="text-align:center">Ładowanie...</p>';
        
        this.ui.bringToFront(this.discoverPanel);
        this.discoverPanel.style.display = 'flex';
        
        try {
            const allWorlds = await WorldStorage.getAllWorlds();
            let filteredWorlds = allWorlds;
            if (category) {
                filteredWorlds = allWorlds.filter(w => {
                    const wType = w.type || 'creative';
                    return wType === category;
                });
            }
            this.renderWorldsList(filteredWorlds);
        } catch (error) {
            console.error("Worlds error:", error);
            this.discoverList.innerHTML = '<p class="text-outline" style="text-align:center">Błąd pobierania.</p>';
        }
    }
    
    renderWorldsList(worlds) {
        if (!this.discoverList) return;
        
        this.discoverList.innerHTML = '';
        
        if (!worlds || worlds.length === 0) {
            this.discoverList.innerHTML = '<p class="text-outline" style="text-align:center">Brak światów.</p>';
            return;
        }
        
        worlds.forEach(world => {
            const div = document.createElement('div');
            div.className = 'skin-list-item';
            
            const thumbContainer = document.createElement('div');
            const thumbnail = world.thumbnail;
            
            if (thumbnail) {
                const img = document.createElement('img');
                img.src = thumbnail;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                thumbContainer.appendChild(img);
            } else {
                thumbContainer.textContent = '?';
                thumbContainer.style.display = 'flex';
                thumbContainer.style.alignItems = 'center';
                thumbContainer.style.justifyContent = 'center';
                thumbContainer.style.color = 'white';
                thumbContainer.style.fontSize = '30px';
            }
            
            let label = world.name || "Bez nazwy";
            if (world.creator) label += `\n(od ${world.creator})`;
            
            const nameSpan = document.createElement('span');
            nameSpan.innerText = label;
            nameSpan.className = 'text-outline';
            
            div.appendChild(thumbContainer);
            div.appendChild(nameSpan);
            
            div.onclick = () => {
                this.closeDiscoverPanel();
                if (this.onWorldSelect) this.onWorldSelect(world);
            };
            
            this.discoverList.appendChild(div);
        });
    }
    
    async showDiscoveryPanel(type) {
        if (!this.discoverPanel) return;
        
        this.currentType = type;
        
        const labels = { skin: 'Skiny', part: 'Części', prefab: 'Prefabrykaty' };
        const title = document.getElementById('discover-panel-title');
        if (title) title.textContent = `Wybierz ${labels[type] || 'Element'}`;
        
        // Konfiguracja zakładek
        const tabs = document.getElementById('discover-tabs');
        if (tabs) {
            tabs.style.display = 'flex';
            
            const tabAll = tabs.querySelector('.friends-tab[data-tab="all"]');
            const tabMine = tabs.querySelector('.friends-tab[data-tab="mine"]');
            
            // Ustaw domyślnie "Wszystkie"
            if (tabAll) tabAll.classList.add('active');
            if (tabMine) tabMine.classList.remove('active');
            
            if (tabAll) {
                tabAll.onclick = () => {
                    if (tabMine) tabMine.classList.remove('active');
                    tabAll.classList.add('active');
                    this.currentMode = 'all';
                    this.refreshDiscoveryList(type, 'all');
                };
            }
            
            if (tabMine) {
                tabMine.onclick = () => {
                    if (tabAll) tabAll.classList.remove('active');
                    tabMine.classList.add('active');
                    this.currentMode = 'mine';
                    this.refreshDiscoveryList(type, 'mine');
                };
            }
        }
        
        this.discoverList.innerHTML = '<p class="text-outline" style="text-align:center">Ładowanie...</p>';
        
        this.ui.bringToFront(this.discoverPanel);
        this.discoverPanel.style.display = 'flex';
        
        await this.refreshDiscoveryList(type, 'all');
    }
    
    async refreshDiscoveryList(type, mode) {
        if (!this.discoverList) return;
        
        this.discoverList.innerHTML = '<p class="text-outline" style="text-align:center">Pobieranie...</p>';
        
        let items = [];
        try {
            if (type === 'skin') {
                items = mode === 'mine' ? await SkinStorage.getMySkins() : await SkinStorage.getAllSkins();
            } else if (type === 'prefab') {
                items = mode === 'mine' ? await PrefabStorage.getSavedPrefabsList() : await PrefabStorage.getAllPrefabs();
            } else if (type === 'part') {
                items = mode === 'mine' ? await HyperCubePartStorage.getSavedPartsList() : await HyperCubePartStorage.getAllParts();
            }
            
            this.renderItemsList(items, type);
        } catch (error) {
            console.error("Discovery error:", error);
            this.discoverList.innerHTML = '<p class="text-outline" style="text-align:center">Błąd połączenia.</p>';
        }
    }
    
    renderItemsList(items, type) {
        if (!this.discoverList) return;
        
        this.discoverList.innerHTML = '';
        
        if (!items || items.length === 0) {
            this.discoverList.innerHTML = '<p class="text-outline" style="text-align:center">Brak elementów.</p>';
            return;
        }
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'skin-list-item';
            
            const thumbContainer = document.createElement('div');
            const thumbnail = item.thumbnail;
            
            if (thumbnail) {
                const img = document.createElement('img');
                img.src = thumbnail;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                thumbContainer.appendChild(img);
            } else {
                thumbContainer.textContent = '?';
                thumbContainer.style.display = 'flex';
                thumbContainer.style.alignItems = 'center';
                thumbContainer.style.justifyContent = 'center';
                thumbContainer.style.color = 'white';
                thumbContainer.style.fontSize = '30px';
            }
            
            let label = item.name || "Bez nazwy";
            if (item.creator) label += `\n(od ${item.creator})`;
            
            const nameSpan = document.createElement('span');
            nameSpan.innerText = label;
            nameSpan.className = 'text-outline';
            
            div.appendChild(thumbContainer);
            div.appendChild(nameSpan);
            
            div.onclick = () => {
                if (this.onItemSelect) {
                    this.onItemSelect(item, type);
                }
            };
            
            this.discoverList.appendChild(div);
        });
    }
    
    // Metody pomocnicze dla kompatybilności z ui.js
    showDiscoverPanel(type, category = null) {
        if (type === 'worlds') {
            this.showWorldsPanel(category);
        } else if (type === 'discovery') {
            this.showDiscoveryPanel(category);
        }
    }
    
    // Cleanup
    cleanup() {
        if (this.choicePanel) this.choicePanel.remove();
        if (this.discoverPanel) this.discoverPanel.remove();
    }
}