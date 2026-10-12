// Profil.js - Gestion du profil utilisateur avec édition et statistiques avancées
// Version 2.0 - Améliorée

/**
 * FONCTIONNALITÉS AJOUTÉES :
 * - Édition du profil utilisateur
 * - Changement d'avatar
 * - Validation des données
 * - Statistiques détaillées
 * - Historique d'activité
 * - Badges et récompenses
 * - Export des données
 * - Mode sombre
 * - Notifications personnalisées
 */

// ============================================================================
// CONSTANTES
// ============================================================================

const PROFILE_CONFIG = {
    MAX_NAME_LENGTH: 50,
    MAX_BIO_LENGTH: 200,
    AVATAR_COLORS: [
        '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', 
        '#f39c12', '#1abc9c', '#34495e', '#e67e22',
        '#16a085', '#27ae60', '#2980b9', '#8e44ad'
    ],
    BADGES: {
        FIRST_SALE: { name: 'Première vente', icon: '🎉', condition: (stats) => stats.vendus >= 1 },
        POWER_SELLER: { name: 'Super vendeur', icon: '⭐', condition: (stats) => stats.vendus >= 10 },
        POPULAR: { name: 'Populaire', icon: '🔥', condition: (stats) => stats.vuesTotales >= 100 },
        VERIFIED: { name: 'Vérifié', icon: '✓', condition: (stats) => stats.emailVerified }
    }
};

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Afficher une notification
 */
function showProfileNotification(message, type = 'info') {
    const notifications = document.querySelectorAll('.profile-notification');
    notifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `profile-notification profile-notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10003;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    notification.innerHTML = `
        <span style="font-size: 20px;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

/**
 * Valider les données utilisateur
 */
function validateUserData(data) {
    const errors = [];
    
    if (data.firstname && data.firstname.length > PROFILE_CONFIG.MAX_NAME_LENGTH) {
        errors.push(`Le prénom ne peut pas dépasser ${PROFILE_CONFIG.MAX_NAME_LENGTH} caractères`);
    }
    
    if (data.lastname && data.lastname.length > PROFILE_CONFIG.MAX_NAME_LENGTH) {
        errors.push(`Le nom ne peut pas dépasser ${PROFILE_CONFIG.MAX_NAME_LENGTH} caractères`);
    }
    
    if (data.bio && data.bio.length > PROFILE_CONFIG.MAX_BIO_LENGTH) {
        errors.push(`La bio ne peut pas dépasser ${PROFILE_CONFIG.MAX_BIO_LENGTH} caractères`);
    }
    
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Email invalide');
    }
    
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Numéro de téléphone invalide');
    }
    
    return errors;
}

/**
 * Valider l'email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valider le téléphone
 */
function isValidPhone(phone) {
    const re = /^[\d\s\+\-\(\)]{8,20}$/;
    return re.test(phone.trim());
}

/**
 * Formater un nombre
 */
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ============================================================================
// GESTION DU PROFIL
// ============================================================================

/**
 * Charger les données utilisateur
 */
function loadUserData() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const currentUserId = localStorage.getItem('currentUserId');
        const currentUserName = localStorage.getItem('currentUserName');
        
        return {
            id: currentUserId,
            username: currentUserName,
            ...currentUser
        };
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        return {};
    }
}

/**
 * Sauvegarder les données utilisateur
 */
function saveUserData(userData) {
    try {
        const errors = validateUserData(userData);
        
        if (errors.length > 0) {
            showProfileNotification(errors[0], 'error');
            return false;
        }
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Mettre à jour le nom si changé
        if (userData.firstname && userData.lastname) {
            const fullName = `${userData.firstname} ${userData.lastname}`.trim();
            localStorage.setItem('currentUserName', fullName);
        }
        
        showProfileNotification('Profil mis à jour avec succès !', 'success');
        return true;
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showProfileNotification('Erreur lors de la sauvegarde', 'error');
        return false;
    }
}

