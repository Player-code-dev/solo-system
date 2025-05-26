/**
 * Solo Leveling System - Level Management
 * Character progression and ranking system
 */

class LevelSystem {
    static getRankByLevel(level) {
        if (level < 10) return 'E-RANK';
        if (level < 25) return 'D-RANK';
        if (level < 50) return 'C-RANK';
        if (level < 75) return 'B-RANK';
        if (level < 100) return 'A-RANK';
        return 'S-RANK';
    }
    
    static getTitleByLevel(level) {
        if (level < 10) return 'Awakened Novice';
        if (level < 25) return 'Rising Hunter';
        if (level < 50) return 'Shadow Walker';
        if (level < 75) return 'Elite Warrior';
        if (level < 100) return 'Shadow Monarch';
        return 'Sovereign of Shadows';
    }
    
    static getThemeByLevel(level) {
        if (level < 25) return 'blue';
        if (level < 50) return 'purple';
        if (level < 75) return 'red';
        return 'gold';
    }
}