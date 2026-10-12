// visite.js - Gestion de la page de visite publique avec système de likes

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Page de visite chargée');
    
    // Charger les articles
    loadPublicArticles();
    
    // Initialiser les filtres
    initFilters();
    
    // Mettre à jour les statistiques
    updateStats();
});

// Charger les articles publics
function loadPublicArticles() {
    const articlesContainer = document.getElementById('articlesContainer');
    if (!articlesContainer) return;
    
    // Récupérer les articles du localStorage
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    
    console.log('Articles totaux:', articles.length);
    
    // Filtrer uniquement les articles validés (status = 'active' OU 'validated')
    const activeArticles = articles.filter(a => a.status === 'active' || a.status === 'validated');
    
    console.log('Articles actifs:', activeArticles.length);
    
    // Trier : promotions en premier, puis par date
    activeArticles.sort((a, b) => {
        if (a.isPromo && !b.isPromo) return -1;
        if (!a.isPromo && b.isPromo) return 1;
        return new Date(b.publishedAt || b.createdAt || Date.now()) - new Date(a.publishedAt || a.createdAt || Date.now());
    });
    
    // Vider le conteneur
    articlesContainer.innerHTML = '';
    
    if (activeArticles.length === 0) {
        articlesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <i class="fa-solid fa-box-open" style="font-size: 64px; margin-bottom: 20px; color: #bdc3c7;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px; color: #2c3e50;">Aucune annonce disponible</h3>
                <p style="font-size: 16px;">Revenez plus tard pour découvrir de nouvelles offres !</p>
            </div>
        `;
        return;
    }
    
    // Afficher chaque article
    activeArticles.forEach(article => {
        const articleCard = createPublicArticleCard(article);
        articlesContainer.appendChild(articleCard);
    });
}

// Créer une carte d'article publique
function createPublicArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.dataset.category = article.category || 'tous';
    card.dataset.id = article.id;
    
    // Déterminer l'icône selon la catégorie
    let icon = 'fa-solid fa-box';
    let iconColor = '#3498db';
    
    switch(article.category) {
        case 'elec':
            icon = 'fa-solid fa-mobile-screen';
            iconColor = '#3498db';
            break;
        case 'mode':
            icon = 'fa-solid fa-shirt';
            iconColor = '#e74c3c';
            break;
        case 'agro':
            icon = 'fa-solid fa-tractor';
            iconColor = '#2ecc71';
            break;
        case 'immo':
            icon = 'fa-solid fa-building';
            iconColor = '#9b59b6';
            break;
    }
    
    const formattedPrice = formatPrice(article.price);
    const timeAgo = getTimeAgo(new Date(article.publishedAt || article.createdAt || Date.now()));
    
    // Récupérer les likes
    const likes = getLikes(article.id);
    const isLiked = isArticleLiked(article.id);
    
    card.innerHTML = `
        ${article.isPromo ? '<div class="promo-badge">🔥 PROMOTION</div>' : ''}
        ${article.status === 'sold' ? '<div class="sold-badge-article">Vendu</div>' : ''}
        
        <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${article.id}">
            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
            ${likes > 0 ? `<span class="likes-count">${likes}</span>` : ''}
        </button>
        
        <div class="article-image" style="background-color: ${iconColor}20;">
            ${article.images && article.images.length > 0 ? 
                `<img src="${article.images[0]}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<i class="${icon}" style="color: ${iconColor}; font-size: 48px;"></i>`}
        </div>
        <div class="article-info">
            <div class="article-title">${article.title || 'Sans titre'}</div>
            <div class="article-price">${formattedPrice}</div>
            <div class="article-location"><i class="fa-solid fa-location-dot"></i> ${article.location || 'Non spécifié'}</div>
            <div class="article-meta">
                <span><i class="far fa-eye"></i> ${article.views || 0} vues</span>
                <span><i class="far fa-heart"></i> ${likes} likes</span>
            </div>
        </div>
    `;
    
    // Événement sur le bouton like
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleLike(article.id, this);
    });
    
    // Événement sur la carte
    card.addEventListener('click', function() {
        showPublicArticleDetails(article.id);
    });
    
    return card;
}

// Système de likes
function getLikes(articleId) {
    const likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
    return likes[articleId] ? likes[articleId].count : 0;
}

function isArticleLiked(articleId) {
    const sessionId = getSessionId();
    const likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
    
    if (!likes[articleId]) return false;
    
    return likes[articleId].users && likes[articleId].users.includes(sessionId);
}

function toggleLike(articleId, button) {
    const sessionId = getSessionId();
    let likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
    
    // Initialiser si nécessaire
    if (!likes[articleId]) {
        likes[articleId] = {
            count: 0,
            users: []
        };
    }
    
    const isLiked = likes[articleId].users && likes[articleId].users.includes(sessionId);
    
    if (isLiked) {
        // Retirer le like
        likes[articleId].count = Math.max(0, likes[articleId].count - 1);
        likes[articleId].users = likes[articleId].users.filter(id => id !== sessionId);
        
        button.classList.remove('liked');
        button.querySelector('i').className = 'far fa-heart';
    } else {
        // Ajouter le like
        likes[articleId].count += 1;
        if (!likes[articleId].users) likes[articleId].users = [];
        likes[articleId].users.push(sessionId);
        
        button.classList.add('liked');
        button.querySelector('i').className = 'fas fa-heart';
    }
    
    // Sauvegarder
    localStorage.setItem('articleLikes', JSON.stringify(likes));
    
    // Mettre à jour l'affichage
    const countSpan = button.querySelector('.likes-count');
    if (likes[articleId].count > 0) {
        if (countSpan) {
            countSpan.textContent = likes[articleId].count;
        } else {
            button.innerHTML += `<span class="likes-count">${likes[articleId].count}</span>`;
        }
    } else {
        if (countSpan) countSpan.remove();
    }
    
    // Mettre à jour aussi dans la card
    const card = button.closest('.article-card');
    const metaLikes = card.querySelector('.article-meta span:last-child');
    if (metaLikes) {
        metaLikes.innerHTML = `<i class="far fa-heart"></i> ${likes[articleId].count} likes`;
    }
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('visitorId');
    
    if (!sessionId) {
        sessionId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('visitorId', sessionId);
    }
    
    return sessionId;
}

// Afficher les détails d'un article
function showPublicArticleDetails(articleId) {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const article = articles.find(a => a.id == articleId);
    
    if (!article) {
        alert('Article non trouvé');
        return;
    }
    
    createPublicArticleModal(article);
}

// Créer la modale de détails
function createPublicArticleModal(article) {
    const existingModal = document.querySelector('.article-modal');
    if (existingModal) existingModal.remove();
    
    let icon = 'fa-solid fa-box';
    let iconColor = '#3498db';
    let categoryName = 'Autre';
    
    switch(article.category) {
        case 'elec':
            icon = 'fa-solid fa-mobile-screen';
            iconColor = '#3498db';
            categoryName = 'Électronique';
            break;
        case 'mode':
            icon = 'fa-solid fa-shirt';
            iconColor = '#e74c3c';
            categoryName = 'Mode';
            break;
        case 'agro':
            icon = 'fa-solid fa-tractor';
            iconColor = '#2ecc71';
            categoryName = 'Agroalimentaire';
            break;
        case 'immo':
            icon = 'fa-solid fa-building';
            iconColor = '#9b59b6';
            categoryName = 'Immobilier';
            break;
    }
    
    const formattedPrice = formatPrice(article.price);
    const formattedDate = new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const likes = getLikes(article.id);
    const isLiked = isArticleLiked(article.id);
    
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Détails de l'annonce</h2>
                <button class="modal-close"><i class="fa-solid fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="modal-images">
                    ${article.images && article.images.length > 0 ? 
                        article.images.map((img, index) => `
                            <img src="${img}" alt="Image ${index + 1}" class="${index === 0 ? 'active' : ''}">
                        `).join('') : 
                        `<div class="no-image" style="background-color: ${iconColor}20;">
                            <i class="${icon}" style="color: ${iconColor}; font-size: 48px;"></i>
                        </div>`
                    }
                </div>
                <div class="modal-details">
                    <h3>${article.title || 'Sans titre'}</h3>
                    <div class="modal-price">${formattedPrice}</div>
                    
                    <div style="margin-bottom: 20px;">
                        <button class="like-btn-modal ${isLiked ? 'liked' : ''}" style="position: relative; padding: 12px 24px; border-radius: 25px; border: 2px solid #e74c3c; background: ${isLiked ? '#e74c3c' : 'white'}; color: ${isLiked ? 'white' : '#e74c3c'}; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> ${isLiked ? 'Aimé' : 'J\'aime'} (${likes})
                        </button>
                    </div>
                    
                    <div class="modal-info-section">
                        <h4><i class="fa-solid fa-info-circle"></i> Description</h4>
                        <p style="white-space: pre-line;">${article.description || 'Aucune description disponible.'}</p>
                    </div>
                    
                    <div class="modal-info-grid">
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-layer-group"></i> Catégorie</span>
                            <span class="info-value">${categoryName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-map-marker-alt"></i> Localisation</span>
                            <span class="info-value">${article.location || 'Non spécifié'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-tag"></i> État</span>
                            <span class="info-value">${article.condition || 'Non spécifié'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-calendar"></i> Publié le</span>
                            <span class="info-value">${formattedDate}</span>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="contact-btn" style="flex: 1; padding: 15px; background-color: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fa-solid fa-comment"></i> Contacter le vendeur
                        </button>
                        <button class="login-required-btn" style="flex: 1; padding: 15px; background-color: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            <i class="fa-solid fa-user"></i> Se connecter pour acheter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Événements
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
    
    // Bouton like dans la modale
    const likeModalBtn = modal.querySelector('.like-btn-modal');
    likeModalBtn.addEventListener('click', function() {
        const sessionId = getSessionId();
        let likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
        
        if (!likes[article.id]) {
            likes[article.id] = { count: 0, users: [] };
        }
        
        const isLiked = likes[article.id].users && likes[article.id].users.includes(sessionId);
        
        if (isLiked) {
            likes[article.id].count = Math.max(0, likes[article.id].count - 1);
            likes[article.id].users = likes[article.id].users.filter(id => id !== sessionId);
            this.style.background = 'white';
            this.style.color = '#e74c3c';
            this.innerHTML = `<i class="far fa-heart"></i> J'aime (${likes[article.id].count})`;
            this.classList.remove('liked');
        } else {
            likes[article.id].count += 1;
            if (!likes[article.id].users) likes[article.id].users = [];
            likes[article.id].users.push(sessionId);
            this.style.background = '#e74c3c';
            this.style.color = 'white';
            this.innerHTML = `<i class="fas fa-heart"></i> Aimé (${likes[article.id].count})`;
            this.classList.add('liked');
        }
        
        localStorage.setItem('articleLikes', JSON.stringify(likes));
        
        // Recharger les articles
        loadPublicArticles();
    });
    
    // Boutons d'action
    modal.querySelector('.contact-btn').addEventListener('click', () => {
        alert('Veuillez vous connecter pour contacter le vendeur');
        window.location.href = 'login.html';
    });
    
    modal.querySelector('.login-required-btn').addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

