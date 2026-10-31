/* PLIK: VipManager.js */

import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

const VIP_TIERS_DATA = {
    vip: {
        name: 'VIP',
        badge: 'icons/normal-vip-badge.png',
        color: '#f1c40f',
        bgGradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        packages: [
            { id: 'week', label: 'Tydzień', days: 7, cost: 2500 },
            { id: 'month', label: 'Miesiąc', days: 30, cost: 15000 },
            { id: '3_months', label: '3 Miesiące', days: 90, cost: 35000 },
            { id: 'year', label: 'Rok', days: 365, cost: 125000 }
        ]
    },
    super_vip: {
        name: 'Super VIP',
        badge: 'icons/super-vip-badge.png',
        color: '#9b59b6',
        bgGradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        packages: [
            { id: 'week', label: 'Tydzień', days: 7, cost: 4500 },
            { id: 'month', label: 'Miesiąc', days: 30, cost: 22500 },
            { id: '3_months', label: '3 Miesiące', days: 90, cost: 50000 },
            { id: 'year', label: 'Rok', days: 365, cost: 175000 }
        ]
    },
    elite_vip: {
        name: 'Elite VIP',
        badge: 'icons/elite-vip-badge.png',
        color: '#e74c3c',
        bgGradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
        packages: [
            { id: 'week', label: 'Tydzień', days: 7, cost: 6000 },
            { id: 'month', label: 'Miesiąc', days: 30, cost: 30000 },
            { id: '3_months', label: '3 Miesiące', days: 90, cost: 75000 },
            { id: 'year', label: 'Rok', days: 365, cost: 250000 }
        ]
    },
    star_vip: {
        name: 'Star VIP',
        badge: 'icons/star-vip-badge.png',
        color: '#3498db',
        bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        packages: [
            { id: 'week', label: 'Tydzień', days: 7, cost: 10000 },
            { id: 'month', label: 'Miesiąc', days: 30, cost: 50000 },
            { id: '3_months', label: '3 Miesiące', days: 90, cost: 150000 },
            { id: 'year', label: 'Rok', days: 365, cost: 500000 }
        ]
    }
};

