/**
 * Audio Manager for Solo Leveling System
 * Handles all audio playback including effects, music, and notifications
 */

class AudioManager {
    constructor() {
        this.context = null;
        this.sounds = new Map();
        this.volume = 0.8;
        this.muted = false;
        this.initialized = false;
    }

    async init() {
        try {
            // Initialize audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master volume control
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = this.volume;
            
            // Load sound effects
            await this.loadSounds();
            
            this.initialized = true;
            console.log('[AudioManager] Initialized successfully');
            
        } catch (error) {
            console.warn('[AudioManager] Initialization failed:', error);
            // Fallback to basic audio without Web Audio API
            this.initFallback();
        }
    }

    initFallback() {
        // Simple fallback using HTML5 Audio
        this.fallbackMode = true;
        this.sounds = new Map();
        this.initialized = true;
        console.log('[AudioManager] Using fallback mode');
    }

    async loadSounds() {
        const soundFiles = {
            // System sounds
            systemIntro: this.generateTone(440, 0.5, 'sawtooth'), // A4 note
            systemAccept: this.generateChord([440, 554.37, 659.25], 1.0), // A major chord
            systemDecline: this.generateTone(220, 1.0, 'square'), // Lower, harsh tone
            
            // UI sounds
            menuSelect: this.generateTone(880, 0.1, 'sine'), // Quick beep
            menuConfirm: this.generateTone(1760, 0.2, 'sine'), // Higher confirm
            notification: this.generateTone(660, 0.3, 'triangle'),
            
            // Quest sounds
            questAccept: this.generateChord([523.25, 659.25, 783.99], 0.5), // C major chord
            questComplete: this.generateChord([523.25, 659.25, 783.99, 1046.5], 1.0), // C major with octave
            emergencyQuest: this.generateAlarm(400, 500, 0.5),
            
            // XP and level sounds
            xpGain: this.generateTone(1320, 0.3, 'sine'), // E6
            levelUp: this.generateFanfare(),
            
            // Prayer sounds
            prayerReminder: this.generateBell(523.25, 1.0),
            
            // Penalty sounds
            penalty: this.generateTone(150, 0.8, 'square'), // Low, harsh
            failure: this.generateDescendingTone(400, 200, 0.8)
        };

        // Generate and store all sounds
        for (const [name, generator] of Object.entries(soundFiles)) {
            try {
                const audioBuffer = await generator;
                this.sounds.set(name, audioBuffer);
            } catch (error) {
                console.warn(`[AudioManager] Failed to generate sound: ${name}`, error);
            }
        }
    }

    generateTone(frequency, duration, waveType = 'sine') {
        if (!this.context) return Promise.resolve(null);
        
        return new Promise((resolve) => {
            const sampleRate = this.context.sampleRate;
            const frameCount = sampleRate * duration;
            const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            for (let i = 0; i < frameCount; i++) {
                const t = i / sampleRate;
                let value;
                
                switch (waveType) {
                    case 'sine':
                        value = Math.sin(2 * Math.PI * frequency * t);
                        break;
                    case 'square':
                        value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                        break;
                    case 'sawtooth':
                        value = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                        break;
                    case 'triangle':
                        value = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
                        break;
                    default:
                        value = Math.sin(2 * Math.PI * frequency * t);
                }
                
                // Apply envelope (fade in/out)
                const envelope = Math.min(1, Math.min(t * 10, (duration - t) * 10));
                channelData[i] = value * envelope * 0.3;
            }
            
            resolve(audioBuffer);
        });
    }

    generateChord(frequencies, duration) {
        if (!this.context) return Promise.resolve(null);
        
        return new Promise((resolve) => {
            const sampleRate = this.context.sampleRate;
            const frameCount = sampleRate * duration;
            const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            for (let i = 0; i < frameCount; i++) {
                const t = i / sampleRate;
                let value = 0;
                
                // Sum all frequencies
                frequencies.forEach(freq => {
                    value += Math.sin(2 * Math.PI * freq * t);
                });
                
                // Normalize
                value /= frequencies.length;
                
                // Apply envelope
                const envelope = Math.min(1, Math.min(t * 5, (duration - t) * 5));
                channelData[i] = value * envelope * 0.2;
            }
            
            resolve(audioBuffer);
        });
    }

    generateAlarm(freq1, freq2, duration) {
        if (!this.context) return Promise.resolve(null);
        
        return new Promise((resolve) => {
            const sampleRate = this.context.sampleRate;
            const frameCount = sampleRate * duration;
            const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            for (let i = 0; i < frameCount; i++) {
                const t = i / sampleRate;
                const switchFreq = Math.sin(2 * Math.PI * 2 * t) > 0 ? freq1 : freq2; // Switch 2 times per second
                const value = Math.sin(2 * Math.PI * switchFreq * t);
                
                const envelope = Math.min(1, Math.min(t * 10, (duration - t) * 10));
                channelData[i] = value * envelope * 0.3;
            }
            
            resolve(audioBuffer);
        });
    }