// Initialiser les filtres
function initFilters() {
    // Filtrage par catégorie
    const categoryButtons = document.querySelectorAll('.ligne1 button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.classList[0];
            const articles = document.querySelectorAll('.article-card');
            
            articles.forEach(article => {
                if (category === 'tous') {
                    article.style.display = 'block';
                } else {
                    article.style.display = article.dataset.category === category ? 'block' : 'none';
                }
            });
        });
    });
    
    // Recherche
    const searchInput = document.querySelector('.recherche input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const articles = document.querySelectorAll('.article-card');
            
            articles.forEach(article => {
                const title = article.querySelector('.article-title').textContent.toLowerCase();
                const price = article.querySelector('.article-price').textContent.toLowerCase();
                const location = article.querySelector('.article-location').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || price.includes(searchTerm) || location.includes(searchTerm)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    }
}

// Mettre à jour les statistiques
function updateStats() {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const activeArticles = articles.filter(a => a.status === 'active' || a.status === 'validated');
    
    // Nombre d'utilisateurs uniques
    const userIds = [...new Set(articles.map(a => a.userId).filter(Boolean))];
    
    document.getElementById('totalAnnonces').textContent = activeArticles.length;
    document.getElementById('totalUtilisateurs').textContent = userIds.length;
}

// Utilitaires
function formatPrice(price) {
    if (!price) return 'Prix non spécifié';
    if (typeof price === 'string' && price.includes('F CFA')) return price;
    const numPrice = parseInt(price);
    if (isNaN(numPrice)) return 'Prix non spécifié';
    return `${numPrice.toLocaleString('fr-FR')} F CFA`;
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays < 7) return `il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
    });
}