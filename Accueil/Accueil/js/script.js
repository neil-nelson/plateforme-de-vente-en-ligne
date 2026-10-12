// script.js - Script général pour la page d'accueil

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 Script d\'accueil chargé');
    
    // Vérifier si l'utilisateur est déjà connecté
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            showWelcomeMessage(user);
        } catch (error) {
            console.error('Erreur lors de la lecture des données utilisateur:', error);
        }
    }

    // Initialiser les animations
    initAnimations();
    initButtonEffects();
    
    console.log('%c🎉 Bienvenue sur Second Main !', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%cApplication de vente d\'objets de seconde main', 'color: #764ba2; font-size: 14px;');
});

// Afficher le message de bienvenue pour utilisateur connecté
function showWelcomeMessage(user) {
    const homeContainer = document.querySelector('.home-container');
    
    if (!homeContainer) return;
    
    // Créer le message d'accueil
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideInRight 0.5s ease-out;
        max-width: 300px;
    `;
    
    const displayName = user.firstname || user.username || 'Utilisateur';
    
    welcomeMessage.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-user-circle" style="font-size: 24px; color: #667eea;"></i>
            <div style="flex: 1;">
                <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">Bonjour ${displayName} !</strong>
                <a href="dashboard.html" style="color: #667eea; text-decoration: none; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 5px;">
                    Accéder au tableau de bord 
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; cursor: pointer; color: #95a5a6; font-size: 18px; padding: 5px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(welcomeMessage);
    
    // Ajouter l'animation CSS
    addAnimationStyles();
}

// Ajouter les styles d'animation
function addAnimationStyles() {
    if (document.getElementById('welcome-animation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'welcome-animation-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes ripple {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialiser les animations au scroll
function initAnimations() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featureCards.length === 0) return;
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease-out';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureCards.forEach(card => {
        observer.observe(card);
    });

    // Effet parallax sur le logo
    initLogoParallax();
}

// Effet parallax sur le logo
function initLogoParallax() {
    const logo = document.querySelector('.logo');
    
    if (!logo) return;
    
    let isMoving = false;
    
    window.addEventListener('mousemove', function(e) {
        if (isMoving) return;
        
        isMoving = true;
        
        requestAnimationFrame(() => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const rotateX = (mouseY - 0.5) * 10;
            const rotateY = (mouseX - 0.5) * -10;
            
            logo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            isMoving = false;
        });
    });
}

// Initialiser les effets sur les boutons
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            createRipple(e, this);
        });
    });
}

// Créer l'effet ripple
function createRipple(e, button) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: translate(-50%, -50%);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Vérifier la connexion et rediriger si nécessaire
function checkLoginStatus() {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    const currentPath = window.location.pathname;
    
    // Pages qui nécessitent une connexion
    const protectedPages = ['dashboard.html', 'admin.html'];
    
    const currentPage = currentPath.split('/').pop();
    
    if (protectedPages.includes(currentPage) && userLoggedIn !== 'true') {
        window.location.href = 'login.html';
    }
}

// Nettoyer les données obsolètes
function cleanupOldData() {
    try {
        // Nettoyer les anciennes sessions (plus de 30 jours)
        const lastCleanup = localStorage.getItem('lastCleanup');
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (!lastCleanup || (now - parseInt(lastCleanup)) > thirtyDays) {
            console.log('🧹 Nettoyage des données anciennes...');
            
            // Supprimer les articles archivés de plus de 30 jours
            const articles = JSON.parse(localStorage.getItem('secondHandArticles') || '[]');
            const cleanedArticles = articles.filter(article => {
                if (article.status === 'archived' && article.archivedAt) {
                    const archivedDate = new Date(article.archivedAt);
                    return (now - archivedDate.getTime()) < thirtyDays;
                }
                return true;
            });
            
            if (cleanedArticles.length < articles.length) {
                localStorage.setItem('secondHandArticles', JSON.stringify(cleanedArticles));
                console.log(`✅ ${articles.length - cleanedArticles.length} articles archivés supprimés`);
            }
            
            localStorage.setItem('lastCleanup', now.toString());
        }
    } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
    }
}

// Exécuter le nettoyage au chargement
cleanupOldData();