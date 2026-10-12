// Boutique.js - Version corrigée avec boutons fonctionnels

document.addEventListener('DOMContentLoaded', function() {
    console.log('Boutique.js chargé');
    
    // Charger les annonces de l'utilisateur au démarrage
    loadUserArticles();
    
    // Initialiser les événements
    initEvents();
});

// Initialiser les événements
function initEvents() {
    // Bouton pour ajouter une annonce
    const addAnnonceBtn = document.querySelector('.add-annonce-btn');
    const emptyBtn = document.querySelector('.empty-btn');
    
    if (addAnnonceBtn) {
        addAnnonceBtn.addEventListener('click', function() {
            // Rediriger vers la page de publication
            window.location.href = 'dashboard.html#publierBtn';
        });
    }
    
    if (emptyBtn) {
        emptyBtn.addEventListener('click', function() {
            // Rediriger vers la page de publication
            window.location.href = 'dashboard.html#publierBtn';
        });
    }
}

// Charger les articles de l'utilisateur
window.loadUserArticles = function() {
    console.log('=== CHARGEMENT DES ARTICLES UTILISATEUR ===');
    
    const boutiqueContainer = document.querySelector('.boutique-annonces');
    if (!boutiqueContainer) {
        console.log('Conteneur boutique non trouvé');
        return;
    }
    
    // Récupérer les articles du localStorage
    let articles = [];
    try {
        const savedData = localStorage.getItem('secondHandArticles');
        articles = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur lecture articles:', e);
        articles = [];
    }
    
    console.log('Articles récupérés:', articles.length);
    
    // Récupérer l'ID de l'utilisateur actuel
    const currentUserId = getCurrentUserId();
    console.log('ID utilisateur actuel:', currentUserId);
    
    // Filtrer les articles de l'utilisateur (tous sauf archived)
    let userArticles = articles.filter(article => {
        return article.userId === currentUserId && article.status !== 'archived';
    });
    
    console.log('Articles de l\'utilisateur:', userArticles.length);
    
    const emptyState = boutiqueContainer.querySelector('.empty-annonces');
    const articlesContainer = boutiqueContainer.querySelector('.user-articles-container');
    
    // Supprimer l'ancien conteneur s'il existe
    if (articlesContainer) {
        articlesContainer.remove();
    }
    
    if (userArticles.length === 0) {
        // Afficher l'état vide
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        
        // Mettre à jour les statistiques
        updateBoutiqueStats([]);
        return;
    }
    
    // Cacher l'état vide
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    // Créer un nouveau conteneur pour les annonces
    const newArticlesContainer = document.createElement('div');
    newArticlesContainer.className = 'user-articles-container';
    newArticlesContainer.style.marginTop = '20px';
    
    // Afficher les articles en attente d'abord
    const pendingArticles = userArticles.filter(article => article.status === 'pending');
    if (pendingArticles.length > 0) {
        const pendingSection = document.createElement('div');
        pendingSection.className = 'pending-section';
        pendingSection.innerHTML = `
            <h3 style="color: #f39c12; margin-bottom: 15px; font-size: 18px;">
                <i class="fa-solid fa-clock"></i> En attente de validation (${pendingArticles.length})
            </h3>
            <p style="color: #7f8c8d; margin-bottom: 20px; font-size: 14px;">
                Vos annonces seront publiées après validation par l'administrateur
            </p>
            <div class="pending-articles" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
        `;
        
        pendingArticles.forEach(article => {
            const pendingCard = createBoutiqueArticleCard(article);
            pendingSection.querySelector('.pending-articles').appendChild(pendingCard);
        });
        
        pendingSection.innerHTML += '</div>';
        newArticlesContainer.appendChild(pendingSection);
    }
    
    // Afficher les articles actifs
    const activeArticles = userArticles.filter(article => article.status === 'active');
    if (activeArticles.length > 0) {
        const validatedSection = document.createElement('div');
        validatedSection.innerHTML = `
            <h3 style="color: #2ecc71; margin-bottom: 15px; font-size: 18px;">
                <i class="fa-solid fa-check-circle"></i> Annonces publiées (${activeArticles.length})
            </h3>
            <div class="validated-articles" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        `;
        
        // Trier par date (plus récents d'abord)
        activeArticles.sort((a, b) => {
            const dateA = new Date(a.publishedAt || Date.now());
            const dateB = new Date(b.publishedAt || Date.now());
            return dateB - dateA;
        });
        
        // Ajouter chaque article
        activeArticles.forEach(article => {
            const articleCard = createBoutiqueArticleCard(article);
            validatedSection.querySelector('.validated-articles').appendChild(articleCard);
        });
        
        validatedSection.innerHTML += '</div>';
        newArticlesContainer.appendChild(validatedSection);
    }
    
    // Insérer après le header
    const header = boutiqueContainer.querySelector('.boutique-header');
    if (header) {
        header.insertAdjacentElement('afterend', newArticlesContainer);
    } else {
        boutiqueContainer.appendChild(newArticlesContainer);
    }
    
    // Mettre à jour les statistiques
    updateBoutiqueStats(activeArticles);
};