    generateFanfare() {
        if (!this.context) return Promise.resolve(null);
        
        return new Promise(async (resolve) => {
            const notes = [
                { freq: 523.25, start: 0, duration: 0.3 },    // C5
                { freq: 659.25, start: 0.1, duration: 0.3 },  // E5
                { freq: 783.99, start: 0.2, duration: 0.3 },  // G5
                { freq: 1046.5, start: 0.3, duration: 0.5 }   // C6
            ];
            
            const totalDuration = 0.8;
            const sampleRate = this.context.sampleRate;
            const frameCount = sampleRate * totalDuration;
            const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            notes.forEach(note => {
                const startFrame = Math.floor(note.start * sampleRate);
                const endFrame = Math.floor((note.start + note.duration) * sampleRate);
                
                for (let i = startFrame; i < Math.min(endFrame, frameCount); i++) {
                    const t = (i - startFrame) / sampleRate;
                    const relativeT = t / note.duration;
                    
                    const value = Math.sin(2 * Math.PI * note.freq * t);
                    const envelope = Math.sin(Math.PI * relativeT); // Bell curve envelope
                    
                    channelData[i] += value * envelope * 0.2;
                }
            });
            
            resolve(audioBuffer);
        });
    }

    generateBell(frequency, duration) {
        if (!this.context) return Promise.resolve(null);
        
        return new Promise((resolve) => {
            const sampleRate = this.context.sampleRate;
            const frameCount = sampleRate * duration;
            const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            for (let i = 0; i < frameCount; i++) {
                const t = i / sampleRate;
                
                // Bell-like harmonics
                const fundamental = Math.sin(2 * Math.PI * frequency * t);
                const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.5;
                const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * t) * 0.25;
                
                const value = fundamental + harmonic2 + harmonic3;
                
                // Exponential decay envelope
                const envelope = Math.exp(-t * 3);
                channelData[i] = value * envelope * 0.3;
            }
            
            resolve(audioBuffer);
        });
    }

    generateDescendingTone(startFreq, endFreq, duration) {
        if (!this.context) return Promise.resolve(null);
        
        return new Promise((resolve) => {
            const sampleRate = this.context.sampleRate;
            const frameCount = sampleRate * duration;
            const audioBuffer = this.context.createBuffer(1, frameCount, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            for (let i = 0; i < frameCount; i++) {
                const t = i / sampleRate;
                const progress = t / duration;
                
                // Linear frequency descent
                const frequency = startFreq + (endFreq - startFreq) * progress;
                const value = Math.sin(2 * Math.PI * frequency * t);
                
                const envelope = Math.min(1, Math.min(t * 10, (duration - t) * 5));
                channelData[i] = value * envelope * 0.3;
            }
            
            resolve(audioBuffer);
        });
    }

    playSound(soundName, options = {}) {
        if (!this.initialized || this.muted) return;
        
        try {
            if (this.fallbackMode) {
                this.playFallbackSound(soundName, options);
                return;
            }
            
            const audioBuffer = this.sounds.get(soundName);
            if (!audioBuffer) {
                console.warn(`[AudioManager] Sound not found: ${soundName}`);
                return;
            }
            
            // Resume context if suspended (required by some browsers)
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            
            source.buffer = audioBuffer;
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Apply options
            if (options.volume !== undefined) {
                gainNode.gain.value = options.volume;
            }
            
            if (options.loop) {
                source.loop = true;
            }
            
            source.start(0);
            
            // Auto-cleanup
            if (!options.loop) {
                source.addEventListener('ended', () => {
                    source.disconnect();
                    gainNode.disconnect();
                });
            }
            
            return source; // Return for potential stopping
            
        } catch (error) {
            console.warn(`[AudioManager] Error playing sound ${soundName}:`, error);
        }
    }

    playFallbackSound(soundName, options = {}) {
        // Create simple beep using oscillator for fallback
        try {
            if (!this.context) {
                // Create a very basic audio context for fallback
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            // Map sound names to frequencies
            const soundMap = {
                systemIntro: 440,
                systemAccept: 660,
                systemDecline: 220,
                menuSelect: 880,
                menuConfirm: 1760,
                notification: 660,
                questAccept: 523,
                questComplete: 783,
                emergencyQuest: 450,
                xpGain: 1320,
                levelUp: 1046,
                prayerReminder: 523,
                penalty: 150,
                failure: 200
            };
            
            oscillator.frequency.value = soundMap[soundName] || 440;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.context.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + 0.3);
            
        } catch (error) {
            console.warn(`[AudioManager] Fallback sound failed: ${soundName}`, error);
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    mute() {
        this.muted = true;
        if (this.masterGain) {
            this.masterGain.gain.value = 0;
        }
    }

    unmute() {
        this.muted = false;
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    toggle() {
        if (this.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }

    // Play themed background ambience
    playAmbience(level) {
        const ambienceFrequencies = {
            blue: [220, 330, 440],      // Blue theme (levels 1-24)
            purple: [246.94, 369.99, 493.88], // Purple theme (levels 25-49)
            red: [261.63, 392.43, 523.25],     // Red theme (levels 50-74)
            gold: [293.66, 440.44, 587.33]    // Gold theme (levels 75+)
        };
        
        let theme = 'blue';
        if (level >= 75) theme = 'gold';
        else if (level >= 50) theme = 'red';
        else if (level >= 25) theme = 'purple';
        
        // Play subtle ambience based on theme
        if (this.context && !this.muted) {
            const frequencies = ambienceFrequencies[theme];
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 2.0, 'sine', 0.05);
                }, index * 1000);
            });
        }
    }

    playTone(frequency, duration, waveType = 'sine', volume = 0.3) {
        if (!this.context || this.muted) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
            
        } catch (error) {
            console.warn('[AudioManager] Error playing tone:', error);
        }
    }
}

// Initialize global audio manager
window.AudioManager = new AudioManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
