// login.js - Gestion de la connexion
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            
            // Validation basique
            if (!username || !password) {
                showMessage('Veuillez remplir tous les champs', 'error');
                return;
            }
            
            // Récupérer les utilisateurs
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Chercher l'utilisateur par username
            const user = users.find(u => u.username === username);
            
            if (!user) {
                showMessage('Pseudo ou mot de passe incorrect', 'error');
                return;
            }
            
            // Vérifier le mot de passe
            if (user.password !== password) {
                showMessage('Pseudo ou mot de passe incorrect', 'error');
                return;
            }
            
            // Sauvegarder l'utilisateur connecté
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('currentUserId', user.id);
            localStorage.setItem('currentUserName', user.firstname || user.username);
            localStorage.setItem('userLoggedIn', 'true');
            
            // Vérifier si c'est un admin
            if (user.isAdmin) {
                localStorage.setItem('isAdmin', 'true');
                showMessage('Connexion admin réussie! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
            } else {
                showMessage('Connexion réussie! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    }
});

// Fonction pour afficher les messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    } else {
        // Fallback si pas de div message
        if (type === 'error') {
            alert('❌ ' + message);
        } else {
            alert('✅ ' + message);
        }
    }
}