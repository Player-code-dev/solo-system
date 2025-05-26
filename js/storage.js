/**
 * Solo Leveling System - Local Storage Management
 * Handles all data persistence for the PWA system
 */

class GameStorage {
    static init() {
        console.log('[GameStorage] Initializing storage system...');
        
        // Initialize default data if not exists
        if (!this.getPlayerData()) {
            this.savePlayerData(this.getDefaultPlayerData());
        }
        
        if (!this.getStats()) {
            this.saveStats(this.getDefaultStats());
        }
        
        if (!this.getQuests()) {
            this.saveQuests(this.getDefaultQuests());
        }
        
        if (!this.getSettings()) {
            this.saveSettings(this.getDefaultSettings());
        }
        
        console.log('[GameStorage] Storage initialized successfully');
    }
    
    static getDefaultPlayerData() {
        return {
            name: 'Player',
            level: 1,
            xp: 0,
            currentHP: 100,
            currentMP: 50,
            availableStatPoints: 0,
            systemAccepted: false,
            acceptedAt: null,
            lastLogin: Date.now(),
            totalQuestsCompleted: 0,
            streak: 0
        };
    }
    
    static getDefaultStats() {
        return {
            strength: 10,
            agility: 10,
            intelligence: 10,
            endurance: 10,
            faith: 10
        };
    }
    
    static getDefaultQuests() {
        return {
            daily: [],
            weekly: [],
            special: [],
            completed: []
        };
    }
    
    static getDefaultSettings() {
        return {
            soundVolume: 80,
            notifications: true,
            prayerReminders: true,
            theme: 'auto',
            language: 'en'
        };
    }
    
    static savePlayerData(data) {
        localStorage.setItem('soloLeveling_playerData', JSON.stringify(data));
    }
    
    static getPlayerData() {
        const data = localStorage.getItem('soloLeveling_playerData');
        return data ? JSON.parse(data) : null;
    }
    
    static saveStats(stats) {
        localStorage.setItem('soloLeveling_stats', JSON.stringify(stats));
    }
    
    static getStats() {
        const data = localStorage.getItem('soloLeveling_stats');
        return data ? JSON.parse(data) : null;
    }
    
    static saveQuests(quests) {
        localStorage.setItem('soloLeveling_quests', JSON.stringify(quests));
    }
    
    static getQuests() {
        const data = localStorage.getItem('soloLeveling_quests');
        return data ? JSON.parse(data) : null;
    }
    
    static saveSettings(settings) {
        localStorage.setItem('soloLeveling_settings', JSON.stringify(settings));
    }
    
    static getSettings() {
        const data = localStorage.getItem('soloLeveling_settings');
        return data ? JSON.parse(data) : null;
    }
    
    static saveAchievements(achievements) {
        localStorage.setItem('soloLeveling_achievements', JSON.stringify(achievements));
    }
    
    static getAchievements() {
        const data = localStorage.getItem('soloLeveling_achievements');
        return data ? JSON.parse(data) : [];
    }
    
    static clearAllData() {
        const keys = [
            'soloLeveling_playerData',
            'soloLeveling_stats',
            'soloLeveling_quests',
            'soloLeveling_settings',
            'soloLeveling_achievements'
        ];
        
        keys.forEach(key => localStorage.removeItem(key));
        console.log('[GameStorage] All data cleared');
    }
}