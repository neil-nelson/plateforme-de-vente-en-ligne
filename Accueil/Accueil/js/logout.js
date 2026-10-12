// logout.js - Gestion de la déconnexion
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de déconnexion chargé');
    
    // Fonction pour ajouter un bouton de déconnexion dans le profil
    function addLogoutButton() {
        // Chercher la section profil
        const profilContainer = document.querySelector('.profil-container');
        
        if (!profilContainer) {
            console.log('Conteneur profil non trouvé, tentative dans 1 seconde...');
            setTimeout(addLogoutButton, 1000);
            return;
        }
        
        // Vérifier si le bouton existe déjà
        if (document.getElementById('logoutBtn')) {
            return;
        }
        
        // Créer le bouton de déconnexion
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'logout-button';
        logoutBtn.innerHTML = `
            <i class="fa-solid fa-right-from-bracket"></i> Se déconnecter
        `;
        
        // Ajouter le bouton après les statistiques
        const userStats = document.querySelector('.user-stats');
        if (userStats && userStats.parentNode) {
            userStats.parentNode.insertBefore(logoutBtn, userStats.nextSibling);
        } else {
            // Sinon, ajouter à la fin du conteneur
            profilContainer.appendChild(logoutBtn);
        }
        
        // Style du bouton
        logoutBtn.style.display = 'block';
        logoutBtn.style.width = '100%';
        logoutBtn.style.marginTop = '25px';
        logoutBtn.style.padding = '15px';
        logoutBtn.style.backgroundColor = '#e74c3c';
        logoutBtn.style.color = 'white';
        logoutBtn.style.border = 'none';
        logoutBtn.style.borderRadius = '10px';
        logoutBtn.style.fontSize = '16px';
        logoutBtn.style.fontWeight = '600';
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.style.transition = 'all 0.3s ease';
        logoutBtn.style.display = 'flex';
        logoutBtn.style.alignItems = 'center';
        logoutBtn.style.justifyContent = 'center';
        logoutBtn.style.gap = '10px';
        
        // Effet hover
        logoutBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#c0392b';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.3)';
        });
        
        logoutBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#e74c3c';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        // Gestionnaire de clic
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performLogout();
        });
        
        console.log('Bouton de déconnexion ajouté avec succès');
    }
    
    // Fonction principale de déconnexion
    function performLogout() {
        // Confirmation
        if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            return;
        }
        
        // Effacer les données de session
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userToken');
        
        // Effacer les données spécifiques si nécessaire
        localStorage.removeItem('userArticles');
        localStorage.removeItem('userStats');
        
        // Message de confirmation
        alert('Vous avez été déconnecté avec succès !');
        
        // Redirection vers la page de connexion
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
    
    // Exposer la fonction globalement
    window.performLogout = performLogout;
    
    // Ajouter le bouton au chargement
    setTimeout(addLogoutButton, 500);
    
    // Écouter les changements d'onglet pour ajouter le bouton quand le profil est ouvert
    const profilBtn = document.getElementById('profilBtn');
    if (profilBtn) {
        profilBtn.addEventListener('click', function() {
            setTimeout(addLogoutButton, 300);
        });
    }
    
    // Ajouter aussi un bouton de déconnexion dans le menu si on le souhaite
    function addLogoutToMenu() {
        const menu = document.querySelector('.util');
        
        if (!menu || document.querySelector('.logout-menu-item')) {
            return;
        }
        
        const logoutMenuItem = document.createElement('div');
        logoutMenuItem.className = 'logout-menu-item';
        logoutMenuItem.style.marginTop = 'auto'; // Pousse en bas du menu
        logoutMenuItem.style.paddingTop = '20px';
        logoutMenuItem.style.borderTop = '1px solid #eee';
        
        const logoutButton = document.createElement('button');
        logoutButton.id = 'menuLogoutBtn';
        logoutButton.innerHTML = `
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Déconnexion</span>
        `;
        
        // Appliquer les styles du menu
        logoutButton.style.width = '100%';
        logoutButton.style.padding = '15px 20px';
        logoutButton.style.marginBottom = '0';
        logoutButton.style.border = 'none';
        logoutButton.style.backgroundColor = 'white';
        logoutButton.style.borderRadius = '12px';
        logoutButton.style.textAlign = 'left';
        logoutButton.style.fontSize = '16px';
        logoutButton.style.color = '#e74c3c'; // Rouge pour indiquer danger
        logoutButton.style.cursor = 'pointer';
        logoutButton.style.transition = 'all 0.3s ease';
        logoutButton.style.display = 'flex';
        logoutButton.style.alignItems = 'center';
        
        logoutButton.innerHTML = `
            <i class="fa-solid fa-right-from-bracket" style="margin-right: 12px; font-size: 18px;"></i>
            <span>Déconnexion</span>
        `;
        
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            performLogout();
        });
        
        logoutButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#ffeaea';
            this.style.color = '#c0392b';
            this.style.transform = 'translateX(5px)';
        });
        
        logoutButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
            this.style.color = '#e74c3c';
            this.style.transform = 'translateX(0)';
        });
        
        logoutMenuItem.appendChild(logoutButton);
        menu.appendChild(logoutMenuItem);
    }
    
    // Ajouter le bouton au menu après un délai
    setTimeout(addLogoutToMenu, 1000);
});