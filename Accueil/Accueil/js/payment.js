// payment.js - Système de paiement avec escrow (séquestre) - VERSION CORRIGÉE

/**
 * SYSTÈME DE PAIEMENT AVEC ESCROW
 * 
 * Flux :
 * 1. Acheteur paie → argent bloqué en escrow
 * 2. Vendeur expédie → statut "expédié"
 * 3. Acheteur confirme réception → argent libéré au vendeur
 * 
 * Statuts de transaction :
 * - pending: En attente de paiement
 * - paid: Payé, argent en escrow
 * - shipped: Expédié par le vendeur
 * - completed: Livré, argent libéré
 * - disputed: Litige en cours
 * - refunded: Remboursé
 */

// Structure d'une transaction
class Transaction {
    constructor(articleId, buyerId, sellerId, amount) {
        this.id = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.articleId = articleId;
        this.buyerId = buyerId;
        this.sellerId = sellerId;
        this.amount = amount;
        this.status = 'pending'; // pending, paid, shipped, completed, disputed, refunded
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.escrowAmount = amount; // Montant bloqué
        this.events = []; // Historique des événements
    }
    
    // Note: Cette méthode ne sera pas disponible après JSON.parse
    // On utilise donc une approche fonctionnelle
}

// Fonction utilitaire pour ajouter un événement
function addEventToTransaction(transaction, type, description) {
    transaction.events = transaction.events || [];
    transaction.events.push({
        type: type,
        description: description,
        timestamp: new Date().toISOString()
    });
    transaction.updatedAt = new Date().toISOString();
    return transaction;
}

// Créer une transaction
function createTransaction(articleId, buyerId, sellerId, amount) {
    const transaction = new Transaction(articleId, buyerId, sellerId, amount);
    
    // Ajouter événement initial
    transaction.events.push({
        type: 'created',
        description: 'Transaction créée',
        timestamp: new Date().toISOString()
    });
    
    // Sauvegarder
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    return transaction;
}

// Initialiser le paiement
function initiatePayment(articleId) {
    // Récupérer l'article
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const article = articles.find(a => a.id == articleId);
    
    if (!article) {
        alert('Article non trouvé');
        return null;
    }
    
    if (article.status === 'sold') {
        alert('Cet article a déjà été vendu');
        return null;
    }
    
    // Récupérer l'utilisateur actuel (acheteur)
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        alert('Veuillez vous connecter pour effectuer un achat');
        window.location.href = 'login.html';
        return null;
    }
    
    if (currentUserId === article.userId) {
        alert('Vous ne pouvez pas acheter votre propre article');
        return null;
    }
    
    // Créer la transaction
    const transaction = createTransaction(
        articleId,
        currentUserId,
        article.userId,
        parseInt(article.price)
    );
    
    // Afficher la modale de paiement
    showPaymentModal(transaction, article);
    
    return transaction;
}

// Afficher la modale de paiement
// payment.js - Version avec interface déroulante

// ... [garder le début du fichier jusqu'à showPaymentModal] ...