// Créer une carte d'article pour la boutique
function createBoutiqueArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'boutique-article-card';
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
    
    // Formater le prix
    const formattedPrice = formatPrice(article.price);
    
    // Calculer le temps écoulé
    const timeAgo = getTimeAgo(new Date(article.publishedAt || Date.now()));
    
    // Déterminer le badge selon le statut
    let statusBadge = '';
    if (article.status === 'pending') {
        statusBadge = '<div class="pending-badge" style="position: absolute; top: 10px; right: 10px; background-color: #f39c12; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">En attente</div>';
    } else if (article.status === 'sold') {
        statusBadge = '<div class="sold-badge" style="position: absolute; top: 10px; right: 10px; background-color: #e74c3c; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">Vendu</div>';
    }
    
    // Créer le HTML
    card.innerHTML = `
        <div class="boutique-article-image" style="background-color: ${iconColor}20; position: relative;">
            ${article.images && article.images.length > 0 ? 
                `<img src="${article.images[0]}" alt="${article.title}" style="width: 100%; height: 180px; object-fit: cover;">` : 
                `<div style="display: flex; align-items: center; justify-content: center; height: 180px;">
                    <i class="${icon}" style="color: ${iconColor}; font-size: 48px;"></i>
                </div>`}
            ${statusBadge}
        </div>
        <div class="boutique-article-info">
            <div class="boutique-article-title">${article.title || 'Sans titre'}</div>
            <div class="boutique-article-price">${formattedPrice}</div>
            <div class="boutique-article-location">
                <i class="fa-solid fa-location-dot"></i> ${article.location || 'Non spécifié'}
            </div>
            <div class="boutique-article-meta">
                <span><i class="far fa-eye"></i> ${article.views || 0} vues</span>
                <span>${timeAgo}</span>
            </div>
            <div class="boutique-article-actions">
                <button class="edit-btn" data-id="${article.id}" onclick="editArticle('${article.id}')">
                    <i class="fa-solid fa-edit"></i> Modifier
                </button>
                <button class="delete-btn" data-id="${article.id}" onclick="deleteArticle('${article.id}')">
                    <i class="fa-solid fa-trash"></i> Supprimer
                </button>
            </div>
        </div>
    `;
    
    // Effets hover
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');
    
    editBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#3498db';
        this.style.color = 'white';
        this.style.borderColor = '#3498db';
    });
    
    editBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#f8f9fa';
        this.style.color = '#3498db';
        this.style.borderColor = '#ddd';
    });
    
    deleteBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e74c3c';
        this.style.color = 'white';
        this.style.borderColor = '#e74c3c';
    });
    
    deleteBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#f8f9fa';
        this.style.color = '#e74c3c';
        this.style.borderColor = '#ddd';
    });
    
    // Clic sur la carte pour voir les détails
    card.addEventListener('click', function(e) {
        if (!e.target.closest('button')) {
            if (typeof window.showArticleDetails === 'function') {
                window.showArticleDetails(article.id);
                incrementArticleViews(article.id);
            }
        }
    });
    
    return card;
}

// Formater le prix
function formatPrice(price) {
    if (!price) return 'Prix non spécifié';
    
    if (typeof price === 'string' && price.includes('F CFA')) {
        return price;
    }
    
    const numPrice = parseInt(price);
    if (isNaN(numPrice)) return 'Prix non spécifié';
    
    return `${numPrice.toLocaleString('fr-FR')} F CFA`;
}

