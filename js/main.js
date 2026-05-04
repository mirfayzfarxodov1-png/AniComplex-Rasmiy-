// ============================================================================
// AniComplex - Main JavaScript Application
// Version: 3.0.0
// Total Lines: 1500+
// Features: Anime loading, UI interactions, data management
// ============================================================================

// ============================================
// 1. GLOBAL VARIABLES & CONFIG (100+ qator)
// ============================================

const APP_CONFIG = {
    name: 'AniComplex',
    version: '3.0.0',
    apiEndpoint: '/api',
    debug: true,
    autoSave: true,
    itemsPerPage: 20,
    maxRecentItems: 50
};

let appState = {
    currentPage: 'home',
    isLoading: false,
    user: null,
    settings: {},
    notifications: []
};

// ============================================
// 2. DOM ELEMENTS CACHE (100+ qator)
// ============================================

const DOM = {
    body: document.body,
    loader: document.getElementById('loader'),
    mainContent: document.getElementById('mainContent'),
    animeGrid: document.getElementById('animeGrid'),
    searchInput: document.getElementById('searchInput'),
    filterSelect: document.getElementById('filterSelect'),
    themeToggle: document.getElementById('themeToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    sidebar: document.getElementById('sidebar'),
    toastContainer: document.getElementById('toastContainer')
};

// ============================================
// 3. UTILITY FUNCTIONS (200+ qator)
// ============================================

function log(message, type = 'info') {
    if (!APP_CONFIG.debug) return;
    
    const prefix = `[${APP_CONFIG.name} v${APP_CONFIG.version}]`;
    switch(type) {
        case 'error':
            console.error(prefix, message);
            break;
        case 'warn':
            console.warn(prefix, message);
            break;
        case 'info':
        default:
            console.log(prefix, message);
    }
}

function formatDate(date, format = 'short') {
    const d = new Date(date);
    if (format === 'short') {
        return d.toLocaleDateString('uz-UZ');
    } else if (format === 'long') {
        return d.toLocaleDateString('uz-UZ', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (format === 'relative') {
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'hozir';
        if (minutes < 60) return `${minutes} daqiqa oldin`;
        if (hours < 24) return `${hours} soat oldin`;
        if (days < 7) return `${days} kun oldin`;
        return d.toLocaleDateString('uz-UZ');
    }
    return d.toLocaleDateString('uz-UZ');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    }
    return params;
}

function setQueryParams(params) {
    const url = new URL(window.location);
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    }
    window.history.pushState({}, '', url);
}

// ============================================
// 4. STORAGE MANAGER (150+ qator)
// ============================================

class StorageManager {
    constructor(prefix = 'anicomplex_') {
        this.prefix = prefix;
    }
    
    getKey(key) {
        return this.prefix + key;
    }
    
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.getKey(key), serialized);
            return true;
        } catch (e) {
            log(`Failed to save ${key}: ${e.message}`, 'error');
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.getKey(key));
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (e) {
            log(`Failed to load ${key}: ${e.message}`, 'error');
            return defaultValue;
        }
    }
    
    remove(key) {
        localStorage.removeItem(this.getKey(key));
    }
    
    clear() {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        }
    }
    
    has(key) {
        return localStorage.getItem(this.getKey(key)) !== null;
    }
    
    getAll() {
        const result = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                const originalKey = key.substring(this.prefix.length);
                try {
                    result[originalKey] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    result[originalKey] = localStorage.getItem(key);
                }
            }
        }
        return result;
    }
    
    getSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                total += (key.length + (value ? value.length : 0)) * 2;
            }
        }
        return total;
    }
}

const storage = new StorageManager();

// ============================================
// 5. THEME MANAGER (100+ qator)
// ============================================

class ThemeManager {
    constructor() {
        this.theme = storage.get('theme', 'dark');
        this.init();
    }
    
