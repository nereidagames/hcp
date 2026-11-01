import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

export class HyperCubePartStorage {

  static async savePart(partName, blocksData, thumbnail = null) {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) {
        alert("Musisz być zalogowany!");
        return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/parts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: partName, blocks: blocksData, thumbnail })
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

  static async loadPart(partId) {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return null;
    try {
        const r = await fetch(`${API_BASE_URL}/api/parts/${partId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(r.ok) return await r.json();
    } catch(e) {}
    return null;
  }

  static async getSavedPartsList() {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return [];
    try {
        const r = await fetch(`${API_BASE_URL}/api/parts/mine`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(r.ok) return await r.json();
    } catch(e) {}
    return [];
  }

  static async getAllParts() {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return [];
    try {
        const r = await fetch(`${API_BASE_URL}/api/parts/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(r.ok) return await r.json();
    } catch(e) {}
    return [];
  }
  
  static getThumbnail(partObj) {
      return partObj.thumbnail;
  }
}