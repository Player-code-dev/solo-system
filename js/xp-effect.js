/**
 * Solo Leveling System - XP Visual Effects
 * Handles XP gain animations and visual feedback
 */

class XPEffects {
    static showXPGain(amount) {
        const effect = document.getElementById('xpGainEffect');
        const xpAmount = document.getElementById('xpAmount');
        
        if (effect && xpAmount) {
            xpAmount.textContent = amount;
            effect.classList.remove('hidden');
            
            // Create particles
            this.createXPParticles(effect);
            
            setTimeout(() => {
                effect.classList.add('hidden');
            }, 2000);
        }
    }
    
    static createXPParticles(container) {
        const particlesContainer = container.querySelector('.xp-particles');
        if (!particlesContainer) return;
        
        // Clear existing particles
        particlesContainer.innerHTML = '';
        
        // Create 8 particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'xp-particle';
            
            // Random position and movement
            const angle = (i / 8) * 2 * Math.PI;
            const distance = 50 + Math.random() * 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.setProperty('--particle-x', `${x}px`);
            particle.style.setProperty('--particle-y', `${y}px`);
            
            particlesContainer.appendChild(particle);
        }
    }
}