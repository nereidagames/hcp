/* PLIK: SkinDetailsManager.js */

import * as THREE from 'three';
import { API_BASE_URL, STORAGE_KEYS } from './Config.js';
import { SkinStorage } from './SkinStorage.js';
import { PrefabStorage } from './PrefabStorage.js';
import { HyperCubePartStorage } from './HyperCubePartStorage.js';
import { createBaseCharacter } from './character.js';

// Szablon HTML dla szczegółów skina
const SKIN_DETAILS_TEMPLATE = `
    <style>
        #skin-details-modal .panel-content {
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

        .skin-card {
            width: 500px;
            height: 420px;
            background: linear-gradient(to bottom, #74b9ff, #0984e3);
            border-radius: 20px;
            position: relative;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6);
            border: 4px solid white;
            font-family: 'Titan One', cursive;
            display: flex;
            flex-direction: column;
            overflow: visible;
        }

        .skin-name-header {
            width: 100%;
            text-align: center;
            color: white;
            font-size: 32px;
            text-shadow: 2px 2px 0 #000;
            margin-top: 10px;
            z-index: 10;
        }

        .skin-left-panel {
            position: absolute;
            top: 60px; left: 0; bottom: 0;
            width: 140px;
            background: rgba(0,0,0,0.2);
            border-radius: 0 0 0 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 10px;
            border-right: 2px solid rgba(255,255,255,0.2);
            z-index: 5;
        }

        .skin-creator-avatar {
            width: 60px; height: 60px;
            background-color: #333;
            border: 3px solid white;
            border-radius: 10px;
            background-size: cover;
            background-position: center;
            margin-bottom: 5px;
        }

        .skin-creator-label { font-size: 10px; color: #ddd; }
        .skin-creator-name { font-size: 14px; color: #f1c40f; text-shadow: 1px 1px 0 #000; margin-bottom: 5px; text-align: center; width: 90%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .skin-time-info { font-size: 10px; color: #ccc; margin-bottom: 15px; }

        .skin-level-box {
            width: 50px; height: 50px;
            background: url('icons/icon-level.png') center/contain no-repeat;
            display: flex; justify-content: center; align-items: center;
            font-size: 18px; color: white; text-shadow: 2px 2px 0 #000;
            margin-bottom: 10px;
        }

        .skin-likes-box {
            display: flex; flex-direction: column; align-items: center;
            background: #2980b9;
            width: 100%;
            padding: 10px 0;
            margin-top: auto;
            border-radius: 0 0 0 20px;
        }
        .skin-likes-icon { width: 30px; height: 30px; background: url('icons/icon-like.png') center/contain no-repeat; margin-bottom: 5px; }
        .skin-likes-count { color: white; font-size: 16px; text-shadow: 1px 1px 0 #000; }

        .skin-right-panel {
            position: absolute;
            top: 60px; right: 0; bottom: 0;
            width: 100px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
            align-items: center;
            z-index: 5;
        }

        .skin-action-btn {
            width: 80px; height: 80px;
            background: linear-gradient(to bottom, #74b9ff, #0984e3);
            border: 3px solid white;
            border-radius: 15px;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            box-shadow: 0 5px 0 #0c2461;
            cursor: pointer; transition: transform 0.1s;
        }
        .skin-action-btn:active { transform: translateY(3px); box-shadow: 0 2px 0 #0c2461; }

        .skin-btn-icon { width: 40px; height: 40px; background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.3)); }
        .skin-btn-label { color: white; font-size: 10px; margin-top: 2px; text-shadow: 1px 1px 0 #000; text-align: center; }

        #skin-preview-canvas {
            position: absolute;
            top: 60px; left: 140px; right: 100px; bottom: 0;
            z-index: 1;
        }

        .skin-warning-icon {
            position: absolute; bottom: 10px; left: 150px;
            width: 30px; height: 30px;
            background: url('icons/alert.png') center/contain no-repeat;
            opacity: 0.8;
        }

        .skin-close-btn {
            position: absolute; top: -15px; right: -15px;
            width: 45px; height: 45px;
            background: #e74c3c; border: 3px solid white; border-radius: 50%;
            display: flex; justify-content: center; align-items: center;
            font-size: 24px; color: white; cursor: pointer;
            box-shadow: 0 3px 5px rgba(0,0,0,0.3); z-index: 20;
        }

        @media (max-width: 600px) {
            .skin-card { width: 95vw; height: 80vh; max-height: 500px; }
            .skin-left-panel { width: 100px; }
            .skin-right-panel { width: 80px; }
            .skin-action-btn { width: 60px; height: 60px; }
            #skin-preview-canvas { left: 100px; right: 80px; }
            .skin-name-header { font-size: 24px; }
        }
    </style>

    <div id="skin-details-modal" class="panel-modal" style="display:none;">
        <div class="panel-content">
            <div class="skin-card">
                <div class="skin-close-btn panel-close-button">X</div>
                <div class="skin-name-header text-outline">Nazwa Skina</div>
                <div class="skin-left-panel">
                    <div class="skin-creator-avatar"></div>
                    <span class="skin-creator-label text-outline">Stworzony przez:</span>
                    <div class="skin-creator-name text-outline">Gracz</div>
                    <div class="skin-time-info">dzisiaj</div>
                    <div class="skin-level-box text-outline"><span class="skin-creator-level-val">1</span></div>
                    <div class="skin-likes-box">
                        <div class="skin-likes-icon"></div>
                        <div class="skin-likes-count text-outline">0</div>
                    </div>
                </div>
                <div id="skin-preview-canvas"></div>
                <div class="skin-warning-icon"></div>
                <div class="skin-right-panel">
                    <div id="skin-btn-share" class="skin-action-btn">
                        <div class="skin-btn-icon" style="background-image: url('icons/icon-share.png');"></div>
                        <div class="skin-btn-label">Udostępnij</div>
                    </div>
                    <div id="skin-btn-like" class="skin-action-btn">
                        <div class="skin-btn-icon" style="background-image: url('icons/icon-like.png');"></div>
                        <div class="skin-btn-label">Polub</div>
                    </div>
                    <div id="skin-btn-comment" class="skin-action-btn">
                        <div class="skin-btn-icon" style="background-image: url('icons/icon-chat.png');"></div>
                        <div class="skin-btn-label">Komentarze</div>
                    </div>
                    <div id="skin-btn-use" class="skin-action-btn" style="display:none; background: linear-gradient(to bottom, #2ecc71, #27ae60);">
                        <div class="skin-btn-icon" style="background-image: url('icons/icon-play.png');"></div>
                        <div class="skin-btn-label">Użyj</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

const SKIN_COMMENTS_TEMPLATE = `
    <div id="skin-comments-panel" style="display:none;">
        <div class="panel-close-button" id="close-comments-btn" style="position: absolute; top: 10px; left: -50px; z-index: 10; background: #e74c3c; width: 40px; height: 40px; display:flex; justify-content:center; align-items:center; font-weight:bold;">X</div>
        <div class="comments-list-container"></div>
        <div class="comments-input-area">
            <input id="comment-input" type="text" placeholder="Napisz wiadomość...">
            <button id="comment-submit-btn">✔</button>
        </div>
    </div>