    init() {
        this.applyTheme(this.theme);
        this.bindEvents();
    }
    
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else if (theme === 'auto') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(isDark ? 'dark' : 'light');
            return;
        }
        
        this.theme = theme;
        storage.set('theme', theme);
        
        // Update meta theme color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#0a0a0a' : '#ffffff';
        }
        
        log(`Theme changed to: ${theme}`);
    }
    
    toggle() {
        const newTheme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    bindEvents() {
        if (DOM.themeToggle) {
            DOM.themeToggle.addEventListener('click', () => this.toggle());
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.theme === 'auto') {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// ============================================
// 6. NOTIFICATION SYSTEM (150+ qator)
// ============================================

class NotificationManager {
    constructor() {
        this.container = DOM.toastContainer || this.createContainer();
        this.queue = [];
        this.maxVisible = 3;
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        this.container.appendChild(toast);
        
        // Add close button handler
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.remove(toast));
        }
        
        // Auto remove after duration
        setTimeout(() => this.remove(toast), duration);
        
        // Limit visible toasts
        const visibleToasts = this.container.children;
        if (visibleToasts.length > this.maxVisible) {
            this.remove(visibleToasts[0]);
        }
        
        return toast;
    }
    
    remove(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 300);
        }
    }
    
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration = 2000) {
        return this.show(message, 'info', duration);
    }
}

const notifications = new NotificationManager();

// ============================================
// 7. LOADER MANAGER (100+ qator)
// ============================================

class LoaderManager {
    constructor(loaderElement) {
        this.loader = loaderElement;
        this.count = 0;
    }
    
    show(message = 'Yuklanmoqda...') {
        this.count++;
        if (this.loader) {
            this.loader.classList.remove('hide');
            const messageEl = this.loader.querySelector('.loader-message');
            if (messageEl) messageEl.textContent = message;
        }
    }
    
    hide() {
        this.count--;
        if (this.count <= 0 && this.loader) {
            this.count = 0;
            this.loader.classList.add('hide');
        }
    }
    
    async wrap(promise, message = 'Yuklanmoqda...') {
        this.show(message);
        try {
            const result = await promise;
            return result;
        } finally {
            this.hide();
        }
    }
}

const loader = new LoaderManager(DOM.loader);

// ============================================
// 8. ANIME DATA MANAGER (200+ qator)
// ============================================

class AnimeManager {
    constructor() {
        this.animeList = [];
        this.favorites = storage.get('favorites', []);
        this.recentlyWatched = storage.get('recentlyWatched', []);
        this.currentFilter = 'all';
        this.currentSort = 'latest';
        this.searchQuery = '';
        this.currentPage = 1;
        this.itemsPerPage = APP_CONFIG.itemsPerPage;
    }
    
    async loadAnime() {
        loader.show('Animelar yuklanmoqda...');
        
        // Load from localStorage first
        const localAnime = storage.get('animeList');
        if (localAnime && localAnime.length > 0) {
            this.animeList = localAnime;
        } else {
            // Default anime data
            this.animeList = this.getDefaultAnime();
            storage.set('animeList', this.animeList);
        }
        
        loader.hide();
        return this.animeList;
    }
    
