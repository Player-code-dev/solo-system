/**
 * Solo Leveling System - Penalty System
 * Handles penalties for missed obligations and failed quests
 */

class PenaltySystem {
    static applyPenalty(penaltyType, amount = 0) {
        const playerData = GameStorage.getPlayerData();
        const stats = GameStorage.getStats();
        
        // Apply XP penalty
        if (amount > 0) {
            playerData.xp = Math.max(0, playerData.xp - amount);
        }
        
        // Save updated data
        GameStorage.savePlayerData(playerData);
        GameStorage.saveStats(stats);
        
        // Show penalty notification
        if (window.SoloLevelingSystem) {
            window.SoloLevelingSystem.showNotification(`Penalty applied: -${amount} XP`, 'error');
        }
    }
}