`;

export class SkinDetailsManager {
    constructor(uiManager) {
        this.ui = uiManager;
        
        // Elementy DOM
        this.modal = null;
        this.commentsPanel = null;
        
        // Stan
        this.currentDetailsId = null;
        this.currentDetailsType = null;
        
        // Preview 3D
        this.sharedPreviewRenderer = null;
        this.previewScene = null;
        this.previewCamera = null;
        this.previewCharacter = null;
        this.previewAnimId = null;
        
        // Callbacki
        this.onSkinSelect = null;
        this.onUsePrefab = null;
        this.onUsePart = null;
        
        // Bindowanie
        this.closeModal = this.closeModal.bind(this);
        this.closeComments = this.closeComments.bind(this);
    }
    
    initialize() {
        // Wstrzyknij HTML do modals-layer
        const modalsLayer = document.getElementById('modals-layer');
        if (modalsLayer) {
            modalsLayer.insertAdjacentHTML('beforeend', SKIN_DETAILS_TEMPLATE);
            modalsLayer.insertAdjacentHTML('beforeend', SKIN_COMMENTS_TEMPLATE);
        }
        
        this.modal = document.getElementById('skin-details-modal');
        this.commentsPanel = document.getElementById('skin-comments-panel');
        
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
        // Zamknięcie modala przez przycisk X
        const closeBtn = this.modal?.querySelector('.skin-close-btn');
        if (closeBtn) closeBtn.onclick = this.closeModal;
        
        // Zamknięcie przez kliknięcie w tło
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }
        
        // Zamknięcie panelu komentarzy
        const closeCommentsBtn = document.getElementById('close-comments-btn');
        if (closeCommentsBtn) closeCommentsBtn.onclick = this.closeComments;
        
        if (this.commentsPanel) {
            this.commentsPanel.addEventListener('click', (e) => {
                if (e.target === this.commentsPanel) this.closeComments();
            });
        }
        
        // Przycisk komentarzy - ustawiamy w showItemDetails
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
            const material = new THREE.MeshLambertMaterial({ map: loader.load(b.texturePath) });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(b.x, b.y, b.z);
            blockGroup.add(mesh);
        });
        
        this.previewCharacter.add(blockGroup);
    }
    
    async showItemDetails(item, type, keepOpen = false) {
        if (!this.modal) return;
        
        this.currentDetailsId = item.id;
        this.currentDetailsType = type;
        
        if (!keepOpen) this.ui.closeAllPanels();
        
        this.ui.bringToFront(this.modal);
        this.modal.style.display = 'flex';
        
        // Wypełnij dane
        const headerName = this.modal.querySelector('.skin-name-header');
        const creatorName = this.modal.querySelector('.skin-creator-name');
        const creatorLevel = this.modal.querySelector('.skin-creator-level-val');
        const likesCount = this.modal.querySelector('.skin-likes-count');
        const timeInfo = this.modal.querySelector('.skin-time-info');
        
        const btnUse = document.getElementById('skin-btn-use');
        const btnLike = document.getElementById('skin-btn-like');
        const btnComment = document.getElementById('skin-btn-comment');
        
        if (headerName) headerName.textContent = item.name || "Bez nazwy";
        if (creatorName) creatorName.textContent = item.creator || "Nieznany";
        if (creatorLevel) creatorLevel.textContent = item.creatorLevel || item.level || "1";
        if (likesCount) likesCount.textContent = item.likes || "0";
        
        if (timeInfo) {
            let dateStr = "niedawno";
            if (item.created_at) {
                const date = new Date(item.created_at);
                if (!isNaN(date.getTime())) {
                    const now = new Date();
                    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
                    dateStr = diffDays === 0 ? "dzisiaj" : `${diffDays} dni temu`;
                }
            }
            timeInfo.textContent = dateStr;
        }
        
        if (btnComment) {
            const label = btnComment.querySelector('.skin-btn-label');
            if (label) label.textContent = "Komentarze";
            btnComment.onclick = () => this.openComments(item.id, type);
        }
        
        const myId = parseInt(localStorage.getItem(STORAGE_KEYS.USER_ID) || "0");
        const isOwner = item.owner_id === myId;
        
        // Przycisk UŻYJ
        if (btnUse) {
            if (type === 'skin' && isOwner) {
                btnUse.style.display = 'flex';
                btnUse.onclick = () => {
                    this.closeModal();
                    if (this.onSkinSelect) this.onSkinSelect(item.id, item.name, item.thumbnail, item.owner_id);
                };
            } else if (type === 'part' && isOwner) {
                btnUse.style.display = 'flex';
                btnUse.onclick = () => {
                    this.closeModal();
                    if (this.onUsePart) this.onUsePart(item);
                };
            } else if (type === 'prefab' && isOwner) {
                btnUse.style.display = 'flex';
                btnUse.onclick = () => {
                    this.closeModal();
                    if (this.onUsePrefab) this.onUsePrefab(item);
                };
            } else {
                btnUse.style.display = 'none';
            }
        }
        
        // Przycisk Lajk
        if (btnLike) {
            btnLike.onclick = async () => {
                const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
                if (!token) return;
                
                btnLike.style.transform = 'scale(0.95)';
                setTimeout(() => btnLike.style.transform = 'scale(1)', 100);
                
                try {
                    const endpointType = type === 'skin' ? 'skins' : (type === 'part' ? 'parts' : 'prefabs');
                    const response = await fetch(`${API_BASE_URL}/api/${endpointType}/${item.id}/like`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success && likesCount) likesCount.textContent = data.likes;
                } catch (error) {
                    console.error("Like error:", error);
                }
            };
        }
        
        // Podgląd 3D
        this.attachPreviewTo('skin-preview-canvas', type === 'skin' ? -0.8 : 0, 1.3);
        
        let blocksData = null;
        if (type === 'skin') blocksData = await SkinStorage.loadSkinData(item.id);
        else if (type === 'prefab') blocksData = await PrefabStorage.loadPrefab(item.id);
        else if (type === 'part') blocksData = await HyperCubePartStorage.loadPart(item.id);
        
        this.applySkinToPreview(blocksData);
    }
    
    async openComments(itemId, type) {
        if (!this.commentsPanel) return;
        
        this.commentsPanel.style.display = 'flex';
        this.ui.bringToFront(this.commentsPanel);
        
        const listContainer = this.commentsPanel.querySelector('.comments-list-container');
        if (!listContainer) return;
        
        listContainer.innerHTML = '<p class="text-outline" style="text-align:center; padding:20px;">Ładowanie...</p>';
        
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (!token) return;
        
        try {
            const endpointType = type === 'skin' ? 'skins' : (type === 'part' ? 'parts' : 'prefabs');
            const response = await fetch(`${API_BASE_URL}/api/${endpointType}/${itemId}/comments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const comments = await response.json();
            this.renderComments(comments, itemId, type);
        } catch (error) {
            console.error("Comments error:", error);
            listContainer.innerHTML = '<p class="text-outline" style="text-align:center; color:red;">Błąd ładowania</p>';
        }
        
        // Obsługa wysyłania komentarza
        const submitBtn = document.getElementById('comment-submit-btn');
        const commentInput = document.getElementById('comment-input');
        
        if (submitBtn && commentInput) {
            const newSubmitHandler = async () => {
                const text = commentInput.value.trim();
                if (!text) return;
                
                const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
                if (!token) return;
                
                try {
                    const endpointType = type === 'skin' ? 'skins' : (type === 'part' ? 'parts' : 'prefabs');
                    await fetch(`${API_BASE_URL}/api/${endpointType}/${itemId}/comments`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ text })
                    });
                    commentInput.value = '';
                    this.openComments(itemId, type);
                } catch (error) {
                    console.error("Post comment error:", error);
                }
            };
            
            submitBtn.onclick = newSubmitHandler;
            commentInput.onkeypress = (e) => {
                if (e.key === 'Enter') newSubmitHandler();
            };
        }
    }
    
    renderComments(comments, itemId, type) {
        const listContainer = this.commentsPanel.querySelector('.comments-list-container');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        if (!comments || comments.length === 0) {
            listContainer.innerHTML = '<p class="text-outline" style="text-align:center; padding:20px;">Brak komentarzy</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';
            commentDiv.style.cssText = `
                background: rgba(0,0,0,0.5);
                border-radius: 8px;
                padding: 10px;
                margin-bottom: 10px;
                border: 1px solid rgba(255,255,255,0.2);
            `;
            
            const date = new Date(comment.created_at);
            const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            commentDiv.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <div style="width:30px; height:30px; background-image:url('${comment.current_skin_thumbnail || 'icons/avatar_placeholder.png'}'); background-size:cover; border-radius:50%; border:2px solid white;"></div>
                    <div style="flex:1;">
                        <span style="color:#f1c40f; font-weight:bold;">${comment.username}</span>
                        <span style="font-size:10px; color:#aaa; margin-left:10px;">${dateStr}</span>
                    </div>
                </div>
                <div style="color:white; font-size:14px; margin-bottom:8px;">${comment.text}</div>
                <div style="display:flex; gap:15px;">
                    <button class="comment-like-btn" data-comment-id="${comment.id}" style="background:transparent; border:none; color:#3498db; cursor:pointer; font-size:12px;">👍 ${comment.likes || 0}</button>
                </div>
            `;
            
            const likeBtn = commentDiv.querySelector('.comment-like-btn');
            if (likeBtn) {
                likeBtn.onclick = async () => {
                    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
                    if (!token) return;
                    
                    const commentId = likeBtn.dataset.commentId;
                    const endpointType = type === 'skin' ? 'skins' : (type === 'part' ? 'parts' : 'prefabs');
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/${endpointType}/comments/${commentId}/like`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await response.json();
                        if (data.success) {
                            const currentLikes = parseInt(likeBtn.textContent.replace('👍 ', '')) || 0;
                            likeBtn.textContent = `👍 ${data.likes}`;
                        }
                    } catch (error) {
                        console.error("Like comment error:", error);
                    }
                };
            }
            
            listContainer.appendChild(commentDiv);
        });
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        this.disposePreview();
    }
    
    closeComments() {
        if (this.commentsPanel) {
            this.commentsPanel.style.display = 'none';
        }
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
    
    cleanup() {
        if (this.previewAnimId) {
            cancelAnimationFrame(this.previewAnimId);
        }
        if (this.sharedPreviewRenderer) {
            this.sharedPreviewRenderer.dispose();
        }
    }
}