// Afficher la modale de paiement avec étapes déroulantes
function showPaymentModal(transaction, article) {
    const existingModal = document.querySelector('.payment-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    modal.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(3px);"></div>
        <div style="position: relative; background: white; max-width: 500px; width: 95%; border-radius: 20px; padding: 0; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: slideUp 0.3s ease;">
            <!-- En-tête -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; color: white; position: relative;">
                <button class="close-modal" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; width: 36px; height: 36px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-times"></i>
                </button>
                
                <div style="text-align: center;">
                    <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                        <i class="fa-solid fa-lock" style="font-size: 32px;"></i>
                    </div>
                    <h2 style="margin: 0 0 8px 0; font-size: 24px;">Paiement Sécurisé</h2>
                    <p style="margin: 0; opacity: 0.9; font-size: 14px;">Votre argent est protégé jusqu'à la livraison</p>
                </div>
            </div>
            
            <!-- Indicateur d'étapes -->
            <div style="padding: 20px 25px; background: #f8f9fa; border-bottom: 1px solid #eee;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="text-align: center; flex: 1; position: relative;">
                        <div style="width: 32px; height: 32px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: 600; font-size: 14px;">
                            1
                        </div>
                        <span style="font-size: 12px; color: #667eea; font-weight: 600;">Récapitulatif</span>
                    </div>
                    
                    <div style="flex: 1; height: 2px; background: #ddd; margin: 0 10px;"></div>
                    
                    <div style="text-align: center; flex: 1; position: relative;">
                        <div style="width: 32px; height: 32px; background: #ddd; color: #666; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: 600; font-size: 14px;">
                            2
                        </div>
                        <span style="font-size: 12px; color: #666;">Paiement</span>
                    </div>
                    
                    <div style="flex: 1; height: 2px; background: #ddd; margin: 0 10px;"></div>
                    
                    <div style="text-align: center; flex: 1; position: relative;">
                        <div style="width: 32px; height: 32px; background: #ddd; color: #666; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: 600; font-size: 14px;">
                            3
                        </div>
                        <span style="font-size: 12px; color: #666;">Confirmation</span>
                    </div>
                </div>
            </div>
            
            <!-- Contenu déroulant -->
            <div style="max-height: 500px; overflow-y: auto;">
                <!-- Étape 1: Récapitulatif -->
                <div id="step1" style="padding: 25px; display: block;">
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px;">
                            <i class="fa-solid fa-receipt" style="color: #667eea; margin-right: 10px;"></i>
                            Récapitulatif de commande
                        </h3>
                        
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <div style="width: 60px; height: 60px; background: #eef2ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                    <i class="fa-solid fa-box" style="color: #667eea; font-size: 24px;"></i>
                                </div>
                                <div style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 16px;">${article.title}</h4>
                                    <p style="margin: 0; color: #7f8c8d; font-size: 14px;">${article.category || 'Article'}</p>
                                </div>
                            </div>
                            
                            <div style="border-top: 1px solid #eee; padding-top: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: #7f8c8d;">Prix de l'article :</span>
                                    <span style="color: #2c3e50; font-weight: 500;">${formatPrice(article.price)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="color: #7f8c8d;">Frais de protection :</span>
                                    <span style="color: #2c3e50; font-weight: 500;">0 F CFA</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-top: 10px; padding-top: 10px; border-top: 2px solid #eee;">
                                    <span style="color: #2c3e50;">Total à payer :</span>
                                    <span style="color: #e74c3c;">${formatPrice(article.price)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #e8f6f3; padding: 15px; border-radius: 10px; border-left: 4px solid #27ae60;">
                            <div style="display: flex; align-items: start;">
                                <i class="fa-solid fa-shield-halved" style="color: #27ae60; font-size: 20px; margin-right: 10px; margin-top: 2px;"></i>
                                <div>
                                    <p style="margin: 0 0 5px 0; color: #27ae60; font-weight: 600;">
                                        Paiement 100% sécurisé
                                    </p>
                                    <p style="margin: 0; color: #27ae60; font-size: 13px;">
                                        Votre argent est bloqué sur notre plateforme et ne sera versé au vendeur qu'après réception de votre commande.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button id="nextToStep2" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <i class="fa-solid fa-credit-card"></i> Continuer vers le paiement
                    </button>
                </div>
                
                <!-- Étape 2: Méthode de paiement -->
                <div id="step2" style="padding: 25px; display: none;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">
                        <i class="fa-solid fa-credit-card" style="color: #667eea; margin-right: 10px;"></i>
                        Choisissez votre méthode de paiement
                    </h3>
                    
                    <div style="margin-bottom: 25px;">
                        <!-- Option Mobile Money -->
                        <div class="payment-option" data-method="momo" style="background: #f8f9fa; border: 2px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s ease;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #FF9900 0%, #FF6600 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                        <i class="fa-solid fa-mobile-screen" style="color: white; font-size: 24px;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">Mobile Money</h4>
                                        <p style="margin: 0; color: #7f8c8d; font-size: 14px;">MTN, Orange Money</p>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-right" style="color: #7f8c8d;"></i>
                            </div>
                        </div>
                        
                        <!-- Option Carte bancaire -->
                        <div class="payment-option" data-method="card" style="background: #f8f9fa; border: 2px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 15px; cursor: pointer; transition: all 0.3s ease;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                        <i class="fa-solid fa-credit-card" style="color: white; font-size: 24px;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">Carte bancaire</h4>
                                        <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Visa, Mastercard</p>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-right" style="color: #7f8c8d;"></i>
                            </div>
                        </div>
                        
                        <!-- Option PayPal -->
                        <div class="payment-option" data-method="paypal" style="background: #f8f9fa; border: 2px solid #ddd; border-radius: 10px; padding: 20px; cursor: pointer; transition: all 0.3s ease;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #0070ba 0%, #1546a0 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                        <i class="fa-brands fa-paypal" style="color: white; font-size: 24px;"></i>
                                    </div>
                                    <div>
                                        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">PayPal</h4>
                                        <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Paiement international</p>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-right" style="color: #7f8c8d;"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button id="backToStep1" style="flex: 1; padding: 14px; background: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-arrow-left"></i> Retour
                        </button>
                        <button id="confirmPaymentMethod" style="flex: 2; padding: 14px; background: #ddd; color: #666; border: none; border-radius: 10px; font-weight: 600; cursor: not-allowed;" disabled>
                            Continuer <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Étape 3: Détails du paiement (Mobile Money) -->
                <div id="step3-momo" style="padding: 25px; display: none;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">
                        <i class="fa-solid fa-mobile-screen" style="color: #FF9900; margin-right: 10px;"></i>
                        Paiement Mobile Money
                    </h3>
                    
                    <div style="margin-bottom: 25px;">
                        <div style="background: #fff8e1; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <i class="fa-solid fa-circle-info" style="color: #FF9900; font-size: 20px; margin-right: 10px;"></i>
                                <p style="margin: 0; color: #ff8f00; font-weight: 500;">
                                    Vous allez recevoir une demande de paiement sur votre téléphone
                                </p>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                                <i class="fa-solid fa-phone"></i> Numéro de téléphone *
                            </label>
                            <input type="tel" id="momoPhone" placeholder="+237 6XX XX XX XX" style="width: 100%; padding: 14px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                                <i class="fa-solid fa-network-wired"></i> Opérateur *
                            </label>
                            <div style="display: flex; gap: 10px;">
                                <div class="operator-option" data-operator="mtn" style="flex: 1; text-align: center; padding: 15px; background: #f8f9fa; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ffcc00 0%, #ff9900 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                                        <span style="color: white; font-weight: 700; font-size: 14px;">M</span>
                                    </div>
                                    <span style="color: #2c3e50; font-weight: 600;">MTN</span>
                                </div>
                                <div class="operator-option" data-operator="orange" style="flex: 1; text-align: center; padding: 15px; background: #f8f9fa; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ff6600 0%, #ff3300 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                                        <span style="color: white; font-weight: 700; font-size: 14px;">O</span>
                                    </div>
                                    <span style="color: #2c3e50; font-weight: 600;">Orange</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                            <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px;">
                                <i class="fa-solid fa-circle-check" style="color: #27ae60; margin-right: 8px;"></i>
                                Récapitulatif
                            </h4>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #7f8c8d;">Montant :</span>
                                <span style="color: #2c3e50; font-weight: 600;">${formatPrice(article.price)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #7f8c8d;">Frais :</span>
                                <span style="color: #27ae60; font-weight: 600;">0 F CFA</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button id="backToStep2" style="flex: 1; padding: 14px; background: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-arrow-left"></i> Retour
                        </button>
                        <button id="processMomoPayment" style="flex: 2; padding: 14px; background: #FF9900; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="fa-solid fa-paper-plane"></i> Envoyer la demande
                        </button>
                    </div>
                </div>
                
                <!-- Étape 3: Détails du paiement (Carte) -->
                <div id="step3-card" style="padding: 25px; display: none;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">
                        <i class="fa-solid fa-credit-card" style="color: #1a73e8; margin-right: 10px;"></i>
                        Informations de carte bancaire
                    </h3>
                    
                    <div style="margin-bottom: 25px;">
                        <div style="background: #e8f0fe; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center;">
                                <i class="fa-solid fa-shield-halved" style="color: #1a73e8; font-size: 20px; margin-right: 10px;"></i>
                                <p style="margin: 0; color: #1a73e8; font-weight: 500;">
                                    Vos informations sont cryptées et sécurisées
                                </p>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                                <i class="fa-solid fa-credit-card"></i> Numéro de carte *
                            </label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" style="width: 100%; padding: 14px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                                    Date d'expiration *
                                </label>
                                <input type="text" id="cardExpiry" placeholder="MM/AA" maxlength="5" style="width: 100%; padding: 14px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                                    Code CVV *
                                </label>
                                <input type="password" id="cardCVV" placeholder="123" maxlength="3" style="width: 100%; padding: 14px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #2c3e50; font-weight: 500;">
                                <i class="fa-solid fa-user"></i> Nom sur la carte *
                            </label>
                            <input type="text" id="cardName" placeholder="JEAN DUPONT" style="width: 100%; padding: 14px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button id="backToStep2FromCard" style="flex: 1; padding: 14px; background: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-arrow-left"></i> Retour
                        </button>
                        <button id="processCardPayment" style="flex: 2; padding: 14px; background: #1a73e8; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="fa-solid fa-lock"></i> Payer ${formatPrice(article.price)}
                        </button>
                    </div>
                </div>
                
                <!-- Étape 3: Détails du paiement (PayPal) -->
                <div id="step3-paypal" style="padding: 25px; display: none;">
                    <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 18px;">
                        <i class="fa-brands fa-paypal" style="color: #0070ba; margin-right: 10px;"></i>
                        Paiement avec PayPal
                    </h3>
                    
                    <div style="text-align: center; padding: 30px 20px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0070ba 0%, #1546a0 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i class="fa-brands fa-paypal" style="color: white; font-size: 40px;"></i>
                        </div>
                        
                        <h4 style="color: #2c3e50; margin-bottom: 10px;">Redirection vers PayPal</h4>
                        <p style="color: #7f8c8d; margin-bottom: 25px; line-height: 1.5;">
                            Vous serez redirigé vers le site sécurisé de PayPal pour finaliser votre paiement de <strong>${formatPrice(article.price)}</strong>.
                        </p>
                        
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span style="color: #7f8c8d;">Article :</span>
                                <span style="color: #2c3e50; font-weight: 500;">${article.title}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #7f8c8d;">Montant :</span>
                                <span style="color: #e74c3c; font-weight: 700;">${formatPrice(article.price)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button id="backToStep2FromPaypal" style="flex: 1; padding: 14px; background: #f8f9fa; color: #2c3e50; border: 2px solid #ddd; border-radius: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fa-solid fa-arrow-left"></i> Retour
                        </button>
                        <button id="processPaypalPayment" style="flex: 2; padding: 14px; background: #0070ba; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <i class="fa-brands fa-paypal"></i> Payer avec PayPal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialiser l'interface déroulante
    initPaymentModal(transaction, article, modal);
}

// Initialiser l'interface de paiement déroulante
function initPaymentModal(transaction, article, modal) {
    let selectedMethod = null;
    let selectedOperator = null;
    
    // Fermer la modale
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    
    // Étape 1 -> Étape 2
    const nextToStep2 = modal.querySelector('#nextToStep2');
    nextToStep2.addEventListener('click', function() {
        modal.querySelector('#step1').style.display = 'none';
        modal.querySelector('#step2').style.display = 'block';
        
        // Mettre à jour l'indicateur d'étapes
        updateStepIndicator(2);
    });
    
    // Sélectionner une méthode de paiement
    const paymentOptions = modal.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Retirer la sélection de toutes les options
            paymentOptions.forEach(opt => {
                opt.style.borderColor = '#ddd';
                opt.style.background = '#f8f9fa';
            });
            
            // Sélectionner cette option
            this.style.borderColor = '#667eea';
            this.style.background = '#eef2ff';
            
            selectedMethod = this.dataset.method;
            
            // Activer le bouton continuer
            const confirmBtn = modal.querySelector('#confirmPaymentMethod');
            confirmBtn.disabled = false;
            confirmBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            confirmBtn.style.color = 'white';
            confirmBtn.style.cursor = 'pointer';
        });
    });
    
    // Étape 2 -> Étape 3 (selon la méthode)
    const confirmPaymentMethod = modal.querySelector('#confirmPaymentMethod');
    confirmPaymentMethod.addEventListener('click', function() {
        if (!selectedMethod) return;
        
        modal.querySelector('#step2').style.display = 'none';
        
        // Afficher l'étape correspondante à la méthode
        if (selectedMethod === 'momo') {
            modal.querySelector('#step3-momo').style.display = 'block';
        } else if (selectedMethod === 'card') {
            modal.querySelector('#step3-card').style.display = 'block';
        } else if (selectedMethod === 'paypal') {
            modal.querySelector('#step3-paypal').style.display = 'block';
        }
        
        // Mettre à jour l'indicateur d'étapes
        updateStepIndicator(3);
    });
    
    // Retour de l'étape 2 à l'étape 1
    modal.querySelector('#backToStep1').addEventListener('click', function() {
        modal.querySelector('#step2').style.display = 'none';
        modal.querySelector('#step1').style.display = 'block';
        
        // Mettre à jour l'indicateur d'étapes
        updateStepIndicator(1);
    });
    
    // Retours depuis les étapes 3
    modal.querySelector('#backToStep2').addEventListener('click', function() {
        modal.querySelector('#step3-momo').style.display = 'none';
        modal.querySelector('#step2').style.display = 'block';
        
        // Mettre à jour l'indicateur d'étapes
        updateStepIndicator(2);
    });
    
    modal.querySelector('#backToStep2FromCard').addEventListener('click', function() {
        modal.querySelector('#step3-card').style.display = 'none';
        modal.querySelector('#step2').style.display = 'block';
        
        // Mettre à jour l'indicateur d'étapes
        updateStepIndicator(2);
    });
    
    modal.querySelector('#backToStep2FromPaypal').addEventListener('click', function() {
        modal.querySelector('#step3-paypal').style.display = 'none';
        modal.querySelector('#step2').style.display = 'block';
        
        // Mettre à jour l'indicateur d'étapes
        updateStepIndicator(2);
    });
    
    // Sélectionner un opérateur Mobile Money
    const operatorOptions = modal.querySelectorAll('.operator-option');
    operatorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Retirer la sélection de tous les opérateurs
            operatorOptions.forEach(opt => {
                opt.style.borderColor = '#ddd';
                opt.style.background = '#f8f9fa';
            });
            
            // Sélectionner cet opérateur
            this.style.borderColor = '#FF9900';
            this.style.background = '#fff8e1';
            
            selectedOperator = this.dataset.operator;
        });
    });
    
    // Traiter le paiement Mobile Money
    modal.querySelector('#processMomoPayment').addEventListener('click', function() {
        const phone = modal.querySelector('#momoPhone').value.trim();
        
        if (!phone) {
            alert('Veuillez entrer votre numéro de téléphone');
            return;
        }
        
        if (!selectedOperator) {
            alert('Veuillez sélectionner votre opérateur');
            return;
        }
        
        // Désactiver le bouton pendant le traitement
        this.disabled = true;
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Traitement en cours...';
        
        // Simuler le paiement
        setTimeout(() => {
            processPayment(transaction, article, 'momo');
            modal.remove();
        }, 2000);
    });
    
    // Traiter le paiement par carte
    modal.querySelector('#processCardPayment').addEventListener('click', function() {
        const cardNumber = modal.querySelector('#cardNumber').value.trim();
        const cardExpiry = modal.querySelector('#cardExpiry').value.trim();
        const cardCVV = modal.querySelector('#cardCVV').value.trim();
        const cardName = modal.querySelector('#cardName').value.trim();
        
        if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        // Validation basique
        if (cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Numéro de carte invalide (16 chiffres requis)');
            return;
        }
        
        if (cardCVV.length !== 3) {
            alert('Code CVV invalide (3 chiffres requis)');
            return;
        }
        
        // Désactiver le bouton pendant le traitement
        this.disabled = true;
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Traitement en cours...';
        
        // Simuler le paiement
        setTimeout(() => {
            processPayment(transaction, article, 'card');
            modal.remove();
        }, 2000);
    });
    
    // Traiter le paiement PayPal
    modal.querySelector('#processPaypalPayment').addEventListener('click', function() {
        // Désactiver le bouton pendant le traitement
        this.disabled = true;
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirection...';
        
        // Simuler la redirection PayPal
        setTimeout(() => {
            processPayment(transaction, article, 'paypal');
            modal.remove();
        }, 1500);
    });
    
    // Mettre à jour l'indicateur d'étapes
    function updateStepIndicator(step) {
        const indicators = modal.querySelectorAll('.payment-modal > div > div:nth-child(2) > div > div');
        indicators.forEach((indicator, index) => {
            const circle = indicator.querySelector('div');
            const text = indicator.querySelector('span');
            
            if (index + 1 <= step) {
                // Étape active ou passée
                circle.style.background = '#667eea';
                circle.style.color = 'white';
                text.style.color = '#667eea';
                text.style.fontWeight = '600';
            } else {
                // Étape future
                circle.style.background = '#ddd';
                circle.style.color = '#666';
                text.style.color = '#666';
                text.style.fontWeight = 'normal';
            }
        });
    }
}

