// admin.js - Gestion de l'interface d'administration

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin.js chargé');
    
    // Initialisation
    initAdmin();
    initTabSwitching();
    initValidationEvents();
    initAdminActions();
    initExplorerEvents();
    
    // Charger les données
    loadAdminData();
});

// Initialiser l'interface admin
function initAdmin() {
    // Définir l'utilisateur comme admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.isAdmin = true;
    currentUser.role = 'Administrateur';
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Afficher le nom admin
    const adminNameDisplay = document.getElementById('adminNameDisplay');
    if (adminNameDisplay && currentUser.firstname && currentUser.lastname) {
        adminNameDisplay.textContent = `${currentUser.firstname} ${currentUser.lastname}`;
    }
    
    // Afficher le rôle
    const adminRoleDisplay = document.getElementById('adminRoleDisplay');
    if (adminRoleDisplay) {
        adminRoleDisplay.textContent = currentUser.role || 'Super Administrateur';
    }
    
    // Initialiser le bouton de déconnexion
    initAdminLogoutButton();
}

// Initialiser les onglets admin
// admin.js - CORRIGÉ
// Modifier la fonction initTabSwitching() pour inclure l'onglet paramètres

function initTabSwitching() {
    const explorerBtn = document.getElementById('explorerBtn');
    const validerBtn = document.getElementById('validerBtn');
    const chatBtn = document.getElementById('chatBtn');
    const profilBtn = document.getElementById('profilBtn');
    const parametresBtn = document.getElementById('parametresBtn'); // AJOUT
    
    const explorerContent = document.getElementById('explorerContent');
    const validerContent = document.getElementById('validerContent');
    const profilContent = document.getElementById('profilContent');
    const chatContent = document.getElementById('chatContent');
    const parametresContent = document.getElementById('parametresContent'); // AJOUT
    
    const menuButtons = [explorerBtn, validerBtn, chatBtn, profilBtn, parametresBtn]; // AJOUT
    const contentSections = [explorerContent, validerContent, chatContent, profilContent, parametresContent]; // AJOUT
    
    function switchTab(activeButton, activeContent) {
        // Désactiver tous les boutons
        menuButtons.forEach(button => {
            if (button) button.classList.remove('active');
        });
        
        // Cacher tous les contenus
        contentSections.forEach(section => {
            if (section) section.style.display = 'none';
        });
        
        // Activer le bouton et le contenu sélectionné
        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.style.display = 'block';
        
        // Charger les données spécifiques à l'onglet
        if (activeButton === validerBtn) {
            loadValidationArticles();
        } else if (activeButton === explorerBtn) {
            loadAllArticlesForAdmin();
        } else if (activeButton === parametresBtn) {
            loadSettingsData();
        }
    }
    
    // Ajouter les événements pour TOUS les boutons
    if (explorerBtn && explorerContent) {
        explorerBtn.addEventListener('click', function() {
            switchTab(explorerBtn, explorerContent);
        });
    }
    
    if (validerBtn && validerContent) {
        validerBtn.addEventListener('click', function() {
            switchTab(validerBtn, validerContent);
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
            updateAdminStats();
        });
    }
    
    if (parametresBtn && parametresContent) {
        parametresBtn.addEventListener('click', function() {
            switchTab(parametresBtn, parametresContent);
            loadSettingsData();
        });
    }
    
    // Activer l'onglet Explorer par défaut
    switchTab(explorerBtn, explorerContent);
}

// Initialiser les événements dans l'onglet Explorer
function initExplorerEvents() {
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
                const userName = article.querySelector('.user-name')?.textContent?.toLowerCase() || '';
                
                if (searchTerm === '' || 
                    title.includes(searchTerm) || 
                    price.includes(searchTerm) || 
                    location.includes(searchTerm) ||
                    userName.includes(searchTerm)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    }
    
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
}

// Initialiser les événements de validation
function initValidationEvents() {
    // Filtres
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Filtrer les articles
            const filter = this.dataset.filter;
            filterValidationArticles(filter);
        });
    });
}

