// ============================================================================
// AniComplex - Advanced Parallax Scroll System
// Version: 3.0.0
// Total Lines: 350+
// Features: Parallax scrolling, mouse parallax, scroll-based animations
// ============================================================================

class ParallaxScroll {
    constructor() {
        this.elements = [];
        this.bgLayers = [];
        this.speedMap = new Map();
        this.scrollY = 0;
        this.isAnimating = false;
        this.frameRequest = null;
        
        this.init();
    }
    
    init() {
        this.scanElements();
        this.bindEvents();
        this.animate();
    }
    
    scanElements() {
        // Find all parallax elements
        document.querySelectorAll('[data-parallax-speed]').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.2;
            const direction = el.getAttribute('data-parallax-direction') || 'up';
            const start = parseInt(el.getAttribute('data-parallax-start')) || 0;
            const end = parseInt(el.getAttribute('data-parallax-end')) || Infinity;
            
            this.elements.push({
                element: el,
                speed: speed,
                direction: direction,
                start: start,
                end: end,
                initialY: 0,
                initialTransform: el.style.transform || ''
            });
        });
        
        // Find parallax backgrounds
        document.querySelectorAll('[data-parallax-bg]').forEach(el => {
            const speed = parseFloat(el.getAttribute('data-parallax-bg-speed')) || 0.3;
            this.bgLayers.push({
                element: el,
                speed: speed,
                initialY: 0
            });
        });
    }
    
    bindEvents() {
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
            if (!this.isAnimating) {
                this.isAnimating = true;
                this.frameRequest = requestAnimationFrame(() => this.update());
            }
        });
        
        // Mouse move parallax for 3D effect
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            document.querySelectorAll('[data-mouse-parallax]').forEach(el => {
                const speedX = parseFloat(el.getAttribute('data-mouse-speed-x')) || 10;
                const speedY = parseFloat(el.getAttribute('data-mouse-speed-y')) || 10;
                const moveX = (mouseX - 0.5) * speedX;
                const moveY = (mouseY - 0.5) * speedY;
                
                el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }
    
    update() {
        this.isAnimating = false;
        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
        }
        
        this.updateElements();
        this.updateBackgrounds();
        
        // Continue animation if needed
        if (this.isAnimating) {
            this.frameRequest = requestAnimationFrame(() => this.update());
        }
    }
    
    updateElements() {
        for (const item of this.elements) {
            const { element, speed, direction, start, end } = item;
            
            if (this.scrollY < start || this.scrollY > end) continue;
            
            let move = this.scrollY * speed;
            if (direction === 'down') move = -move;
            else if (direction === 'left') {
                element.style.transform = `translateX(${-move}px)`;
                continue;
            } else if (direction === 'right') {
                element.style.transform = `translateX(${move}px)`;
                continue;
            } else if (direction === 'fade') {
                const opacity = Math.max(0, Math.min(1, 1 - (this.scrollY - start) / (end - start)));
                element.style.opacity = opacity;
                continue;
            } else if (direction === 'scale') {
                const scale = Math.max(0.5, Math.min(1.5, 1 + (this.scrollY - start) / (end - start) * 0.5));
                element.style.transform = `scale(${scale})`;
                continue;
            } else if (direction === 'rotate') {
                const rotate = (this.scrollY - start) / (end - start) * 360;
                element.style.transform = `rotate(${rotate}deg)`;
                continue;
            }
            
            element.style.transform = `translateY(${move}px)`;
        }
    }
    
    updateBackgrounds() {
        for (const bg of this.bgLayers) {
            const move = this.scrollY * bg.speed;
            bg.element.style.backgroundPositionY = `${move}px`;
        }
    }
    
    // Register element dynamically
    register(element, speed = 0.2, direction = 'up') {
        element.setAttribute('data-parallax-speed', speed);
        element.setAttribute('data-parallax-direction', direction);
        
        this.elements.push({
            element: element,
            speed: speed,
            direction: direction,
            start: 0,
            end: Infinity,
            initialY: 0,
            initialTransform: element.style.transform || ''
        });
    }
    
    // Remove element
    unregister(element) {
        const index = this.elements.findIndex(e => e.element === element);
        if (index !== -1) {
            this.elements.splice(index, 1);
        }
    }
}

// ============================================
// 2. SCROLL TRIGGER ANIMATIONS
// ============================================

class ScrollTrigger {
    constructor() {
        this.animations = [];
        this.init();
    }
    
    init() {
        this.animate();
        window.addEventListener('scroll', () => this.animate());
    }
    
    animate() {
        for (const anim of this.animations) {
            const rect = anim.element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 0;
            
            if (isVisible && !anim.triggered) {
                anim.triggered = true;
                anim.element.classList.add(anim.animationClass);
                
                // Remove class after animation if needed
                if (anim.removeAfter) {
                    setTimeout(() => {
                        anim.element.classList.remove(anim.animationClass);
                    }, 1000);
                }
            }
        }
    }
    
    add(element, animationClass, oneTime = true) {
        this.animations.push({
            element: element,
            animationClass: animationClass,
            triggered: false,
            removeAfter: oneTime
        });
    }
    
    remove(element) {
        const index = this.animations.findIndex(a => a.element === element);
        if (index !== -1) {
            this.animations.splice(index, 1);
        }
    }
}

// ============================================
// 3. COUNT-UP ANIMATION ON SCROLL
// ============================================

class CountUpOnScroll {
    constructor() {
        this.counters = [];
        this.init();
    }
    
    init() {
        this.scanCounters();
        window.addEventListener('scroll', () => this.checkCounters());
        this.checkCounters();
    }
    
    scanCounters() {
        document.querySelectorAll('[data-count-up]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count-up'));
            const duration = parseInt(el.getAttribute('data-count-duration')) || 2000;
            const suffix = el.getAttribute('data-count-suffix') || '';
            const prefix = el.getAttribute('data-count-prefix') || '';
            
            this.counters.push({
                element: el,
                target: target,
                duration: duration,
                suffix: suffix,
                prefix: prefix,
                current: 0,
                triggered: false,
                startTime: null
            });
        });
    }
    
    checkCounters() {
        for (const counter of this.counters) {
            if (counter.triggered) continue;
            
            const rect = counter.element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100;
            
            if (isVisible) {
                counter.triggered = true;
                this.animateCounter(counter);
            }
        }
    }
    
    animateCounter(counter) {
        const startTime = performance.now();
        const startValue = 0;
        const endValue = counter.target;
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / counter.duration);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
            
            counter.element.textContent = `${counter.prefix}${currentValue}${counter.suffix}`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// ============================================
// 4. INITIALIZE ALL PARALLAX SYSTEMS
// ============================================

let parallaxScroller = null;
let scrollTrigger = null;
let countUp = null;

function initParallaxSystems() {
    parallaxScroller = new ParallaxScroll();
    scrollTrigger = new ScrollTrigger();
    countUp = new CountUpOnScroll();
    
    // Auto-add scroll-trigger animations
    document.querySelectorAll('[data-scroll-animate]').forEach(el => {
        const animation = el.getAttribute('data-scroll-animate');
        scrollTrigger.add(el, `animate-${animation}`);
    });
    
    console.log('Parallax systems initialized');
}

// Auto-init
document.addEventListener('DOMContentLoaded', initParallaxSystems);

// Export for global use
window.ParallaxScroll = ParallaxScroll;
window.ScrollTrigger = ScrollTrigger;
window.CountUpOnScroll = CountUpOnScroll;
window.initParallaxSystems = initParallaxSystems;