// ... [le reste des fonctions reste inchangé] ...

// Traiter le paiement
function processPayment(transaction, article, paymentMethod) {
    // Simuler le paiement
    showLoadingModal('Traitement du paiement en cours...');
    
    setTimeout(() => {
        // Mettre à jour la transaction
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const txIndex = transactions.findIndex(t => t.id === transaction.id);
        
        if (txIndex !== -1) {
            transactions[txIndex].status = 'paid';
            transactions[txIndex].paymentMethod = paymentMethod;
            transactions[txIndex].paidAt = new Date().toISOString();
            
            // Ajouter événement
            transactions[txIndex].events = transactions[txIndex].events || [];
            transactions[txIndex].events.push({
                type: 'payment_received',
                description: 'Paiement reçu et bloqué en escrow',
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }
        
        // Créer une notification pour le vendeur
        createNotification(article.userId, 'new_order', `Nouvelle commande pour "${article.title}"`, article.id);
        
        hideLoadingModal();
        showSuccessModal(transaction, article);
    }, 2000);
}

// Modale de succès
function showSuccessModal(transaction, article) {
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.7);
    `;
    
    modal.innerHTML = `
        <div style="position: relative; background: white; max-width: 500px; width: 90%; border-radius: 20px; padding: 40px; text-align: center;">
            <div style="width: 80px; height: 80px; background: #27ae60; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; animation: scaleIn 0.5s ease;">
                <i class="fa-solid fa-check" style="font-size: 40px; color: white;"></i>
            </div>
            
            <h2 style="color: #2c3e50; margin-bottom: 10px;">Paiement Confirmé !</h2>
            <p style="color: #7f8c8d; margin-bottom: 25px;">Votre argent est en sécurité dans notre système d'escrow</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: left;">
                <h4 style="color: #2c3e50; margin-bottom: 15px;">Prochaines étapes :</h4>
                <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 30px; height: 30px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span style="color: white; font-weight: 600;">1</span>
                    </div>
                    <div>
                        <strong style="color: #2c3e50; display: block; margin-bottom: 3px;">Le vendeur expédie l'article</strong>
                        <small style="color: #7f8c8d;">Vous recevrez une notification avec le suivi</small>
                    </div>
                </div>
                <div style="display: flex; align-items: start; gap: 15px; margin-bottom: 12px;">
                    <div style="width: 30px; height: 30px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span style="color: white; font-weight: 600;">2</span>
                    </div>
                    <div>
                        <strong style="color: #2c3e50; display: block; margin-bottom: 3px;">Vous recevez l'article</strong>
                        <small style="color: #7f8c8d;">Vérifiez que tout est conforme</small>
                    </div>
                </div>
                <div style="display: flex; align-items: start; gap: 15px;">
                    <div style="width: 30px; height: 30px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span style="color: white; font-weight: 600;">3</span>
                    </div>
                    <div>
                        <strong style="color: #2c3e50; display: block; margin-bottom: 3px;">Confirmez la réception</strong>
                        <small style="color: #7f8c8d;">L'argent sera libéré au vendeur</small>
                    </div>
                </div>
            </div>
            
            <button onclick="window.location.href='dashboard.html'" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">
                Voir mes commandes
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => modal.remove(), 10000); // Auto-fermer après 10s
}

