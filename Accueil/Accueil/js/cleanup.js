// cleanup.js - Nettoyage des données pour l'admin

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le bouton de nettoyage
    initCleanupButton();
    
    // Mettre à jour les statistiques
    updateCleanupStats();
});

// Initialiser le bouton de nettoyage
function initCleanupButton() {
    const clearArticlesBtn = document.getElementById('clearArticlesBtn');
    
    if (clearArticlesBtn) {
        clearArticlesBtn.addEventListener('click', function() {
            clearAllArticles();
        });
    }
}

// Mettre à jour les statistiques de nettoyage
function updateCleanupStats() {
    // Récupérer les articles
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    
    // Compter les articles par statut
    const stats = {
        total: articles.length,
        pending: articles.filter(a => a.status === 'pending').length,
        active: articles.filter(a => a.status === 'active').length,
        rejected: articles.filter(a => a.status === 'rejected').length
    };
    
    // Mettre à jour les compteurs
    const totalCount = document.getElementById('totalArticlesCount');
    const pendingCount = document.getElementById('pendingArticlesCount');
    const activeCount = document.getElementById('activeArticlesCount');
    const rejectedCount = document.getElementById('rejectedArticlesCount');
    
    if (totalCount) totalCount.textContent = stats.total;
    if (pendingCount) pendingCount.textContent = stats.pending;
    if (activeCount) activeCount.textContent = stats.active;
    if (rejectedCount) rejectedCount.textContent = stats.rejected;
}

// Fonction principale de nettoyage
function clearAllArticles() {
    // Créer une modale de confirmation
    const modal = document.createElement('div');
    modal.className = 'cleanup-modal';
    modal.innerHTML = `
        <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); z-index: 2000;"></div>
        <div class="modal-content" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 30px; border-radius: 12px; z-index: 2001; max-width: 500px; width: 90%;">
            <h3 style="color: #e74c3c; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-triangle-exclamation"></i> Confirmation de suppression
            </h3>
            
            <div style="margin-bottom: 25px;">
                <p style="margin-bottom: 10px; font-weight: 500; color: #2c3e50;">Vous êtes sur le point de supprimer :</p>
                <ul style="color: #7f8c8d; padding-left: 20px; margin-bottom: 15px;">
                    <li>Toutes les annonces (validées, en attente, rejetées)</li>
                    <li>Les images stockées dans le navigateur</li>
                    <li>Les statistiques de vues</li>
                </ul>
                
                <div style="background-color: #fef5e7; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <p style="margin: 0; color: #b7950b; font-size: 14px;">
                        <i class="fa-solid fa-lightbulb"></i> 
                        <strong>Note :</strong> Les comptes utilisateurs ne seront pas affectés.
                    </p>
                </div>
            </div>
            
            <div style="display: flex; gap: 15px;">
                <button id="cancelCleanup" style="flex: 1; padding: 12px; background-color: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Annuler
                </button>
                <button id="confirmCleanup" style="flex: 1; padding: 12px; background-color: #e74c3c; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-trash"></i> Supprimer tout
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gestionnaires d'événements pour la modale
    const cancelBtn = document.getElementById('cancelCleanup');
    const confirmBtn = document.getElementById('confirmCleanup');
    const overlay = modal.querySelector('.modal-overlay');
    
    // Fonction pour fermer la modale
    function closeModal() {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
    
    // Événements
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            executeCleanup();
            closeModal();
        });
    }
    
    // Fermer avec la touche ESC
    const closeOnEsc = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', closeOnEsc);
    
    // Nettoyer l'événement ESC quand la modale est fermée
    const observer = new MutationObserver(() => {
        if (!document.body.contains(modal)) {
            document.removeEventListener('keydown', closeOnEsc);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Exécuter le nettoyage
function executeCleanup() {
    // Récupérer les articles avant suppression pour affichage
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const totalArticles = articles.length;
    
    // Supprimer les annonces
    localStorage.removeItem('secondHandArticles');
    
    // Supprimer aussi les favoris (optionnel)
    localStorage.removeItem('userFavorites');
    
    // Mettre à jour les statistiques
    updateCleanupStats();
    
    // Afficher une notification de succès
    showCleanupNotification(totalArticles);
    
    // Recharger les données dans l'interface admin
    setTimeout(() => {
        if (typeof loadValidationArticles === 'function') {
            loadValidationArticles();
        }
        if (typeof loadAllArticlesForAdmin === 'function') {
            loadAllArticlesForAdmin();
        }
        if (typeof updateAdminStats === 'function') {
            updateAdminStats();
        }
    }, 500);
}

// Afficher une notification de succès
function showCleanupNotification(totalArticles) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.cleanup-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'cleanup-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2ecc71;
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(46, 204, 113, 0.4);
        z-index: 2000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
            <div style="width: 50px; height: 50px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-check" style="font-size: 24px;"></i>
            </div>
            <div>
                <h4 style="margin: 0; font-size: 18px;">Nettoyage effectué !</h4>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">${totalArticles} annonces supprimées</p>
            </div>
        </div>
        <div style="background-color: rgba(255,255,255,0.1); padding: 10px; border-radius: 6px; margin-top: 15px; font-size: 13px;">
            <i class="fa-solid fa-info-circle"></i> 
            L'interface sera mise à jour automatiquement
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animer l'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Ajouter du CSS pour l'animation
    if (!document.querySelector('#cleanup-styles')) {
        const style = document.createElement('style');
        style.id = 'cleanup-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Exposer la fonction globalement
window.clearAllArticles = clearAllArticles;
window.updateCleanupStats = updateCleanupStats;

// Rafraîchir les statistiques toutes les 30 secondes
setInterval(updateCleanupStats, 30000);