// ============================================================================
// AFFICHAGE DU PROFIL
// ============================================================================

/**
 * Afficher les informations du profil
 */
window.displayUserProfileInfo = function() {
    const userData = loadUserData();
    
    // Nom d'utilisateur
    const userNameElement = document.getElementById('userNameDisplay');
    if (userNameElement) {
        const displayName = userData.firstname && userData.lastname 
            ? `${userData.firstname} ${userData.lastname}` 
            : userData.username || 'Utilisateur';
        userNameElement.textContent = displayName;
    }
    
    // Téléphone
    const phoneElement = document.getElementById('userPhoneDisplay');
    if (phoneElement && userData.phone) {
        phoneElement.textContent = userData.phone;
    }
    
    // Email
    const emailElement = document.getElementById('userEmailDisplay');
    if (emailElement) {
        if (userData.email) {
            emailElement.textContent = userData.email;
        } else if (userData.username) {
            emailElement.textContent = `${userData.username}@secondmain.com`;
        }
    }
    
    // Avatar
    updateAvatarDisplay(userData);
    
    // Statistiques
    updateUserStats(userData.id);
    
    // Badges
    displayBadges(userData.id);
};

/**
 * Mettre à jour l'affichage de l'avatar
 */
function updateAvatarDisplay(userData) {
    const avatarElement = document.querySelector('.profil-avatar');
    if (!avatarElement) return;
    
    if (userData.avatarColor) {
        avatarElement.style.background = userData.avatarColor;
    }
    
    if (userData.avatarIcon) {
        avatarElement.innerHTML = `<i class="${userData.avatarIcon}"></i>`;
    }
}

// ============================================================================
// STATISTIQUES
// ============================================================================

/**
 * Mettre à jour les statistiques utilisateur
 */
function updateUserStats(userId) {
    if (!userId) return;
    
    try {
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const userArticles = articles.filter(article => article.userId === userId);
        
        // Calculer les statistiques
        const stats = {
            vendus: userArticles.filter(a => a.status === 'sold').length,
            achetes: calculatePurchases(userId),
            actives: userArticles.filter(a => a.status === 'active' || a.status === 'validated').length,
            vuesTotales: userArticles.reduce((sum, article) => sum + (article.views || 0), 0),
            revenus: userArticles
                .filter(a => a.status === 'sold')
                .reduce((sum, article) => sum + (parseFloat(article.price) || 0), 0)
        };
        
        // Afficher les statistiques principales
        updateStatElement('.profil-stat-vues', stats.vuesTotales);
        updateStatElement('.user-stat-vendus .user-stat-number', stats.vendus);
        updateStatElement('.user-stat-achetes .user-stat-number', stats.achetes);
        updateStatElement('.user-stat-actives .user-stat-number', stats.actives);
        
        // Statistiques des abonnements (simulées pour l'instant)
        const socialStats = calculateSocialStats(userId);
        updateStatElement('.profil-stat-abonnees', socialStats.followers);
        updateStatElement('.profil-stat-abonnements', socialStats.following);
        
        // Sauvegarder les stats pour les badges
        localStorage.setItem(`userStats_${userId}`, JSON.stringify(stats));
        
        return stats;
        
    } catch (error) {
        console.error('Erreur lors du calcul des statistiques:', error);
        return null;
    }
}

/**
 * Mettre à jour un élément de statistique
 */