// Vendeur expédie l'article - VERSION CORRIGÉE
function markAsShipped(transactionId, trackingNumber) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const txIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (txIndex !== -1) {
        if (transactions[txIndex].status !== 'paid') {
            alert('Cette transaction n\'est pas encore payée');
            return false;
        }
        
        transactions[txIndex].status = 'shipped';
        transactions[txIndex].trackingNumber = trackingNumber;
        transactions[txIndex].shippedAt = new Date().toISOString();
        
        // CORRECTION ICI : Ajouter événement correctement
        transactions[txIndex].events = transactions[txIndex].events || [];
        transactions[txIndex].events.push({
            type: 'shipped',
            description: `Article expédié. Suivi: ${trackingNumber}`,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Notifier l'acheteur
        createNotification(
            transactions[txIndex].buyerId, 
            'shipped', 
            'Votre colis a été expédié !',
            transactions[txIndex].articleId
        );
        
        return true;
    }
    
    return false;
}

// Acheteur confirme la réception - VERSION CORRIGÉE
function confirmDelivery(transactionId) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const txIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (txIndex !== -1) {
        if (transactions[txIndex].status !== 'shipped') {
            alert('L\'article n\'a pas encore été expédié');
            return false;
        }
        
        transactions[txIndex].status = 'completed';
        transactions[txIndex].completedAt = new Date().toISOString();
        
        // CORRECTION ICI : Ajouter événement correctement
        transactions[txIndex].events = transactions[txIndex].events || [];
        transactions[txIndex].events.push({
            type: 'completed',
            description: 'Livraison confirmée. Argent libéré au vendeur.',
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Marquer l'article comme vendu
        let articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const articleIndex = articles.findIndex(a => a.id == transactions[txIndex].articleId);
        
        if (articleIndex !== -1) {
            articles[articleIndex].status = 'sold';
            articles[articleIndex].soldAt = new Date().toISOString();
            articles[articleIndex].soldTo = transactions[txIndex].buyerId;
            localStorage.setItem('secondHandArticles', JSON.stringify(articles));
        }
        
        // Notifier le vendeur
        createNotification(
            transactions[txIndex].sellerId,
            'payment_released',
            'Paiement libéré ! L\'acheteur a confirmé la réception.',
            transactions[txIndex].articleId
        );
        
        return true;
    }
    
    return false;
}

// Créer une notification
function createNotification(userId, type, message, articleId) {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    notifications.push({
        id: 'notif_' + Date.now(),
        userId: userId,
        type: type,
        message: message,
        articleId: articleId,
        read: false,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Modales utilitaires
function showLoadingModal(message) {
    const modal = document.createElement('div');
    modal.id = 'loadingModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.7);
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center;">
            <div style="width: 60px; height: 60px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
            <p style="color: #2c3e50; font-weight: 600;">${message}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ajouter l'animation
    if (!document.getElementById('spinAnimation')) {
        const style = document.createElement('style');
        style.id = 'spinAnimation';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    if (modal) modal.remove();
}

// Utilitaire
function formatPrice(price) {
    if (!price) return 'Prix non spécifié';
    if (typeof price === 'string' && price.includes('F CFA')) return price;
    const numPrice = parseInt(price);
    if (isNaN(numPrice)) return 'Prix non spécifié';
    return `${numPrice.toLocaleString('fr-FR')} F CFA`;
}

// Exposer les fonctions globalement
window.initiatePayment = initiatePayment;
window.markAsShipped = markAsShipped;
window.confirmDelivery = confirmDelivery;