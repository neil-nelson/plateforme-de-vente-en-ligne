// orders.js - Gestion des commandes avec suppression
// Version avec possibilité de supprimer les commandes terminées ou en attente

// Charger les commandes de l'utilisateur
function loadUserOrders() {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return [];
    
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    
    // Filtrer les transactions de l'utilisateur (en tant qu'acheteur ou vendeur)
    const userTransactions = transactions.filter(t => 
        t.buyerId === currentUserId || t.sellerId === currentUserId
    );
    
    return userTransactions;
}

// Afficher les commandes dans l'interface
function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;
    
    const orders = loadUserOrders();
    const currentUserId = localStorage.getItem('currentUserId');
    
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <i class="fa-solid fa-shopping-bag" style="font-size: 64px; margin-bottom: 20px; color: #bdc3c7;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px; color: #2c3e50;">Aucune commande</h3>
                <p style="font-size: 16px;">Vos commandes et ventes apparaîtront ici</p>
            </div>
        `;
        return;
    }
    
    // Trier par date (plus récentes d'abord)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    orders.forEach(order => {
        const isBuyer = order.buyerId === currentUserId;
        const orderCard = createOrderCard(order, isBuyer);
        ordersContainer.appendChild(orderCard);
    });
}

// Créer une carte de commande
function createOrderCard(order, isBuyer) {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const article = articles.find(a => a.id == order.articleId);
    
    const card = document.createElement('div');
    card.className = 'order-card';
    card.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        border-left: 4px solid ${getStatusColor(order.status)};
        position: relative;
    `;
    
    // Badge de statut
    const statusBadge = getStatusBadge(order.status);
    const roleText = isBuyer ? 'Achat' : 'Vente';
    
    // Vérifier si la commande peut être supprimée
    const canDelete = canDeleteOrder(order, isBuyer);
    
    card.innerHTML = `
        ${canDelete ? `
            <button onclick="deleteOrder('${order.id}')" style="position: absolute; top: 20px; right: 20px; width: 36px; height: 36px; background: #fee; border: 2px solid #e74c3c; border-radius: 50%; color: #e74c3c; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" title="Supprimer cette commande">
                <i class="fa-solid fa-trash"></i>
            </button>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px; ${canDelete ? 'padding-right: 50px;' : ''}">
            <div>
                <h3 style="color: #2c3e50; margin-bottom: 5px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-${isBuyer ? 'shopping-cart' : 'store'}"></i>
                    ${roleText} - ${article ? article.title : 'Article supprimé'}
                </h3>
                <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                    Commande #${order.id ? order.id.substr(-8) : 'N/A'} • ${new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </p>
            </div>
            ${statusBadge}
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div>
                <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 5px;">Montant</p>
                <p style="color: #2c3e50; font-weight: 600; margin: 0; font-size: 18px;">
                    ${formatPrice(order.amount)}
                </p>
            </div>
            <div>
                <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 5px;">Statut</p>
                <p style="color: #2c3e50; font-weight: 600; margin: 0;">
                    ${getStatusText(order.status)}
                </p>
            </div>
            <div>
                <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 5px;">
                    ${isBuyer ? 'Vendeur' : 'Acheteur'}
                </p>
                <p style="color: #2c3e50; font-weight: 600; margin: 0;">
                    ${isBuyer ? getSellerName(order.sellerId) : getBuyerName(order.buyerId)}
                </p>
            </div>
        </div>
        
        <!-- Timeline de progression -->
        <div style="margin-bottom: 20px;">
            ${createProgressTimeline(order)}
        </div>
        
        <!-- Actions selon le rôle et le statut -->
        <div class="order-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
            ${createOrderActions(order, isBuyer)}
        </div>
        
        <!-- Événements -->
        ${order.events && order.events.length > 0 ? `
            <details style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 600; color: #2c3e50;">
                    <i class="fa-solid fa-clock-rotate-left"></i> Historique (${order.events.length})
                </summary>
                <div style="margin-top: 15px;">
                    ${order.events.map(event => `
                        <div style="padding: 10px; border-left: 2px solid #3498db; margin: 10px 0; padding-left: 15px;">
                            <p style="margin: 0; color: #2c3e50; font-weight: 500;">${event.description}</p>
                            <small style="color: #7f8c8d;">
                                ${new Date(event.timestamp).toLocaleString('fr-FR')}
                            </small>
                        </div>
                    `).join('')}
                </div>
            </details>
        ` : ''}
    `;
    
    return card;
}

// Vérifier si une commande peut être supprimée
function canDeleteOrder(order, isBuyer) {
    // L'acheteur peut supprimer si :
    // - La commande est terminée (completed)
    // - La commande est encore en attente de paiement (pending)
    // - La commande a été remboursée (refunded)
    
    if (isBuyer) {
        return order.status === 'pending' || 
               order.status === 'completed' || 
               order.status === 'refunded';
    }
    
    // Le vendeur ne peut pas supprimer
    return false;
}

// Supprimer une commande
function deleteOrder(transactionId) {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
        alert('❌ Commande introuvable');
        return;
    }
    
    const currentUserId = localStorage.getItem('currentUserId');
    const isBuyer = transaction.buyerId === currentUserId;
    
    // Vérifier les permissions
    if (!canDeleteOrder(transaction, isBuyer)) {
        alert('❌ Vous ne pouvez pas supprimer cette commande pour le moment');
        return;
    }
    
    // Messages de confirmation différents selon le statut
    let confirmMessage = '';
    
    if (transaction.status === 'pending') {
        confirmMessage = 'Voulez-vous annuler cette commande ?\n\nLa transaction sera supprimée et aucun paiement ne sera effectué.';
    } else if (transaction.status === 'completed') {
        confirmMessage = 'Voulez-vous supprimer cette commande de votre historique ?\n\nCette action est irréversible mais n\'affectera pas la transaction déjà terminée.';
    } else if (transaction.status === 'refunded') {
        confirmMessage = 'Voulez-vous supprimer cette commande remboursée de votre historique ?';
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Supprimer la transaction
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    // Afficher une notification
    showNotification('🗑️ Commande supprimée avec succès', 'info');
    
    // Rafraîchir l'affichage
    displayOrders();
}

// Créer la timeline de progression
function createProgressTimeline(order) {
    const steps = [
        { key: 'pending', label: 'Commande', icon: 'fa-shopping-cart' },
        { key: 'paid', label: 'Payé', icon: 'fa-lock' },
        { key: 'shipped', label: 'Expédié', icon: 'fa-truck' },
        { key: 'completed', label: 'Livré', icon: 'fa-check-circle' }
    ];
    
    const currentStepIndex = steps.findIndex(s => s.key === order.status);
    
    return `
        <div style="display: flex; align-items: center; justify-content: space-between; position: relative; padding: 20px 0;">
            ${steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return `
                    <div style="flex: 1; text-align: center; position: relative; z-index: 1;">
                        <div style="width: 40px; height: 40px; margin: 0 auto 10px; background: ${isCompleted ? '#27ae60' : '#e0e0e0'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; ${isCurrent ? 'box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.2);' : ''}">
                            <i class="fa-solid ${step.icon}" style="color: white; font-size: 16px;"></i>
                        </div>
                        <small style="color: ${isCompleted ? '#27ae60' : '#7f8c8d'}; font-weight: ${isCurrent ? '600' : '500'};">
                            ${step.label}
                        </small>
                    </div>
                    ${index < steps.length - 1 ? `
                        <div style="flex: 1; height: 2px; background: ${index < currentStepIndex ? '#27ae60' : '#e0e0e0'}; margin-bottom: 30px;"></div>
                    ` : ''}
                `;
            }).join('')}
        </div>
    `;
}

// Créer les actions selon le rôle
function createOrderActions(order, isBuyer) {
    const actions = [];
    
    if (isBuyer) {
        // Actions pour l'acheteur
        if (order.status === 'paid') {
            actions.push(`
                <div style="flex: 1; min-width: 200px; padding: 15px; background: #e8f6f3; border-radius: 8px; border-left: 4px solid #27ae60;">
                    <p style="margin: 0; color: #27ae60; font-weight: 600;">
                        <i class="fa-solid fa-info-circle"></i> En attente d'expédition
                    </p>
                    <small style="color: #27ae60;">Le vendeur doit expédier l'article</small>
                </div>
            `);
        } else if (order.status === 'shipped') {
            actions.push(`
                <button onclick="confirmDelivery('${order.id}')" style="flex: 1; padding: 15px; background: #27ae60; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s ease;">
                    <i class="fa-solid fa-check-circle"></i> Confirmer la réception
                </button>
            `);
            
            if (order.trackingNumber) {
                actions.push(`
                    <div style="flex: 1; min-width: 200px; padding: 15px; background: #ebf5fb; border-radius: 8px; border-left: 4px solid #3498db;">
                        <p style="margin: 0; color: #3498db; font-weight: 600;">
                            <i class="fa-solid fa-truck"></i> Suivi: ${order.trackingNumber}
                        </p>
                        <small style="color: #3498db;">Suivez votre colis</small>
                    </div>
                `);
            }
        } else if (order.status === 'completed') {
            actions.push(`
                <div style="flex: 1; min-width: 200px; padding: 15px; background: #e8f6f3; border-radius: 8px; border-left: 4px solid #27ae60;">
                    <p style="margin: 0; color: #27ae60; font-weight: 600;">
                        <i class="fa-solid fa-check-circle"></i> Commande terminée
                    </p>
                    <small style="color: #27ae60;">Livraison confirmée le ${order.completedAt ? new Date(order.completedAt).toLocaleDateString('fr-FR') : 'N/A'}</small>
                </div>
            `);
        } else if (order.status === 'pending') {
            actions.push(`
                <div style="flex: 1; padding: 15px; background: #fef9e7; border-radius: 8px; border-left: 4px solid #f39c12;">
                    <p style="margin: 0; color: #f39c12; font-weight: 600;">
                        <i class="fa-solid fa-clock"></i> Paiement non effectué
                    </p>
                    <small style="color: #f39c12;">Vous pouvez annuler cette commande</small>
                </div>
            `);
        }
        
        // Bouton pour ouvrir un litige
        if (order.status !== 'completed' && order.status !== 'refunded' && order.status !== 'disputed' && order.status !== 'pending') {
            actions.push(`
                <button onclick="openDispute('${order.id}')" style="padding: 15px 20px; background: #f8f9fa; color: #e74c3c; border: 2px solid #e74c3c; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    <i class="fa-solid fa-exclamation-triangle"></i> Signaler un problème
                </button>
            `);
        }
    } else {
        // Actions pour le vendeur
        if (order.status === 'paid') {
            actions.push(`
                <button onclick="showShippingModal('${order.id}')" style="flex: 1; padding: 15px; background: #3498db; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s ease;">
                    <i class="fa-solid fa-truck"></i> Marquer comme expédié
                </button>
            `);
            
            actions.push(`
                <div style="flex: 1; min-width: 200px; padding: 15px; background: #fef9e7; border-radius: 8px; border-left: 4px solid #f39c12;">
                    <p style="margin: 0; color: #f39c12; font-weight: 600;">
                        <i class="fa-solid fa-clock"></i> Paiement en escrow
                    </p>
                    <small style="color: #f39c12;">L'argent sera libéré après confirmation</small>
                </div>
            `);
        } else if (order.status === 'shipped') {
            actions.push(`
                <div style="flex: 1; padding: 15px; background: #ebf5fb; border-radius: 8px; border-left: 4px solid #3498db;">
                    <p style="margin: 0; color: #3498db; font-weight: 600;">
                        <i class="fa-solid fa-truck"></i> Article expédié
                    </p>
                    <small style="color: #3498db;">En attente de confirmation de livraison</small>
                </div>
            `);
        } else if (order.status === 'completed') {
            actions.push(`
                <div style="flex: 1; padding: 15px; background: #e8f6f3; border-radius: 8px; border-left: 4px solid #27ae60;">
                    <p style="margin: 0; color: #27ae60; font-weight: 600;">
                        <i class="fa-solid fa-money-bill-wave"></i> Paiement libéré
                    </p>
                    <small style="color: #27ae60;">Vous avez reçu ${formatPrice(order.amount)}</small>
                </div>
            `);
        }
    }
    
    return actions.join('');
}

// Modale pour ajouter le numéro de suivi
function showShippingModal(transactionId) {
    const modal = document.createElement('div');
    modal.id = 'shippingModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; max-width: 500px; width: 90%; border-radius: 20px; padding: 30px;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fa-solid fa-truck"></i> Marquer comme expédié
            </h3>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                    Numéro de suivi (optionnel)
                </label>
                <input type="text" id="trackingNumber" placeholder="Ex: TRACK123456789" style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                <small style="color: #7f8c8d; display: block; margin-top: 5px;">
                    Le numéro de suivi sera partagé avec l'acheteur
                </small>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="closeShippingModal()" style="flex: 1; padding: 12px; background: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Annuler
                </button>
                <button onclick="confirmShipping('${transactionId}')" style="flex: 1; padding: 12px; background: #3498db; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Confirmer l'expédition
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fermer la modale d'expédition
function closeShippingModal() {
    const modal = document.getElementById('shippingModal');
    if (modal) modal.remove();
}

// Confirmer l'expédition
function confirmShipping(transactionId) {
    const trackingNumber = document.getElementById('trackingNumber')?.value.trim() || 'Non fourni';
    
    if (typeof window.markAsShipped !== 'function') {
        console.error('markAsShipped non disponible');
        alert('Erreur: Fonction de marquage d\'expédition non disponible');
        return;
    }
    
    const result = window.markAsShipped(transactionId, trackingNumber);
    
    if (result) {
        showNotification('✅ Article marqué comme expédié !', 'success');
        
        const modal = document.getElementById('shippingModal');
        if (modal) modal.remove();
        
        if (window.displayOrders) {
            window.displayOrders();
        }
    } else {
        alert('❌ Erreur lors du marquage de l\'expédition');
    }
}

// Ouvrir un litige
function openDispute(transactionId) {
    if (confirm('Voulez-vous vraiment signaler un problème avec cette commande ?')) {
        const reason = prompt('Décrivez le problème :');
        
        if (reason && reason.trim()) {
            let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            const txIndex = transactions.findIndex(t => t.id === transactionId);
            
            if (txIndex !== -1) {
                transactions[txIndex].status = 'disputed';
                transactions[txIndex].disputeReason = reason;
                transactions[txIndex].disputedAt = new Date().toISOString();
                if (!transactions[txIndex].events) transactions[txIndex].events = [];
                transactions[txIndex].events.push({
                    type: 'disputed',
                    description: `Litige ouvert: ${reason}`,
                    timestamp: new Date().toISOString()
                });
                
                localStorage.setItem('transactions', JSON.stringify(transactions));
                
                showNotification('🚨 Litige enregistré. Notre équipe va examiner votre cas.', 'warning');
                displayOrders();
            }
        }
    }
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
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
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
        <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
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

// Fonctions utilitaires
function getStatusColor(status) {
    switch(status) {
        case 'pending': return '#f39c12';
        case 'paid': return '#3498db';
        case 'shipped': return '#9b59b6';
        case 'completed': return '#27ae60';
        case 'disputed': return '#e74c3c';
        case 'refunded': return '#95a5a6';
        default: return '#bdc3c7';
    }
}

function getStatusBadge(status) {
    const color = getStatusColor(status);
    const text = getStatusText(status);
    
    return `
        <span style="background: ${color}; color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
            ${text}
        </span>
    `;
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return 'En attente';
        case 'paid': return 'Payé - En escrow';
        case 'shipped': return 'Expédié';
        case 'completed': return 'Terminé';
        case 'disputed': return 'Litige';
        case 'refunded': return 'Remboursé';
        default: return 'Inconnu';
    }
}

function getSellerName(sellerId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const seller = users.find(u => u.id === sellerId);
    
    if (seller) {
        return `${seller.firstname || ''} ${seller.lastname || ''}`.trim();
    }
    
    return 'Vendeur';
}

function getBuyerName(buyerId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const buyer = users.find(u => u.id === buyerId);
    
    if (buyer) {
        return `${buyer.firstname || ''} ${buyer.lastname || ''}`.trim();
    }
    
    return 'Acheteur';
}

function formatPrice(price) {
    if (!price) return 'Prix non spécifié';
    if (typeof price === 'string' && price.includes('F CFA')) return price;
    const numPrice = parseInt(price);
    if (isNaN(numPrice)) return 'Prix non spécifié';
    return `${numPrice.toLocaleString('fr-FR')} F CFA`;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('ordersContainer')) {
        displayOrders();
    }
});

// Exposer les fonctions globalement
window.displayOrders = displayOrders;
window.confirmShipping = confirmShipping;
window.showShippingModal = showShippingModal;
window.closeShippingModal = closeShippingModal;
window.openDispute = openDispute;
window.deleteOrder = deleteOrder;