// Initialiser les actions admin
function initAdminActions() {
    // Gérer les utilisateurs
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    if (manageUsersBtn) {
        manageUsersBtn.addEventListener('click', function() {
            alert('Gestion des utilisateurs - À implémenter');
        });
    }
    
    // Voir les signalements
    const viewReportsBtn = document.getElementById('viewReportsBtn');
    if (viewReportsBtn) {
        viewReportsBtn.addEventListener('click', function() {
            alert('Signalements - À implémenter');
        });
    }
    
    // Statistiques système
    const systemStatsBtn = document.getElementById('systemStatsBtn');
    if (systemStatsBtn) {
        systemStatsBtn.addEventListener('click', function() {
            alert('Statistiques système - À implémenter');
        });
    }
    
    // Sauvegarde
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', function() {
            backupDatabase();
        });
    }
    
    // Paramètres
    const autoApproveCheck = document.getElementById('autoApproveCheck');
    const emailNotificationsCheck = document.getElementById('emailNotificationsCheck');
    const moderationLogCheck = document.getElementById('moderationLogCheck');
    const deleteLogCheck = document.getElementById('deleteLogCheck');
    
    // Charger les paramètres sauvegardés
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    
    if (autoApproveCheck) autoApproveCheck.checked = settings.autoApprove || false;
    if (emailNotificationsCheck) emailNotificationsCheck.checked = settings.emailNotifications || true;
    if (moderationLogCheck) moderationLogCheck.checked = settings.moderationLog || true;
    if (deleteLogCheck) deleteLogCheck.checked = settings.deleteLog || true;
    
    // Sauvegarder les paramètres quand ils changent
    [autoApproveCheck, emailNotificationsCheck, moderationLogCheck, deleteLogCheck].forEach(input => {
        if (input) {
            input.addEventListener('change', function() {
                saveAdminSettings();
            });
        }
    });
}

