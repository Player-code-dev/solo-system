/**
 * Solo Leveling System - Main Application Script
 * Core application logic and initialization
 */

class SoloLevelingSystem {
    constructor() {
        this.initialized = false;
        this.currentScreen = 'status';
        this.audioManager = null;
        this.notificationPermission = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleSystemChoice = this.handleSystemChoice.bind(this);
        this.switchScreen = this.switchScreen.bind(this);
    }

    async init() {
        console.log('[SoloSystem] Initializing Solo Leveling System...');
        
        try {
            // Initialize storage
            GameStorage.init();
            
            // Initialize audio
            this.audioManager = new AudioManager();
            await this.audioManager.init();
            
            // Register service worker
            await this.registerServiceWorker();
            
            // Request notification permission
            await this.requestNotificationPermission();
            
            // Check if system has been accepted before
            const playerData = GameStorage.getPlayerData();
            if (playerData.systemAccepted) {
                this.showMainInterface();
            } else {
                this.showSystemIntroduction();
            }
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize HUD
            this.initializeHUD();
            
            // Start periodic tasks
            this.startPeriodicTasks();
            
            this.initialized = true;
            console.log('[SoloSystem] System initialized successfully');
            
        } catch (error) {
            console.error('[SoloSystem] Initialization failed:', error);
            this.showError('System initialization failed. Please refresh the page.');
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('[SoloSystem] Service Worker registered:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showNotification('System update available! Refresh to apply.', 'info');
                        }
                    });
                });
                
            } catch (error) {
                console.warn('[SoloSystem] Service Worker registration failed:', error);
            }
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            console.log('[SoloSystem] Notification permission:', permission);
        }
    }

    setupEventListeners() {
        // System introduction buttons
        const acceptBtn = document.getElementById('acceptSystem');
        const declineBtn = document.getElementById('declineSystem');
        
        if (acceptBtn) acceptBtn.addEventListener('click', () => this.handleSystemChoice(true));
        if (declineBtn) declineBtn.addEventListener('click', () => this.handleSystemChoice(false));
        
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.switchScreen(screen);
            });
        });
        
        // Settings
        this.setupSettingsListeners();
        
        // Quest category tabs
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchQuestCategory(e.currentTarget.dataset.category);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateInterface();
            }
        });
    }

    setupSettingsListeners() {
        const playerNameInput = document.getElementById('playerNameInput');
        const soundVolume = document.getElementById('soundVolume');
        const notifications = document.getElementById('notifications');
        const prayerReminders = document.getElementById('prayerReminders');
        const resetProgress = document.getElementById('resetProgress');
        
        if (playerNameInput) {
            playerNameInput.addEventListener('change', (e) => {
                const playerData = GameStorage.getPlayerData();
                playerData.name = e.target.value;
                GameStorage.savePlayerData(playerData);
                this.updatePlayerName(e.target.value);
            });
        }
        
        if (soundVolume) {
            soundVolume.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value);
                this.audioManager.setVolume(volume / 100);
                document.querySelector('.volume-value').textContent = `${volume}%`;
                
                const settings = GameStorage.getSettings();
                settings.soundVolume = volume;
                GameStorage.saveSettings(settings);
            });
        }
        
        if (notifications) {
            notifications.addEventListener('change', (e) => {
                const settings = GameStorage.getSettings();
                settings.notifications = e.target.checked;
                GameStorage.saveSettings(settings);
            });
        }
        
        if (prayerReminders) {
            prayerReminders.addEventListener('change', (e) => {
                const settings = GameStorage.getSettings();
                settings.prayerReminders = e.target.checked;
                GameStorage.saveSettings(settings);
            });
        }
        
        if (resetProgress) {
            resetProgress.addEventListener('click', () => {
                this.confirmReset();
            });
        }
    }

    handleKeyboardShortcuts(e) {
        // Quick navigation shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    this.switchScreen('status');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchScreen('quests');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchScreen('inventory');
                    break;
                case '4':
                    e.preventDefault();
                    this.switchScreen('settings');
                    break;
            }
        }
    }

    showSystemIntroduction() {
        console.log('[SoloSystem] Showing system introduction');
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000);
        }
        
        // Show system intro modal
        const systemIntro = document.getElementById('systemIntro');
        if (systemIntro) {
            setTimeout(() => {
                systemIntro.classList.remove('hidden');
                this.audioManager.playSound('systemIntro');
            }, 1500);
        }
    }

    handleSystemChoice(accepted) {
        const systemIntro = document.getElementById('systemIntro');
        
        if (accepted) {
            console.log('[SoloSystem] System accepted');
            
            // Save acceptance
            const playerData = GameStorage.getPlayerData();
            playerData.systemAccepted = true;
            playerData.acceptedAt = Date.now();
            GameStorage.savePlayerData(playerData);
            
            // Play acceptance sound
            this.audioManager.playSound('systemAccept');
            
            // Glitch effect on modal
            systemIntro.classList.add('glitch-accept');
            
            setTimeout(() => {
                systemIntro.classList.add('hidden');
                this.showMainInterface();
            }, 2000);
            
        } else {
            console.log('[SoloSystem] System declined');
            
            // Play decline sound
            this.audioManager.playSound('systemDecline');
            
            // Glitch effect and close
            systemIntro.classList.add('glitch-decline');
            
            setTimeout(() => {
                systemIntro.classList.add('hidden');
                this.showDeclineMessage();
            }, 1500);
        }
    }

    showMainInterface() {
        console.log('[SoloSystem] Showing main interface');
        
        const mainInterface = document.getElementById('mainInterface');
        if (mainInterface) {
            mainInterface.classList.remove('hidden');
            
            // Initialize interface components
            this.updateInterface();
            this.generateInitialQuests();
            
            // Show welcome message
            setTimeout(() => {
                this.showNotification('Welcome back, Player. Your journey continues...', 'success');
            }, 1000);
        }
    }

    showDeclineMessage() {
        document.body.innerHTML = `
            <div class="decline-screen">
                <div class="decline-message">
                    <h1 class="glitch-text" data-text="SYSTEM DECLINED">SYSTEM DECLINED</h1>
                    <p>The opportunity has passed...</p>
                    <button onclick="location.reload()" class="retry-btn">Try Again</button>
                </div>
            </div>
        `;
    }

    switchScreen(screenName) {
        console.log(`[SoloSystem] Switching to screen: ${screenName}`);
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');
        
        // Update screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });
        
        const targetScreen = document.getElementById(`${screenName}Screen`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('active');
        }
        
        this.currentScreen = screenName;
        
        // Screen-specific initialization
        this.initializeScreen(screenName);
        
        // Play navigation sound
        this.audioManager.playSound('menuSelect');
    }

    initializeScreen(screenName) {
        switch(screenName) {
            case 'status':
                this.updateStatusScreen();
                break;
            case 'quests':
                this.updateQuestScreen();
                break;
            case 'inventory':
                this.updateInventoryScreen();
                break;
            case 'settings':
                this.updateSettingsScreen();
                break;
        }
    }

    updateInterface() {
        const playerData = GameStorage.getPlayerData();
        const stats = GameStorage.getStats();
        
        // Update player info
        this.updatePlayerInfo(playerData);
        
        // Update XP bar
        this.updateXPBar(playerData);
        
        // Update stats
        this.updateStats(stats);
        
        // Update theme based on level
        this.updateTheme(playerData.level);
    }

    updatePlayerInfo(playerData) {
        const playerNameElements = document.querySelectorAll('#playerName, [data-player-name]');
        playerNameElements.forEach(el => {
            el.textContent = playerData.name || 'Player';
        });
        
        const playerLevelElements = document.querySelectorAll('#playerLevel, [data-player-level]');
        playerLevelElements.forEach(el => {
            el.textContent = playerData.level || 1;
        });
    }

    updateXPBar(playerData) {
        const xpFill = document.getElementById('xpFill');
        const currentXPEl = document.getElementById('currentXP');
        const maxXPEl = document.getElementById('maxXP');
        
        if (xpFill && currentXPEl && maxXPEl) {
            const currentXP = playerData.xp || 0;
            const maxXP = XPSystem.getXPToNextLevel(playerData.level || 1);
            const levelBaseXP = XPSystem.getXPToNextLevel((playerData.level || 1) - 1);
            const currentLevelXP = currentXP - levelBaseXP;
            const nextLevelXP = maxXP - levelBaseXP;
            
            const percentage = Math.min((currentLevelXP / nextLevelXP) * 100, 100);
            
            xpFill.style.width = `${percentage}%`;
            currentXPEl.textContent = currentLevelXP;
            maxXPEl.textContent = nextLevelXP;
        }
    }

    updateStats(stats) {
        const statNames = ['strength', 'agility', 'intelligence', 'endurance', 'faith'];
        
        statNames.forEach(statName => {
            const valueEl = document.getElementById(`${statName}Value`);
            const bonusEl = document.getElementById(`${statName}Bonus`);
            
            if (valueEl) {
                const statValue = stats[statName] || 10;
                valueEl.textContent = statValue;
                
                if (bonusEl) {
                    const bonusValue = Math.floor(statValue * 0.1);
                    bonusEl.textContent = `(+${bonusValue})`;
                }
            }
        });
        
        // Update available stat points
        const availablePointsEl = document.getElementById('availablePoints');
        if (availablePointsEl) {
            availablePointsEl.textContent = GameStorage.getPlayerData().availableStatPoints || 0;
        }
    }

    updateTheme(level) {
        const root = document.documentElement;
        
        // Color progression: blue → purple → red → gold
        if (level < 25) {
            // Blue theme (levels 1-24)
            root.style.setProperty('--primary-color', '#00d4ff');
            root.style.setProperty('--secondary-color', '#0099cc');
        } else if (level < 50) {
            // Purple theme (levels 25-49)
            root.style.setProperty('--primary-color', '#8b5cf6');
            root.style.setProperty('--secondary-color', '#7c3aed');
        } else if (level < 75) {
            // Red theme (levels 50-74)
            root.style.setProperty('--primary-color', '#ef4444');
            root.style.setProperty('--secondary-color', '#dc2626');
        } else {
            // Gold theme (levels 75+)
            root.style.setProperty('--primary-color', '#f59e0b');
            root.style.setProperty('--secondary-color', '#d97706');
        }
    }

    updateStatusScreen() {
        // Status screen specific updates
        const stats = GameStorage.getStats();
        this.updateStats(stats);
    }

    updateQuestScreen() {
        // Quest screen specific updates
        this.loadQuests();
    }

    updateInventoryScreen() {
        // Inventory screen specific updates
        this.loadInventory();
    }

    updateSettingsScreen() {
        // Settings screen specific updates
        this.loadSettings();
    }

    generateInitialQuests() {
        const questData = GameStorage.getQuests();
        
        // Generate daily quests if none exist
        if (!questData.daily || questData.daily.length === 0) {
            const dailyQuests = QuestGenerator.generateDailyQuests();
            questData.daily = dailyQuests;
        }
        
        // Generate weekly quests if none exist
        if (!questData.weekly || questData.weekly.length === 0) {
            const weeklyQuests = QuestGenerator.generateWeeklyQuests();
            questData.weekly = weeklyQuests;
        }
        
        GameStorage.saveQuests(questData);
        console.log('[SoloSystem] Initial quests generated');
    }

    loadQuests() {
        // Implementation depends on current quest category
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'daily';
        this.switchQuestCategory(activeCategory);
    }

    switchQuestCategory(category) {
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        // Load quests for category
        const questData = GameStorage.getQuests();
        const quests = questData[category] || [];
        
        this.renderQuests(quests, category);
    }

    renderQuests(quests, category) {
        const questList = document.getElementById('questList');
        if (!questList) return;
        
        questList.innerHTML = '';
        
        if (quests.length === 0) {
            questList.innerHTML = `
                <div class="empty-quests">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No ${category} quests available</p>
                    <p class="sub-text">Check back later for new challenges</p>
                </div>
            `;
            return;
        }
        
        quests.forEach(quest => {
            const questCard = this.createQuestCard(quest);
            questList.appendChild(questCard);
        });
    }

    createQuestCard(quest) {
        const card = document.createElement('div');
        card.className = `quest-card ${quest.difficulty} ${quest.status || 'available'}`;
        
        const progressPercent = (quest.progress || 0) / (quest.maxProgress || 1) * 100;
        
        card.innerHTML = `
            <div class="quest-header">
                <div class="quest-icon">
                    <i class="${quest.icon || 'fas fa-star'}"></i>
                </div>
                <div class="quest-info">
                    <h3 class="quest-title">${quest.title}</h3>
                    <div class="quest-category">${quest.category}</div>
                </div>
                <div class="quest-difficulty">
                    <span class="difficulty-label">${quest.difficulty?.toUpperCase() || 'NORMAL'}</span>
                </div>
            </div>
            <div class="quest-description">
                ${quest.description}
            </div>
            <div class="quest-rewards">
                <div class="reward-item">
                    <i class="fas fa-star"></i>
                    <span>+${quest.xpReward || 0} XP</span>
                </div>
                ${quest.statRewards ? Object.entries(quest.statRewards).map(([stat, value]) => 
                    `<div class="reward-item">
                        <i class="fas fa-arrow-up"></i>
                        <span>+${value} ${stat.toUpperCase()}</span>
                    </div>`
                ).join('') : ''}
            </div>
            <div class="quest-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="progress-text">${quest.progress || 0} / ${quest.maxProgress || 1}</div>
            </div>
            <div class="quest-actions">
                ${this.getQuestActionButton(quest)}
            </div>
        `;
        
        return card;
    }

    getQuestActionButton(quest) {
        switch(quest.status) {
            case 'completed':
                return '<button class="quest-btn completed-btn" disabled>COMPLETED</button>';
            case 'active':
                return `<button class="quest-btn complete-btn" onclick="app.completeQuest('${quest.id}')">COMPLETE</button>`;
            default:
                return `<button class="quest-btn accept-btn" onclick="app.acceptQuest('${quest.id}')">ACCEPT</button>`;
        }
    }

    acceptQuest(questId) {
        console.log(`[SoloSystem] Accepting quest: ${questId}`);
        
        const questData = GameStorage.getQuests();
        const quest = this.findQuestById(questId, questData);
        
        if (quest) {
            quest.status = 'active';
            quest.acceptedAt = Date.now();
            GameStorage.saveQuests(questData);
            
            this.audioManager.playSound('questAccept');
            this.showNotification(`Quest "${quest.title}" accepted!`, 'success');
            this.updateQuestScreen();
        }
    }

    completeQuest(questId) {
        console.log(`[SoloSystem] Completing quest: ${questId}`);
        
        const questData = GameStorage.getQuests();
        const quest = this.findQuestById(questId, questData);
        
        if (quest && quest.status === 'active') {
            // Award rewards
            this.awardQuestRewards(quest);
            
            // Mark as completed
            quest.status = 'completed';
            quest.completedAt = Date.now();
            
            // Move to completed list
            if (!questData.completed) questData.completed = [];
            questData.completed.push({ ...quest });
            
            // Remove from current category
            ['daily', 'weekly', 'special'].forEach(category => {
                if (questData[category]) {
                    questData[category] = questData[category].filter(q => q.id !== questId);
                }
            });
            
            GameStorage.saveQuests(questData);
            
            this.audioManager.playSound('questComplete');
            this.showNotification(`Quest "${quest.title}" completed! +${quest.xpReward} XP`, 'success');
            
            // Update interface
            this.updateInterface();
            this.updateQuestScreen();
        }
    }

    awardQuestRewards(quest) {
        const playerData = GameStorage.getPlayerData();
        const stats = GameStorage.getStats();
        
        // Award XP
        if (quest.xpReward) {
            const oldLevel = playerData.level;
            playerData.xp = (playerData.xp || 0) + quest.xpReward;
            
            // Check for level up
            const newLevel = XPSystem.calculateLevel(playerData.xp);
            if (newLevel > oldLevel) {
                playerData.level = newLevel;
                playerData.availableStatPoints = (playerData.availableStatPoints || 0) + (newLevel - oldLevel) * 5;
                this.triggerLevelUp(newLevel);
            }
            
            // Show XP gain effect
            XPEffects.showXPGain(quest.xpReward);
        }
        
        // Award stat bonuses
        if (quest.statRewards) {
            Object.entries(quest.statRewards).forEach(([stat, value]) => {
                stats[stat] = (stats[stat] || 10) + value;
            });
        }
        
        GameStorage.savePlayerData(playerData);
        GameStorage.saveStats(stats);
    }

    findQuestById(questId, questData) {
        for (const category of ['daily', 'weekly', 'special', 'completed']) {
            if (questData[category]) {
                const quest = questData[category].find(q => q.id === questId);
                if (quest) return quest;
            }
        }
        return null;
    }

    triggerLevelUp(newLevel) {
        console.log(`[SoloSystem] Level up! New level: ${newLevel}`);
        
        this.audioManager.playSound('levelUp');
        LevelEffects.showLevelUp(newLevel);
        
        // Show level up notification
        setTimeout(() => {
            this.showNotification(`LEVEL UP! You are now level ${newLevel}!`, 'success');
        }, 1000);
        
        // Update theme
        this.updateTheme(newLevel);
    }

    loadInventory() {
        // Placeholder for inventory system
        console.log('[SoloSystem] Loading inventory');
    }

    loadSettings() {
        const settings = GameStorage.getSettings();
        const playerData = GameStorage.getPlayerData();
        
        // Update settings form
        const playerNameInput = document.getElementById('playerNameInput');
        const soundVolume = document.getElementById('soundVolume');
        const notifications = document.getElementById('notifications');
        const prayerReminders = document.getElementById('prayerReminders');
        
        if (playerNameInput) playerNameInput.value = playerData.name || 'Player';
        if (soundVolume) {
            soundVolume.value = settings.soundVolume || 80;
            document.querySelector('.volume-value').textContent = `${settings.soundVolume || 80}%`;
        }
        if (notifications) notifications.checked = settings.notifications !== false;
        if (prayerReminders) prayerReminders.checked = settings.prayerReminders !== false;
    }

    updatePlayerName(name) {
        this.updatePlayerInfo({ name });
    }

    confirmReset() {
        if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
            GameStorage.reset();
            location.reload();
        }
    }

    startPeriodicTasks() {
        // Check for daily reset every hour
        setInterval(() => {
            this.checkDailyReset();
        }, 60 * 60 * 1000);
        
        // Check for emergency quests every 30 minutes
        setInterval(() => {
            this.checkEmergencyQuests();
        }, 30 * 60 * 1000);
        
        // Check for prayer times every minute
        setInterval(() => {
            this.checkPrayerTimes();
        }, 60 * 1000);
        
        // Auto-save every 5 minutes
        setInterval(() => {
            this.autoSave();
        }, 5 * 60 * 1000);
    }

    checkDailyReset() {
        const now = new Date();
        const lastReset = new Date(GameStorage.getPlayerData().lastDailyReset || 0);
        
        if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
            this.performDailyReset();
        }
    }

    performDailyReset() {
        console.log('[SoloSystem] Performing daily reset');
        
        // Reset daily quests
        const questData = GameStorage.getQuests();
        questData.daily = QuestGenerator.generateDailyQuests();
        GameStorage.saveQuests(questData);
        
        // Update reset timestamp
        const playerData = GameStorage.getPlayerData();
        playerData.lastDailyReset = Date.now();
        GameStorage.savePlayerData(playerData);
        
        this.showNotification('Daily quests have been reset!', 'info');
    }

    checkEmergencyQuests() {
        // Random chance for emergency quest
        if (Math.random() < 0.1) { // 10% chance
            this.triggerEmergencyQuest();
        }
    }

    triggerEmergencyQuest() {
        const emergencyQuests = [
            {
                title: "Nafs Suppression Challenge",
                description: "Resist a strong desire or temptation for the next 5 minutes",
                xpReward: 50,
                statRewards: { faith: 2 },
                timeLimit: 5 * 60 * 1000
            },
            {
                title: "Instant Dhikr Session",
                description: "Recite 'SubhanAllah' 100 times within 5 minutes",
                xpReward: 30,
                statRewards: { faith: 1 },
                timeLimit: 5 * 60 * 1000
            }
        ];
        
        const quest = emergencyQuests[Math.floor(Math.random() * emergencyQuests.length)];
        quest.id = 'emergency_' + Date.now();
        quest.status = 'pending';
        quest.category = 'Emergency';
        quest.icon = 'fas fa-exclamation-triangle';
        quest.difficulty = 'hard';
        quest.progress = 0;
        quest.maxProgress = 1;
        
        this.showEmergencyQuestModal(quest);
    }

    showEmergencyQuestModal(quest) {
        // Implementation would show emergency quest modal
        console.log('[SoloSystem] Emergency quest triggered:', quest.title);
        this.audioManager.playSound('emergencyQuest');
        this.showNotification(`Emergency Quest: ${quest.title}`, 'warning');
    }

    checkPrayerTimes() {
        const settings = GameStorage.getSettings();
        if (!settings.prayerReminders) return;
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Simple prayer time checking (would need proper calculation in real app)
        const prayerTimes = [
            { name: 'Fajr', hour: 5, minute: 30 },
            { name: 'Dhuhr', hour: 12, minute: 30 },
            { name: 'Asr', hour: 15, minute: 30 },
            { name: 'Maghrib', hour: 18, minute: 30 },
            { name: 'Isha', hour: 20, minute: 0 }
        ];
        
        prayerTimes.forEach(prayer => {
            if (currentHour === prayer.hour && currentMinute === prayer.minute) {
                this.showPrayerReminder(prayer.name);
            }
        });
    }

    showPrayerReminder(prayerName) {
        this.audioManager.playSound('prayerReminder');
        this.showNotification(`Time for ${prayerName} prayer`, 'info');
        
        if (this.notificationPermission) {
            new Notification('Solo Leveling System', {
                body: `Time for ${prayerName} prayer`,
                icon: '/assets/icons/icon-192.svg'
            });
        }
    }

    autoSave() {
        // Auto-save is handled by GameStorage on each update
        console.log('[SoloSystem] Auto-save triggered');
    }

    initializeHUD() {
        // Initialize HUD overlay if available
        this.updateInterface();
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `system-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-frame">
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-text">${message}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
        
        // Play notification sound
        this.audioManager.playSound('notification');
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    }

    showError(message) {
        console.error('[SoloSystem] Error:', message);
        this.showNotification(message, 'error');
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[SoloSystem] DOM loaded, initializing...');
    
    app = new SoloLevelingSystem();
    await app.init();
});

// Export for global access
window.SoloLevelingSystem = SoloLevelingSystem;