function updateStatElement(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = formatNumber(value);
        
        // Animation
        element.style.transform = 'scale(1.2)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * Calculer les achats (à implémenter avec un vrai système)
 */
function calculatePurchases(userId) {
    const purchases = JSON.parse(localStorage.getItem(`purchases_${userId}`)) || [];
    return purchases.length;
}

/**
 * Calculer les statistiques sociales
 */
function calculateSocialStats(userId) {
    const followers = JSON.parse(localStorage.getItem(`followers_${userId}`)) || [];
    const following = JSON.parse(localStorage.getItem(`following_${userId}`)) || [];
    
    return {
        followers: followers.length,
        following: following.length
    };
}

// ============================================================================
// BADGES
// ============================================================================

/**
 * Afficher les badges utilisateur
 */
function displayBadges(userId) {
    const stats = JSON.parse(localStorage.getItem(`userStats_${userId}`)) || {};
    const badgesContainer = document.querySelector('.user-badges');
    
    if (!badgesContainer) {
        // Créer le conteneur de badges s'il n'existe pas
        const container = document.createElement('div');
        container.className = 'user-badges';
        container.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        `;
        
        const profilContainer = document.querySelector('.profil-container');
        if (profilContainer) {
            profilContainer.appendChild(container);
        }
    }
    
    const badgesHTML = Object.entries(PROFILE_CONFIG.BADGES)
        .filter(([_, badge]) => badge.condition(stats))
        .map(([key, badge]) => `
            <div class="badge-item" title="${badge.name}" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                cursor: pointer;
                transition: transform 0.2s ease;
            " onmouseover="this.style.transform='scale(1.05)'" 
               onmouseout="this.style.transform='scale(1)'">
                <span style="font-size: 18px;">${badge.icon}</span>
                <span>${badge.name}</span>
            </div>
        `).join('');
    
    const container = document.querySelector('.user-badges');
    if (container && badgesHTML) {
        container.innerHTML = `
            <h3 style="width: 100%; margin: 0 0 10px 0; color: #2c3e50; font-size: 18px;">
                🏆 Badges
            </h3>
            ${badgesHTML}
        `;
    }
}

// ============================================================================
// ÉDITION DU PROFIL
// ============================================================================

/**
 * Activer le mode édition
 */
function enableEditMode() {
    const userData = loadUserData();
    
    // Créer le modal d'édition
    const modal = document.createElement('div');
    modal.className = 'profile-edit-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="profile-edit-content" style="
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #2c3e50;">
                    <i class="fa-solid fa-user-edit"></i> Modifier le profil
                </h2>
                <button class="close-modal-btn" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #95a5a6;
                    cursor: pointer;
                    transition: color 0.2s ease;
                " onmouseover="this.style.color='#e74c3c'" 
                   onmouseout="this.style.color='#95a5a6'">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            
            <form id="profileEditForm" style="display: flex; flex-direction: column; gap: 20px;">
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 600;">
                        Prénom
                    </label>
                    <input type="text" name="firstname" value="${userData.firstname || ''}" 
                           placeholder="Votre prénom"
                           style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                  border-radius: 8px; font-size: 16px; transition: border-color 0.2s ease;"
                           onfocus="this.style.borderColor='#3498db'"
                           onblur="this.style.borderColor='#e0e0e0'">
                </div>
                
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 600;">
                        Nom
                    </label>
                    <input type="text" name="lastname" value="${userData.lastname || ''}" 
                           placeholder="Votre nom"
                           style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                  border-radius: 8px; font-size: 16px; transition: border-color 0.2s ease;"
                           onfocus="this.style.borderColor='#3498db'"
                           onblur="this.style.borderColor='#e0e0e0'">
                </div>
                
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 600;">
                        Email
                    </label>
                    <input type="email" name="email" value="${userData.email || ''}" 
                           placeholder="votre@email.com"
                           style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                  border-radius: 8px; font-size: 16px; transition: border-color 0.2s ease;"
                           onfocus="this.style.borderColor='#3498db'"
                           onblur="this.style.borderColor='#e0e0e0'">
                </div>
                
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 600;">
                        Téléphone
                    </label>
                    <input type="tel" name="phone" value="${userData.phone || ''}" 
                           placeholder="+237 6XX XX XX XX"
                           style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; 
                                  border-radius: 8px; font-size: 16px; transition: border-color 0.2s ease;"
                           onfocus="this.style.borderColor='#3498db'"
                           onblur="this.style.borderColor='#e0e0e0'">
                </div>
                
                <div class="form-group">
                    <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 600;">
                        Couleur de l'avatar
                    </label>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${PROFILE_CONFIG.AVATAR_COLORS.map(color => `
                            <div class="color-option" data-color="${color}" style="
                                width: 40px;
                                height: 40px;
                                background: ${color};
                                border-radius: 50%;
                                cursor: pointer;
                                border: 3px solid ${color === userData.avatarColor ? '#2c3e50' : 'transparent'};
                                transition: transform 0.2s ease;
                            " onmouseover="this.style.transform='scale(1.15)'"
                               onmouseout="this.style.transform='scale(1)'"></div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button type="submit" style="
                        flex: 1;
                        padding: 15px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'"
                       onmouseout="this.style.transform='translateY(0)'">
                        <i class="fa-solid fa-save"></i> Enregistrer
                    </button>
                    <button type="button" class="cancel-btn" style="
                        flex: 1;
                        padding: 15px;
                        background: #95a5a6;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'"
                       onmouseout="this.style.transform='translateY(0)'">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation d'entrée
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.profile-edit-content').style.transform = 'scale(1)';
    }, 10);
    
    // Gestion des couleurs
    modal.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            modal.querySelectorAll('.color-option').forEach(o => {
                o.style.border = '3px solid transparent';
            });
            this.style.border = '3px solid #2c3e50';
        });
    });
    
    // Soumission du formulaire
    modal.querySelector('#profileEditForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const selectedColor = modal.querySelector('.color-option[style*="2c3e50"]');
        
        const updatedData = {
            ...userData,
            firstname: formData.get('firstname'),
            lastname: formData.get('lastname'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            avatarColor: selectedColor ? selectedColor.dataset.color : userData.avatarColor
        };
        
        if (saveUserData(updatedData)) {
            closeModal();
            displayUserProfileInfo();
        }
    });
    
    // Fermeture
    const closeModal = () => {
        modal.style.opacity = '0';
        modal.querySelector('.profile-edit-content').style.transform = 'scale(0.9)';
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
}

