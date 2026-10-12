// register.js - Gestion de l'inscription

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const lastname = document.getElementById('lastname').value.trim();
            const firstname = document.getElementById('firstname').value.trim();
            const age = parseInt(document.getElementById('age').value);
            const username = document.getElementById('register-username').value.trim();
            const password = document.getElementById('register-password').value;

            // Validations
            if (!lastname || !firstname || !username || !password) {
                alert('⚠️ Veuillez remplir tous les champs obligatoires');
                return;
            }

            if (username.length < 3) {
                alert('⚠️ Le pseudo doit contenir au moins 3 caractères');
                document.getElementById('register-username').focus();
                return;
            }

            if (password.length < 8) {
                alert('⚠️ Le mot de passe doit contenir au moins 8 caractères');
                document.getElementById('register-password').focus();
                return;
            }

            if (age < 13) {
                alert('⚠️ Vous devez avoir au moins 13 ans pour vous inscrire');
                document.getElementById('age').focus();
                return;
            }

            if (age > 120) {
                alert('⚠️ Veuillez entrer un âge valide');
                document.getElementById('age').focus();
                return;
            }

            // Récupérer les utilisateurs existants
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Vérifier si le pseudo existe déjà
            const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (userExists) {
                alert('❌ Ce pseudo est déjà utilisé. Veuillez en choisir un autre.');
                document.getElementById('register-username').focus();
                return;
            }

            // Créer le nouvel utilisateur
            const newUser = {
                id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                lastname: lastname,
                firstname: firstname,
                age: age,
                username: username,
                password: password,
                createdAt: new Date().toISOString()
            };

            // Ajouter l'utilisateur à la liste
            users.push(newUser);
            
            // Sauvegarder dans le localStorage
            localStorage.setItem('users', JSON.stringify(users));

            // Message de succès
            alert('✅ Inscription réussie ! Vous pouvez maintenant vous connecter avec votre pseudo et mot de passe.');
            
            // Redirection vers la page de connexion
            window.location.href = 'login.html';
        });
    }

    // Validation en temps réel du pseudo
    const usernameInput = document.getElementById('register-username');
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            const username = this.value.trim();
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (exists && username.length >= 3) {
                this.style.borderColor = '#e74c3c';
                const small = this.parentElement.querySelector('small');
                if (small) {
                    small.textContent = '❌ Ce pseudo est déjà pris';
                    small.style.color = '#e74c3c';
                }
            } else if (username.length >= 3) {
                this.style.borderColor = '#2ecc71';
                const small = this.parentElement.querySelector('small');
                if (small) {
                    small.textContent = '✅ Pseudo disponible';
                    small.style.color = '#2ecc71';
                }
            } else {
                this.style.borderColor = '#e0e0e0';
                const small = this.parentElement.querySelector('small');
                if (small) {
                    small.textContent = 'Minimum 3 caractères';
                    small.style.color = '#95a5a6';
                }
            }
        });
    }

    // Validation en temps réel du mot de passe
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const small = this.parentElement.querySelector('small');
            
            if (password.length >= 8) {
                this.style.borderColor = '#2ecc71';
                if (small) {
                    small.textContent = '✅ Mot de passe valide';
                    small.style.color = '#2ecc71';
                }
            } else if (password.length > 0) {
                this.style.borderColor = '#f39c12';
                if (small) {
                    small.textContent = `⚠️ Encore ${8 - password.length} caractère(s)`;
                    small.style.color = '#f39c12';
                }
            } else {
                this.style.borderColor = '#e0e0e0';
                if (small) {
                    small.textContent = 'Au moins 8 caractères';
                    small.style.color = '#95a5a6';
                }
            }
        });
    }

    // Animation au focus des inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

// Fonction de déconnexion depuis l'inscription (au cas où)
function logoutFromRegister() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

// Dans register.js, ajoutez cette fonction pour créer un admin par défaut
function createDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Vérifier si l'admin existe déjà
    const adminExists = users.some(user => user.email === 'admin@secondmain.com');
    
    if (!adminExists) {
        const adminUser = {
            id: 'admin_' + Date.now(),
            firstname: 'Admin',
            lastname: 'Nelarillau',
            username: 'admin',
            email: 'admin@secondmain.com',
            phone: '+237 000 000 000',
            password: 'admin', // À changer en production!
            isAdmin: true,
            role: 'Administrateur',
            createdAt: new Date().toISOString()
        };
        
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Compte administrateur créé par défaut');
    }
}

// Appeler cette fonction au chargement
document.addEventListener('DOMContentLoaded', function() {
    createDefaultAdmin();
});

// Exposer la fonction globalement
window.logoutFromRegister = logoutFromRegister;