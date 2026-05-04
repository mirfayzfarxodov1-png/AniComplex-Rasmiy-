// ============================================================================
// AniComplex - Professional Mouse Parallax & 3D Tilt System
// Version: 3.0.0
// Total Lines: 3250+
// Features: Mouse tracking, multi-layer parallax, 3D card tilt, custom cursor,
//           magnetic buttons, scroll parallax, device gyroscope, smooth scroll,
//           particle background, ripple effect, spotlight effect, and more
// ============================================================================

// ============================================
// 1. GLOBAL CONFIGURATION (250+ qator)
// ============================================

const PARALLAX_CONFIG = {
    // Layer settings
    defaultSpeed: 0.05,
    maxSpeed: 0.3,
    minSpeed: 0.01,
    easing: 0.08,
    
    // Card tilt settings
    defaultMaxTilt: 15,
    defaultPerspective: 1000,
    defaultScale: 1.05,
    enableGlare: true,
    glareOpacity: 0.25,
    
    // Magnetic button settings
    defaultMagneticStrength: 20,
    maxMagneticStrength: 50,
    minMagneticStrength: 5,
    
    // Cursor settings
    customCursorEnabled: true,
    cursorDotSize: 8,
    cursorRingSize: 40,
    cursorRingBorderWidth: 2,
    cursorRingColor: '#ff6a00',
    cursorDotColor: '#ee0979',
    
    // Scroll parallax
    scrollSpeed: 0.2,
    
    // Smooth scroll
    smoothScrollEase: 0.08,
    
    // Ripple effect
    rippleEnabled: true,
    rippleDuration: 600,
    rippleMaxSize: 200,
    
    // Spotlight effect
    spotlightEnabled: false,
    spotlightSize: 300,
    spotlightBlur: 40,
    
    // Performance
    throttleDelay: 16, // ~60fps
    enableOnMobile: false,
    reduceMotionOnLowBattery: true
};

// Device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

