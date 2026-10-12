// Accueil.js - Version corrigée complète

// Système de likes - Fonctions nécessaires
function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

function getLikes(articleId) {
    try {
        const likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
        return likes[articleId] ? likes[articleId].count : 0;
    } catch (e) {
        console.error('Erreur getLikes:', e);
        return 0;
    }
}

function isArticleLiked(articleId) {
    try {
        const sessionId = getSessionId();
        const likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
        
        if (!likes[articleId]) return false;
        
        return likes[articleId].users.includes(sessionId);
    } catch (e) {
        console.error('Erreur isArticleLiked:', e);
        return false;
    }
}

function toggleLike(articleId, button) {
    try {
        const sessionId = getSessionId();
        let likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
        
        // Initialiser si nécessaire
        if (!likes[articleId]) {
            likes[articleId] = {
                count: 0,
                users: []
            };
        }
        
        const isLiked = likes[articleId].users.includes(sessionId);
        
        if (isLiked) {
            // Retirer le like
            likes[articleId].count = Math.max(0, likes[articleId].count - 1);
            likes[articleId].users = likes[articleId].users.filter(id => id !== sessionId);
            
            button.classList.remove('liked');
            button.querySelector('i').className = 'far fa-heart';
        } else {
            // Ajouter le like
            likes[articleId].count += 1;
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
                const newSpan = document.createElement('span');
                newSpan.className = 'likes-count';
                newSpan.textContent = likes[articleId].count;
                newSpan.style.cssText = `
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    background: #e74c3c;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 10px;
                `;
                button.appendChild(newSpan);
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
    } catch (e) {
        console.error('Erreur toggleLike:', e);
    }
}

// Accueil.js - CORRECTION : Afficher uniquement les articles validés

// Fonction globale pour charger les articles
window.loadArticlesFromStorage = function() {
    console.log('=== CHARGEMENT DES ARTICLES ===');
    
    const articlesContainer = document.querySelector('.artice');
    if (!articlesContainer) {
        console.log('Conteneur articles non trouvé');
        return;
    }
    
    // Récupérer les articles du localStorage
    let savedArticles = [];
    try {
        const savedData = localStorage.getItem('secondHandArticles');
        savedArticles = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur lecture articles:', e);
        savedArticles = [];
    }
    
    console.log('Articles récupérés:', savedArticles.length);
    
    // CORRECTION : Afficher UNIQUEMENT les articles validés (status 'active' ou 'validated')
    // Ne plus afficher les articles 'pending'
    const activeArticles = savedArticles.filter(article => {
        // Inclure uniquement les articles validés ou vendus
        return article.status === 'active' || 
               article.status === 'validated' || 
               article.status === 'sold';
    });
    
    console.log('Articles validés à afficher:', activeArticles.length);
    
    // Trier par date (les plus récents d'abord)
    activeArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || Date.now());
        const dateB = new Date(b.publishedAt || Date.now());
        return dateB - dateA;
    });
    
    // Vider le conteneur
    articlesContainer.innerHTML = '';
    
    if (activeArticles.length === 0) {
        articlesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <i class="fa-solid fa-box-open" style="font-size: 64px; margin-bottom: 20px; color: #bdc3c7;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px; color: #2c3e50;">Aucune annonce disponible</h3>
                <p style="font-size: 16px; margin-bottom: 20px;">Soyez le premier à publier une annonce !</p>
            </div>
        `;
        return;
    }
    
    // Ajouter chaque article
    activeArticles.forEach(article => {
        try {
            const articleCard = createArticleCard(article);
            articlesContainer.appendChild(articleCard);
        } catch (error) {
            console.error('Erreur création carte article:', error);
            console.log('Article problématique:', article);
        }
    });
    
    // Initialiser les événements de filtre
    initFilterEvents();
    
    // Rafraîchir la boutique si elle est ouverte
    if (typeof window.refreshBoutique === 'function') {
        window.refreshBoutique();
    }
};

// Le reste du code reste identique...
// (createArticleCard, formatPrice, getTimeAgo, etc.)

// Créer une carte d'article SIMPLIFIÉE (sans système de likes pour l'instant)
// Accueil.js - Modifier la fonction createArticleCard()
function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.dataset.category = article.category || 'tous';
    card.dataset.id = article.id;
    card.dataset.description = article.description ? article.description.toLowerCase() : '';
    
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
    
    // Vérifier si l'utilisateur est le propriétaire
    const currentUserId = getCurrentUserId();
    const isOwner = article.userId === currentUserId;
    
    // Créer le HTML avec bouton d'achat
    card.innerHTML = `
        ${article.sponsored ? '<div class="sponsored-badge">SPONSORISÉ</div>' : ''}
        ${article.status === 'sold' ? '<div class="sold-badge-article">Vendu</div>' : ''}
        ${article.isPromo ? '<div class="promo-badge">🔥 PROMOTION</div>' : ''}
        
        <div class="article-image" style="background-color: ${iconColor}20;">
            ${article.images && article.images.length > 0 ? 
                `<img src="${article.images[0]}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<i class="${icon}" style="color: ${iconColor}; font-size: 48px;"></i>`}
        </div>
        <div class="article-info">
            <div class="article-title">${article.title || 'Sans titre'}</div>
            <div class="article-price">${formattedPrice}</div>
            <div class="article-location"><i class="fa-solid fa-location-dot"></i> ${article.location || 'Non spécifié'}</div>
            
            <!-- Bouton d'achat -->
            ${!isOwner && article.status !== 'sold' ? `
                <button class="buy-btn" data-id="${article.id}" style="width: 100%; padding: 10px; margin-top: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease;">
                    <i class="fa-solid fa-shopping-cart"></i> Acheter maintenant
                </button>
            ` : ''}
            
            ${isOwner ? `
                <div style="margin-top: 10px; font-size: 12px; color: #3498db; text-align: center;">
                    <i class="fa-solid fa-user"></i> Votre annonce
                </div>
            ` : ''}
            
            <div class="article-meta">
                <span><i class="far fa-eye"></i> ${article.views || 0} vues</span>
                <span>${timeAgo}</span>
            </div>
        </div>
    `;
    
    // Ajouter l'événement pour le bouton d'achat
    if (!isOwner && article.status !== 'sold') {
        const buyBtn = card.querySelector('.buy-btn');
        if (buyBtn) {
            buyBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Empêcher l'ouverture des détails
                const articleId = this.dataset.id;
                initiatePurchase(articleId);
            });
            
            // Effet hover sur le bouton
            buyBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            });
            
            buyBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        }
    }
    
    // Ajouter un événement click pour afficher les détails
    card.addEventListener('click', function(e) {
        if (e.target.closest('.sponsored-badge') || 
            e.target.closest('.sold-badge-article') || 
            e.target.closest('.buy-btn')) {
            return;
        }
        
        showArticleDetails(article.id);
        incrementArticleViews(article.id);
    });
    
    return card;
}

// Accueil.js - Ajouter cette fonction après createArticleCard()
function initiatePurchase(articleId) {
    console.log('Achat initié pour l\'article:', articleId);
    
    // Vérifier si l'utilisateur est connecté
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        alert('Veuillez vous connecter pour effectuer un achat');
        window.location.href = 'login.html';
        return;
    }
    
    // Récupérer l'article
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const article = articles.find(a => a.id == articleId);
    
    if (!article) {
        alert('Article non trouvé');
        return;
    }
    
    // Vérifier si l'article est déjà vendu
    if (article.status === 'sold') {
        alert('Cet article a déjà été vendu');
        return;
    }
    
    // Vérifier si l'utilisateur est le propriétaire
    if (article.userId === currentUserId) {
        alert('Vous ne pouvez pas acheter votre propre article');
        return;
    }
    
    // Demander confirmation
    if (confirm(`Voulez-vous acheter "${article.title}" pour ${formatPrice(article.price)} ?`)) {
        // Vérifier si initiatePayment est disponible
        if (typeof window.initiatePayment === 'function') {
            window.initiatePayment(articleId);
        } else {
            alert('Système de paiement non disponible. Redirection vers la page de détails.');
            showArticleDetails(articleId);
        }
    }
}

// Reste du fichier Accueil.js inchangé...
// [Les autres fonctions restent les mêmes : formatPrice, getTimeAgo, incrementArticleViews, etc.]

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

// Accueil.js - Ajouter cette fonction après la fonction getTimeAgo() :

function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
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
        } catch (e) {
            console.error('Erreur sauvegarde:', e);
        }
        
        // Mettre à jour l'affichage
        const articleElement = document.querySelector(`.article-card[data-id="${articleId}"]`);
        if (articleElement) {
            const viewsSpan = articleElement.querySelector('.article-meta span:first-child');
            if (viewsSpan) {
                viewsSpan.innerHTML = `<i class="far fa-eye"></i> ${articles[articleIndex].views} vues`;
            }
        }
        
        // Rafraîchir les statistiques de la boutique
        if (typeof window.updateBoutiqueStats === 'function') {
            window.updateBoutiqueStats();
        }
    }
}

// Afficher les détails d'un article dans une modale
window.showArticleDetails = function(articleId) {
    console.log('Détails article:', articleId);
    
    // Récupérer les articles
    let articles = [];
    try {
        const savedData = localStorage.getItem('secondHandArticles');
        articles = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur:', e);
        alert('Impossible de charger les détails');
        return;
    }
    
    const article = articles.find(a => a.id == articleId);
    
    if (!article) {
        alert('Article non trouvé');
        return;
    }
    
    createArticleModal(article);
};

// Créer la modale de détails
function createArticleModal(article) {
    // Supprimer toute modale existante
    const existingModal = document.querySelector('.article-modal');
    if (existingModal) existingModal.remove();
    
    // Déterminer l'icône et la couleur
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
    const publishedDate = new Date(article.publishedAt || Date.now());
    const formattedDate = publishedDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Vérifier si l'article appartient à l'utilisateur courant
    const currentUserId = getCurrentUserId();
    const isOwner = article.userId === currentUserId;
    
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
                    
                    ${article.userName ? `<div class="modal-seller" style="margin-bottom: 15px; color: #7f8c8d;"><i class="fa-solid fa-user"></i> Vendeur: ${article.userName}</div>` : ''}
                    
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
                            <span class="info-label"><i class="fa-solid fa-phone"></i> Contact</span>
                            <span class="info-value">${article.contact || 'Non spécifié'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-tag"></i> État</span>
                            <span class="info-value">${article.condition || 'Non spécifié'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-truck"></i> Livraison</span>
                            <span class="info-value">${getDeliveryOptionText(article.deliveryOption)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-calendar"></i> Publié le</span>
                            <span class="info-value">${formattedDate}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label"><i class="fa-solid fa-eye"></i> Vues</span>
                            <span class="info-value">${article.views || 0}</span>
                        </div>
                    </div>
                    
                    // Dans createArticleModal() - Section modal-actions
// Remplacer la section modal-actions par :

<div class="modal-actions">
    ${isOwner ? `
        <button class="owner-edit-btn" style="flex: 1; padding: 12px; background-color: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
            <i class="fa-solid fa-edit"></i> Modifier
        </button>
        <button class="owner-delete-btn" style="flex: 1; padding: 12px; background-color: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
            <i class="fa-solid fa-trash"></i> Supprimer
        </button>
        ${article.status !== 'sold' ? `
            <button class="owner-mark-sold-btn" style="flex: 1; padding: 12px; background-color: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
                <i class="fa-solid fa-check-circle"></i> Marquer vendu
            </button>
        ` : ''}
    ` : `
        ${article.status !== 'sold' ? `
            <button class="buy-now-btn" style="flex: 1; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fa-solid fa-shopping-cart"></i> Acheter maintenant
            </button>
        ` : `
            <div style="flex: 1; padding: 15px; background-color: #e74c3c; color: white; border-radius: 8px; text-align: center; font-weight: 600;">
                <i class="fa-solid fa-tag"></i> Déjà vendu
            </div>
        `}
        <button class="contact-btn" style="flex: 1; padding: 12px; background-color: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
            <i class="fa-solid fa-comment"></i> Contacter
        </button>
        <button class="save-btn" style="flex: 1; padding: 12px; background-color: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; margin: 5px;">
            <i class="fa-regular fa-bookmark"></i> Favoris
        </button>
    `}
</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gestionnaires d'événements
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
    
    // Boutons d'action
    if (isOwner) {
        // Bouton Modifier
        modal.querySelector('.owner-edit-btn').addEventListener('click', () => {
            modal.remove();
            window.location.href = `modifier-article.html?id=${article.id}`;
        });

        // Dans createArticleModal() - Après les autres événements
if (!isOwner && article.status !== 'sold') {
    const buyBtn = modal.querySelector('.buy-now-btn');
    if (buyBtn) {
        buyBtn.addEventListener('click', () => {
            modal.remove();
            initiatePurchase(article.id);
        });
    }
}
        
        // Bouton Supprimer
        modal.querySelector('.owner-delete-btn').addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                deleteArticle(article.id);
                modal.remove();
            }
        });
        
        // Bouton Marquer vendu
        const markSoldBtn = modal.querySelector('.owner-mark-sold-btn');
        if (markSoldBtn) {
            markSoldBtn.addEventListener('click', () => {
                if (confirm('Marquer cet article comme vendu ?')) {
                    markAsSold(article.id);
                    modal.remove();
                }
            });
        }
    } else {
        // Bouton Contacter
        modal.querySelector('.contact-btn').addEventListener('click', () => {
            if (article.contact) {
                alert(`Pour contacter le vendeur, appelez le ${article.contact}`);
            } else {
                alert('Aucun numéro de contact disponible');
            }
        });
        
        // Bouton Favoris
        modal.querySelector('.save-btn').addEventListener('click', function() {
            const isSaved = this.classList.contains('saved');
            if (!isSaved) {
                this.innerHTML = '<i class="fa-solid fa-check"></i> Favori';
                this.style.backgroundColor = '#2ecc71';
                this.style.color = 'white';
                this.classList.add('saved');
                saveToFavorites(article.id);
            } else {
                this.innerHTML = '<i class="fa-regular fa-bookmark"></i> Favoris';
                this.style.backgroundColor = '#f8f9fa';
                this.style.color = '#2c3e50';
                this.classList.remove('saved');
                removeFromFavorites(article.id);
            }
        });
        
        // Vérifier si l'article est déjà en favoris
        checkIfFavorite(article.id, modal.querySelector('.save-btn'));
    }
    
    // Fermer avec ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') modal.remove();
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Nettoyer l'événement quand la modale est fermée
    const observer = new MutationObserver(() => {
        if (!document.body.contains(modal)) {
            document.removeEventListener('keydown', closeOnEsc);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Après les autres événements dans createArticleModal :
const buyBtn = modal.querySelector('.buy-now-btn');
if (buyBtn) {
    buyBtn.addEventListener('click', () => {
        modal.remove();
        initiatePayment(article.id);
    });
}

// Obtenir le texte de l'option de livraison
function getDeliveryOptionText(option) {
    switch(option) {
        case 'Meeting': return 'Rencontre en personne';
        case 'Delivery': return 'Livraison possible';
        case 'Shipping': return 'Envoi possible';
        default: return 'Non spécifié';
    }
}

// Fonction pour obtenir l'ID de l'utilisateur actuel
function getCurrentUserId() {
    let userId = localStorage.getItem('currentUserId');
    
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('currentUserId', userId);
    }
    
    return userId;
}

// Vérifier si un article est en favoris
function checkIfFavorite(articleId, button) {
    let favorites = [];
    try {
        const savedData = localStorage.getItem('userFavorites');
        favorites = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur:', e);
        return;
    }
    
    if (favorites.includes(articleId.toString())) {
        button.innerHTML = '<i class="fa-solid fa-check"></i> Favori';
        button.style.backgroundColor = '#2ecc71';
        button.style.color = 'white';
        button.classList.add('saved');
    }
}

// Sauvegarder aux favoris
function saveToFavorites(articleId) {
    let favorites = [];
    try {
        const savedData = localStorage.getItem('userFavorites');
        favorites = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur:', e);
        return;
    }
    
    const articleIdStr = articleId.toString();
    if (!favorites.includes(articleIdStr)) {
        favorites.push(articleIdStr);
        try {
            localStorage.setItem('userFavorites', JSON.stringify(favorites));
            showNotification('Article ajouté aux favoris', 'success');
        } catch (e) {
            console.error('Erreur sauvegarde:', e);
        }
    }
}

// Retirer des favoris
function removeFromFavorites(articleId) {
    let favorites = [];
    try {
        const savedData = localStorage.getItem('userFavorites');
        favorites = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur:', e);
        return;
    }
    
    const articleIdStr = articleId.toString();
    favorites = favorites.filter(id => id !== articleIdStr);
    
    try {
        localStorage.setItem('userFavorites', JSON.stringify(favorites));
        showNotification('Article retiré des favoris', 'info');
    } catch (e) {
        console.error('Erreur sauvegarde:', e);
    }
}

// Marquer un article comme vendu
function markAsSold(articleId) {
    let articles = [];
    try {
        const savedData = localStorage.getItem('secondHandArticles');
        articles = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur:', e);
        alert('Erreur lors de la mise à jour');
        return;
    }
    
    const articleIndex = articles.findIndex(a => a.id == articleId);
    
    if (articleIndex !== -1) {
        articles[articleIndex].status = 'sold';
        articles[articleIndex].soldAt = new Date().toISOString();
        
        try {
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
        } catch (e) {
            console.error('Erreur sauvegarde:', e);
            alert('Erreur lors de la sauvegarde');
            return;
        }
        
        // Recharger les articles
        if (typeof window.loadArticlesFromStorage === 'function') {
            window.loadArticlesFromStorage();
        }
        
        // Recharger la boutique si elle est ouverte
        if (typeof window.loadUserArticles === 'function') {
            window.loadUserArticles();
        }
        
        alert('✅ Article marqué comme vendu !');
    }
}

// Supprimer un article
function deleteArticle(articleId) {
    let articles = [];
    try {
        const savedData = localStorage.getItem('secondHandArticles');
        articles = savedData ? JSON.parse(savedData) : [];
    } catch (e) {
        console.error('Erreur:', e);
        alert('Erreur lors de la suppression');
        return;
    }
    
    const articleIndex = articles.findIndex(a => a.id == articleId);
    
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
        
        // Recharger les articles
        if (typeof window.loadArticlesFromStorage === 'function') {
            window.loadArticlesFromStorage();
        }
        
        // Recharger la boutique
        if (typeof window.loadUserArticles === 'function') {
            window.loadUserArticles();
        }
        
        alert('✅ Article supprimé avec succès !');
    }
}

// Afficher une notification
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
    `;
    
    notification.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Afficher la notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Cacher et supprimer après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialiser les événements de filtre
function initFilterEvents() {
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
                    const articleType = article.dataset.category || 'tous';
                    article.style.display = articleType === category ? 'block' : 'none';
                }
            });
        });
    });
    
    // Recherche d'articles
    const searchInput = document.querySelector('.recherche input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const articles = document.querySelectorAll('.article-card');
            
            articles.forEach(article => {
                const title = article.querySelector('.article-title').textContent.toLowerCase();
                const price = article.querySelector('.article-price').textContent.toLowerCase();
                const location = article.querySelector('.article-location').textContent.toLowerCase();
                const description = article.dataset.description || '';
                
                if (searchTerm === '' || 
                    title.includes(searchTerm) || 
                    price.includes(searchTerm) || 
                    location.includes(searchTerm) || 
                    description.includes(searchTerm)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    }
}

// Fonction globale pour rafraîchir la boutique
window.refreshBoutique = function() {
    if (typeof window.loadUserArticles === 'function') {
        window.loadUserArticles();
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Accueil.js initialisé');
    
    // Initialiser les gestionnaires d'onglets
    const explorerBtn = document.getElementById('explorerBtn');
    const publierBtn = document.getElementById('publierBtn');
    const boutiqueBtn = document.getElementById('boutiqueBtn');
    const chatBtn = document.getElementById('chatBtn');
    const profilBtn = document.getElementById('profilBtn');
    
    const explorerContent = document.getElementById('explorerContent');
    const publierContent = document.getElementById('publierContent');
    const boutiqueContent = document.getElementById('boutiqueContent');
    const profilContent = document.getElementById('profilContent');
    const chatContent = document.getElementById('chatContent');
    
    const menuButtons = [explorerBtn, publierBtn, boutiqueBtn, chatBtn, profilBtn];
    const contentSections = [explorerContent, publierContent, boutiqueContent, profilContent, chatContent];
    
    function switchTab(activeButton, activeContent) {
        menuButtons.forEach(button => {
            if (button) button.classList.remove('active');
        });
        
        contentSections.forEach(section => {
            if (section) section.style.display = 'none';
        });
        
        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.style.display = 'block';
    }
    
    if (explorerBtn && explorerContent) {
        explorerBtn.addEventListener('click', function() {
            switchTab(explorerBtn, explorerContent);
            loadArticlesFromStorage();
        });
    }
    
    if (publierBtn && publierContent) {
        publierBtn.addEventListener('click', function() {
            switchTab(publierBtn, publierContent);
        });
    }
    
    if (boutiqueBtn && boutiqueContent) {
        boutiqueBtn.addEventListener('click', function() {
            switchTab(boutiqueBtn, boutiqueContent);
            if (typeof window.loadUserArticles === 'function') {
                window.loadUserArticles();
            }
        });
    }
    
    if (chatBtn && chatContent) {
        chatBtn.addEventListener('click', function() {
            switchTab(chatBtn, chatContent);
        });
    }
    
    if (profilBtn && profilContent) {
        profilBtn.addEventListener('click', function() {
            switchTab(profilBtn, profilContent);
        });
    }
    
    // Charger les articles au démarrage
    setTimeout(() => {
        loadArticlesFromStorage();
    }, 100);
});

// Système de likes
function getLikes(articleId) {
    const likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
    return likes[articleId] ? likes[articleId].count : 0;
}

function isArticleLiked(articleId) {
    const sessionId = getSessionId();
    const likes = JSON.parse(localStorage.getItem('articleLikes')) || {};
    
    if (!likes[articleId]) return false;
    
    return likes[articleId].users.includes(sessionId);
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
    
    const isLiked = likes[articleId].users.includes(sessionId);
    
    if (isLiked) {
        // Retirer le like
        likes[articleId].count = Math.max(0, likes[articleId].count - 1);
        likes[articleId].users = likes[articleId].users.filter(id => id !== sessionId);
        
        button.classList.remove('liked');
        button.querySelector('i').className = 'far fa-heart';
    } else {
        // Ajouter le like
        likes[articleId].count += 1;
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

// Exposer les fonctions globalement
window.loadArticlesFromStorage = loadArticlesFromStorage;
window.showArticleDetails = showArticleDetails;
window.refreshBoutique = refreshBoutique;