const TEMPLATE = `
    <style>
        #vip-shop-modal .panel-content {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: auto !important;
            max-width: none !important;
            pointer-events: auto;
        }

        .vip-shop-card {
            width: 580px;
            max-width: 95vw;
            height: 520px;
            max-height: 85vh;
            background: #2c3e50;
            border: 4px solid white;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Titan One', cursive;
            position: relative;
            box-shadow: 0 12px 35px rgba(0,0,0,0.6);
        }

        .vip-shop-header {
            height: 54px;
            background: linear-gradient(to bottom, #f39c12, #d35400);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 15px;
            border-bottom: 3px solid rgba(255,255,255,0.4);
            flex-shrink: 0;
        }

        .vip-shop-title {
            color: white;
            font-size: 24px;
            text-shadow: 2px 2px 0 #000;
        }

        .vip-shop-close-btn {
            width: 38px;
            height: 38px;
            background: #e74c3c;
            border: 2px solid white;
            border-radius: 50%;
            color: white;
            font-size: 18px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        }
        .vip-shop-close-btn:active { transform: scale(0.92); }

        /* PASEK STATUSU VIP UŻYTKOWNIKA */
        .vip-user-status-bar {
            background: rgba(0, 0, 0, 0.4);
            padding: 10px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid rgba(255,255,255,0.2);
            flex-shrink: 0;
        }

        .vip-status-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .vip-current-badge-preview {
            width: 44px;
            height: 34px;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        }

        .vip-status-name {
            font-size: 15px;
            color: white;
            text-shadow: 1px 1px 0 #000;
        }

        .vip-status-timer {
            font-size: 13px;
            color: #f1c40f;
            text-shadow: 1px 1px 0 #000;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        /* ZAKŁADKI RANG */
        .vip-tier-tabs {
            display: flex;
            background: #1a252f;
            height: 48px;
            border-bottom: 2px solid rgba(255,255,255,0.2);
            flex-shrink: 0;
        }

        .vip-tier-tab {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            cursor: pointer;
            color: #bdc3c7;
            font-size: 13px;
            text-shadow: 1px 1px 0 #000;
            transition: all 0.15s ease-out;
            border-bottom: 3px solid transparent;
        }

        .vip-tier-tab.active {
            color: white;
            background: rgba(255, 255, 255, 0.12);
            border-bottom: 3px solid #f1c40f;
        }

        .vip-tab-badge-icon {
            width: 22px;
            height: 18px;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        }

        /* ZAWARTOŚĆ Z PAKIETAMI */
        .vip-tier-content {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #243342;
        }

        .vip-pkg-row {
            background: rgba(255, 255, 255, 0.08);
            border: 2px solid rgba(255, 255, 255, 0.25);
            border-radius: 12px;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: transform 0.1s, background 0.15s;
        }
        .vip-pkg-row:hover {
            background: rgba(255, 255, 255, 0.14);
        }

        .vip-pkg-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .vip-pkg-label {
            font-size: 18px;
            color: white;
            text-shadow: 1.5px 1.5px 0 #000;
        }

        .vip-pkg-sub {
            font-size: 11px;
            color: #bdc3c7;
            font-family: Arial, sans-serif;
            font-weight: bold;
        }

        .vip-buy-btn {
            background: linear-gradient(to bottom, #2ecc71, #27ae60);
            border: 2px solid white;
            border-radius: 10px;
            padding: 8px 16px;
            color: white;
            font-family: 'Titan One', cursive;
            font-size: 15px;
            cursor: pointer;
            box-shadow: 0 3px 0 #1e8449;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: transform 0.1s;
            text-shadow: 1px 1px 0 #000;
        }
        .vip-buy-btn:active {
            transform: translateY(2px);
            box-shadow: none;
        }

        .vip-coin-icon-small {
            width: 18px;
            height: 18px;
            background: url('icons/icon-coin.png') center/contain no-repeat;
        }
    </style>

    <div id="vip-shop-modal" class="panel-modal" style="display:none; z-index:33000;">
        <div class="panel-content">
            <div class="vip-shop-card">
                
                <div class="vip-shop-header">
                    <span class="vip-shop-title">Sklep VIP</span>
                    <div id="btn-vip-shop-close" class="vip-shop-close-btn">X</div>
                </div>

                <!-- PODGLĄD AKTUALNEGO VIPA -->
                <div class="vip-user-status-bar">
                    <div class="vip-status-left">
                        <div id="vip-status-badge-icon" class="vip-current-badge-preview"></div>
                        <span id="vip-status-text" class="vip-status-name">Brak aktywnego VIP-a</span>
                    </div>
                    <div id="vip-status-countdown" class="vip-status-timer"></div>
                </div>

                <!-- ZAKŁADKI 4 RANG -->
                <div class="vip-tier-tabs">
                    <div class="vip-tier-tab active" data-tier="vip">
                        <div class="vip-tab-badge-icon" style="background-image: url('icons/normal-vip-badge.png');"></div>
                        <span>VIP</span>
                    </div>
                    <div class="vip-tier-tab" data-tier="super_vip">
                        <div class="vip-tab-badge-icon" style="background-image: url('icons/super-vip-badge.png');"></div>
                        <span>Super VIP</span>
                    </div>
                    <div class="vip-tier-tab" data-tier="elite_vip">
                        <div class="vip-tab-badge-icon" style="background-image: url('icons/elite-vip-badge.png');"></div>
                        <span>Elite VIP</span>
                    </div>
                    <div class="vip-tier-tab" data-tier="star_vip">
                        <div class="vip-tab-badge-icon" style="background-image: url('icons/star-vip-badge.png');"></div>
                        <span>Star VIP</span>
                    </div>
                </div>

                <!-- PAKIETY CENOWE -->
                <div id="vip-packages-list" class="vip-tier-content"></div>

            </div>
        </div>
    </div>
`;

export class VipManager {
    constructor(uiManager) {
        this.ui = uiManager;
        this.vipTier = 'none';
        this.vipUntil = null;
        this.activeSelectedTier = 'vip';
        this.countdownInterval = null;
    }