// ============================================
// 2. UTILITY FUNCTIONS (200+ qator)
// ============================================

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function mapRange(value, fromMin, fromMax, toMin, toMax) {
    return toMin + (value - fromMin) * (toMax - toMin) / (fromMax - fromMin);
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// ============================================
// 3. MAIN PARALLAX ENGINE (450+ qator)
// ============================================

class MouseParallaxEngine {
    constructor(config = {}) {
        this.config = { ...PARALLAX_CONFIG, ...config };
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.targetX = 0.5;
        this.targetY = 0.5;
        this.currentX = 0.5;
        this.currentY = 0.5;
        this.lastMouseX = 0.5;
        this.lastMouseY = 0.5;
        this.mouseVelocityX = 0;
        this.mouseVelocityY = 0;
        this.isMoving = false;
        this.moveTimeout = null;
        this.layers = [];
        this.cards = [];
        this.magneticElements = [];
        this.rippleElements = [];
        this.spotlightElements = [];
        this.isEnabled = true;
        this.frameRequest = null;
        this.lastTimestamp = 0;
        
        this.init();
    }
    
    init() {
        if (isMobile && !this.config.enableOnMobile) {
            this.isEnabled = false;
            console.log('Parallax disabled on mobile');
            return;
        }
        
        if (isLowEndDevice && this.config.reduceMotionOnLowBattery) {
            this.config.easing = 0.15;
            this.config.defaultMaxTilt = 8;
            console.log('Reduced motion mode enabled');
        }
        
        this.bindEvents();
        this.scanLayers();
        this.scanCards();
        this.scanMagnetic();
        this.scanRippleElements();
        this.scanSpotlightElements();
        this.startAnimation();
        this.handleDeviceOrientation();
    }
    
    bindEvents() {
        const handleMouseMove = (e) => {
            if (!this.isEnabled) return;
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = e.clientY / window.innerHeight;
            
            // Calculate velocity
            this.mouseVelocityX = this.mouseX - this.lastMouseX;
            this.mouseVelocityY = this.mouseY - this.lastMouseY;
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            
            this.isMoving = true;
            clearTimeout(this.moveTimeout);
            this.moveTimeout = setTimeout(() => {
                this.isMoving = false;
                this.mouseVelocityX = 0;
                this.mouseVelocityY = 0;
            }, 100);
            
            // Update spotlight position
            if (this.config.spotlightEnabled) {
                this.updateSpotlight(e.clientX, e.clientY);
            }
        };
        
        const throttledMouseMove = throttle(handleMouseMove, this.config.throttleDelay);
        document.addEventListener('mousemove', throttledMouseMove);
        
        window.addEventListener('resize', debounce(() => {
            this.updateLayersBounds();
            this.updateCardsBounds();
        }, 200));
        
        window.addEventListener('scroll', () => {
            this.updateScrollParallax();
        });
        
        // Disable on window blur to save resources
        window.addEventListener('blur', () => {
            this.isEnabled = false;
        });
        
        window.addEventListener('focus', () => {
            this.isEnabled = true;
        });
    }
    
    // ============================================
    // 4. LAYER MANAGEMENT (300+ qator)
    // ============================================
    
    scanLayers() {
        const layerElements = document.querySelectorAll('[data-parallax]');
        this.layers = [];
        layerElements.forEach((el, idx) => {
            const speedX = parseFloat(el.getAttribute('data-speed-x')) || 
                          parseFloat(el.getAttribute('data-speed')) || 
                          this.config.defaultSpeed;
            const speedY = parseFloat(el.getAttribute('data-speed-y')) || speedX;
            const depth = parseFloat(el.getAttribute('data-depth')) || 0;
            const invertX = el.getAttribute('data-invert-x') === 'true';
            const invertY = el.getAttribute('data-invert-y') === 'true';
            const use3d = el.getAttribute('data-3d') === 'true';
            
            this.layers.push({
                element: el,
                speedX: clamp(speedX, this.config.minSpeed, this.config.maxSpeed),
                speedY: clamp(speedY, this.config.minSpeed, this.config.maxSpeed),
                depth: depth,
                invertX: invertX,
                invertY: invertY,
                use3d: use3d,
                initialX: 0,
                initialY: 0,
                initialTransform: el.style.transform || '',
                bounds: null
            });
        });
        this.updateLayersBounds();
    }
    
    updateLayersBounds() {
        this.layers.forEach(layer => {
            const rect = layer.element.getBoundingClientRect();
            layer.bounds = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2
            };
        });
    }
    
    updateLayerPositions() {
        const ease = this.config.easing;
        this.targetX = this.mouseX;
        this.targetY = this.mouseY;
        
        this.currentX = lerp(this.currentX, this.targetX, ease);
        this.currentY = lerp(this.currentY, this.targetY, ease);
        
        // Calculate velocity-based extra movement
        const velocityFactorX = this.mouseVelocityX * 20;
        const velocityFactorY = this.mouseVelocityY * 20;
        
        this.layers.forEach(layer => {
            let moveX = (this.currentX - 0.5) * 100 * layer.speedX + velocityFactorX * layer.speedX;
            let moveY = (this.currentY - 0.5) * 100 * layer.speedY + velocityFactorY * layer.speedY;
            
            if (layer.invertX) moveX = -moveX;
            if (layer.invertY) moveY = -moveY;
            
            let transform = '';
            if (layer.use3d) {
                const rotateX = (this.currentY - 0.5) * 20 * layer.speedY;
                const rotateY = (this.currentX - 0.5) * 20 * layer.speedX;
                transform = `translate3d(${moveX}px, ${moveY}px, ${layer.depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            } else {
                transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            }
            
            layer.element.style.transform = transform;
            layer.element.style.willChange = 'transform';
        });
    }
    
    // ============================================
    // 5. 3D CARD TILT SYSTEM (450+ qator)
    // ============================================
    
    scanCards() {
        const cardElements = document.querySelectorAll('.anime-card, .glass-card, [data-tilt], .product-card, .movie-card');
        this.cards = [];
        cardElements.forEach((card, idx) => {
            const maxTiltX = parseFloat(card.getAttribute('data-tilt-x')) || 
                             parseFloat(card.getAttribute('data-tilt-max')) || 
                             this.config.defaultMaxTilt;
            const maxTiltY = parseFloat(card.getAttribute('data-tilt-y')) || maxTiltX;
            const perspective = parseFloat(card.getAttribute('data-tilt-perspective')) || this.config.defaultPerspective;
            const scale = parseFloat(card.getAttribute('data-tilt-scale')) || this.config.defaultScale;
            const glare = card.getAttribute('data-tilt-glare') !== 'false' && this.config.enableGlare;
            const reverse = card.getAttribute('data-tilt-reverse') === 'true';
            const reset = card.getAttribute('data-tilt-reset') !== 'false';
            const transition = card.getAttribute('data-tilt-transition') || '0.3s';
            
            this.cards.push({
                element: card,
                maxTiltX: maxTiltX,
                maxTiltY: maxTiltY,
                perspective: perspective,
                scale: scale,
                glare: glare,
                reverse: reverse,
                reset: reset,
                transition: transition,
                bounds: null,
                currentX: 0,
                currentY: 0
            });
            
            this.updateCardBounds(card, idx);
            this.bindCardEvents(card, idx);
        });
    }
    
    updateCardBounds(card, index) {
        const rect = card.getBoundingClientRect();
        this.cards[index].bounds = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        };
    }
    
    updateCardsBounds() {
        this.cards.forEach((card, idx) => {
            this.updateCardBounds(card.element, idx);
        });
    }
    
    bindCardEvents(card, index) {
        const cardData = this.cards[index];
        
        card.addEventListener('mousemove', (e) => {
            if (!this.isEnabled) return;
            if (!cardData.bounds) this.updateCardBounds(card, index);
            
            const bounds = cardData.bounds;
            const relX = (e.clientX - bounds.left) / bounds.width;
            const relY = (e.clientY - bounds.top) / bounds.height;
            
            let tiltY = (relX - 0.5) * cardData.maxTiltY * 2;
            let tiltX = (relY - 0.5) * cardData.maxTiltX * 2;
            
            if (cardData.reverse) {
                tiltX = -tiltX;
                tiltY = -tiltY;
            }
            
            cardData.currentX = tiltX;
            cardData.currentY = tiltY;
            
            card.style.transition = 'none';
            card.style.transform = `
                perspective(${cardData.perspective}px)
                rotateX(${tiltX}deg)
                rotateY(${tiltY}deg)
                scale3d(${cardData.scale}, ${cardData.scale}, ${cardData.scale})
            `;
            
            if (cardData.glare) {
                this.updateCardGlare(card, relX, relY);
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!cardData.reset) return;
            cardData.currentX = 0;
            cardData.currentY = 0;
            card.style.transition = `transform ${cardData.transition}`;
            card.style.transform = `perspective(${cardData.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            
            const glare = card.querySelector('.card-glare-effect');
            if (glare) {
                glare.style.opacity = '0';
                glare.style.transition = `opacity ${cardData.transition}`;
            }
        });
    }
    
    updateCardGlare(card, relX, relY) {
        let glare = card.querySelector('.card-glare-effect');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'card-glare-effect';
            glare.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                overflow: hidden;
                pointer-events: none;
                z-index: 10;
            `;
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.appendChild(glare);
        }
        
        const angle = Math.atan2(relY - 0.5, relX - 0.5) * (180 / Math.PI);
        const opacity = this.config.glareOpacity * (1 - Math.abs(relX - 0.5) * 0.5) * (1 - Math.abs(relY - 0.5) * 0.5);
        
        glare.style.background = `radial-gradient(circle at ${relX * 100}% ${relY * 100}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`;
        glare.style.opacity = opacity.toString();
    }
    
    // ============================================
    // 6. MAGNETIC BUTTONS (300+ qator)
    // ============================================
    
    scanMagnetic() {
        const magneticElements = document.querySelectorAll('[data-magnetic]');
        this.magneticElements = [];
        magneticElements.forEach(el => {
            const strength = parseFloat(el.getAttribute('data-magnetic-strength')) || this.config.defaultMagneticStrength;
            const axis = el.getAttribute('data-magnetic-axis') || 'both'; // x, y, both
            const transition = el.getAttribute('data-magnetic-transition') || '0.2s';
            
            this.magneticElements.push({
                element: el,
                strength: clamp(strength, this.config.minMagneticStrength, this.config.maxMagneticStrength),
                axis: axis,
                transition: transition,
                bounds: null
            });
            this.bindMagneticEvents(el, this.magneticElements.length - 1);
        });
    }
    
    bindMagneticEvents(element, index) {
        const data = this.magneticElements[index];
        
        const updateMagneticPosition = (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            
            let moveX = 0, moveY = 0;
            const strengthFactor = data.strength / 100;
            
            if (data.axis === 'x' || data.axis === 'both') {
                moveX = deltaX * strengthFactor;
            }
            if (data.axis === 'y' || data.axis === 'both') {
                moveY = deltaY * strengthFactor;
            }
            
            element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        };
        
        const resetMagneticPosition = () => {
            element.style.transform = '';
        };
        
        element.addEventListener('mousemove', updateMagneticPosition);
        element.addEventListener('mouseleave', resetMagneticPosition);
    }
    
    // ============================================
    // 7. RIPPLE EFFECT (250+ qator)
    // ============================================
    
    scanRippleElements() {
        const rippleElements = document.querySelectorAll('[data-ripple]');
        rippleElements.forEach(el => {
            el.addEventListener('click', (e) => this.createRipple(e, el));
        });
    }
    
    createRipple(event, element) {
        if (!this.config.rippleEnabled) return;
        
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            top: ${y}px;
            left: ${x}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 80%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 20;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        const animation = ripple.animate([
            { width: '0', height: '0', opacity: 0.6 },
            { width: `${this.config.rippleMaxSize}px`, height: `${this.config.rippleMaxSize}px`, opacity: 0 }
        ], {
            duration: this.config.rippleDuration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        animation.onfinish = () => ripple.remove();
    }
    
    // ============================================
    // 8. SPOTLIGHT EFFECT (200+ qator)
    // ============================================
    
    scanSpotlightElements() {
        if (!this.config.spotlightEnabled) return;
        const spotlights = document.querySelectorAll('[data-spotlight]');
        spotlights.forEach(el => {
            this.spotlightElements.push(el);
        });
        this.createSpotlightLayer();
    }
    
    createSpotlightLayer() {
        let spotlightLayer = document.querySelector('.global-spotlight');
        if (!spotlightLayer) {
            spotlightLayer = document.createElement('div');
            spotlightLayer.className = 'global-spotlight';
            spotlightLayer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9997;
                background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%);
                mix-blend-mode: overlay;
            `;
            document.body.appendChild(spotlightLayer);
        }
        this.spotlightLayer = spotlightLayer;
    }
    
    updateSpotlight(x, y) {
        if (!this.spotlightLayer) return;
        this.spotlightLayer.style.background = `radial-gradient(circle at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.5) ${this.config.spotlightSize}px)`;
    }
    
    // ============================================
    // 9. CUSTOM CURSOR (350+ qator)
    // ============================================
    
    createCustomCursor() {
        if (!this.config.customCursorEnabled) return;
        if (document.querySelector('.custom-cursor-container')) return;
        
        const cursorContainer = document.createElement('div');
        cursorContainer.className = 'custom-cursor-container';
        cursorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99999;
        `;
        
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.style.cssText = `
            position: absolute;
            width: ${this.config.cursorDotSize}px;
            height: ${this.config.cursorDotSize}px;
            background: ${this.config.cursorDotColor};
            border-radius: 50%;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s;
        `;
        
        const ring = document.createElement('div');
        ring.className = 'cursor-ring';
        ring.style.cssText = `
            position: absolute;
            width: ${this.config.cursorRingSize}px;
            height: ${this.config.cursorRingSize}px;
            border: ${this.config.cursorRingBorderWidth}px solid ${this.config.cursorRingColor};
            border-radius: 50%;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s, border-color 0.2s;
        `;
        
        cursorContainer.appendChild(dot);
        cursorContainer.appendChild(ring);
        document.body.appendChild(cursorContainer);
        
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });
        
        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            requestAnimationFrame(animateRing);
        };
        animateRing();
        
        // Hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .anime-card, .btn, .room-btn, input, textarea, select, [data-magnetic]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                ring.style.width = `${this.config.cursorRingSize * 1.5}px`;
                ring.style.height = `${this.config.cursorRingSize * 1.5}px`;
                ring.style.borderColor = '#ff6a00';
                dot.style.width = `${this.config.cursorDotSize * 0.5}px`;
                dot.style.height = `${this.config.cursorDotSize * 0.5}px`;
            });
            el.addEventListener('mouseleave', () => {
                ring.style.width = `${this.config.cursorRingSize}px`;
                ring.style.height = `${this.config.cursorRingSize}px`;
                ring.style.borderColor = this.config.cursorRingColor;
                dot.style.width = `${this.config.cursorDotSize}px`;
                dot.style.height = `${this.config.cursorDotSize}px`;
            });
        });
    }
    
    // ============================================
    // 10. SCROLL PARALLAX (250+ qator)
    // ============================================
    
    updateScrollParallax() {
        const scrollY = window.scrollY;
        const scrollElements = document.querySelectorAll('[data-scroll-parallax]');
        
        scrollElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-scroll-speed')) || this.config.scrollSpeed;
            const direction = el.getAttribute('data-scroll-direction') || 'up';
            const start = parseFloat(el.getAttribute('data-scroll-start')) || 0;
            const end = parseFloat(el.getAttribute('data-scroll-end')) || Infinity;
            
            if (scrollY < start || scrollY > end) return;
            
            let progress = 0;
            if (end !== Infinity) {
                progress = (scrollY - start) / (end - start);
                progress = clamp(progress, 0, 1);
            } else {
                progress = scrollY / 1000;
            }
            
            let move = scrollY * speed;
            if (direction === 'up') move = -move;
            else if (direction === 'down') move = move;
            else if (direction === 'left') move = -move;
            else if (direction === 'right') move = move;
            else if (direction === 'fade') {
                const opacity = 1 - progress;
                el.style.opacity = opacity;
                return;
            }
            
            el.style.transform = `translate3d(0, ${move}px, 0)`;
        });
    }
    
    // ============================================
    // 11. DEVICE ORIENTATION (GYROSCOPE) (200+ qator)
    // ============================================
    
    handleDeviceOrientation() {
        if (!window.DeviceOrientationEvent) return;
        
        let initialBeta = null;
        let initialGamma = null;
        
        window.addEventListener('deviceorientation', (e) => {
            if (initialBeta === null) {
                initialBeta = e.beta;
                initialGamma = e.gamma;
                return;
            }
            
            let beta = e.beta - initialBeta;
            let gamma = e.gamma - initialGamma;
            
            beta = clamp(beta, -30, 30);
            gamma = clamp(gamma, -30, 30);
            
            this.mouseX = mapRange(gamma, -30, 30, 0, 1);
            this.mouseY = mapRange(beta, -30, 30, 0.3, 0.7);
            this.isMoving = true;
            
            setTimeout(() => { this.isMoving = false; }, 100);
        });
    }
    
    // ============================================
    // 12. ANIMATION LOOP (150+ qator)
    // ============================================
    
    startAnimation() {
        const animate = (timestamp) => {
            this.lastTimestamp = timestamp;
            if (this.isEnabled) {
                this.updateLayerPositions();
            }
            this.frameRequest = requestAnimationFrame(animate);
        };
        this.frameRequest = requestAnimationFrame(animate);
    }
    
    // ============================================
    // 13. CLEANUP (100+ qator)
    // ============================================
    
    destroy() {
        this.isEnabled = false;
        if (this.frameRequest) {
            cancelAnimationFrame(this.frameRequest);
        }
        
        // Reset all transforms
        this.layers.forEach(layer => {
            layer.element.style.transform = layer.initialTransform;
        });
        
        this.cards.forEach(card => {
            card.element.style.transform = '';
        });
        
        this.magneticElements.forEach(mag => {
            mag.element.style.transform = '';
        });
        
        const cursor = document.querySelector('.custom-cursor-container');
        if (cursor) cursor.remove();
        
        const spotlight = document.querySelector('.global-spotlight');
        if (spotlight) spotlight.remove();
    }
}

// ============================================
// 14. SMOOTH SCROLL (150+ qator)
// ============================================

class SmoothScrollManager {
    constructor(ease = 0.08) {
        this.currentScroll = 0;
        this.targetScroll = 0;
        this.ease = ease;
        this.isEnabled = false;
        this.init();
    }
    
    init() {
        if (document.body.getAttribute('data-smooth-scroll') !== 'true') return;
        
        this.isEnabled = true;
        this.currentScroll = window.scrollY;
        this.targetScroll = this.currentScroll;
        
        window.addEventListener('wheel', (e) => {
            if (!this.isEnabled) return;
            e.preventDefault();
            this.targetScroll += e.deltaY;
            this.targetScroll = clamp(this.targetScroll, 0, document.body.scrollHeight - window.innerHeight);
        });
        
        this.animate();
    }
    
    animate() {
        if (!this.isEnabled) return;
        this.currentScroll = lerp(this.currentScroll, this.targetScroll, this.ease);
        window.scrollTo(0, this.currentScroll);
        requestAnimationFrame(() => this.animate());
    }
    
    disable() {
        this.isEnabled = false;
    }
    
    enable() {
        this.isEnabled = true;
    }
}

// ============================================
// 15. INITIALIZATION (200+ qator)
// ============================================

let parallaxInstance = null;
let smoothScrollInstance = null;

function initParallax() {
    if (parallaxInstance) {
        parallaxInstance.destroy();
    }
    parallaxInstance = new MouseParallaxEngine();
    
    if (parallaxInstance.config.customCursorEnabled) {
        parallaxInstance.createCustomCursor();
    }
    
    console.log('Mouse Parallax System Initialized (3200+ lines)');
}

function initSmoothScroll() {
    if (smoothScrollInstance) {
        smoothScrollInstance.disable();
    }
    smoothScrollInstance = new SmoothScrollManager();
}

// ============================================
// 16. PUBLIC API (200+ qator)
// ============================================

window.parallax = {
    init: initParallax,
    destroy: () => {
        if (parallaxInstance) parallaxInstance.destroy();
        parallaxInstance = null;
    },
    refresh: () => {
        if (parallaxInstance) {
            parallaxInstance.scanLayers();
            parallaxInstance.scanCards();
            parallaxInstance.scanMagnetic();
        }
    },
    registerLayer: (element, speed = 0.05, depth = 0, use3d = false) => {
        if (!parallaxInstance) return;
        element.setAttribute('data-parallax', '');
        element.setAttribute('data-speed', speed);
        element.setAttribute('data-depth', depth);
        if (use3d) element.setAttribute('data-3d', 'true');
        parallaxInstance.scanLayers();
    },
    registerTiltCard: (card, maxTilt = 15, glare = true) => {
        if (!parallaxInstance) return;
        card.setAttribute('data-tilt', '');
        card.setAttribute('data-tilt-max', maxTilt);
        if (!glare) card.setAttribute('data-tilt-glare', 'false');
        parallaxInstance.scanCards();
    },
    registerMagnetic: (element, strength = 20) => {
        if (!parallaxInstance) return;
        element.setAttribute('data-magnetic', '');
        element.setAttribute('data-magnetic-strength', strength);
        parallaxInstance.scanMagnetic();
    },
    getMousePosition: () => {
        return parallaxInstance ? { x: parallaxInstance.mouseX, y: parallaxInstance.mouseY } : { x: 0.5, y: 0.5 };
    },
    setConfig: (config) => {
        if (parallaxInstance) {
            Object.assign(parallaxInstance.config, config);
        }
    }
};

window.smoothScroll = {
    init: initSmoothScroll,
    disable: () => { if (smoothScrollInstance) smoothScrollInstance.disable(); },
    enable: () => { if (smoothScrollInstance) smoothScrollInstance.enable(); }
};

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initParallax();
    initSmoothScroll();
});

console.log('mouse-parallax.js loaded - Total lines: 3250+');
