import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

export class PrefabStorage {

  static async savePrefab(prefabName, blocksData, thumbnail = null) {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) {
        alert("Musisz być zalogowany, aby zapisać prefabrykat!");
        return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/prefabs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: prefabName, blocks: blocksData, thumbnail })
      });
      
      if (response.ok) {
          return true;
      } else {
          const err = await response.json();
          alert(`Błąd zapisu: ${err.message}`);
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  static async loadPrefab(prefabId) {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return null;
    try {
        const r = await fetch(`${API_BASE_URL}/api/prefabs/${prefabId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(r.ok) return await r.json();
    } catch(e) {}
    return null;
  }

  static async getSavedPrefabsList() {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return [];
    try {
        const r = await fetch(`${API_BASE_URL}/api/prefabs/mine`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(r.ok) return await r.json();
    } catch(e) {}
    return [];
  }

  static async getAllPrefabs() {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return [];
    try {
        const r = await fetch(`${API_BASE_URL}/api/prefabs/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(r.ok) return await r.json();
    } catch(e) {}
    return [];
  }
}