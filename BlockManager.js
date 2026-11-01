import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

const MASTER_BLOCK_LIST = [
    { id: 1, name: 'Ziemia', texturePath: 'textures/ziemia.png', cost: 0, category: 'block' },
    { id: 2, name: 'Trawa', texturePath: 'textures/trawa.png', cost: 0, category: 'block' },
    { id: 3, name: 'Drewno', texturePath: 'textures/drewno.png', cost: 0, category: 'block' },
    { id: 4, name: 'Piasek', texturePath: 'textures/piasek.png', cost: 0, category: 'block' },
    { id: 5, name: 'Beton', texturePath: 'textures/beton.png', cost: 0, category: 'block' },
    
    { id: 6, name: 'Gładki', texturePath: 'textures/gladki.png', cost: 150, category: 'block' },
    { id: 7, name: 'Karton', texturePath: 'textures/karton.png', cost: 200, category: 'block' },
    { id: 8, name: 'Dżins', texturePath: 'textures/dzins.png', cost: 300, category: 'block' },
    { id: 9, name: 'Kamień', texturePath: 'textures/kamien.png', cost: 400, category: 'block' },
    { id: 10, name: 'Drewniana podłoga', texturePath: 'textures/drewnianapodloga.png', cost: 450, category: 'block' },
    { id: 11, name: 'Bruk', texturePath: 'textures/bruk.png', cost: 450, category: 'block' },
    { id: 12, name: 'Cegła', texturePath: 'textures/cegla.png', cost: 500, category: 'block' },
    { id: 13, name: 'Otoczak', texturePath: 'textures/otoczak.png', cost: 550, category: 'block' },
    { id: 14, name: 'Metalowa siatka', texturePath: 'textures/metalowasiatka.png', cost: 600, category: 'block' },
    { id: 15, name: 'Metalowa płyta', texturePath: 'textures/metalowaplyta.png', cost: 800, category: 'block' },
    { id: 16, name: 'Granit', texturePath: 'textures/granit.png', cost: 900, category: 'block' },
    { id: 17, name: 'Cukierek', texturePath: 'textures/cukierek.png', cost: 1200, category: 'block' },
    { id: 18, name: 'ptok', texturePath: 'textures/ptok.png', cost: 6767, category: 'block' },

    { id: 100, name: 'Parkour Start', texturePath: 'textures/beton.png', cost: 1000, category: 'addon' }, 
    { id: 101, name: 'Parkour Meta', texturePath: 'textures/drewno.png', cost: 1000, category: 'addon' },
    
    { id: 200, name: 'Clouds', texturePath: 'textures/sky/clouds.png', cost: 0, category: 'sky', isSky: true }
];

export class BlockManager {
    constructor() {
        this.ownedBlocks = new Set();
        this.ownedSkies = new Set();
    }

    load() {
        MASTER_BLOCK_LIST.forEach(block => {
            if (block.cost === 0 && block.category !== 'sky') {
                this.ownedBlocks.add(block.name);
            }
            if (block.isSky && block.cost === 0) {
                this.ownedSkies.add(block.id);
            }
        });
    }

    setOwnedBlocks(blocksArray) {
        if (typeof blocksArray === 'string') {
            try { blocksArray = JSON.parse(blocksArray); } catch (e) { blocksArray = []; }
        }
        
        MASTER_BLOCK_LIST.forEach(block => {
            if (block.cost === 0 && block.category !== 'sky') this.ownedBlocks.add(block.name);
        });

        if (Array.isArray(blocksArray)) {
            blocksArray.forEach(b => this.ownedBlocks.add(b));
        }
    }
    
    setOwnedSkies(skiesArray) {
        if (typeof skiesArray === 'string') {
            try { skiesArray = JSON.parse(skiesArray); } catch (e) { skiesArray = []; }
        }
        
        this.ownedSkies.add(200);

        if (Array.isArray(skiesArray)) {
            skiesArray.forEach(skyId => this.ownedSkies.add(parseInt(skyId)));
        }
    }

    isOwned(blockName) {
        return this.ownedBlocks.has(blockName);
    }
    
    isSkyOwned(skyId) {
        return this.ownedSkies.has(parseInt(skyId));
    }

    getIdByTexture(texturePath, blockName) {
        if (blockName === 'Parkour Start') return 100;
        if (blockName === 'Parkour Meta') return 101;
        if (blockName === 'Clouds') return 200;
        const block = MASTER_BLOCK_LIST.find(b => b.texturePath === texturePath && b.category !== 'addon' && !b.isSky);
        return block ? block.id : 1; 
    }

    getTextureById(id) {
        const block = MASTER_BLOCK_LIST.find(b => b.id === id);
        return block ? block.texturePath : 'textures/ziemia.png';
    }
    
    getBlockNameById(id) {
        const block = MASTER_BLOCK_LIST.find(b => b.id === id);
        return block ? block.name : 'Nieznany';
    }

    getBlockById(id) {
        return MASTER_BLOCK_LIST.find(b => b.id === id);
    }
    
    getSkyById(id) {
        return MASTER_BLOCK_LIST.find(b => b.id === id && b.isSky);
    }

    async buyBlock(blockName, cost) {
        if (this.isOwned(blockName)) return { success: false, message: "Już posiadasz ten element." };

        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (!token) return { success: false, message: "Błąd autoryzacji." };

        try {
            const response = await fetch(`${API_BASE_URL}/api/shop/buy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ blockName, cost })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.setOwnedBlocks(data.ownedBlocks);
                return { success: true, newBalance: data.newBalance };
            } else {
                return { success: false, message: data.message || "Błąd zakupu." };
            }
        } catch (error) {
            return { success: false, message: "Błąd sieci." };
        }
    }
    
    async buySky(skyId, name, cost) {
        if (this.isSkyOwned(skyId)) return { success: false, message: "Już posiadasz tę panoramę." };

        const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
        if (!token) return { success: false, message: "Błąd autoryzacji." };

        try {
            const response = await fetch(`${API_BASE_URL}/api/shop/buy-sky`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ skyId, name, cost })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.setOwnedSkies(data.ownedSkies);
                return { success: true, newBalance: data.newBalance };
            } else {
                return { success: false, message: data.message || "Błąd zakupu." };
            }
        } catch (error) {
            return { success: false, message: "Błąd sieci." };
        }
    }

    getOwnedBlockTypes() {
        return MASTER_BLOCK_LIST.filter(block => this.isOwned(block.name) && !block.isSky);
    }

    getOwnedByCategory(category) {
        return MASTER_BLOCK_LIST.filter(block => this.isOwned(block.name) && block.category === category);
    }
    
    getOwnedSkies() {
        return MASTER_BLOCK_LIST.filter(block => block.isSky && this.isSkyOwned(block.id));
    }

    getAllBlockDefinitions() {
        return MASTER_BLOCK_LIST;
    }
}