    initialize() {
        if (!document.getElementById('vip-shop-modal')) {
            const modalsLayer = document.getElementById('modals-layer');
            if (modalsLayer) {
                modalsLayer.insertAdjacentHTML('beforeend', TEMPLATE);
            }
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('btn-vip-shop-close');
        if (closeBtn) closeBtn.onclick = () => this.close();

        const modal = document.getElementById('vip-shop-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'vip-shop-modal') {
                    this.close();
                }
            });
        }

        const tabs = document.querySelectorAll('.vip-tier-tab');
        tabs.forEach(tab => {
            tab.onclick = () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeSelectedTier = tab.getAttribute('data-tier') || 'vip';
                this.renderPackages(this.activeSelectedTier);
            };
        });
    }

    setVipStatus(tier, until) {
        this.vipTier = tier || 'none';
        this.vipUntil = until ? new Date(until) : null;
        this.updateBadgeIcon();
        this.updateCountdownDisplay();
    }

    updateBadgeIcon() {
        const vipCornerBtn = document.getElementById('btn-vip-corner');
        if (!vipCornerBtn) return;

        const isVipActive = this.isVipActive();

        if (isVipActive) {
            let badgeUrl = 'icons/normal-vip-badge.png';
            if (this.vipTier === 'super_vip') badgeUrl = 'icons/super-vip-badge.png';
            else if (this.vipTier === 'elite_vip') badgeUrl = 'icons/elite-vip-badge.png';
            else if (this.vipTier === 'star_vip') badgeUrl = 'icons/star-vip-badge.png';

            vipCornerBtn.style.backgroundImage = `url('${badgeUrl}')`;
            vipCornerBtn.style.backgroundSize = 'contain';
            vipCornerBtn.style.backgroundPosition = 'center';
            vipCornerBtn.title = `Ranga: ${this.getTierDisplayName(this.vipTier)}`;
        } else {
            vipCornerBtn.style.backgroundImage = "url('icons/icon-vip1.png')";
            vipCornerBtn.style.backgroundSize = 'contain';
            vipCornerBtn.title = "Kup VIP";
        }
    }

    isVipActive() {
        if (!this.vipUntil || !this.vipTier || this.vipTier === 'none') return false;
        return new Date(this.vipUntil) > new Date();
    }

    getTierDisplayName(tier) {
        return VIP_TIERS_DATA[tier]?.name || 'Zwykły Gracz';
    }

    getRemainingTimeText() {
        if (!this.isVipActive()) return '';
        const now = new Date();
        const diffMs = Math.max(0, new Date(this.vipUntil).getTime() - now.getTime());

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        if (days > 0) {
            return `Wygasa za: ${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `Wygasa za: ${hours}h ${minutes}m`;
        } else {
            return `Wygasa za: ${minutes} min`;
        }
    }

    updateCountdownDisplay() {
        const textEl = document.getElementById('vip-status-text');
        const countEl = document.getElementById('vip-status-countdown');
        const badgeEl = document.getElementById('vip-status-badge-icon');

        if (!textEl || !countEl || !badgeEl) return;

        if (this.isVipActive()) {
            const tierData = VIP_TIERS_DATA[this.vipTier];
            textEl.textContent = `Twój status: ${tierData?.name || 'VIP'}`;
            textEl.style.color = tierData?.color || '#f1c40f';
            badgeEl.style.backgroundImage = `url('${tierData?.badge || 'icons/normal-vip-badge.png'}')`;
            badgeEl.style.display = 'block';
            countEl.textContent = this.getRemainingTimeText();
        } else {
            textEl.textContent = 'Brak aktywnego VIP-a';
            textEl.style.color = '#bdc3c7';
            badgeEl.style.display = 'none';
            countEl.textContent = '';
        }
    }

    startCountdownLoop() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.updateCountdownDisplay();

        this.countdownInterval = setInterval(() => {
            if (this.isVipActive()) {
                this.updateCountdownDisplay();
            } else {
                this.vipTier = 'none';
                this.vipUntil = null;
                this.updateBadgeIcon();
                this.updateCountdownDisplay();
                clearInterval(this.countdownInterval);
            }
        }, 30000); // Odświeżanie co 30 sekund
    }

    open() {
        const modal = document.getElementById('vip-shop-modal');
        if (!modal) return;

        if (this.ui.bringToFront) this.ui.bringToFront(modal);
        modal.style.display = 'flex';

        this.updateCountdownDisplay();
        this.startCountdownLoop();
        this.renderPackages(this.activeSelectedTier);
    }

    close() {
        const modal = document.getElementById('vip-shop-modal');
        if (modal) modal.style.display = 'none';
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    renderPackages(tierKey) {
        const container = document.getElementById('vip-packages-list');
        if (!container) return;
        container.innerHTML = '';

        const tierInfo = VIP_TIERS_DATA[tierKey];
        if (!tierInfo) return;

        tierInfo.packages.forEach(pkg => {
            const row = document.createElement('div');
            row.className = 'vip-pkg-row';

            row.innerHTML = `
                <div class="vip-pkg-info">
                    <span class="vip-pkg-label">${tierInfo.name} na ${pkg.label.toLowerCase()}</span>
                    <span class="vip-pkg-sub">${pkg.days} dni ważności konta</span>
                </div>
                <button class="vip-buy-btn">
                    <span>${pkg.cost.toLocaleString()}</span>
                    <div class="vip-coin-icon-small"></div>
                </button>
            `;

            const buyBtn = row.querySelector('.vip-buy-btn');
            buyBtn.onclick = () => this.purchaseVip(tierKey, pkg.id, pkg.cost);

            container.appendChild(row);
        });
    }

    async purchaseVip(tier, duration, cost) {
        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (!token) {
            this.ui.showMessage("Musisz być zalogowany!", "error");
            return;
        }

        const tierName = VIP_TIERS_DATA[tier]?.name || 'VIP';
        if (!confirm(`Czy na pewno chcesz kupić ${tierName} za ${cost} monet?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/vip/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tier, duration })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.setVipStatus(data.vipTier, data.vipUntil);
                if (this.ui.updateCoinCounter && data.newBalance !== undefined) {
                    this.ui.updateCoinCounter(data.newBalance);
                }
                this.ui.showMessage(data.message || `Aktywowano ${tierName}!`, "success");
                this.startCountdownLoop();
            } else {
                this.ui.showMessage(data.message || "Błąd zakupu pakietu.", "error");
            }
        } catch (error) {
            console.error("Purchase VIP error:", error);
            this.ui.showMessage("Błąd sieci podczas zakupu.", "error");
        }
    }
}