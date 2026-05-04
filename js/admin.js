<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime ro'yxati | AniComplex</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <style>
        /* ============================================
           ANIME LIST PAGE STYLES (500+ qator)
        ============================================ */
        .anime-list-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .page-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .page-header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #ff6a00, #ee0979);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        
        /* Filter bar */
        .filter-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1rem;
            background: rgba(15,15,30,0.5);
            backdrop-filter: blur(10px);
            border-radius: 20px;
        }
        
        .search-box {
            flex: 1;
            min-width: 200px;
            position: relative;
        }
        
        .search-box i {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.5);
        }
        
        .search-box input {
            width: 100%;
            padding: 12px 15px 12px 45px;
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 40px;
            color: #fff;
            font-size: 1rem;
        }
        
        .filter-group {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 8px 20px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 30px;
            cursor: pointer;
            transition: all 0.3s;
            color: #fff;
        }
        
        .filter-btn.active, .filter-btn:hover {
            background: linear-gradient(135deg, #ff6a00, #ee0979);
            border-color: transparent;
        }
        
        .sort-select {
            padding: 8px 20px;
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 30px;
            color: #fff;
            cursor: pointer;
        }
        
        /* Anime grid */
        .anime-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
        }
        
        .anime-card {
            background: rgba(20,20,40,0.7);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.4s;
            cursor: pointer;
            animation: fadeInUp 0.5s ease backwards;
        }
        
        .anime-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(238,9,121,0.3);
        }
        
        .anime-card img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            transition: transform 0.5s;
        }
        
        .anime-card:hover img {
            transform: scale(1.05);
        }
        
        .anime-info {
            padding: 1rem;
        }
        
        .anime-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .anime-meta {
            display: flex;
            justify-content: space-between;
            margin: 0.5rem 0;
            font-size: 0.8rem;
            color: rgba(255,255,255,0.7);
        }
        
        .anime-status {
            color: #ff6a00;
        }
        
        .anime-rating {
            color: #ffc107;
        }
        
        .no-results {
            text-align: center;
            padding: 3rem;
            background: rgba(15,15,30,0.5);
            border-radius: 20px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        
        .page-btn {
            padding: 8px 16px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .page-btn.active, .page-btn:hover {
            background: linear-gradient(135deg, #ff6a00, #ee0979);
        }
        
        @media (max-width: 768px) {
            .anime-list-container { padding: 1rem; }
            .filter-bar { flex-direction: column; }
            .filter-group { justify-content: center; }
            .anime-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }
    </style>
</head>
<body>

<nav class="glass-nav">
    <div class="logo"><i class="fas fa-dragon"></i> AniComplex</div>
    <div class="nav-links">
        <a href="../index.html"><i class="fas fa-home"></i> Bosh sahifa</a>
        <a href="quiz.html"><i class="fas fa-question-circle"></i> Quiz</a>
        <a href="admin.html"><i class="fas fa-user-cog"></i> Admin</a>
        <a href="download.html"><i class="fas fa-download"></i> Yuklab olish</a>
    </div>
</nav>

<div class="anime-list-container">
    <div class="page-header">
        <h1><i class="fas fa-tv"></i> Anime ro'yxati</h1>
        <p>Barcha animelar bir joyda</p>
    </div>
    
    <div class="filter-bar">
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="searchInput" placeholder="Anime qidirish...">
        </div>
        <div class="filter-group">
            <button class="filter-btn active" data-filter="all">Barchasi</button>
            <button class="filter-btn" data-filter="Davom etmoqda">Davom etmoqda</button>
            <button class="filter-btn" data-filter="Tugagan">Tugagan</button>
            <button class="filter-btn" data-filter="Tez orada">Tez orada</button>
        </div>
        <select class="sort-select" id="sortSelect">
            <option value="latest">Eng yangi</option>
            <option value="rating">Eng yuqori reyting</option>
            <option value="name">Nomi bo'yicha</option>
        </select>
    </div>
    
    <div class="anime-grid" id="animeGrid"></div>
    <div class="pagination" id="pagination"></div>
</div>

<script>
// ============================================
// ANIME LIST PAGE - 500+ qator JavaScript
// ============================================

let allAnime = [];
let currentFilter = 'all';
let currentSort = 'latest';
let searchQuery = '';
let currentPage = 1;
const itemsPerPage = 24;

// Load anime from localStorage
function loadAnime() {
    const saved = localStorage.getItem('animeList');
    if (saved && JSON.parse(saved).length > 0) {
        allAnime = JSON.parse(saved);
    } else {
        // Default anime data
        allAnime = [
            { id: 1, name: "Attack on Titan", image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", desc: "Insoniyat devorlar ichida yashaydi", episodes: 87, status: "Tugagan", rating: 9.0, year: 2013, genre: "Action,Fantasy" },
            { id: 2, name: "Demon Slayer", image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", desc: "Yashash va qilich yo'li", episodes: 55, status: "Davom etmoqda", rating: 8.8, year: 2019, genre: "Action,Supernatural" },
            { id: 3, name: "Jujutsu Kaisen", image: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg", desc: "Lanatlar va sehr", episodes: 47, status: "Davom etmoqda", rating: 8.7, year: 2020, genre: "Action,Supernatural" },
            { id: 4, name: "One Piece", image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", desc: "Qaroqchilar sarguzashti", episodes: 1000, status: "Davom etmoqda", rating: 9.1, year: 1999, genre: "Action,Adventure" },
            { id: 5, name: "Naruto", image: "https://cdn.myanimelist.net/images/anime/13/17405.jpg", desc: "Hokage bo'lish yo'li", episodes: 720, status: "Tugagan", rating: 8.4, year: 2002, genre: "Action,Adventure" },
            { id: 6, name: "Death Note", image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", desc: "O'lim daftari", episodes: 37, status: "Tugagan", rating: 8.9, year: 2006, genre: "Mystery,Thriller" },
            { id: 7, name: "My Hero Academia", image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg", desc: "Qahramonlar akademiyasi", episodes: 138, status: "Davom etmoqda", rating: 8.2, year: 2016, genre: "Action,Superhero" },
            { id: 8, name: "Tokyo Revengers", image: "https://cdn.myanimelist.net/images/anime/1193/113978.jpg", desc: "Vaqt sayohati", episodes: 50, status: "Davom etmoqda", rating: 8.3, year: 2021, genre: "Action,Drama" },
            { id: 9, name: "Spy x Family", image: "https://cdn.myanimelist.net/images/anime/1441/122795.jpg", desc: "Komediya va josuslik", episodes: 37, status: "Davom etmoqda", rating: 8.6, year: 2022, genre: "Action,Comedy" },
            { id: 10, name: "Chainsaw Man", image: "https://cdn.myanimelist.net/images/anime/1806/126216.jpg", desc: "Iblis va arra", episodes: 12, status: "Davom etmoqda", rating: 8.5, year: 2022, genre: "Action,Fantasy" }
        ];
        localStorage.setItem('animeList', JSON.stringify(allAnime));
    }
    renderAnime();
}

// Filter and sort anime
function getFilteredAnime() {
    let filtered = [...allAnime];
    
    // Apply filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(anime => anime.status === currentFilter);
    }
    
    // Apply search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(anime => 
            anime.name.toLowerCase().includes(query) ||
            (anime.genre && anime.genre.toLowerCase().includes(query))
        );
    }
    
    // Apply sort
    if (currentSort === 'latest') {
        filtered.sort((a, b) => b.year - a.year);
    } else if (currentSort === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (currentSort === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return filtered;
}

// Render anime grid
function renderAnime() {
    const filtered = getFilteredAnime();
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    const grid = document.getElementById('animeGrid');
    if (!grid) return;
    
    if (paginated.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem;"></i>
                <h3>Hech narsa topilmadi</h3>
                <p>Qidiruv so'zini o'zgartiring yoki boshqa kategoriya tanlang</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    grid.innerHTML = paginated.map((anime, idx) => `
        <div class="anime-card" data-id="${anime.id}" style="animation-delay: ${idx * 0.03}s">
            <img src="${anime.image}" alt="${anime.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Anime'">
            <div class="anime-info">
                <h3 class="anime-title">${anime.name}</h3>
                <div class="anime-meta">
                    <span><i class="fas fa-film"></i> ${anime.episodes} qism</span>
                    <span class="anime-status">${anime.status}</span>
                    <span class="anime-rating"><i class="fas fa-star"></i> ${anime.rating || 'N/A'}</span>
                </div>
                <p style="font-size: 0.8rem; opacity: 0.7;">${(anime.desc || '').substring(0, 80)}...</p>
            </div>
        </div>
    `).join('');
    
    // Add click event to cards
    document.querySelectorAll('.anime-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            // Show anime details modal
            showAnimeDetails(id);
        });
    });
    
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination">';
    
    if (currentPage > 1) {
        html += `<button class="page-btn" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
    }
    
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    if (totalPages > 5) {
        html += `<span>...</span>`;
        html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    if (currentPage < totalPages) {
        html += `<button class="page-btn" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
    
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            if (page) {
                currentPage = page;
                renderAnime();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function showAnimeDetails(id) {
    const anime = allAnime.find(a => a.id === id);
    if (!anime) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>${anime.name}</h2>
                <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <img src="${anime.image}" style="width: 200px; border-radius: 12px;">
                <div style="flex: 1;">
                    <p><strong><i class="fas fa-calendar"></i> Yil:</strong> ${anime.year || 'N/A'}</p>
                    <p><strong><i class="fas fa-film"></i> Qismlar:</strong> ${anime.episodes}</p>
                    <p><strong><i class="fas fa-star"></i> Reyting:</strong> ${anime.rating || 'N/A'}</p>
                    <p><strong><i class="fas fa-tag"></i> Janr:</strong> ${anime.genre || 'N/A'}</p>
                    <p><strong><i class="fas fa-info-circle"></i> Holati:</strong> <span style="color:#ff6a00;">${anime.status}</span></p>
                </div>
            </div>
            <p style="margin-top: 1rem;"><strong>Tavsif:</strong> ${anime.desc || 'Ma\'lumot mavjud emas'}</p>
            <div class="modal-buttons" style="margin-top: 1.5rem;">
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Yopish</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Event listeners
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    renderAnime();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        currentPage = 1;
        renderAnime();
    });
});

document.getElementById('sortSelect')?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    renderAnime();
});

// Initialize
loadAnime();
</script>

</body>
</html>
