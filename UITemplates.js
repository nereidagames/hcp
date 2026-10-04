/* PLIK: UITemplates.js - OKROJONY */

// TYLKO NIEZBĘDNE SZABLONY, KTÓRE NIE ZOSTAŁY JESZCZE PRZENIESIONE

export const HUD_HTML = `
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

export const BUILD_UI_HTML = `
    <!-- UI BUILDERA -->
    <div class="build-top-left">
        <div id="build-exit-btn-new" class="btn-bsp-back"></div>
        <div class="btn-bsp-green" style="display:none;" id="build-chat-dummy">...</div>
        <div id="build-save-btn-new" class="btn-bsp-green">Zapisz</div>
    </div>

    <div class="build-sidebar-right">
        <div id="build-mode-toggle-new" class="btn-mode-toggle">Tryb: Łatwy</div>
        <div id="build-tools-menu-btn" class="btn-tool-main">
            <div class="icon-finger">👆</div>
        </div>
        <div class="btn-undo-redo" style="margin-top:10px;">↩️</div>
        <div class="btn-undo-redo">↪️</div>
    </div>

    <div id="build-rotate-zone"></div>

    <div class="build-bottom-bar">
        <div id="build-add-btn-new" class="btn-add-block"></div>
        <div id="build-hotbar-container" class="hotbar-container"></div>
    </div>

    <div id="tools-modal">
        <div class="tools-section">
            <div class="tools-section-title">Narzędzia Łatwe</div>
            <div class="tools-grid">
                <div class="tool-icon-btn" id="tool-btn-single" title="Pojedynczy"><img src="icons/tool-hand.png" onerror="this.onerror=null; this.src='icons/icon-build.png'" class="tool-icon-img"></div>
                <div class="tool-icon-btn" id="tool-btn-eraser" title="Gumka"><img src="icons/tool-eraser.png" onerror="this.onerror=null; this.src='icons/icon-back.png'" class="tool-icon-img"></div>
                <div class="tool-icon-btn"><img src="icons/tool-bucket.png" onerror="this.onerror=null; this.src='icons/icon-shop.png'" class="tool-icon-img"></div>
                <div class="tool-icon-btn"><img src="icons/tool-swap.png" onerror="this.onerror=null; this.src='icons/icon-restart.png'" class="tool-icon-img"></div>
                <div class="tool-icon-btn"><img src="icons/tool-grid.png" onerror="this.onerror=null; this.src='icons/icon-smallworld.png'" class="tool-icon-img"></div>
                <div class="tool-icon-btn"><img src="icons/tool-trash.png" onerror="this.onerror=null; this.src='icons/icon-back.png'" class="tool-icon-img"></div>
            </div>
        </div>
        <div class="tools-section">
            <div class="tools-section-title">Narzędzia Profesjonalne</div>
            <div class="tools-grid">
                 <div class="tool-icon-btn"><img src="icons/tool-mound.png" onerror="this.onerror=null; this.src='icons/icon-newworld.png'" class="tool-icon-img"></div>
                 <div class="tool-icon-btn"><img src="icons/tool-pencil.png" onerror="this.onerror=null; this.src='icons/icon-build.png'" class="tool-icon-img"></div>
                 <div class="tool-icon-btn"><img src="icons/tool-pipette.png" onerror="this.onerror=null; this.src='icons/icon-more.png'" class="tool-icon-img"></div>
                 <div class="tool-icon-btn" id="tool-btn-line" title="Linia"><img src="icons/tool-line.png" onerror="this.onerror=null; this.src='icons/icon-jump.png'" class="tool-icon-img"></div>
                 <div class="tool-icon-btn"><img src="icons/tool-rotate.png" onerror="this.onerror=null; this.src='icons/icon-restart.png'" class="tool-icon-img"></div>
                 <div class="tool-icon-btn"><img src="icons/tool-box.png" onerror="this.onerror=null; this.src='icons/icon-newprefab.png'" class="tool-icon-img"></div>
            </div>
        </div>
        <div class="tools-section">
            <div class="tools-section-title" style="color:#f1c40f;">Narzędzia VIP</div>
            <div class="tools-grid">
                 <div class="tool-icon-btn vip"><img src="icons/tool-tnt.png" onerror="this.onerror=null; this.src='icons/alert.png'" class="tool-icon-img"></div>
                 <div class="tool-icon-btn vip"><img src="icons/tool-fog.png" onerror="this.onerror=null; this.src='icons/icon-discover.png'" class="tool-icon-img"></div>
                 <div class="tool-icon-btn vip"><img src="icons/tool-wire.png" onerror="this.onerror=null; this.src='icons/icon-newhypercubepart.png'" class="tool-icon-img"></div>
            </div>
        </div>
    </div>

    <div id="block-selection-panel">
        <div class="friends-tabs">
            <div class="friends-tab active" id="build-tab-blocks">Bloki</div>
            <div class="friends-tab" id="build-tab-addons">Dodatki</div>
        </div>
        <div id="build-block-list"></div>
    </div>
    <div id="prefab-selection-panel"></div>
    <div id="part-selection-panel"></div>
