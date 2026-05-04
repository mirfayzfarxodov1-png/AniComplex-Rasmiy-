// ============================================================================
// AniComplex - Fireworks Animation System
// Version: 3.0.0
// Total Lines: 350+
// Features: Canvas fireworks, particle explosions, celebration effects
// ============================================================================

class FireworksSystem {
    constructor(canvasId = 'fireworksCanvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = canvasId;
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';
            document.body.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.rockets = [];
        this.animationId = null;
        this.isActive = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.animate();
        
        // Launch rockets periodically
        this.rocketInterval = setInterval(() => {
            if (this.isActive) {
                this.launchRocket();
            }
        }, 800);
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.rocketInterval) {
            clearInterval(this.rocketInterval);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
        this.rockets = [];
    }
    
    launchRocket() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height;
        const targetY = Math.random() * (this.canvas.height * 0.5);
        
        this.rockets.push({
            x: x,
            y: y,
            targetY: targetY,
            speed: 8,
            color: this.getRandomColor()
        });
    }
    
    getRandomColor() {
        const colors = [
            '#ff6a00', '#ee0979', '#ff0000', '#00ff00', 
            '#0088ff', '#ffff00', '#ff00ff', '#00ffff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createExplosion(x, y, color) {
        const particleCount = 50 + Math.random() * 50;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: 1,
                color: color,
                size: 2 + Math.random() * 3
            });
        }
    }
    
    updateRockets() {
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            
            // Move rocket
            rocket.y -= rocket.speed;
            
            // Draw rocket trail
            this.drawRocketTrail(rocket);
            
            // Check if reached target
            if (rocket.y <= rocket.targetY) {
                this.createExplosion(rocket.x, rocket.y, rocket.color);
                this.rockets.splice(i, 1);
            }
        }
    }
    
    drawRocketTrail(rocket) {
        this.ctx.beginPath();
        this.ctx.moveTo(rocket.x, rocket.y);
        this.ctx.lineTo(rocket.x, rocket.y + 15);
        this.ctx.strokeStyle = rocket.color;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw rocket head
        this.ctx.beginPath();
        this.ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = rocket.color;
        this.ctx.fill();
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.life -= 0.02;
            
            // Remove dead particles
            if (p.life <= 0 || p.y > this.canvas.height) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        for (const p of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateRockets();
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // Single celebration burst
    celebrate(x, y) {
        if (!x || !y) {
            x = this.canvas.width / 2;
            y = this.canvas.height / 2;
        }
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createExplosion(
                    x + (Math.random() - 0.5) * 100,
                    y + (Math.random() - 0.5) * 100,
                    this.getRandomColor()
                );
            }, i * 150);
        }
    }
    
    // Multiple fireworks at once
    burstFireworks(count = 10) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * (this.canvas.height * 0.6);
                this.createExplosion(x, y, this.getRandomColor());
            }, i * 200);
        }
    }
}

// Global instance
let fireworks = null;

function startFireworks() {
    if (!fireworks) {
        fireworks = new FireworksSystem();
    }
    fireworks.start();
}

function stopFireworks() {
    if (fireworks) {
        fireworks.stop();
    }
}

function celebrate() {
    if (!fireworks) {
        fireworks = new FireworksSystem();
    }
    fireworks.start();
    setTimeout(() => {
        fireworks.burstFireworks(20);
    }, 500);
    setTimeout(() => {
        fireworks.stop();
    }, 5000);
}

// Export for global use
window.fireworks = {
    start: startFireworks,
    stop: stopFireworks,
    celebrate: celebrate,
    burst: (count) => {
        if (fireworks) fireworks.burstFireworks(count);
    }
};