// Sauvegarder les paramètres admin
function saveAdminSettings() {
    const settings = {
        autoApprove: document.getElementById('autoApproveCheck').checked,
        emailNotifications: document.getElementById('emailNotificationsCheck').checked,
        moderationLog: document.getElementById('moderationLogCheck').checked,
        deleteLog: document.getElementById('deleteLogCheck').checked
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('Paramètres sauvegardés', 'success');
}

// Charger les données admin
function loadAdminData() {
    updateAdminStats();
    loadAllArticlesForAdmin();
}

// Mettre à jour les statistiques admin
function updateAdminStats() {
    // Récupérer tous les articles
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    
    // Compter par statut
    const stats = {
        pending: articles.filter(a => a.status === 'pending').length,
        validated: articles.filter(a => a.status === 'active' || a.status === 'validated').length,
        rejected: articles.filter(a => a.status === 'rejected').length,
        deleted: articles.filter(a => a.status === 'deleted' || a.status === 'admin_deleted').length,
        total: articles.length
    };
    
    // Calculer le nombre d'utilisateurs uniques
    const userIds = [...new Set(articles.map(a => a.userId))];
    stats.users = userIds.length;
    
    // Mettre à jour les statistiques dans l'onglet Explorer
    document.querySelector('.admin-stat-pending .stat-number').textContent = stats.pending;
    document.querySelector('.admin-stat-validated .stat-number').textContent = stats.validated;
    document.querySelector('.admin-stat-rejected .stat-number').textContent = stats.rejected;
    document.querySelector('.admin-stat-users .stat-number').textContent = stats.users;
    
    // Mettre à jour les compteurs de filtre
    document.querySelector('.filter-btn[data-filter="pending"] .filter-count').textContent = stats.pending;
    document.querySelector('.filter-btn[data-filter="validated"] .filter-count').textContent = stats.validated;
    document.querySelector('.filter-btn[data-filter="rejected"] .filter-count').textContent = stats.rejected;
    document.querySelector('.filter-btn[data-filter="all"] .filter-count').textContent = stats.total;
    
    // Mettre à jour les statistiques du profil
    document.querySelector('.profil-stat-users').textContent = stats.users;
    document.querySelector('.profil-stat-annonces').textContent = stats.total;
    document.querySelector('.profil-stat-supprimees').textContent = stats.deleted;
    
    // Statistiques modérées aujourd'hui
    const today = new Date().toDateString();
    const moderatedToday = articles.filter(a => {
        if (a.moderationDate) {
            const modDate = new Date(a.moderationDate).toDateString();
            return modDate === today;
        }
        return false;
    }).length;
    
    document.querySelector('.profil-stat-moderees').textContent = moderatedToday;
}

// Charger tous les articles pour l'admin (onglet Explorer)
function loadAllArticlesForAdmin() {
    const articlesContainer = document.querySelector('.artice');
    if (!articlesContainer) return;
    
    // Récupérer tous les articles
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    
    // Trier par date (plus récents d'abord)
    const sortedArticles = [...articles].sort((a, b) => {
        const dateA = new Date(a.publishedAt || Date.now());
        const dateB = new Date(b.publishedAt || Date.now());
        return dateB - dateA;
    });
    
    // Vider le conteneur
    articlesContainer.innerHTML = '';
    
    if (sortedArticles.length === 0) {
        articlesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <i class="fa-solid fa-box-open" style="font-size: 64px; margin-bottom: 20px; color: #bdc3c7;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px; color: #2c3e50;">Aucune annonce disponible</h3>
                <p style="font-size: 16px; margin-bottom: 20px;">Les utilisateurs n'ont pas encore publié d'annonces</p>
            </div>
        `;
        return;
    }
    
    // Ajouter chaque article avec badge de statut admin
    sortedArticles.forEach(article => {
        const articleCard = createAdminArticleCard(article);
        articlesContainer.appendChild(articleCard);
    });
    
    // Mettre à jour les statistiques
    updateAdminStats();
}

// Créer une carte d'article pour l'admin
function createAdminArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.dataset.category = article.category || 'tous';
    card.dataset.id = article.id;
    card.dataset.status = article.status || 'pending';
    
    // Déterminer l'icône et la couleur
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
    
    // Déterminer le badge de statut
    let statusBadge = '';
    let statusColor = '#f39c12';
    let statusClass = '';
    
    switch(article.status) {
        case 'pending':
            statusBadge = 'En attente';
            statusColor = '#f39c12';
            statusClass = 'pending';
            break;
        case 'active':
        case 'validated':
            statusBadge = 'Validé';
            statusColor = '#2ecc71';
            statusClass = 'validated';
            break;
        case 'rejected':
            statusBadge = 'Rejeté';
            statusColor = '#e74c3c';
            statusClass = 'rejected';
            break;
        case 'sold':
            statusBadge = 'Vendu';
            statusColor = '#3498db';
            statusClass = 'sold';
            break;
        case 'deleted':
        case 'admin_deleted':
            statusBadge = 'Supprimé';
            statusColor = '#7f8c8d';
            statusClass = 'deleted';
            break;
        default:
            statusBadge = 'Inconnu';
            statusColor = '#95a5a6';
            statusClass = 'unknown';
    }
    
    // Créer le HTML avec bouton de suppression
    card.innerHTML = `
        ${article.sponsored ? '<div class="sponsored-badge">SPONSORISÉ</div>' : ''}
        <button class="delete-btn-article" data-id="${article.id}" title="Supprimer cette annonce">
            <i class="fa-solid fa-trash"></i> Supprimer
        </button>
        <div class="article-image" style="background-color: ${iconColor}20; position: relative;">
            ${article.images && article.images.length > 0 ? 
                `<img src="${article.images[0]}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                `<i class="${icon}" style="color: ${iconColor}; font-size: 48px;"></i>`}
            <div style="position: absolute; top: 10px; right: 10px; background-color: ${statusColor}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">
                ${statusBadge}
            </div>
        </div>
        <div class="article-info">
            <div class="article-title">${article.title || 'Sans titre'}</div>
            <div class="article-price">${formattedPrice}</div>
            <div class="article-location">
                <i class="fa-solid fa-location-dot"></i> ${article.location || 'Non spécifié'}
                <br>
                <i class="fa-solid fa-user"></i> 
                <span class="user-name">${article.userName || 'Utilisateur inconnu'}</span>
            </div>
            <div class="article-meta">
                <span><i class="far fa-eye"></i> ${article.views || 0} vues</span>
                <span>${timeAgo}</span>
            </div>
        </div>
    `;
    
    // Ajouter la classe de statut
    if (statusClass) {
        card.classList.add(statusClass);
    }
    
    // Ajouter un événement click pour afficher les détails admin
    card.addEventListener('click', function(e) {
        if (e.target.closest('.sponsored-badge') || e.target.closest('.delete-btn-article')) {
            return;
        }
        
        showAdminArticleDetails(article.id);
    });
    
    // Ajouter l'événement pour le bouton de suppression
    const deleteBtn = card.querySelector('.delete-btn-article');
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteArticleAsAdmin(article.id);
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

// Afficher les détails d'un article pour l'admin
function showAdminArticleDetails(articleId) {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const article = articles.find(a => a.id == articleId);
    
    if (!article) {
        alert('Article non trouvé');
        return;
    }
    
    // Créer une modale de détails admin
    createAdminArticleModal(article);
}

// Créer une modale de détails admin
function createAdminArticleModal(article) {
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
    
    // Statut
    let statusText = 'En attente';
    let statusColor = '#f39c12';
    
    switch(article.status) {
        case 'pending':
            statusText = 'En attente de validation';
            statusColor = '#f39c12';
            break;
        case 'active':
        case 'validated':
            statusText = 'Validé';
            statusColor = '#2ecc71';
            break;
        case 'rejected':
            statusText = 'Rejeté';
            statusColor = '#e74c3c';
            break;
        case 'sold':
            statusText = 'Vendu';
            statusColor = '#3498db';
            break;
        case 'deleted':
        case 'admin_deleted':
            statusText = 'Supprimé';
            statusColor = '#7f8c8d';
            break;
    }
    
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Détails de l'annonce (Admin)</h2>
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
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>${article.title || 'Sans titre'}</h3>
                        <span style="background-color: ${statusColor}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                            ${statusText}
                        </span>
                    </div>
                    
                    <div class="modal-price">${formattedPrice}</div>
                    
                    ${article.userName ? `
                        <div class="modal-seller" style="margin-bottom: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                            <h4 style="margin-top: 0; margin-bottom: 10px; color: #2c3e50;"><i class="fa-solid fa-user"></i> Informations vendeur</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div><strong>Nom:</strong> ${article.userName}</div>
                                <div><strong>ID:</strong> ${article.userId || 'N/A'}</div>
                                ${article.contact ? `<div><strong>Contact:</strong> ${article.contact}</div>` : ''}
                                ${article.email ? `<div><strong>Email:</strong> ${article.email}</div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                    
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
                        ${article.moderationDate ? `
                            <div class="info-item">
                                <span class="info-label"><i class="fa-solid fa-gavel"></i> Modéré le</span>
                                <span class="info-value">${new Date(article.moderationDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                        ` : ''}
                        ${article.deletedDate ? `
                            <div class="info-item">
                                <span class="info-label"><i class="fa-solid fa-trash"></i> Supprimé le</span>
                                <span class="info-value">${new Date(article.deletedDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                        ` : ''}
                        ${article.deletionReason ? `
                            <div class="info-item" style="grid-column: 1 / -1;">
                                <span class="info-label"><i class="fa-solid fa-comment-exclamation"></i> Raison de suppression</span>
                                <span class="info-value">${article.deletionReason}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="admin-modal-actions">
                        ${article.status === 'pending' ? `
                            <button class="admin-validate-btn" style="flex: 1; padding: 12px; background-color: #2ecc71; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                <i class="fa-solid fa-check-circle"></i> Valider
                            </button>
                            <button class="admin-reject-btn" style="flex: 1; padding: 12px; background-color: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                <i class="fa-solid fa-times-circle"></i> Rejeter
                            </button>
                        ` : ''}
                        ${article.status !== 'deleted' && article.status !== 'admin_deleted' ? `
                            <button class="admin-delete-btn" data-id="${article.id}" style="flex: 1; padding: 12px; background-color: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer;">
                                <i class="fa-solid fa-trash"></i> Supprimer
                            </button>
                        ` : ''}
                        ${article.status === 'active' || article.status === 'validated' ? `
    <button class="admin-promo-btn" data-id="${article.id}" style="flex: 1; padding: 12px; background-color: ${article.isPromo ? '#e67e22' : '#f39c12'}; color: white; border: none; border-radius: 8px; cursor: pointer;">
        <i class="fa-solid fa-fire"></i> ${article.isPromo ? 'Retirer promotion' : 'Mettre en promotion'}
    </button>
` : ''}
                        <button class="admin-close-btn" style="flex: 1; padding: 12px; background-color: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 8px; cursor: pointer;">
                            <i class="fa-solid fa-times"></i> Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gestionnaires d'événements
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());
    modal.querySelector('.admin-close-btn').addEventListener('click', () => modal.remove());
    
    // Boutons de validation/rejet
    const validateBtn = modal.querySelector('.admin-validate-btn');
    const rejectBtn = modal.querySelector('.admin-reject-btn');
    const deleteBtn = modal.querySelector('.admin-delete-btn');
    const promoBtn = modal.querySelector('.admin-promo-btn');

    if (validateBtn) {
        validateBtn.addEventListener('click', () => {
            validateArticle(article.id);
            modal.remove();
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            rejectArticle(article.id);
            modal.remove();
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            deleteArticleAsAdmin(article.id);
            modal.remove();
        });
    }
    
if (promoBtn) {
    promoBtn.addEventListener('click', () => {
        togglePromotion(article.id);
        modal.remove();
    });
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

// Obtenir le texte de l'option de livraison
function getDeliveryOptionText(option) {
    switch(option) {
        case 'Meeting': return 'Rencontre en personne';
        case 'Delivery': return 'Livraison possible';
        case 'Shipping': return 'Envoi possible';
        default: return 'Non spécifié';
    }
}

// Charger les articles à valider
function loadValidationArticles() {
    const validationList = document.querySelector('.validation-list');
    if (!validationList) return;
    
    // Récupérer tous les articles
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    
    // Filtrer les articles en attente
    const pendingArticles = articles.filter(a => a.status === 'pending');
    
    // Vider le conteneur
    const emptyValidation = validationList.querySelector('.empty-validation');
    const articlesContainer = validationList.querySelector('.validation-articles-container');
    
    if (articlesContainer) {
        articlesContainer.remove();
    }
    
    if (pendingArticles.length === 0) {
        if (emptyValidation) {
            emptyValidation.style.display = 'block';
        }
        return;
    }
    
    // Cacher l'état vide
    if (emptyValidation) {
        emptyValidation.style.display = 'none';
    }
    
    // Créer un conteneur pour les articles
    const newContainer = document.createElement('div');
    newContainer.className = 'validation-articles-container';
    
    // Trier par date (plus anciens d'abord)
    pendingArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || Date.now());
        const dateB = new Date(b.publishedAt || Date.now());
        return dateA - dateB;
    });
    
    // Ajouter chaque article
    pendingArticles.forEach(article => {
        const validationCard = createValidationCard(article);
        newContainer.appendChild(validationCard);
    });
    
    validationList.appendChild(newContainer);
}

// Créer une carte de validation
function createValidationCard(article) {
    const card = document.createElement('div');
    card.className = 'validation-article-card pending';
    card.dataset.id = article.id;
    
    // Calculer le temps écoulé
    const timeAgo = getTimeAgo(new Date(article.publishedAt || Date.now()));
    
    card.innerHTML = `
     ${article.isPromo ? '<div class="promo-badge">🔥 PROMOTION</div>' : ''}
        <div class="validation-article-header">
            <div class="validation-article-user">
                <div class="user-avatar">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="user-info">
                    <h4>${article.userName || 'Utilisateur inconnu'}</h4>
                    <p>ID: ${article.userId || 'N/A'}</p>
                </div>
            </div>
            <div class="validation-article-time">${timeAgo}</div>
        </div>
        
        <div class="validation-article-content">
            <h3 class="validation-article-title">${article.title || 'Sans titre'}</h3>
            
            <div class="validation-article-description">
                ${article.description ? article.description.substring(0, 200) + (article.description.length > 200 ? '...' : '') : 'Aucune description'}
            </div>
            
            <div class="validation-article-meta">
                <span><i class="fa-solid fa-tag"></i> ${formatPrice(article.price)}</span>
                <span><i class="fa-solid fa-map-marker-alt"></i> ${article.location || 'Non spécifié'}</span>
                <span><i class="fa-solid fa-layer-group"></i> ${getCategoryName(article.category)}</span>
            </div>
            
            <div class="validation-article-actions">
                <button class="validation-btn validate-btn" data-id="${article.id}">
                    <i class="fa-solid fa-check-circle"></i> Valider
                </button>
                <button class="validation-btn reject-btn" data-id="${article.id}">
                    <i class="fa-solid fa-times-circle"></i> Rejeter
                </button>
                <button class="validation-btn view-btn" data-id="${article.id}">
                    <i class="fa-solid fa-eye"></i> Voir détails
                </button>
            </div>
        </div>
    `;
    
    // Ajouter les événements
    const validateBtn = card.querySelector('.validate-btn');
    const rejectBtn = card.querySelector('.reject-btn');
    const viewBtn = card.querySelector('.view-btn');
    
    validateBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        validateArticle(this.dataset.id);
    });
    
    rejectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        rejectArticle(this.dataset.id);
    });
    
    viewBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        showAdminArticleDetails(this.dataset.id);
    });
    
    return card;
}

// Obtenir le nom de la catégorie
function getCategoryName(category) {
    switch(category) {
        case 'elec': return 'Électronique';
        case 'mode': return 'Mode';
        case 'agro': return 'Agroalimentaire';
        case 'immo': return 'Immobilier';
        default: return 'Autre';
    }
}

// Filtrer les articles de validation
function filterValidationArticles(filter) {
    const articlesContainer = document.querySelector('.validation-articles-container');
    if (!articlesContainer) return;
    
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    
    let filteredArticles = [];
    
    switch(filter) {
        case 'pending':
            filteredArticles = articles.filter(a => a.status === 'pending');
            break;
        case 'validated':
            filteredArticles = articles.filter(a => a.status === 'active' || a.status === 'validated');
            break;
        case 'rejected':
            filteredArticles = articles.filter(a => a.status === 'rejected');
            break;
        case 'all':
            filteredArticles = articles;
            break;
    }
    
    // Trier par date
    filteredArticles.sort((a, b) => {
        const dateA = new Date(a.publishedAt || Date.now());
        const dateB = new Date(b.publishedAt || Date.now());
        return dateB - dateA;
    });
    
    // Mettre à jour l'affichage
    articlesContainer.innerHTML = '';
    
    if (filteredArticles.length === 0) {
        articlesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #7f8c8d;">
                <i class="fa-solid fa-clipboard-list" style="font-size: 48px; margin-bottom: 15px; color: #bdc3c7;"></i>
                <p style="font-size: 16px;">Aucune annonce trouvée</p>
            </div>
        `;
        return;
    }
    
    filteredArticles.forEach(article => {
        const card = createValidationCard(article);
        
        // Mettre à jour la classe selon le statut
        card.className = `validation-article-card ${filter}`;
        
        articlesContainer.appendChild(card);
    });
}

// Valider un article
function validateArticle(articleId) {
    if (confirm('Voulez-vous vraiment valider cette annonce ?')) {
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const articleIndex = articles.findIndex(a => a.id == articleId);
        
        if (articleIndex !== -1) {
            articles[articleIndex].status = 'active';
            articles[articleIndex].validated = true;
            articles[articleIndex].moderationDate = new Date().toISOString();
            articles[articleIndex].moderatedBy = 'admin';
            
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            
            showNotification('✅ Annonce validée avec succès !', 'success');
            
            // Recharger les données
            loadValidationArticles();
            loadAllArticlesForAdmin();
            updateAdminStats();
        }
    }
}

// Rejeter un article
function rejectArticle(articleId) {
    const reason = prompt('Veuillez indiquer la raison du rejet :', 'Contenu non conforme');
    
    if (reason !== null) {
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const articleIndex = articles.findIndex(a => a.id == articleId);
        
        if (articleIndex !== -1) {
            articles[articleIndex].status = 'rejected';
            articles[articleIndex].rejected = true;
            articles[articleIndex].rejectionReason = reason;
            articles[articleIndex].moderationDate = new Date().toISOString();
            articles[articleIndex].moderatedBy = 'admin';
            
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            
            showNotification('❌ Annonce rejetée avec succès !', 'info');
            
            // Recharger les données
            loadValidationArticles();
            loadAllArticlesForAdmin();
            updateAdminStats();
        }
    }
}

// Supprimer un article en tant qu'admin
function deleteArticleAsAdmin(articleId) {
    const reason = prompt('Veuillez indiquer la raison de la suppression :', 'Contenu inapproprié');
    
    if (reason !== null) {
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const articleIndex = articles.findIndex(a => a.id == articleId);
        
        if (articleIndex !== -1) {
            // Demander confirmation
            const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer cette annonce ?\n\nTitre: ${articles[articleIndex].title || 'Sans titre'}\nUtilisateur: ${articles[articleIndex].userName || 'Inconnu'}\n\nCette action est irréversible.`);
            
            if (!confirmDelete) return;
            
            // Sauvegarder les informations de suppression
            articles[articleIndex].previousStatus = articles[articleIndex].status;
            articles[articleIndex].status = 'admin_deleted';
            articles[articleIndex].deletedBy = 'admin';
            articles[articleIndex].deletedDate = new Date().toISOString();
            articles[articleIndex].deletionReason = reason;
            
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            
            showNotification('🗑️ Annonce supprimée avec succès !', 'info');
            
            // Recharger les données
            loadValidationArticles();
            loadAllArticlesForAdmin();
            updateAdminStats();
        } else {
            showNotification('❌ Article non trouvé !', 'error');
        }
    }
}

// Sauvegarde de la base de données
function backupDatabase() {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const backupData = {
        timestamp: new Date().toISOString(),
        articles: articles,
        users: users,
        totalArticles: articles.length,
        totalUsers: users.length
    };
    
    // Créer un fichier de sauvegarde
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_secondmain_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('✅ Sauvegarde créée avec succès !', 'success');
}

// Initialiser le bouton de déconnexion admin
function initAdminLogoutButton() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    
    function logoutAdmin() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            // Retirer le statut admin
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            delete currentUser.isAdmin;
            delete currentUser.role;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Rediriger vers la page de connexion
            showNotification('Déconnexion réussie', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    }
    
    if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);
    if (menuLogoutBtn) menuLogoutBtn.addEventListener('click', logoutAdmin);
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
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Fonction pour restaurer un article supprimé (optionnel)
function restoreArticle(articleId) {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const articleIndex = articles.findIndex(a => a.id == articleId);
    
    if (articleIndex !== -1 && articles[articleIndex].status === 'admin_deleted') {
        articles[articleIndex].status = articles[articleIndex].previousStatus || 'pending';
        delete articles[articleIndex].deletedBy;
        delete articles[articleIndex].deletedDate;
        delete articles[articleIndex].deletionReason;
        
        localStorage.setItem('secondHandArticles', JSON.stringify(articles));
        
        showNotification('✅ Annonce restaurée avec succès !', 'success');
        
        // Recharger les données
        loadValidationArticles();
        loadAllArticlesForAdmin();
        updateAdminStats();
    }
}

// Fonction pour envoyer un message de validation dans le chat
function sendValidationMessage(userId, articleTitle, isApproved, reason = '') {
    // Récupérer les conversations
    let conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
    
    // Trouver ou créer une conversation avec l'administrateur
    let conversation = conversations.find(c => c.userId === userId && c.isAdmin === true);
    
    if (!conversation) {
        // Créer une nouvelle conversation admin
        conversation = {
            id: 'admin_conv_' + Date.now(),
            userId: userId,
            userName: 'Administrateur Second Main',
            avatarColor: '#3498db',
            avatarIcon: 'fa-solid fa-user-shield',
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 1,
            isAdmin: true
        };
        conversations.push(conversation);
    }
    
    // Créer le message
    const message = {
        id: 'msg_' + Date.now(),
        sender: 'admin',
        text: isApproved 
            ? `✅ Votre annonce "${articleTitle}" a été validée et publiée avec succès !`
            : `❌ Votre annonce "${articleTitle}" a été rejetée.${reason ? ' Raison : ' + reason : ''}`,
        timestamp: new Date().toISOString(),
        isValidationMessage: true
    };
    
    // Sauvegarder le message
    saveMessages(conversation.id, [message]);
    
    // Mettre à jour la conversation
    conversation.lastMessage = message.text;
    conversation.lastMessageTime = message.timestamp;
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    
    // Sauvegarder les conversations
    saveConversations(conversations);
}

// Modifier les fonctions validateArticle et rejectArticle :
function validateArticle(articleId) {
    if (confirm('Voulez-vous vraiment valider cette annonce ?')) {
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const articleIndex = articles.findIndex(a => a.id == articleId);
        
        if (articleIndex !== -1) {
            articles[articleIndex].status = 'active';
            articles[articleIndex].validated = true;
            articles[articleIndex].moderationDate = new Date().toISOString();
            articles[articleIndex].moderatedBy = 'admin';
            articles[articleIndex].validationStatus = 'approved';
            
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            
            // Envoyer un message dans le chat de l'utilisateur
            sendValidationMessage(
                articles[articleIndex].userId,
                articles[articleIndex].title,
                true
            );
            
            showNotification('✅ Annonce validée avec succès ! Message envoyé à l\'utilisateur.', 'success');
            
            // Recharger les données
            loadValidationArticles();
            loadAllArticlesForAdmin();
            updateAdminStats();
        }
    }
}

function rejectArticle(articleId) {
    const reason = prompt('Veuillez indiquer la raison du rejet :', 'Contenu non conforme');
    
    if (reason !== null && reason.trim() !== '') {
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const articleIndex = articles.findIndex(a => a.id == articleId);
        
        if (articleIndex !== -1) {
            articles[articleIndex].status = 'rejected';
            articles[articleIndex].rejected = true;
            articles[articleIndex].rejectionReason = reason;
            articles[articleIndex].moderationDate = new Date().toISOString();
            articles[articleIndex].moderatedBy = 'admin';
            articles[articleIndex].validationStatus = 'rejected';
            
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            
            // Envoyer un message dans le chat de l'utilisateur
            sendValidationMessage(
                articles[articleIndex].userId,
                articles[articleIndex].title,
                false,
                reason
            );
            
            showNotification('❌ Annonce rejetée avec succès ! Message envoyé à l\'utilisateur.', 'info');
            
            // Recharger les données
            loadValidationArticles();
            loadAllArticlesForAdmin();
            updateAdminStats();
        }
    }
}

// Gestion de la navigation pour l'onglet Paramètres

// Initialisation des paramètres
document.addEventListener('DOMContentLoaded', function() {
    // Charger les paramètres sauvegardés
    loadSettings();
    
    // Sauvegarder les paramètres
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    
    // Réinitialiser les paramètres
    document.getElementById('resetSettingsBtn')?.addEventListener('click', resetSettings);
    
    // Gestion des boutons de maintenance
    document.getElementById('clearAllArticlesBtn')?.addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir supprimer TOUTES les annonces ? Cette action est irréversible.')) {
            clearAllArticles();
        }
    });
});

function loadSettings() {
    // Charger depuis localStorage ou API
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
    
    // Appliquer les paramètres
    document.getElementById('autoApproveCheck').checked = settings.autoApprove || false;
    document.getElementById('emailNotificationsCheck').checked = settings.emailNotifications || true;
    // ... etc.
}

function saveSettings() {
    const settings = {
        autoApprove: document.getElementById('autoApproveCheck').checked,
        emailNotifications: document.getElementById('emailNotificationsCheck').checked,
        // ... etc.
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    // Afficher un message de succès
    alert('Paramètres sauvegardés avec succès !');
}

function resetSettings() {
    if (confirm('Rétablir tous les paramètres par défaut ?')) {
        localStorage.removeItem('adminSettings');
        loadSettings();
        alert('Paramètres réinitialisés !');
    }
}

function clearAllArticles() {
    // API call pour supprimer les annonces
    console.log('Suppression de toutes les annonces...');
    // Actualiser les statistiques après suppression
}

// Fonction pour mettre une annonce en promotion
function togglePromotion(articleId) {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const articleIndex = articles.findIndex(a => a.id == articleId);
    
    if (articleIndex !== -1) {
        articles[articleIndex].isPromo = !articles[articleIndex].isPromo;
        articles[articleIndex].promoDate = articles[articleIndex].isPromo ? new Date().toISOString() : null;
        
        localStorage.setItem('secondHandArticles', JSON.stringify(articles));
        
        const message = articles[articleIndex].isPromo 
            ? '🔥 Annonce mise en promotion !' 
            : 'Promotion retirée';
        
        showNotification(message, 'success');
        loadAllArticlesForAdmin();
    }
}

// Exposer globalement
window.togglePromotion = togglePromotion;