`;

export const DIGGING_UI_HTML = `
    <style>
        #digging-ui-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: transparent;
            z-index: 10000;
            display: none;
            font-family: 'Titan One', cursive;
            color: white;
            overflow: hidden;
            pointer-events: none;
        }
        
        #digging-ui-container * {
            pointer-events: auto;
        }
        
        .dig-top-bar {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            height: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(0,0,0,0.6);
            border: 3px solid #f1c40f;
            border-radius: 10px;
            padding: 0 20px;
            z-index: 10;
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .dig-timer {
            font-size: 28px;
            color: #f1c40f;
            text-shadow: 2px 2px 0 #000;
            font-weight: bold;
        }
        
        .dig-depth {
            font-size: 28px;
            color: #3498db;
            text-shadow: 2px 2px 0 #000;
            font-weight: bold;
        }
        
        .dig-exit-btn {
            width: 50px;
            height: 50px;
            background: #e74c3c;
            border: 3px solid white;
            border-radius: 10px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            color: white;
            box-shadow: 0 4px 0 #c0392b;
            transition: transform 0.1s;
        }
        .dig-exit-btn:active { transform: translateY(4px); box-shadow: none; }
        
        .dig-stats-panel {
            position: absolute;
            top: 80px;
            left: 10px;
            width: 280px;
            background: rgba(0,0,0,0.6);
            border: 3px solid #3498db;
            border-radius: 10px;
            padding: 15px;
            z-index: 10;
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .dig-stat-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            gap: 10px;
        }
        
        .dig-stat-icon {
            width: 40px;
            height: 40px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
        }
        
        .dig-health-icon { background-image: url('icons/health.png'); }
        .dig-crystal-icon { background-image: url('icons/crystal.png'); }
        
        .dig-stat-bar {
            flex: 1;
            height: 25px;
            background: rgba(0,0,0,0.5);
            border: 2px solid white;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }
        
        .dig-stat-fill {
            height: 100%;
            background: linear-gradient(to right, #2ecc71, #27ae60);
            width: 0%;
            transition: width 0.3s;
        }
        
        .dig-stat-fill.health { background: linear-gradient(to right, #e74c3c, #c0392b); }
        
        .dig-stat-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            text-shadow: 1px 1px 0 #000;
            font-weight: bold;
        }
        
        .dig-resources-panel {
            position: absolute;
            top: 80px;
            right: 10px;
            width: 220px;
            background: rgba(0,0,0,0.6);
            border: 3px solid #f1c40f;
            border-radius: 10px;
            padding: 15px;
            z-index: 10;
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .dig-resource {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: bold;
        }
        
        .dig-zoins-icon {
            width: 40px;
            height: 40px;
            background-image: url('icons/icon-coin.png');
            background-size: contain;
            background-repeat: no-repeat;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
        }
        
        .dig-dynamite-icon {
            width: 40px;
            height: 40px;
            background-image: url('icons/dynamite.png');
            background-size: contain;
            background-repeat: no-repeat;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
        }
        
        .dig-player-count {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid rgba(255,255,255,0.3);
            font-size: 18px;
        }
        
        .dig-player-icon {
            width: 30px;
            height: 30px;
            background-image: url('icons/icon-friends.png');
            background-size: contain;
            background-repeat: no-repeat;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
        }
        
        #dig-player-count {
            color: #f1c40f;
            font-weight: bold;
            text-shadow: 1px 1px 0 #000;
        }
        
        .dig-upgrades-panel {
            position: absolute;
            bottom: 120px;
            left: 10px;
            width: 300px;
            background: rgba(0,0,0,0.6);
            border: 3px solid #9b59b6;
            border-radius: 10px;
            padding: 15px;
            z-index: 10;
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .dig-upgrade-title {
            color: #f1c40f;
            font-size: 18px;
            margin-bottom: 10px;
            text-align: center;
            text-shadow: 2px 2px 0 #000;
        }
        
        .dig-upgrade-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            background: rgba(255,255,255,0.1);
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .dig-upgrade-info {
            flex: 1;
        }
        
        .dig-upgrade-name {
            font-size: 16px;
            font-weight: bold;
            color: white;
            text-shadow: 1px 1px 0 #000;
        }
        
        .dig-upgrade-desc {
            font-size: 12px;
            opacity: 0.9;
            color: #bdc3c7;
        }
        
        .dig-upgrade-btn {
            background: #2ecc71;
            border: 2px solid white;
            border-radius: 8px;
            padding: 5px 15px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 3px 0 #27ae60;
            transition: transform 0.1s;
            font-weight: bold;
        }
        .dig-upgrade-btn:active { transform: translateY(3px); box-shadow: none; }
        
        .dig-actions-panel {
            position: absolute;
            bottom: 120px;
            right: 10px;
            width: 220px;
            background: rgba(0,0,0,0.6);
            border: 3px solid #e67e22;
            border-radius: 10px;
            padding: 15px;
            z-index: 10;
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .dig-action-btn {
            width: 100%;
            height: 55px;
            margin-bottom: 12px;
            background: #3498db;
            border: 2px solid white;
            border-radius: 8px;
            color: white;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 4px 0 #2980b9;
            transition: transform 0.1s;
            font-weight: bold;
            text-shadow: 1px 1px 0 #000;
        }
        .dig-action-btn:active { transform: translateY(4px); box-shadow: none; }
        
        .dig-action-btn.redeem { 
            background: #f1c40f; 
            box-shadow: 0 4px 0 #f39c12;
            color: #2c3e50;
        }
        .dig-action-btn.dynamite { 
            background: #e67e22; 
            box-shadow: 0 4px 0 #d35400;
        }
        
        .dig-mining-progress {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            width: 400px;
            height: 30px;
            background: rgba(0,0,0,0.7);
            border: 3px solid #f1c40f;
            border-radius: 15px;
            overflow: hidden;
            z-index: 20;
            display: none;
            backdrop-filter: blur(5px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .dig-mining-bar {
            height: 100%;
            background: linear-gradient(to right, #f1c40f, #e67e22);
            width: 0%;
            transition: width 0.1s;
        }
        
        @media (max-width: 768px) {
            .dig-stats-panel { width: 220px; font-size: 14px; }
            .dig-resources-panel { width: 180px; }
            .dig-upgrades-panel { width: 250px; }
            .dig-actions-panel { width: 180px; }
            .dig-mining-progress { width: 300px; }
            .dig-timer, .dig-depth { font-size: 22px; }
        }
    </style>

    <div id="digging-ui-container">
        <div class="dig-top-bar">
            <div class="dig-timer" id="dig-timer">30:00</div>
            <div class="dig-depth" id="dig-depth">0m</div>
            <div class="dig-exit-btn" id="dig-exit-btn">✕</div>
        </div>
        
        <div class="dig-stats-panel">
            <div class="dig-stat-row">
                <div class="dig-stat-icon dig-health-icon"></div>
                <div class="dig-stat-bar">
                    <div class="dig-stat-fill health" id="dig-health-bar" style="width:100%"></div>
                    <div class="dig-stat-text" id="dig-health-text">100/100</div>
                </div>
            </div>
            <div class="dig-stat-row">
                <div class="dig-stat-icon dig-crystal-icon"></div>
                <div class="dig-stat-bar">
                    <div class="dig-stat-fill" id="dig-crystal-bar" style="width:0%"></div>
                    <div class="dig-stat-text" id="dig-crystal-text"><span id="dig-crystal-count">0</span>/<span id="dig-crystal-max">10</span></div>
                </div>
            </div>
        </div>
        
        <div class="dig-resources-panel">
            <div class="dig-resource">
                <div class="dig-zoins-icon"></div>
                <span id="dig-zoins">0</span>
            </div>
            <div class="dig-resource">
                <div class="dig-dynamite-icon"></div>
                <span id="dig-dynamite-count">2</span>
            </div>
            <div class="dig-player-count">
                <div class="dig-player-icon"></div>
                <span id="dig-player-count">1/6</span>
            </div>
        </div>
        
        <div class="dig-upgrades-panel">
            <div class="dig-upgrade-title">⚡ B.I.T. Upgrades ⚡</div>
            <div class="dig-upgrade-row">
                <div class="dig-upgrade-info">
                    <div class="dig-upgrade-name" id="dig-laser-name">Base Laser</div>
                    <div class="dig-upgrade-desc" id="dig-laser-power">100%</div>
                </div>
                <div class="dig-upgrade-btn" id="dig-upgrade-laser">↑</div>
            </div>
            <div class="dig-upgrade-row">
                <div class="dig-upgrade-info">
                    <div class="dig-upgrade-name" id="dig-storage-name">Base Storage</div>
                    <div class="dig-upgrade-desc" id="dig-storage-capacity">10</div>
                </div>
                <div class="dig-upgrade-btn" id="dig-upgrade-storage">↑</div>
            </div>
        </div>
        
        <div class="dig-actions-panel">
            <button class="dig-action-btn redeem" id="dig-redeem-btn">
                <span>💰</span> Redeem
            </button>
            <button class="dig-action-btn dynamite" id="dig-dynamite-btn">
                <span>💣</span> Dynamit
            </button>
        </div>
        
        <div class="dig-mining-progress" id="dig-mining-progress">
            <div class="dig-mining-bar" id="dig-mining-bar"></div>
        </div>
    </div>
`;

// MODALS_HTML - tylko elementy globalne (name-input-panel, discover-panel, itp.)
// Reszta została przeniesiona do managerów
export const MODALS_HTML = `
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
    <div id="add-choice-panel" class="panel-modal"><div class="panel-content"><h2>Dodaj</h2><div class="panel-list"><div id="add-choice-blocks" class="panel-item">Bloki</div><div id="add-choice-prefabs" class="panel-item">Prefabrykaty</div><div id="add-choice-parts" class="panel-item">Części</div></div><button id="add-choice-close" class="panel-close-button">Anuluj</button></div></div>
    <div id="player-preview-panel" class="panel-modal"><div class="panel-content"><h2>Podgląd</h2><div id="player-preview-renderer-container"></div><button class="panel-close-button">Zamknij</button></div></div>
    
    <!-- OKNO WPISYWANIA NAZWY -->
    <div id="name-input-panel" class="panel-modal" style="display:none;">
        <div id="name-input-panel-container">
            <h2 class="text-outline">Wpisz nazwę</h2>
            <input id="name-input-field" placeholder="Wpisz tekst..." maxlength="20">
            <button id="name-submit-btn">OK</button>
        </div>
    </div>
`;