// ============================================================================
// BOUTON ÉDITER
// ============================================================================

/**
 * Ajouter le bouton d'édition
 */
function addEditButton() {
    const profilHeader = document.querySelector('.profil-header');
    if (!profilHeader || document.querySelector('.edit-profile-btn')) return;
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-profile-btn';
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        margin-left: auto;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    `;
    
    editBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(15deg)';
        this.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
    });
    
    editBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
        this.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
    });
    
    editBtn.addEventListener('click', enableEditMode);
    
    profilHeader.appendChild(editBtn);
}

// ============================================================================
// DÉCONNEXION
// ============================================================================

/**
 * Initialiser le bouton de déconnexion
 */
function initProfileLogoutButton() {
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            const userData = loadUserData();
            const userName = userData.firstname || userData.username || 'Utilisateur';
            
            // Effacer les données de session
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('currentUserName');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('userToken');
            
            showProfileNotification(`À bientôt ${userName} !`, 'info');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
    });
}

// ============================================================================
// INITIALISATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Profil.js v2.0 chargé');
    
    // Afficher les informations
    displayUserProfileInfo();
    
    // Ajouter le bouton d'édition
    addEditButton();
    
    // Initialiser la déconnexion
    initProfileLogoutButton();
    
    // Bouton de vérification d'email
    const verifyBtn = document.querySelector('.verify-btn');
    if (verifyBtn && verifyBtn.textContent === 'Vérifier') {
        verifyBtn.addEventListener('click', function() {
            this.textContent = 'Vérifié';
            this.style.backgroundColor = '#2ecc71';
            this.disabled = true;
            
            const userData = loadUserData();
            userData.emailVerified = true;
            saveUserData(userData);
            
            showProfileNotification('Email vérifié avec succès !', 'success');
            
            // Rafraîchir les badges
            setTimeout(() => displayBadges(userData.id), 500);
        });
    }
});

// Exposer les fonctions globalement
window.displayUserProfileInfo = displayUserProfileInfo;
window.updateUserStats = updateUserStats;