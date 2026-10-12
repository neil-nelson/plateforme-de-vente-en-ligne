// ModifierArticle.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('ModifierArticle.js chargé');
    
    // Récupérer l'ID de l'article depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
        alert('Aucun article spécifié');
        window.history.back();
        return;
    }
    
    // Charger l'article
    loadArticle(articleId);
    
    // Gérer la soumission du formulaire
    const form = document.getElementById('modifierForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveArticleChanges(articleId);
        });
    }
});

function loadArticle(articleId) {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const article = articles.find(a => a.id == articleId);
    
    if (!article) {
        alert('Article non trouvé');
        window.history.back();
        return;
    }
    
    // Vérifier que l'utilisateur est le propriétaire
    const currentUserId = localStorage.getItem('currentUserId');
    if (article.userId !== currentUserId) {
        alert('Vous n\'êtes pas autorisé à modifier cet article');
        window.history.back();
        return;
    }
    
    // Afficher le formulaire
    displayArticleForm(article);
}

function displayArticleForm(article) {
    const container = document.getElementById('modifierContent');
    
    let categoryName = 'Autre';
    let categoryCode = article.category || 'other';
    
    switch(article.category) {
        case 'elec':
            categoryName = 'Électronique';
            break;
        case 'mode':
            categoryName = 'Mode';
            break;
        case 'agro':
            categoryName = 'Agroalimentaire';
            break;
        case 'immo':
            categoryName = 'Immobilier';
            break;
    }
    
    container.innerHTML = `
        <div class="form-section">
            <h2><i class="fa-solid fa-heading"></i> Informations de base</h2>
            
            <div class="form-group">
                <label for="title">
                    <i class="fa-solid fa-pen"></i> Titre de l'annonce *
                </label>
                <input type="text" id="title" value="${article.title || ''}" required 
                       placeholder="Ex: iPhone 12 Pro Max 256GB - Excellent état">
            </div>
            
            <div class="form-group">
                <label for="category">
                    <i class="fa-solid fa-tag"></i> Catégorie
                </label>
                <select id="category" disabled>
                    <option value="${categoryCode}">${categoryName}</option>
                </select>
                <small>La catégorie ne peut pas être modifiée</small>
            </div>
            
            <div class="form-group">
                <label for="price">
                    <i class="fa-solid fa-money-bill-wave"></i> Prix (F CFA) *
                </label>
                <input type="number" id="price" value="${article.price || ''}" required 
                       placeholder="Ex: 150000">
            </div>
        </div>
        
        <div class="form-section">
            <h2><i class="fa-solid fa-align-left"></i> Description</h2>
            <div class="form-group">
                <label for="description">
                    <i class="fa-solid fa-file-alt"></i> Description détaillée *
                </label>
                <textarea id="description" rows="5" required 
                          placeholder="Décrivez votre article en détail...">${article.description || ''}</textarea>
            </div>
        </div>
        
        <div class="form-section">
            <h2><i class="fa-solid fa-location-dot"></i> Localisation</h2>
            <div class="form-group">
                <label for="location">
                    <i class="fa-solid fa-map-marker-alt"></i> Ville/Village *
                </label>
                <input type="text" id="location" value="${article.location || ''}" required 
                       placeholder="Ex: Yaoundé, Douala, Garoua...">
            </div>
            
            <div class="form-group">
                <label for="contact">
                    <i class="fa-solid fa-phone"></i> Numéro de contact *
                </label>
                <input type="tel" id="contact" value="${article.contact || ''}" required 
                       placeholder="Ex: +237 6XX XX XX XX">
            </div>
        </div>
        
        <div class="form-section">
            <h2><i class="fa-solid fa-info-circle"></i> Détails supplémentaires</h2>
            
            <div class="form-group">
                <label for="condition">
                    <i class="fa-solid fa-certificate"></i> État de l'article
                </label>
                <select id="condition">
                    <option value="new" ${article.condition === 'new' ? 'selected' : ''}>Neuf</option>
                    <option value="very-good" ${article.condition === 'very-good' ? 'selected' : ''}>Très bon état</option>
                    <option value="good" ${article.condition === 'good' ? 'selected' : ''}>Bon état</option>
                    <option value="satisfying" ${article.condition === 'satisfying' ? 'selected' : ''}>État satisfaisant</option>
                    <option value="used" ${article.condition === 'used' ? 'selected' : ''}>Usé</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="deliveryOption">
                    <i class="fa-solid fa-truck"></i> Mode de livraison
                </label>
                <select id="deliveryOption">
                    <option value="Meeting" ${article.deliveryOption === 'Meeting' ? 'selected' : ''}>Rencontre en personne</option>
                    <option value="Delivery" ${article.deliveryOption === 'Delivery' ? 'selected' : ''}>Livraison possible</option>
                    <option value="Shipping" ${article.deliveryOption === 'Shipping' ? 'selected' : ''}>Envoi possible</option>
                </select>
            </div>
        </div>
        
        <div class="form-section">
            <h2><i class="fa-solid fa-images"></i> Images (${article.images ? article.images.length : 0})</h2>
            <div class="image-preview-container" id="imagePreview">
                ${article.images && article.images.length > 0 ? 
                    article.images.map((img, index) => `
                        <div class="image-preview">
                            <img src="${img}" alt="Image ${index + 1}">
                            <button type="button" class="remove-image-btn" data-index="${index}">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                    `).join('') : 
                    '<p style="color: #7f8c8d; text-align: center;">Aucune image</p>'
                }
            </div>
            <small>Les images existantes seront conservées. La suppression d\'images est définitive.</small>
        </div>
    `;
    
    // Ajouter les événements pour les boutons de suppression d'images
    container.querySelectorAll('.remove-image-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            if (confirm('Supprimer cette image ?')) {
                article.images.splice(index, 1);
                displayArticleForm(article);
            }
        });
    });
}

function saveArticleChanges(articleId) {
    // Récupérer les valeurs du formulaire
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const condition = document.getElementById('condition').value;
    const deliveryOption = document.getElementById('deliveryOption').value;
    
    // Validation basique
    if (!title || !price || !description || !location || !contact) {
        alert('Veuillez remplir tous les champs obligatoires (*)');
        return;
    }
    
    // Récupérer l'article original
    let articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const articleIndex = articles.findIndex(a => a.id == articleId);
    
    if (articleIndex === -1) {
        alert('Article non trouvé');
        return;
    }
    
    // Mettre à jour l'article
    articles[articleIndex] = {
        ...articles[articleIndex],
        title: title,
        price: price,
        description: description,
        location: location,
        contact: contact,
        condition: condition,
        deliveryOption: deliveryOption,
        updatedAt: new Date().toISOString()
        // Note: Les images sont déjà mises à jour dans displayArticleForm
    };
    
    // Sauvegarder
    localStorage.setItem('secondHandArticles', JSON.stringify(articles));
    
    // Rediriger vers le tableau de bord avec notification
    alert('✅ Article modifié avec succès !');
    window.location.href = 'dashboard.html?edited=success';
}