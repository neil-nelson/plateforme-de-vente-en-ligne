// Gestion de la publication d'annonces
document.addEventListener('DOMContentLoaded', function() {
    // Interaction avec les options de catégorie
    const categoryOptions = document.querySelectorAll('.category-option');
    const continueBtn = document.querySelector('.continue-btn');
    let selectedCategory = null;
    
    categoryOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Retirer la classe selected de toutes les options
            categoryOptions.forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Ajouter la classe selected à l'option cliquée
            this.classList.add('selected');
            selectedCategory = this.dataset.category;
            
            // Activer le bouton continuer
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
        });
    });
    
    // Gestion du bouton continuer
    continueBtn.addEventListener('click', function() {
        if (selectedCategory) {
            // Rediriger vers la page de formulaire détaillé
            window.location.href = `formulaire-publication.html?category=${encodeURIComponent(selectedCategory)}`;
        } else {
            alert('Veuillez sélectionner une catégorie');
        }
    });
    
    // Désactiver le bouton continuer par défaut
    continueBtn.disabled = true;
    continueBtn.style.opacity = '0.5';
    continueBtn.style.cursor = 'not-allowed';
    
    // Sélectionner automatiquement la première catégorie pour le démo
    if (categoryOptions.length > 0 && !selectedCategory) {
        categoryOptions[0].click();
    }
});