// Fonction pour calculer le temps écoulé
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} h`;
    if (diffDays < 7) return `il y a ${diffDays} j`;
    if (diffWeeks < 4) return `il y a ${diffWeeks} sem`;
    
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
    });
}

// Incrémenter le compteur de vues
function incrementArticleViews(articleId) {
    let articles = [];
    try {
        const savedData = localStorage.getItem('secondHandArticles');
        articles = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur:', e);
        return;
    }
    
    const articleIndex = articles.findIndex(a => a.id == articleId);
    
    if (articleIndex !== -1) {
        articles[articleIndex].views = (articles[articleIndex].views || 0) + 1;
        
        try {
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            
            // Mettre à jour l'affichage dans la carte
            const articleElement = document.querySelector(`.boutique-article-card[data-id="${articleId}"]`);
            if (articleElement) {
                const viewsSpan = articleElement.querySelector('.boutique-article-meta span:first-child');
                if (viewsSpan) {
                    viewsSpan.innerHTML = `<i class="far fa-eye"></i> ${articles[articleIndex].views} vues`;
                }
            }
        } catch (e) {
            console.error('Erreur sauvegarde:', e);
        }
    }
}

// Mettre à jour les statistiques
window.updateBoutiqueStats = function(userArticles = null) {
    console.log('=== MISE À JOUR STATISTIQUES ===');
    
    let articles = userArticles;
    
    if (!articles) {
        try {
            const savedData = localStorage.getItem('secondHandArticles');
            articles = savedData ? JSON.parse(savedData) : [];
        } catch (e) {
            console.error('Erreur:', e);
            articles = [];
        }
        
        const currentUserId = getCurrentUserId();
        if (currentUserId) {
            articles = articles.filter(article => article.userId === currentUserId);
        }
    }
    
    // Filtrer les articles actifs
    const activeArticles = articles.filter(a => a.status === 'active');
    const soldArticles = articles.filter(a => a.status === 'sold');
    
    const stats = {
        annoncesActives: activeArticles.length,
        articlesVendus: soldArticles.length,
        vuesTotales: articles.reduce((sum, article) => sum + (article.views || 0), 0),
        revenus: soldArticles
            .filter(a => a.price)
            .reduce((sum, article) => {
                const price = parseInt(article.price) || 0;
                return sum + price;
            }, 0)
    };
    
    console.log('Statistiques boutique:', stats);
    
    // Mettre à jour les statistiques
    const annoncesEl = document.querySelector('.stat-annonces');
    const vendusEl = document.querySelector('.stat-vendus');
    const vuesEl = document.querySelector('.stat-vues');
    const revenusEl = document.querySelector('.stat-revenus');
    
    if (annoncesEl) annoncesEl.textContent = stats.annoncesActives;
    if (vendusEl) vendusEl.textContent = stats.articlesVendus;
    if (vuesEl) vuesEl.textContent = stats.vuesTotales;
    if (revenusEl) revenusEl.textContent = stats.revenus.toLocaleString('fr-FR');
};

// Fonction pour obtenir l'ID de l'utilisateur actuel
function getCurrentUserId() {
    let userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
        // Créer un ID aléatoire si aucun n'existe
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('currentUserId', userId);
        
        // Stocker aussi un nom d'utilisateur
        const userName = 'Utilisateur ' + Math.floor(Math.random() * 1000);
        localStorage.setItem('currentUserName', userName);
    }
    
    return userId;
}

// Modifier un article
window.editArticle = function(articleId) {
    console.log('Modification article:', articleId);
    
    // Vérifier si l'article existe
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const article = articles.find(a => a.id == articleId);
    
    if (!article) {
        alert('Article non trouvé');
        return;
    }
    
    // Vérifier que l'utilisateur est bien le propriétaire
    const currentUserId = getCurrentUserId();
    if (article.userId !== currentUserId) {
        alert('Vous n\'êtes pas autorisé à modifier cet article');
        return;
    }
    
    // Rediriger vers la page de modification
    window.location.href = `modifier-article.html?id=${articleId}`;
};

// Supprimer un article
window.deleteArticle = function(articleId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
        let articles = [];
        try {
            const savedData = localStorage.getItem('secondHandArticles');
            articles = savedData ? JSON.parse(savedData) : [];
        } catch (e) {
            console.error('Erreur:', e);
            alert('Erreur lors de la suppression');
            return;
        }
        
        // Marquer comme supprimé plutôt que de supprimer complètement
        const articleIndex = articles.findIndex(article => article.id == articleId);
        
        if (articleIndex !== -1) {
            articles[articleIndex].status = 'archived';
            articles[articleIndex].archivedAt = new Date().toISOString();
            
            try {
                localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            } catch (e) {
                console.error('Erreur sauvegarde:', e);
                alert('Erreur lors de la sauvegarde');
                return;
            }
            
            // Recharger les annonces
            loadUserArticles();
            
            // Mettre à jour l'affichage dans l'onglet Explorer
            if (typeof window.loadArticlesFromStorage === 'function') {
                window.loadArticlesFromStorage();
            }
            
            alert('Annonce supprimée avec succès !');
        } else {
            alert('Article non trouvé');
        }
    }
};

// Exposer les fonctions globalement
window.loadUserArticles = loadUserArticles;
window.updateBoutiqueStats = updateBoutiqueStats;
window.editArticle = editArticle;
window.deleteArticle = deleteArticle;