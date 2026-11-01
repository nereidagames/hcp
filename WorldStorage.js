import { API_BASE_URL, STORAGE_KEYS } from './Config.js';

export class WorldStorage {

  static async saveWorld(worldName, worldData) {
    if (!worldName) return false;
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    
    if (!token) {
        alert("Nie jesteś zalogowany! Nie można zapisać świata.");
        return false;
    }

    const thumbnail = worldData.thumbnail;
    
    const dataToSave = { ...worldData };
    delete dataToSave.thumbnail; 

    try {
        const response = await fetch(`${API_BASE_URL}/api/worlds`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: worldName, 
                world_data: dataToSave, 
                thumbnail: thumbnail 
            })
        });

        if (response.ok) {
            return true;
        } else {
            const err = await response.json();
            alert(`Nie udało się zapisać: ${err.message}`);
            return false;
        }
    } catch (error) {
        alert("Błąd sieci.");
        return false;
    }
  }

  static async loadWorldData(worldId) {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/api/worlds/${worldId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            return await response.json(); 
        }
    } catch (error) {}
    return null;
  }

  static async getAllWorlds() {
    const token = localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    if (!token) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/api/worlds/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            return await response.json();
        }
    } catch(e) {}
    return [];
  }
  
  static getThumbnail(worldObj) {
      if (worldObj && worldObj.thumbnail) {
          return worldObj.thumbnail;
      }
      return null;
  }

  static loadWorld(name) { return null; }
  static getSavedWorldsList() { return []; }
}