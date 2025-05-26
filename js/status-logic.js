/**
 * Solo Leveling System - Status Logic
 * Core logic for status calculations and updates
 */

class StatusLogic {
    static calculateDerivedStats(baseStats) {
        return {
            health: baseStats.endurance * 10,
            mana: baseStats.intelligence * 5,
            defense: Math.floor(baseStats.strength / 2),
            speed: baseStats.agility
        };
    }
}