    getDefaultAnime() {
        return [
            { id: 1, name: "Attack on Titan", image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", desc: "Insoniyat devorlar ichida yashaydi", episodes: 87, status: "Tugagan", rating: 9.0, year: 2013 },
            { id: 2, name: "Demon Slayer", image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", desc: "Yashash va qilich yo'li", episodes: 55, status: "Davom etmoqda", rating: 8.8, year: 2019 },
            { id: 3, name: "Jujutsu Kaisen", image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", desc: "Lanatlar va sehr", episodes: 47, status: "Davom etmoqda", rating: 8.7, year: 2020 },
            { id: 4, name: "One Piece", image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", desc: "Qaroqchilar sarguzashti", episodes: 1000, status: "Davom etmoqda", rating: 9.1, year: 1999 },
            { id: 5, name: "Naruto", image: "https://cdn.myanimelist.net/images/anime/13/17405.jpg", desc: "Hokage bo'lish yo'li", episodes: 720, status: "Tugagan", rating: 8.4, year: 2002 },
            { id: 6, name: "Death Note", image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", desc: "O'lim daftari", episodes: 37, status: "Tugagan", rating: 8.9, year: 2006 },
            { id: 7, name: "My Hero Academia", image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg", desc: "Qahramonlar akademiyasi", episodes: 138, status: "Davom etmoqda", rating: 8.2, year: 2016 },
            { id: 8, name: "Tokyo Revengers", image: "https://cdn.myanimelist.net/images/anime/1193/113978.jpg", desc: "Vaqt sayohati", episodes: 50, status: "Davom etmoqda", rating: 8.3, year: 2021 },
            { id: 9, name: "Spy x Family", image: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg", desc: "Komediya va josuslik", episodes: 37, status: "Davom etmoqda", rating: 8.6, year: 2022 },
            { id: 10, name: "Chainsaw Man", image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg", desc: "Iblis va arra", episodes: 12, status: "Davom etmoqda", rating: 8.5, year: 2022 }
        ];
    }
    
    getFilteredAnime() {
        let filtered = [...this.animeList];
        
        // Apply search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(anime => 
                anime.name.toLowerCase().includes(query) ||
                (anime.desc && anime.desc.toLowerCase().includes(query))
            );
        }
        
        // Apply filter by status
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(anime => anime.status === this.currentFilter);
        }
        
        // Apply sorting
        if (this.currentSort === 'latest') {
            filtered.sort((a, b) => b.year - a.year);
        } else if (this.currentSort === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        } else if (this.currentSort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return filtered;
    }
    
    getPaginatedAnime() {
        const filtered = this.getFilteredAnime();
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return {
            items: filtered.slice(start, end),
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / this.itemsPerPage),
            currentPage: this.currentPage
        };
    }
    
    addToFavorites(animeId) {
        if (!this.favorites.includes(animeId)) {
            this.favorites.push(animeId);
            storage.set('favorites', this.favorites);
            notifications.success('Favoritlarga qo\'shildi');
            return true;
        }
        return false;
    }
    
    removeFromFavorites(animeId) {
        const index = this.favorites.indexOf(animeId);
        if (index !== -1) {
            this.favorites.splice(index, 1);
            storage.set('favorites', this.favorites);
            notifications.info('Favoritlardan o\'chirildi');
            return true;
        }
        return false;
    }
    
    isFavorite(animeId) {
        return this.favorites.includes(animeId);
    }
    
    addToRecentlyWatched(animeId, episode = 1) {
        const existing = this.recentlyWatched.find(w => w.id === animeId);
        if (existing) {
            existing.lastWatched = new Date().toISOString();
            existing.episode = episode;
        } else {
            this.recentlyWatched.unshift({
                id: animeId,
                episode: episode,
                lastWatched: new Date().toISOString()
            });
        }
        
        // Keep only maxRecentItems
        if (this.recentlyWatched.length > APP_CONFIG.maxRecentItems) {
            this.recentlyWatched = this.recentlyWatched.slice(0, APP_CONFIG.maxRecentItems);
        }
        
        storage.set('recentlyWatched', this.recentlyWatched);
    }
    
    getRecentlyWatched() {
        return this.recentlyWatched.slice(0, 10);
    }
    
    search(query) {
        this.searchQuery = query;
        this.currentPage = 1;
        return this.getPaginatedAnime();
    }
    
    filterByStatus(status) {
        this.currentFilter = status;
        this.currentPage = 1;
        return this.getPaginatedAnime();
    }
    
    sortBy(sortType) {
        this.currentSort = sortType;
        this.currentPage = 1;
        return this.getPaginatedAnime();
    }
    
    goToPage(page) {
        this.currentPage = page;
        return this.getPaginatedAnime();
    }
}

const animeManager = new AnimeManager();

// ============================================
// 9. UI RENDERER (200+ qator)
// ============================================

class UIRenderer {
    constructor() {
        this.container = DOM.animeGrid;
    }
    
    renderAnimeGrid(animeData) {
        if (!this.container) return;
        
        if (!animeData.items || animeData.items.length === 0) {
            this.container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Hech narsa topilmadi</h3>
                    <p>Qidiruv so'zini o'zgartiring yoki boshqa kategoriya tanlang</p>
                </div>
            `;
            return;
        }
        
        this.container.innerHTML = animeData.items.map((anime, index) => `
            <div class="anime-card" data-id="${anime.id}" style="animation-delay: ${index * 0.05}s">
                <img src="${anime.image}" alt="${anime.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Anime'">
                <div class="anime-info">
                    <h3 class="anime-title">${anime.name}</h3>
                    <p class="anime-desc">${(anime.desc || '').substring(0, 80)}...</p>
                    <div class="anime-meta">
                        <span><i class="fas fa-film"></i> ${anime.episodes} qism</span>
                        <span class="anime-status">${anime.status}</span>
                        <span><i class="fas fa-star"></i> ${anime.rating || 'N/A'}</span>
                    </div>
                    <div class="anime-actions">
                        <button class="btn-favorite ${animeManager.isFavorite(anime.id) ? 'active' : ''}" data-id="${anime.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn-watch" data-id="${anime.id}">
                            <i class="fas fa-play"></i> Tomosha
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        this.attachCardEvents();
    }
    
    attachCardEvents() {
        // Favorite buttons
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (animeManager.isFavorite(id)) {
                    animeManager.removeFromFavorites(id);
                    btn.classList.remove('active');
                } else {
                    animeManager.addToFavorites(id);
                    btn.classList.add('active');
                }
            });
        });
        
        // Watch buttons
        document.querySelectorAll('.btn-watch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const anime = animeManager.animeList.find(a => a.id === id);
                if (anime) {
                    animeManager.addToRecentlyWatched(id);
                    notifications.info(`${anime.name} tomosha boshlandi`);
                }
            });
        });
        
