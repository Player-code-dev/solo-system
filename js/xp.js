/**
 * Solo Leveling System - XP Management
 * Experience points and leveling system
 */

class XPSystem {
    static getXPToNextLevel(level) {
        // Exponential XP curve like in Solo Leveling
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    static getTotalXPForLevel(level) {
        let totalXP = 0;
        for (let i = 1; i < level; i++) {
            totalXP += this.getXPToNextLevel(i);
        }
        return totalXP;
    }
    
    static getLevelFromXP(xp) {
        let level = 1;
        let totalXP = 0;
        
        while (totalXP <= xp) {
            totalXP += this.getXPToNextLevel(level);
            if (totalXP <= xp) {
                level++;
            }
        }
        
        return level;
    }
    
    static awardXP(amount) {
        const playerData = GameStorage.getPlayerData();
        const oldLevel = playerData.level;
        
        playerData.xp += amount;
        const newLevel = this.getLevelFromXP(playerData.xp);
        
        if (newLevel > oldLevel) {
            playerData.level = newLevel;
            playerData.availableStatPoints += (newLevel - oldLevel) * 2;
            
            // Trigger level up effect
            this.triggerLevelUp(newLevel);
        }
        
        GameStorage.savePlayerData(playerData);
        return { leveledUp: newLevel > oldLevel, newLevel, xpGained: amount };
    }
    
    static triggerLevelUp(newLevel) {
        // Play level up sound if audio is available
        if (window.AudioManager) {
            window.AudioManager.playSound('levelUp');
        }
        
        // Show level up effect
        this.showLevelUpEffect(newLevel);
    }
    
    static showLevelUpEffect(level) {
        const effect = document.getElementById('levelUpEffect');
        const levelNumber = document.getElementById('newLevel');
        
        if (effect && levelNumber) {
            levelNumber.textContent = level;
            effect.classList.remove('hidden');
            
            setTimeout(() => {
                effect.classList.add('hidden');
            }, 3000);
        }
    }
}