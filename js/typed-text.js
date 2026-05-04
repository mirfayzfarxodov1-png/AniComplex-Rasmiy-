// ============================================================================
// AniComplex - Typed Text Animation System
// Version: 3.0.0
// Total Lines: 300+
// Features: Typewriter effect, delete effect, multiple strings, cursor blink
// ============================================================================

class TypedText {
    constructor(elementId, options = {}) {
        this.element = document.getElementById(elementId);
        if (!this.element) {
            console.error(`Element with id "${elementId}" not found`);
            return;
        }
        
        this.strings = options.strings || [];
        this.typeSpeed = options.typeSpeed || 100;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.pauseDelay = options.pauseDelay || 1500;
        this.loop = options.loop !== false;
        this.cursor = options.cursor !== false;
        this.cursorChar = options.cursorChar || '|';
        this.shuffle = options.shuffle || false;
        this.showCursor = options.showCursor !== false;
        
        this.currentStringIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.timeout = null;
        
        this.init();
    }
    
    init() {
        // Create cursor element
        if (this.showCursor) {
            this.cursorElement = document.createElement('span');
            this.cursorElement.className = 'typed-cursor';
            this.cursorElement.textContent = this.cursorChar;
            this.cursorElement.style.display = 'inline-block';
            this.cursorElement.style.animation = 'blink-caret 0.75s step-end infinite';
            this.element.appendChild(this.cursorElement);
        }
        
        // Shuffle strings if enabled
        if (this.shuffle) {
            this.strings = this.shuffleArray(this.strings);
        }
        
        // Start typing
        this.type();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    type() {
        if (this.timeout) clearTimeout(this.timeout);
        
        const currentString = this.strings[this.currentStringIndex];
        
        if (this.isDeleting) {
            // Delete characters
            this.currentCharIndex--;
            const typedText = currentString.substring(0, this.currentCharIndex);
            this.updateText(typedText);
            
            if (this.currentCharIndex === 0) {
                this.isDeleting = false;
                this.isPaused = true;
                
                // Move to next string
                this.currentStringIndex++;
                if (this.currentStringIndex >= this.strings.length) {
                    if (this.loop) {
                        this.currentStringIndex = 0;
                    } else {
                        return; // Finished
                    }
                }
                
                this.timeout = setTimeout(() => {
                    this.isPaused = false;
                    this.type();
                }, this.pauseDelay);
            } else {
                this.timeout = setTimeout(() => this.type(), this.deleteSpeed);
            }
        } else {
            // Type characters
            this.currentCharIndex++;
            const typedText = currentString.substring(0, this.currentCharIndex);
            this.updateText(typedText);
            
            if (this.currentCharIndex === currentString.length) {
                this.isDeleting = true;
                if (this.loop || this.currentStringIndex + 1 < this.strings.length) {
                    this.timeout = setTimeout(() => this.type(), this.pauseDelay);
                }
            } else {
                this.timeout = setTimeout(() => this.type(), this.typeSpeed);
            }
        }
    }
    
    updateText(text) {
        // Get text container (without cursor)
        let textContainer = this.element.querySelector('.typed-text');
        if (!textContainer) {
            textContainer = document.createElement('span');
            textContainer.className = 'typed-text';
            this.element.insertBefore(textContainer, this.cursorElement);
        }
        textContainer.textContent = text;
    }
    
    stop() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.isDeleting = false;
        this.isPaused = false;
    }
    
    start() {
        this.currentStringIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.type();
    }
}

// Multiple instances manager
class TypedManager {
    constructor() {
        this.instances = [];
    }
    
    create(elementId, options) {
        const instance = new TypedText(elementId, options);
        this.instances.push(instance);
        return instance;
    }
    
    stopAll() {
        this.instances.forEach(instance => instance.stop());
    }
    
    startAll() {
        this.instances.forEach(instance => instance.start());
    }
}

// Pre-built animations
const typedAnimations = {
    // Anime quotes
    animeQuotes: [
        "Anime is life! 🎌",
        "1000+ Anime available",
        "Watch anytime, anywhere",
        "New episodes daily",
        "Join our community"
    ],
    
    // Naruto quotes
    narutoQuotes: [
        "Believe it!",
        "Dattebayo!",
        "I never give up!",
        "That's my ninja way!",
        "Sasuke!!!"
    ],
    
    // One Piece quotes
    onePieceQuotes: [
        "I'm gonna be King of the Pirates!",
        "Gomu Gomu no...",
        "Nakama are everything",
        "The One Piece is real!",
        "SUUUUPER!"
    ]
};

// Global function to initialize typed text
function initTypedText() {
    const elements = document.querySelectorAll('[data-typed]');
    const manager = new TypedManager();
    
    elements.forEach(el => {
        let strings = [];
        const stringsAttr = el.getAttribute('data-typed-strings');
        const preset = el.getAttribute('data-typed-preset');
        
        if (preset && typedAnimations[preset]) {
            strings = typedAnimations[preset];
        } else if (stringsAttr) {
            strings = stringsAttr.split(',');
        } else {
            strings = ["Welcome to AniComplex", "Anime portal", "1000+ anime"];
        }
        
        const typeSpeed = parseInt(el.getAttribute('data-type-speed')) || 100;
        const deleteSpeed = parseInt(el.getAttribute('data-delete-speed')) || 50;
        const pauseDelay = parseInt(el.getAttribute('data-pause-delay')) || 1500;
        const loop = el.getAttribute('data-loop') !== 'false';
        const shuffle = el.getAttribute('data-shuffle') === 'true';
        
        manager.create(el.id || `typed-${Date.now()}-${Math.random()}`, {
            strings: strings,
            typeSpeed: typeSpeed,
            deleteSpeed: deleteSpeed,
            pauseDelay: pauseDelay,
            loop: loop,
            shuffle: shuffle
        });
    });
    
    return manager;
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.typedManager = initTypedText();
});

// Export for global use
window.TypedText = TypedText;
window.TypedManager = TypedManager;
window.initTypedText = initTypedText;
window.typedAnimations = typedAnimations;
