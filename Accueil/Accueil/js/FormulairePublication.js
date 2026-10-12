// FormulairePublication.js - Gestion complète de la publication d'annonces

document.addEventListener('DOMContentLoaded', function() {
    console.log('FormulairePublication.js chargé');
    
    // Variables globales
    let currentStep = 1;
    let selectedCategory = '';
    let images = [];
    
    // Récupérer la catégorie depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    selectedCategory = urlParams.get('category') || '';
    
    if (!selectedCategory) {
        console.warn('Aucune catégorie sélectionnée');
        selectedCategory = 'Électronique';
    }
    
    console.log('Catégorie sélectionnée:', selectedCategory);
    
    // Mettre à jour le titre avec la catégorie
    const categoryTitle = document.getElementById('selectedCategory');
    if (categoryTitle) {
        categoryTitle.textContent = selectedCategory;
    }
    
    // Initialiser les sous-catégories
    initializeSubcategories();
    
    // Initialiser les étapes
    showStep(1);
    
    // Initialiser les événements
    initEvents();
    
    // Fonctions
    function initializeSubcategories() {
        const subcategories = {
            'Électronique': ['Téléphones', 'Ordinateurs', 'Tablettes', 'Accessoires', 'Jeux vidéo', 'Photo & Vidéo'],
            'Mode': ['Vêtements Hommes', 'Vêtements Femmes', 'Chaussures', 'Accessoires', 'Sacs', 'Bijoux'],
            'Agroalimentaire': ['Fruits & Légumes', 'Produits laitiers', 'Viandes', 'Céréales', 'Produits transformés', 'Boissons'],
            'Immobilier': ['Appartements', 'Maisons', 'Terrains', 'Locaux commerciaux', 'Colocations', 'Bureaux']
        };
        
        const subcategorySelect = document.getElementById('subcategory');
        if (subcategorySelect && subcategories[selectedCategory]) {
            subcategorySelect.innerHTML = '<option value="">Sélectionnez une sous-catégorie</option>';
            subcategories[selectedCategory].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                subcategorySelect.appendChild(option);
            });
        }
    }
    
    function initEvents() {
        // Boutons de navigation
        const nextBtnStep1 = document.getElementById('nextBtnStep1');
        const prevBtnStep2 = document.getElementById('prevBtnStep2');
        const nextBtnStep2 = document.getElementById('nextBtnStep2');
        const prevBtnStep3 = document.getElementById('prevBtnStep3');
        const publishBtnFinal = document.getElementById('publishBtnFinal');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (nextBtnStep1) {
            nextBtnStep1.addEventListener('click', () => {
                if (validateStep1()) {
                    showStep(2);
                }
            });
        }
        
        if (prevBtnStep2) {
            prevBtnStep2.addEventListener('click', () => showStep(1));
        }
        
        if (nextBtnStep2) {
            nextBtnStep2.addEventListener('click', () => {
                if (validateStep2()) {
                    showStep(3);
                }
            });
        }
        
        if (prevBtnStep3) {
            prevBtnStep3.addEventListener('click', () => showStep(2));
        }
        
        if (publishBtnFinal) {
            publishBtnFinal.addEventListener('click', (e) => {
                e.preventDefault();
                publishArticle();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Annuler la publication ? Les données saisies seront perdues.')) {
                    window.location.href = 'dashboard.html#boutiqueBtn';
                }
            });
        }
        
        // Validation en temps réel pour l'étape 1
        const titleInput = document.getElementById('articleTitle');
        const priceInput = document.getElementById('articlePrice');
        const descInput = document.getElementById('articleDescription');
        
        if (titleInput) {
            titleInput.addEventListener('input', () => validateStep1Button());
        }
        if (priceInput) {
            priceInput.addEventListener('input', () => validateStep1Button());
        }
        if (descInput) {
            descInput.addEventListener('input', () => validateStep1Button());
        }
        
        // Upload d'images
        const imageUpload = document.getElementById('imageUpload');
        const imageInput = document.getElementById('imageInput');
        
        if (imageUpload && imageInput) {
            imageUpload.addEventListener('click', () => imageInput.click());
            
            imageUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                imageUpload.classList.add('dragover');
            });
            
            imageUpload.addEventListener('dragleave', () => {
                imageUpload.classList.remove('dragover');
            });
            
            imageUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                imageUpload.classList.remove('dragover');
                handleImageFiles(e.dataTransfer.files);
            });
            
            imageInput.addEventListener('change', (e) => {
                handleImageFiles(e.target.files);
            });
        }
        
        // Validation en temps réel pour l'étape 3
        const locationInput = document.getElementById('articleLocation');
        const contactInput = document.getElementById('articleContact');
        const termsCheckbox = document.getElementById('termsCheckbox');
        
        if (locationInput) {
            locationInput.addEventListener('input', () => validateStep3Button());
        }
        if (contactInput) {
            contactInput.addEventListener('input', () => validateStep3Button());
        }
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => validateStep3Button());
        }
    }
    
    function handleImageFiles(files) {
        if (!files || files.length === 0) return;
        
        if (images.length + files.length > 10) {
            alert('Maximum 10 images autorisées');
            return;
        }
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} n'est pas une image valide`);
                continue;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} est trop volumineux (max 5MB)`);
                continue;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                images.push({
                    src: e.target.result,
                    name: file.name
                });
                updateImagePreviews();
                validateStep2Button();
            };
            reader.readAsDataURL(file);
        }
    }
    
    function updateImagePreviews() {
        const container = document.getElementById('imagePreviewContainer');
        const uploadText = document.getElementById('uploadText');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        if (images.length === 0) {
            container.innerHTML = `
                <div class="no-images-message">
                    <i class="fa-solid fa-image"></i>
                    <p>Aucune image sélectionnée</p>
                </div>
            `;
        } else {
            images.forEach((img, index) => {
                const div = document.createElement('div');
                div.className = 'image-preview';
                div.innerHTML = `
                    <img src="${img.src}" alt="Image ${index + 1}">
                    <button type="button" class="remove-image" data-index="${index}">
                        <i class="fa-solid fa-times"></i>
                    </button>
                `;
                container.appendChild(div);
            });
            
            document.querySelectorAll('.remove-image').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    images.splice(index, 1);
                    updateImagePreviews();
                    validateStep2Button();
                });
            });
        }
        
        if (uploadText) {
            uploadText.textContent = images.length === 0 
                ? 'Glissez-déposez des images ici ou cliquez pour sélectionner'
                : `Ajouter plus d'images (${images.length}/10)`;
        }
    }
    
    function showStep(step) {
        currentStep = step;
        
        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'none';
        
        const currentStepElement = document.getElementById(`step${step}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }
        
        updateStepIndicators(step);
        
        if (step === 1) validateStep1Button();
        if (step === 2) validateStep2Button();
        if (step === 3) validateStep3Button();
    }
    
    function updateStepIndicators(step) {
        const indicators = [
            document.getElementById('stepIndicator1'),
            document.getElementById('stepIndicator2'),
            document.getElementById('stepIndicator3')
        ];
        
        const lines = [
            document.getElementById('stepLine1'),
            document.getElementById('stepLine2')
        ];
        
        indicators.forEach(ind => {
            if (ind) ind.classList.remove('active', 'completed');
        });
        lines.forEach(line => {
            if (line) line.classList.remove('completed');
        });
        
        for (let i = 0; i < step; i++) {
            if (indicators[i]) {
                indicators[i].classList.add(i < step - 1 ? 'completed' : 'active');
            }
            if (i < step - 1 && lines[i]) {
                lines[i].classList.add('completed');
            }
        }
    }
    
    function validateStep1() {
        const title = document.getElementById('articleTitle').value.trim();
        const price = document.getElementById('articlePrice').value.trim();
        const description = document.getElementById('articleDescription').value.trim();
        
        let valid = true;
        
        if (!title || title.length < 3) {
            showError('titleError', 'Le titre doit contenir au moins 3 caractères');
            valid = false;
        } else {
            clearError('titleError');
        }
        
        if (!price || isNaN(price) || parseFloat(price) < 100) {
            showError('priceError', 'Veuillez saisir un prix valide (minimum 100 F CFA)');
            valid = false;
        } else {
            clearError('priceError');
        }
        
        if (!description || description.length < 10) {
            showError('descriptionError', 'La description doit contenir au moins 10 caractères');
            valid = false;
        } else {
            clearError('descriptionError');
        }
        
        return valid;
    }
    
    function validateStep2() {
        if (images.length === 0) {
            showError('imageError', 'Veuillez ajouter au moins une image');
            return false;
        } else {
            clearError('imageError');
        }
        return true;
    }
    
    function validateStep3() {
        const location = document.getElementById('articleLocation').value.trim();
        const contact = document.getElementById('articleContact').value.trim();
        const terms = document.getElementById('termsCheckbox').checked;
        
        let valid = true;
        
        if (!location || location.length < 2) {
            showError('locationError', 'Veuillez saisir une localisation valide');
            valid = false;
        } else {
            clearError('locationError');
        }
        
        if (!contact || contact.length < 8) {
            showError('contactError', 'Veuillez saisir un numéro de téléphone valide');
            valid = false;
        } else {
            clearError('contactError');
        }
        
        if (!terms) {
            showError('termsError', 'Vous devez accepter les conditions générales');
            valid = false;
        } else {
            clearError('termsError');
        }
        
        return valid;
    }
    
    function validateStep1Button() {
        const btn = document.getElementById('nextBtnStep1');
        if (!btn) return;
        
        const title = document.getElementById('articleTitle').value.trim();
        const price = document.getElementById('articlePrice').value.trim();
        const description = document.getElementById('articleDescription').value.trim();
        
        const isValid = title && title.length >= 3 && 
                       price && !isNaN(price) && parseFloat(price) >= 100 && 
                       description && description.length >= 10;
        
        btn.disabled = !isValid;
        btn.style.opacity = isValid ? '1' : '0.5';
        btn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }
    
    function validateStep2Button() {
        const btn = document.getElementById('nextBtnStep2');
        if (!btn) return;
        
        const isValid = images.length > 0;
        
        btn.disabled = !isValid;
        btn.style.opacity = isValid ? '1' : '0.5';
        btn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }
    
    function validateStep3Button() {
        const publishBtn = document.getElementById('publishBtnFinal');
        if (!publishBtn) return;
        
        const location = document.getElementById('articleLocation').value.trim();
        const contact = document.getElementById('articleContact').value.trim();
        const terms = document.getElementById('termsCheckbox').checked;
        
        const isValid = location && location.length >= 2 && 
                       contact && contact.length >= 8 && 
                       terms;
        
        publishBtn.disabled = !isValid;
        publishBtn.style.opacity = isValid ? '1' : '0.5';
        publishBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }
    
    function showError(id, message) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }
    
    function clearError(id) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    }
    
    // Dans la fonction publishArticle(), modifier le statut de l'article :
function publishArticle() {
    console.log('Publication de l\'article en cours...');
    
    // Valider toutes les étapes
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
        alert('Veuillez corriger les erreurs avant de publier');
        showStep(1); // Retourner à la première étape pour voir les erreurs
        return;
    }
    
    // Créer un ID unique (timestamp + random)
    const articleId = 'art_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Récupérer l'utilisateur courant
    const currentUserId = getCurrentUserId();
    const currentUserName = getCurrentUserName();
    
    console.log('Utilisateur courant:', currentUserId, currentUserName);
    
    // Créer l'objet article avec statut "pending"
    const article = {
        id: articleId,
        title: document.getElementById('articleTitle').value.trim(),
        price: document.getElementById('articlePrice').value.trim(),
        description: document.getElementById('articleDescription').value.trim(),
        category: getCategoryCode(selectedCategory),
        subcategory: document.getElementById('subcategory').value,
        location: document.getElementById('articleLocation').value.trim(),
        contact: document.getElementById('articleContact').value.trim(),
        condition: document.getElementById('articleCondition').value,
        deliveryOption: document.getElementById('deliveryOption').value,
        images: images.map(img => img.src),
        views: 0,
        publishedAt: new Date().toISOString(),
        sponsored: false,
        status: 'pending', // Changé de 'active' à 'pending'
        userId: currentUserId,
        userName: currentUserName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        validationStatus: 'pending',
        validationMessage: null
    };
    
    console.log('Article à publier (en attente de validation):', article);
    
    // Sauvegarder dans localStorage
    saveArticle(article);
    
    // Message de succès
    alert('✅ Article soumis avec succès ! Il sera publié après validation par l\'administrateur.');
    
    // Redirection vers le dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html#boutiqueBtn';
    }, 500);
}
    
    function getCategoryCode(categoryName) {
        const map = {
            'Électronique': 'elec',
            'Mode': 'mode',
            'Agroalimentaire': 'agro',
            'Immobilier': 'immo'
        };
        return map[categoryName] || 'elec';
    }
    
    function saveArticle(article) {
        let articles = [];
        try {
            const savedData = localStorage.getItem('secondHandArticles');
            articles = savedData ? JSON.parse(savedData) : [];
        } catch (e) {
            console.error('Erreur lecture:', e);
            articles = [];
        }
        
        // Ajouter le nouvel article au début
        articles.unshift(article);
        
        // Limiter à 100 articles maximum
        if (articles.length > 100) {
            articles = articles.slice(0, 100);
        }
        
        try {
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
            console.log('Article sauvegardé dans localStorage');
            console.log('Total articles après sauvegarde:', articles.length);
        } catch (e) {
            console.error('Erreur sauvegarde:', e);
            alert('Erreur lors de la sauvegarde');
        }
    }
    
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
    
    // Fonction pour obtenir le nom de l'utilisateur actuel
    function getCurrentUserName() {
        const userName = localStorage.getItem('currentUserName');
        return userName || 'Utilisateur';
    }
    
    // Initialiser le bouton de l'étape 1
    validateStep1Button();
});