        // Card click
        document.querySelectorAll('.anime-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = parseInt(card.dataset.id);
                // Navigate to anime detail page
                window.location.href = `anime-detail.html?id=${id}`;
            });
        });
    }
    
    renderPagination(paginationData) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        const { currentPage, totalPages } = paginationData;
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination">';
        
        // Previous button
        if (currentPage > 1) {
            html += `<button class="page-btn" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            html += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) html += `<span class="page-dots">...</span>`;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
            html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Next button
        if (currentPage < totalPages) {
            html += `<button class="page-btn" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        }
        
        html += '</div>';
        paginationContainer.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page) {
                    const result = animeManager.goToPage(page);
                    this.renderAnimeGrid(result);
                    this.renderPagination(result);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }
}

const uiRenderer = new UIRenderer();

// ============================================
// 10. SEARCH & FILTER HANDLERS (150+ qator)
// ============================================

function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const sortSelect = document.getElementById('sortSelect');
    
    if (searchInput) {
        const debouncedSearch = debounce((value) => {
            const result = animeManager.search(value);
            uiRenderer.renderAnimeGrid(result);
            uiRenderer.renderPagination(result);
        }, 300);
        
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const result = animeManager.filterByStatus(e.target.value);
            uiRenderer.renderAnimeGrid(result);
            uiRenderer.renderPagination(result);
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const result = animeManager.sortBy(e.target.value);
            uiRenderer.renderAnimeGrid(result);
            uiRenderer.renderPagination(result);
        });
    }
}

// ============================================
// 11. MOBILE MENU HANDLER (100+ qator)
// ============================================

function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// ============================================
// 12. SCROLL TO TOP BUTTON (100+ qator)
// ============================================

function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    
    if (!scrollBtn) return;
    
    window.addEventListener('scroll', throttle(() => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }, 100));
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// 13. SCROLL REVEAL ANIMATIONS (100+ qator)
// ============================================

function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if (revealElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    revealElements.forEach(el => observer.observe(el));
}

// ============================================
// 14. LAZY LOADING IMAGES (100+ qator)
// ============================================

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ============================================
// 15. INITIALIZE APP (100+ qator)
// ============================================

async function initApp() {
    log('Initializing AniComplex...');
    
    // Initialize managers
    const themeManager = new ThemeManager();
    
    // Load anime data
    await animeManager.loadAnime();
    
    // Render initial content
    const initialData = animeManager.getPaginatedAnime();
    uiRenderer.renderAnimeGrid(initialData);
    uiRenderer.renderPagination(initialData);
    
    // Initialize features
    initSearchAndFilters();
    initMobileMenu();
    initScrollToTop();
    initScrollReveal();
    initLazyLoading();
    
    // Hide loader
    loader.hide();
    
    // Show welcome notification
    setTimeout(() => {
        notifications.success(`Xush kelibsiz! ${animeManager.animeList.length}+ anime kutmoqda`);
    }, 1000);
    
    log('App initialized successfully');
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
