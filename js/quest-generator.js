/**
 * Solo Leveling System - Quest Generator
 * AI-like quest generation system for personal development
 */

class QuestGenerator {
    static generateDailyQuests() {
        const questTemplates = this.getQuestTemplates();
        const playerStats = GameStorage.getStats();
        const playerLevel = GameStorage.getPlayerData().level;
        
        const quests = [];
        
        // Generate 1 physical quest
        const physicalQuest = this.selectQuest(questTemplates.daily.physical, playerStats, playerLevel);
        if (physicalQuest) quests.push(physicalQuest);
        
        // Generate 1 spiritual quest
        const spiritualQuest = this.selectQuest(questTemplates.daily.spiritual, playerStats, playerLevel);
        if (spiritualQuest) quests.push(spiritualQuest);
        
        // Generate 1 mental quest
        const mentalQuest = this.selectQuest(questTemplates.daily.mental, playerStats, playerLevel);
        if (mentalQuest) quests.push(mentalQuest);
        
        return quests.map(quest => this.createQuestInstance(quest));
    }

    static generateWeeklyQuests() {
        const questTemplates = this.getQuestTemplates();
        const playerStats = GameStorage.getStats();
        const playerLevel = GameStorage.getPlayerData().level;
        
        const quests = [];
        
        // Generate 1-2 weekly challenge quests
        const challengeQuest = this.selectQuest(questTemplates.weekly?.challenges || [], playerStats, playerLevel);
        if (challengeQuest) quests.push(challengeQuest);
        
        return quests.map(quest => this.createQuestInstance(quest));
    }
    
    static selectQuest(templates, playerStats, playerLevel) {
        if (!templates || templates.length === 0) return null;
        
        // Filter quests based on difficulty and player level
        const suitableQuests = templates.filter(quest => {
            const difficultyLevel = this.getDifficultyLevel(quest.difficulty);
            return difficultyLevel <= Math.max(1, Math.floor(playerLevel / 10));
        });
        
        // If no suitable quests, use any available
        const availableQuests = suitableQuests.length > 0 ? suitableQuests : templates;
        
        // Random selection
        return availableQuests[Math.floor(Math.random() * availableQuests.length)];
    }
    
    static getDifficultyLevel(difficulty) {
        const levels = { easy: 1, normal: 2, hard: 3, extreme: 4 };
        return levels[difficulty] || 1;
    }
    
    static createQuestInstance(template) {
        return {
            id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...template,
            status: 'available',
            progress: 0,
            maxProgress: 1,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
    }
    
    static getQuestTemplates() {
        // Fallback quest templates if system-data.json fails to load
        return {
            daily: {
                physical: [
                    {
                        title: "Foundation Building",
                        description: "Complete 3 sets of push-ups (adjust reps based on current ability)",
                        category: "Calisthenics",
                        xpReward: 25,
                        statRewards: { strength: 1, endurance: 1 },
                        difficulty: "easy",
                        icon: "fas fa-dumbbell"
                    },
                    {
                        title: "Combat Reflexes",
                        description: "Practice reaction time drills for 10 minutes",
                        category: "Combat Training", 
                        xpReward: 30,
                        statRewards: { agility: 2 },
                        difficulty: "normal",
                        icon: "fas fa-crosshairs"
                    }
                ],
                spiritual: [
                    {
                        title: "Dawn Remembrance",
                        description: "Recite Ayat al-Kursi and reflect on its meaning for 5 minutes",
                        category: "Dhikr & Reflection",
                        xpReward: 40,
                        statRewards: { faith: 2, intelligence: 1 },
                        difficulty: "easy",
                        icon: "fas fa-book-open"
                    },
                    {
                        title: "Nafs Resistance",
                        description: "Identify and resist one unnecessary desire today",
                        category: "Self-Control",
                        xpReward: 50,
                        statRewards: { faith: 3, intelligence: 1 },
                        difficulty: "hard",
                        icon: "fas fa-shield-alt"
                    }
                ],
                mental: [
                    {
                        title: "Strategic Planning",
                        description: "Plan your next day in detail, including priorities and time allocation",
                        category: "Intelligence",
                        xpReward: 30,
                        statRewards: { intelligence: 2 },
                        difficulty: "easy",
                        icon: "fas fa-chess"
                    },
                    {
                        title: "Problem Solving",
                        description: "Solve 5 complex puzzles or riddles to sharpen analytical thinking",
                        category: "Mental Training",
                        xpReward: 25,
                        statRewards: { intelligence: 2 },
                        difficulty: "normal",
                        icon: "fas fa-puzzle-piece"
                    }
                ]
            }
        };
    }
}