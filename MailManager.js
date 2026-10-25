/* PLIK: MailManager.js */

import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

const TEMPLATE = `
    <style>
        /* NAKŁADKA MODALA POCZTY (ZACIEMNIENIE TŁA) */
        #mail-panel {
            position: fixed !important;
            top: calc(76px * var(--ui-scale)) !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: calc(100vh - 76px * var(--ui-scale)) !important;
            display: none;
            justify-content: center !important;
            align-items: flex-end !important;
            background: rgba(0, 0, 0, 0.4) !important;
            z-index: 25000 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.28s ease-out;
            overflow: hidden !important;
        }

        #mail-panel.active {
            display: flex !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }

        #mail-panel .panel-content {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-end !important;
            transform: none !important;
            pointer-events: none;
        }

        /* OKNO POCZTY BSP */
        .bsp-mail-card {
            width: 495px;
            max-width: 95vw;
            height: 100%;
            background-color: #68b8f8;
            border-radius: 18px 18px 0 0;
            border: none !important;
            outline: none !important;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Titan One', cursive;
            box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.35);
            pointer-events: auto;
            position: relative;
            margin: 0 auto;
            margin-bottom: 0 !important;
            
            /* Animacja wysuwania od samego dołu */
            transform: translateY(105%);
            transition: transform 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.05);
            will-change: transform;
        }

        #mail-panel.active .bsp-mail-card {
            transform: translateY(0);
        }

        /* 1. NAGŁÓWEK POCZTY */
        .bsp-mail-header {
            height: 54px;
            background: linear-gradient(to bottom, #5cb4f8, #2a94f0);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-bottom: 2px solid rgba(255,255,255,0.4);
            flex-shrink: 0;
        }

        .bsp-mail-title {
            color: white;
            font-size: 26px;
            text-shadow: 2px 2px 0 #000;
            letter-spacing: 0.5px;
        }

        .bsp-btn-compose {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            width: 42px;
            height: 42px;
            background: linear-gradient(to bottom, #8ede13, #5ba806);
            border: 2.5px solid white;
            border-radius: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 30px;
            line-height: 1;
            cursor: pointer;
            box-shadow: 0 3px 0 #3e7504;
            transition: transform 0.1s;
        }
        .bsp-btn-compose:active { transform: translateY(-45%) scale(0.95); box-shadow: none; }

        /* CZERWONY PRZYCISK COFANIA DO LISTY */
        .bsp-mail-back-btn {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 44px;
            height: 40px;
            background: transparent url('icons/icon-back.png') center/contain no-repeat;
            border: none;
            cursor: pointer;
            transition: transform 0.1s;
            z-index: 2;
        }
        .bsp-mail-back-btn:active { transform: translateY(-50%) scale(0.92); }

        /* 2. LISTA WIADOMOŚCI */
        .bsp-mail-inbox-list {
            flex: 1;
            overflow-y: auto;
            background-color: #72bdf8;
            display: flex;
            flex-direction: column;
        }

        .bsp-mail-row {
            display: flex;
            align-items: center;
            height: 70px;
            padding: 6px 14px;
            cursor: pointer;
            border-bottom: 2px solid rgba(255,255,255,0.4);
            position: relative;
            transition: filter 0.1s;
        }
        .bsp-mail-row:hover { filter: brightness(1.05); }

        /* Przeczytana konwersacja */
        .bsp-mail-row.read {
            background-color: #7dc5fb;
        }

        /* Nieprzeczytana konwersacja */
        .bsp-mail-row.unread {
            background-color: #8ede13;
        }

        .bsp-unread-badge {
            width: 22px;
            height: 22px;
            background: #e74c3c;
            border: 2px solid white;
            border-radius: 50%;
            color: white;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .bsp-row-avatar {
            width: 52px;
            height: 52px;
            background-color: transparent;
            background-size: contain;
            background-position: center bottom;
            background-repeat: no-repeat;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .bsp-row-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            overflow: hidden;
        }

        .bsp-row-username {
            color: white;
            font-size: 16px;
            text-shadow: 1.5px 1.5px 0 #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
        }

        .bsp-row-preview {
            color: white;
            font-size: 12px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            opacity: 0.95;
        }

        .bsp-row-time {
            font-size: 10px;
            color: rgba(255,255,255,0.85);
            font-family: Arial, sans-serif;
            font-weight: bold;
            margin-top: 2px;
            text-shadow: 1px 1px 0 rgba(0,0,0,0.4);
        }

        /* 3. ROZMOWA (CZAT) - ZIELONY PASEK MA ZAWSZE 75% DŁUGOŚCI OKNA */
        .bsp-chat-user-pill {
            width: 75%;
            height: 38px;
            padding: 0 16px;
            background: linear-gradient(to bottom, #8ede13, #5ba806);
            border: 2.5px solid white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 17px;
            text-shadow: 1.5px 1.5px 0 #000;
            box-shadow: 0 3px 0 #3e7504;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin: 0 auto;
            box-sizing: border-box;
        }

        .bsp-chat-area {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background-color: #c7e6fc;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .bsp-msg-row {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            width: 100%;
        }
        .bsp-msg-row.received { justify-content: flex-start; }
        .bsp-msg-row.sent { justify-content: flex-end; }

        .bsp-msg-avatar {
            width: 42px;
            height: 42px;
            background-size: contain;
            background-position: center bottom;
            background-repeat: no-repeat;
            flex-shrink: 0;
        }

        .bsp-msg-bubble {
            max-width: 65%;
            padding: 10px 14px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            word-wrap: break-word;
        }

        .bsp-msg-row.received .bsp-msg-bubble {
            background-color: white;
            color: #2c3e50;
            border: 2px solid white;
        }

        .bsp-msg-row.sent .bsp-msg-bubble {
            background-color: #5cb4f8;
            color: white;
            border: 2px solid white;
            text-shadow: 0.5px 0.5px 0 rgba(0,0,0,0.3);
        }

        .bsp-chat-footer {
            height: 58px;
            background: #68b8f8;
            border-top: 2px solid rgba(255,255,255,0.4);
            padding: 6px 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }

        .bsp-chat-input {
            flex: 1;
            height: 42px;
            background: white;
            border: 2px solid #5cb4f8;
            border-radius: 8px;
            padding: 0 12px;
            font-family: Arial, sans-serif;
            font-size: 15px;
            font-weight: bold;
            color: #2c3e50;
            outline: none;
        }

        .bsp-chat-send-btn {
            width: 44px;
            height: 42px;
            background: linear-gradient(to bottom, #8ede13, #5ba806);
            border: 2px solid white;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 22px;
            cursor: pointer;
            box-shadow: 0 3px 0 #3e7504;
            transition: transform 0.1s;
        }
        .bsp-chat-send-btn:active { transform: translateY(2px); box-shadow: none; }

        /* 4. NOWA WIADOMOŚĆ (WYSZUKIWANIE) */
        .bsp-composer-search-row {
            height: 52px;
            background: #72bdf8;
            padding: 6px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid white;
        }

        .bsp-search-box {
            flex: 1;
            height: 40px;
            background: white;
            border: 2px solid white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            padding: 0 8px;
            gap: 6px;
        }

        .bsp-search-prefix {
            color: #7f8c8d;
            font-size: 16px;
        }

        .bsp-search-input {
            flex: 1;
            border: none;
            outline: none;
            font-family: 'Titan One', cursive;
            font-size: 16px;
            color: #2c3e50;
        }

        .bsp-search-btn {
            width: 38px;
            height: 38px;
            background: linear-gradient(to bottom, #5cb4f8, #2a94f0);
            border: 2px solid white;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            flex-shrink: 0;
            box-shadow: 0 2px 0 #1b6cb4;
        }
        .bsp-search-btn:active { transform: translateY(1px); box-shadow: none; }
        .bsp-search-icon { font-size: 18px; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3)); }

        .bsp-composer-list {
            flex: 1;
            overflow-y: auto;
            background: #7dc5fb;
            display: flex;
            flex-direction: column;
        }

        .bsp-composer-user-row {
            height: 60px;
            display: flex;
            align-items: center;
            padding: 0 15px;
            border-bottom: 1.5px solid rgba(255,255,255,0.4);
            cursor: pointer;
            transition: background 0.1s;
        }
        .bsp-composer-user-row:hover { background-color: #8ecefb; }

        .hidden { display: none !important; }
    </style>

    <div id="mail-panel" class="panel-modal">
        <div class="panel-content">
            <div class="bsp-mail-card" id="bsp-mail-card-el">
                
                <!-- WIDOK 1: LISTA (INBOX) -->
                <div id="mail-inbox-view" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
                    <div class="bsp-mail-header">
                        <span class="bsp-mail-title">Poczta</span>
                        <div id="btn-mail-compose" class="bsp-btn-compose">+</div>
                    </div>
                    <div id="mail-inbox-list" class="bsp-mail-inbox-list"></div>
                </div>

                <!-- WIDOK 2: ROZMOWA (CHAT) -->
                <div id="mail-conversation-view" class="hidden" style="flex-direction: column; height: 100%; width: 100%;">
                    <div class="bsp-mail-header">
                        <div id="btn-mail-back" class="bsp-mail-back-btn"></div>
                        <div id="mail-chat-username" class="bsp-chat-user-pill">Gracz</div>
                    </div>
                    <div id="mail-chat-messages" class="bsp-chat-area"></div>
                    <div class="bsp-chat-footer">
                        <input id="mail-reply-input" class="bsp-chat-input" placeholder="Napisz wiadomość..." maxlength="250">
                        <div id="mail-reply-btn" class="bsp-chat-send-btn">✔</div>
                    </div>
                </div>

                <!-- WIDOK 3: NOWA WIADOMOŚĆ -->
                <div id="new-mail-composer" class="hidden" style="flex-direction: column; height: 100%; width: 100%;">
                    <div class="bsp-mail-header">
                        <div id="btn-cancel-composer" class="bsp-mail-back-btn"></div>
                        <span class="bsp-mail-title">Nowa Wiadomość</span>
                    </div>
                    <div class="bsp-composer-search-row">
                        <div class="bsp-search-box">
                            <span class="bsp-search-prefix">Do:</span>
                            <input id="new-mail-recipient-input" class="bsp-search-input" placeholder="Wpisz nick gracza..." autocomplete="off">
                        </div>
                        <div id="btn-search-recipient" class="bsp-search-btn">
                            <span class="bsp-search-icon">🔍</span>
                        </div>
                    </div>
                    <div id="composer-friends-list" class="bsp-composer-list"></div>
                </div>

            </div>
        </div>
    </div>
`;

export class MailManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.activeConversation = null;
        this.friendsCache = [];
        this.isClosing = false;
    }

    initialize() {
        if (!document.getElementById('mail-panel')) {
            const modalsLayer = document.getElementById('modals-layer');
            if (modalsLayer) {
                modalsLayer.insertAdjacentHTML('beforeend', TEMPLATE);
            }
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        const btnCompose = document.getElementById('btn-mail-compose');
        if (btnCompose) {
            btnCompose.onclick = () => {
                this.switchView('composer');
                this.loadComposerFriends();
            };
        }

        const btnBack = document.getElementById('btn-mail-back');
        if (btnBack) {
            btnBack.onclick = () => {
                this.activeConversation = null;
                this.switchView('inbox');
                this.loadMailData();
            };
        }

        const btnCancelComposer = document.getElementById('btn-cancel-composer');
        if (btnCancelComposer) {
            btnCancelComposer.onclick = () => {
                this.switchView('inbox');
            };
        }

        const btnReply = document.getElementById('mail-reply-btn');
        if (btnReply) {
            btnReply.onclick = () => this.sendReply();
        }

        const replyInput = document.getElementById('mail-reply-input');
        if (replyInput) {
            replyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendReply();
            });
        }

        const btnSearchRecipient = document.getElementById('btn-search-recipient');
        const recipientInput = document.getElementById('new-mail-recipient-input');
        
        if (btnSearchRecipient && recipientInput) {
            const doSearch = () => {
                const query = recipientInput.value.trim();
                if (query) {
                    this.openConversation(query);
                }
            };
            btnSearchRecipient.onclick = doSearch;
            recipientInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') doSearch();
            });
        }

        // Zamykanie poczty po kliknięciu poza samą kartą
        const panel = document.getElementById('mail-panel');
        if (panel) {
            panel.addEventListener('mousedown', (e) => {
                if (!e.target.closest('#bsp-mail-card-el')) {
                    this.close();
                }
            });
            panel.addEventListener('touchstart', (e) => {
                if (!e.target.closest('#bsp-mail-card-el')) {
                    this.close();
                }
            }, { passive: true });
        }
    }

    sendReply() {
        const input = document.getElementById('mail-reply-input');
        const text = input.value.trim();
        if (text && this.activeConversation && this.ui.onSendPrivateMessage) {
            this.ui.onSendPrivateMessage(this.activeConversation, text);
            input.value = '';

            const container = document.getElementById('mail-chat-messages');
            const myAvatar = localStorage.getItem('bsp_clone_player_avatar') || 'icons/avatar_placeholder.png';

            const row = document.createElement('div');
            row.className = 'bsp-msg-row sent';
            row.innerHTML = `
                <div class="bsp-msg-bubble">${this.escapeHtml(text)}</div>
                <div class="bsp-msg-avatar" style="background-image: url('${myAvatar}');"></div>
            `;
            container.appendChild(row);
            container.scrollTop = container.scrollHeight;
        }
    }

    open() {
        const panel = document.getElementById('mail-panel');
        if (!panel) return;

        this.isClosing = false;
        if (this.ui.bringToFront) this.ui.bringToFront(panel);

        this.setHudVisibility(false);

        panel.style.display = 'flex';
        requestAnimationFrame(() => {
            panel.classList.add('active');
        });

        this.switchView('inbox');
        this.loadMailData();
    }

    close() {
        const panel = document.getElementById('mail-panel');
        if (!panel || this.isClosing) return;

        this.isClosing = true;
        panel.classList.remove('active');

        this.setHudVisibility(true);

        setTimeout(() => {
            if (this.isClosing) {
                panel.style.display = 'none';
                this.isClosing = false;
                this.activeConversation = null;
            }
        }, 280);
    }

    setHudVisibility(visible) {
        const displayVal = visible ? '' : 'none';
        
        const chat = document.querySelector('.chat-container');
        if (chat) chat.style.display = visible ? 'flex' : 'none';

        const rightUi = document.querySelector('.right-ui');
        if (rightUi) rightUi.style.display = displayVal;

        const mobileControls = document.getElementById('mobile-game-controls');
        if (mobileControls && this.ui.isMobile) {
            mobileControls.style.display = visible ? 'block' : 'none';
        }
    }

    switchView(viewName) {
        const inbox = document.getElementById('mail-inbox-view');
        const chat = document.getElementById('mail-conversation-view');
        const composer = document.getElementById('new-mail-composer');

        if (inbox) inbox.classList.add('hidden');
        if (chat) chat.classList.add('hidden');
        if (composer) composer.classList.add('hidden');

        if (viewName === 'inbox') {
            inbox.classList.remove('hidden');
        } else if (viewName === 'chat') {
            chat.classList.remove('hidden');
            chat.style.display = 'flex';
        } else if (viewName === 'composer') {
            composer.classList.remove('hidden');
            composer.style.display = 'flex';
        }
    }

    async loadMailData() {
        const t = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (!t) return;

        const inboxList = document.getElementById('mail-inbox-list');
        if (inboxList) {
            inboxList.innerHTML = '<p class="text-outline" style="text-align:center; padding:30px; color:white;">Ładowanie...</p>';
        }

        try {
            const r = await fetch(`${API_BASE_URL}/api/messages`, { 
                headers: { 'Authorization': `Bearer ${t}` } 
            });
            const messages = await r.json();
            this.renderMailList(messages);
        } catch (e) {
            console.error(e);
            if (inboxList) {
                inboxList.innerHTML = '<p class="text-outline" style="text-align:center; color:white; padding:30px;">Błąd pobierania wiadomości.</p>';
            }
        }
    }

    renderMailList(messages) {
        const list = document.getElementById('mail-inbox-list');
        if (!list) return;
        list.innerHTML = '';

        if (!messages || messages.length === 0) {
            list.innerHTML = '<p class="text-outline" style="text-align:center; padding:30px; color:white;">Skrzynka jest pusta.</p>';
            return;
        }

        const myName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);

        messages.forEach(msg => {
            const div = document.createElement('div');
            const isUnread = Boolean(msg.is_read === false && msg.sender_username !== myName);
            div.className = `bsp-mail-row ${isUnread ? 'unread' : 'read'}`;

            const timeStr = this.formatTimeAgo(msg.created_at);
            const isMeLastSender = msg.sender_username === myName;
            const previewText = (isMeLastSender ? 'Ty: ' : '') + msg.message_text;
            const avatarUrl = msg.other_avatar || 'icons/avatar_placeholder.png';

            div.innerHTML = `
                ${isUnread ? '<div class="bsp-unread-badge">!</div>' : ''}
                <div class="bsp-row-avatar" style="background-image: url('${avatarUrl}');"></div>
                <div class="bsp-row-content">
                    <div class="bsp-row-username">${this.escapeHtml(msg.other_username)}</div>
                    <div class="bsp-row-preview">${this.escapeHtml(previewText)}</div>
                    <div class="bsp-row-time">${timeStr}</div>
                </div>
            `;

            div.onclick = () => {
                this.openConversation(msg.other_username);
            };

            list.appendChild(div);
        });
    }

    async openConversation(username) {
        this.activeConversation = username;
        this.switchView('chat');

        const headerName = document.getElementById('mail-chat-username');
        if (headerName) headerName.textContent = username;

        const msgsContainer = document.getElementById('mail-chat-messages');
        if (msgsContainer) {
            msgsContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#2c3e50; font-family:Arial,sans-serif; font-weight:bold;">Pobieranie...</p>';
        }

        const t = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        try {
            const r = await fetch(`${API_BASE_URL}/api/messages/${username}`, { 
                headers: { 'Authorization': `Bearer ${t}` } 
            });
            const history = await r.json();
            this.renderChatHistory(history);
        } catch (e) {
            console.error(e);
        }
    }

    renderChatHistory(history) {
        const container = document.getElementById('mail-chat-messages');
        if (!container) return;
        container.innerHTML = '';

        const myName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
        const myAvatar = localStorage.getItem('bsp_clone_player_avatar') || 'icons/avatar_placeholder.png';

        history.forEach(msg => {
            const isMine = msg.sender_username === myName;
            const row = document.createElement('div');
            row.className = `bsp-msg-row ${isMine ? 'sent' : 'received'}`;

            const senderAvatar = isMine ? myAvatar : (msg.sender_avatar || 'icons/avatar_placeholder.png');

            if (isMine) {
                row.innerHTML = `
                    <div class="bsp-msg-bubble">${this.escapeHtml(msg.message_text)}</div>
                    <div class="bsp-msg-avatar" style="background-image: url('${senderAvatar}');"></div>
                `;
            } else {
                row.innerHTML = `
                    <div class="bsp-msg-avatar" style="background-image: url('${senderAvatar}');"></div>
                    <div class="bsp-msg-bubble">${this.escapeHtml(msg.message_text)}</div>
                `;
            }

            container.appendChild(row);
        });

        container.scrollTop = container.scrollHeight;
    }

    async loadComposerFriends() {
        const listContainer = document.getElementById('composer-friends-list');
        if (!listContainer) return;

        listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:white;">Ładowanie znajomych...</p>';

        const t = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (!t) return;

        try {
            const r = await fetch(`${API_BASE_URL}/api/friends`, { 
                headers: { 'Authorization': `Bearer ${t}` } 
            });
            if (r.ok) {
                const d = await r.json();
                this.friendsCache = d.friends || [];
                this.renderComposerFriends(this.friendsCache);
            }
        } catch (e) {
            console.error(e);
            listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:white;">Wpisz nick powyżej.</p>';
        }
    }

    renderComposerFriends(friends) {
        const listContainer = document.getElementById('composer-friends-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';

        if (!friends || friends.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:white;">Brak znajomych. Wpisz nick gracza w polu powyżej.</p>';
            return;
        }

        friends.forEach(f => {
            const row = document.createElement('div');
            row.className = 'bsp-composer-user-row';

            const avatarUrl = f.current_skin_thumbnail || 'icons/avatar_placeholder.png';

            row.innerHTML = `
                <div class="bsp-row-avatar" style="background-image: url('${avatarUrl}'); width:44px; height:44px; margin-right:12px;"></div>
                <div class="bsp-row-username" style="font-size:16px;">${this.escapeHtml(f.username)}</div>
            `;

            row.onclick = () => {
                this.openConversation(f.username);
            };

            listContainer.appendChild(row);
        });
    }

    formatTimeAgo(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now - date) / 1000);

        if (diffSeconds < 60) return 'przed chwilą';
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes} minut temu`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} godz. temu`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) return `${diffDays} dni temu`;
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths} miesięcy temu`;
        const diffYears = Math.floor(diffDays / 365);
        return `${diffYears} lat temu`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
