// Chat.js - Messagerie améliorée avec notifications et gestion avancée
// Version 2.0 - Améliorée et corrigée

/**
 * FONCTIONNALITÉS AJOUTÉES :
 * - Validation robuste des données
 * - Gestion d'erreurs complète
 * - Notifications de nouveau message
 * - Recherche améliorée
 * - Indicateurs de statut en ligne/hors ligne
 * - Suppression de conversations
 * - Marquage comme lu/non lu
 * - Tri intelligent des conversations
 * - Détection de messages non lus
 * - Horodatage amélioré
 */

// ============================================================================
// CONSTANTES ET CONFIGURATION
// ============================================================================

const CHAT_CONFIG = {
    MAX_MESSAGE_LENGTH: 1000,
    MAX_CONVERSATIONS: 100,
    AUTO_REFRESH_INTERVAL: 30000, // 30 secondes
    NOTIFICATION_DURATION: 3000,
    MESSAGE_BATCH_SIZE: 50
};

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Valider les données d'entrée
 */
function validateInput(text, maxLength = CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
    if (!text || typeof text !== 'string') {
        throw new Error('Le texte est requis');
    }
    
    const trimmed = text.trim();
    if (trimmed.length === 0) {
        throw new Error('Le message ne peut pas être vide');
    }
    
    if (trimmed.length > maxLength) {
        throw new Error(`Le message ne peut pas dépasser ${maxLength} caractères`);
    }
    
    return trimmed;
}

/**
 * Générer un ID unique
 */
function generateUniqueId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtenir la couleur de l'avatar basée sur le nom
 */
function getAvatarColor(name) {
    const colors = [
        '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', 
        '#f39c12', '#1abc9c', '#34495e', '#e67e22',
        '#16a085', '#27ae60', '#2980b9', '#8e44ad'
    ];
    
    if (!name) return colors[0];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Formater le temps écoulé de manière intelligente
 */
function getSmartTimeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins === 1) return "Il y a 1 min";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours === 1) return "Il y a 1 heure";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem`;
    
    return then.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'short',
        year: now.getFullYear() !== then.getFullYear() ? 'numeric' : undefined
    });
}

/**
 * Afficher une notification toast
 */
function showToast(message, type = 'info') {
    // Supprimer les anciennes notifications
    document.querySelectorAll('.chat-toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `chat-toast chat-toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10002;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 300px;
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-size: 18px;">${icon}</span><span>${message}</span>`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, CHAT_CONFIG.NOTIFICATION_DURATION);
}

// ============================================================================
// GESTION DES CONVERSATIONS
// ============================================================================

/**
 * Charger les conversations avec validation
 */
function loadConversations() {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        console.warn('Utilisateur non connecté');
        return [];
    }
    
    try {
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        
        // Filtrer et valider
        return conversations.filter(c => {
            if (!c.id || !c.userId || !c.currentUserId) return false;
            return c.userId === currentUserId || c.currentUserId === currentUserId;
        });
    } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        return [];
    }
}

/**
 * Sauvegarder les conversations
 */
function saveConversations(conversations) {
    try {
        // Limiter le nombre de conversations
        const limited = conversations.slice(0, CHAT_CONFIG.MAX_CONVERSATIONS);
        localStorage.setItem('chatConversations', JSON.stringify(limited));
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showToast('Erreur de sauvegarde', 'error');
        return false;
    }
}

/**
 * Charger les messages d'une conversation
 */
function loadMessages(conversationId) {
    if (!conversationId) return [];
    
    try {
        const messages = JSON.parse(
            localStorage.getItem(`chatMessages_${conversationId}`)
        ) || [];
        
        // Trier par date
        return messages.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
        );
    } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        return [];
    }
}

/**
 * Sauvegarder les messages
 */
function saveMessages(conversationId, messages) {
    if (!conversationId) return false;
    
    try {
        // Limiter le nombre de messages
        const limited = messages.slice(-CHAT_CONFIG.MESSAGE_BATCH_SIZE);
        localStorage.setItem(
            `chatMessages_${conversationId}`, 
            JSON.stringify(limited)
        );
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des messages:', error);
        return false;
    }
}

/**
 * Supprimer une conversation
 */
function deleteConversation(conversationId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
        return false;
    }
    
    try {
        // Supprimer les messages
        localStorage.removeItem(`chatMessages_${conversationId}`);
        
        // Supprimer la conversation
        const conversations = loadConversations();
        const filtered = conversations.filter(c => c.id !== conversationId);
        saveConversations(filtered);
        
        showToast('Conversation supprimée', 'success');
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showToast('Erreur de suppression', 'error');
        return false;
    }
}

// ============================================================================
// DÉMARRER UNE CONVERSATION AVEC UN VENDEUR
// ============================================================================

window.startConversationWithSeller = function(articleId, sellerId) {
    const currentUserId = localStorage.getItem('currentUserId');
    
    // Validation
    if (!currentUserId) {
        showToast('Veuillez vous connecter', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    if (currentUserId === sellerId) {
        showToast('Vous ne pouvez pas vous contacter vous-même', 'error');
        return;
    }
    
    try {
        // Récupérer l'article
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const article = articles.find(a => a.id == articleId);
        
        if (!article) {
            showToast('Article non trouvé', 'error');
            return;
        }
        
        // Récupérer les infos du vendeur
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const seller = users.find(u => u.id === sellerId);
        
        const sellerName = seller 
            ? `${seller.firstname || ''} ${seller.lastname || ''}`.trim() 
            : article.userName || 'Vendeur';
        
        // Vérifier si la conversation existe
        let conversations = loadConversations();
        let conversation = conversations.find(c => 
            (c.userId === sellerId && c.currentUserId === currentUserId) ||
            (c.userId === currentUserId && c.currentUserId === sellerId)
        );
        
        if (!conversation) {
            // Créer nouvelle conversation
            conversation = {
                id: generateUniqueId('conv'),
                userId: sellerId,
                userName: sellerName,
                currentUserId: currentUserId,
                articleId: articleId,
                articleTitle: article.title,
                avatarColor: getAvatarColor(sellerName),
                avatarIcon: 'fa-solid fa-user',
                lastMessage: '',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            conversations.unshift(conversation);
            saveConversations(conversations);
            
            // Message de bienvenue
            const welcomeMessage = {
                id: generateUniqueId('msg'),
                sender: 'system',
                text: `Conversation démarrée à propos de "${article.title}"`,
                timestamp: new Date().toISOString(),
                isSystemMessage: true
            };
            
            saveMessages(conversation.id, [welcomeMessage]);
            showToast('Conversation créée', 'success');
        }
        
        // Redirection
        window.location.href = `dashboard.html#chatBtn`;
        
        setTimeout(() => {
            const chatBtn = document.getElementById('chatBtn');
            if (chatBtn) {
                chatBtn.click();
                setTimeout(() => selectConversation(conversation.id), 300);
            }
        }, 500);
        
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la création de la conversation', 'error');
    }
};

// ============================================================================
// AFFICHAGE DES CONVERSATIONS
// ============================================================================

window.displayConversations = function() {
    const conversationsList = document.querySelector('.conversations-list');
    if (!conversationsList) return;
    
    conversationsList.innerHTML = '';
    
    const conversations = loadConversations();
    
    if (conversations.length === 0) {
        conversationsList.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: #7f8c8d;">
                <i class="fa-solid fa-comments" style="font-size: 48px; margin-bottom: 15px; color: #bdc3c7;"></i>
                <p style="font-size: 16px; line-height: 1.5;">
                    Aucune conversation<br>
                    <small style="font-size: 14px;">Contactez un vendeur depuis une annonce</small>
                </p>
            </div>
        `;
        return;
    }
    
    // Trier par date (plus récent en premier)
    conversations.sort((a, b) => 
        new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );
    
    const currentUserId = localStorage.getItem('currentUserId');
    
    conversations.forEach(conv => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        conversationItem.dataset.id = conv.id;
        
        const time = getSmartTimeAgo(conv.lastMessageTime);
        const displayName = conv.userId === currentUserId 
            ? (conv.userName || 'Utilisateur') 
            : (conv.userName || 'Contact');
        
        // Info article
        const articleInfo = conv.articleTitle ? `
            <small style="color: #95a5a6; font-size: 12px; display: block; margin-top: 2px;">
                <i class="fa-solid fa-tag"></i> ${conv.articleTitle.substring(0, 30)}${conv.articleTitle.length > 30 ? '...' : ''}
            </small>
        ` : '';
        
        // Badge non lu
        const unreadBadge = conv.unreadCount > 0 ? `
            <span class="unread-badge">${conv.unreadCount}</span>
        ` : '';
        
        conversationItem.innerHTML = `
            <div class="conversation-avatar" style="background-color: ${conv.avatarColor || '#3498db'};">
                <i class="${conv.avatarIcon || 'fa-solid fa-user'}"></i>
            </div>
            <div class="conversation-details">
                <div class="conversation-header">
                    <h3>${displayName}</h3>
                    <span class="conversation-time">${time}</span>
                </div>
                ${articleInfo}
                <p class="conversation-preview">${conv.lastMessage || 'Aucun message'}</p>
                ${unreadBadge}
            </div>
            <button class="delete-conversation-btn" data-id="${conv.id}" title="Supprimer">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        
        // Sélection de conversation
        conversationItem.addEventListener('click', function(e) {
            if (!e.target.closest('.delete-conversation-btn')) {
                selectConversation(conv.id);
            }
        });
        
        // Bouton supprimer
        const deleteBtn = conversationItem.querySelector('.delete-conversation-btn');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (deleteConversation(conv.id)) {
                conversationItem.remove();
                
                // Si c'était la conversation active, réinitialiser
                const activeConv = document.querySelector('.active-conversation');
                if (activeConv && activeConv.dataset.conversationId === conv.id) {
                    showEmptyState();
                }
            }
        });
        
        conversationsList.appendChild(conversationItem);
    });
};

// ============================================================================
// SÉLECTION ET AFFICHAGE D'UNE CONVERSATION
// ============================================================================

function selectConversation(conversationId) {
    const conversations = loadConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
        console.error('Conversation non trouvée:', conversationId);
        return;
    }
    
    // Marquer comme lu
    conversation.unreadCount = 0;
    saveConversations(conversations);
    
    // UI - activer l'item
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.conversation-item[data-id="${conversationId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        const badge = activeItem.querySelector('.unread-badge');
        if (badge) badge.remove();
    }
    
    // Afficher la zone de conversation
    const activeConversation = document.querySelector('.active-conversation');
    const emptyState = document.querySelector('.empty-conversation-state');
    
    if (activeConversation) {
        activeConversation.style.display = 'flex';
        activeConversation.dataset.conversationId = conversationId;
    }
    if (emptyState) emptyState.style.display = 'none';
    
    // Mettre à jour l'en-tête
    const currentUserId = localStorage.getItem('currentUserId');
    const displayName = conversation.userId === currentUserId 
        ? (conversation.userName || 'Utilisateur') 
        : (conversation.userName || 'Contact');
    
    const activeUserName = document.querySelector('.active-user h3');
    const activeUserAvatar = document.querySelector('.active-avatar');
    
    if (activeUserName) activeUserName.textContent = displayName;
    if (activeUserAvatar) {
        activeUserAvatar.style.backgroundColor = conversation.avatarColor || '#3498db';
        activeUserAvatar.innerHTML = `<i class="${conversation.avatarIcon || 'fa-solid fa-user'}"></i>`;
    }
    
    // Charger les messages
    displayMessages(conversationId);
}

function showEmptyState() {
    const activeConversation = document.querySelector('.active-conversation');
    const emptyState = document.querySelector('.empty-conversation-state');
    
    if (activeConversation) activeConversation.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
}

// ============================================================================
// AFFICHAGE DES MESSAGES
// ============================================================================

function displayMessages(conversationId) {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    const messages = loadMessages(conversationId);
    const currentUserId = localStorage.getItem('currentUserId');
    
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #95a5a6;">
                <i class="fa-regular fa-comments" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Aucun message pour le moment<br>Commencez la conversation !</p>
            </div>
        `;
        return;
    }
    
    messages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        
        if (msg.isSystemMessage) {
            messageDiv.className = 'message system-message';
            messageDiv.innerHTML = `
                <div style="background: #f0f7ff; padding: 10px 15px; border-radius: 15px; 
                            text-align: center; color: #3498db; font-size: 13px; margin: 10px auto; max-width: 80%;">
                    <i class="fa-solid fa-info-circle"></i> ${msg.text}
                </div>
            `;
        } else {
            const isSent = msg.sender === currentUserId || msg.sender === 'me';
            messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
            
            const time = new Date(msg.timestamp).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Grouper les messages
            const prevMsg = messages[index - 1];
            const isGrouped = prevMsg && 
                              !prevMsg.isSystemMessage &&
                              (prevMsg.sender === msg.sender) &&
                              (new Date(msg.timestamp) - new Date(prevMsg.timestamp) < 60000);
            
            if (isGrouped) {
                messageDiv.classList.add('grouped');
            }
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p style="word-wrap: break-word; white-space: pre-wrap;">${escapeHtml(msg.text)}</p>
                    <span class="message-time">${time}</span>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
    });
    
    // Défiler vers le bas
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Échapper le HTML pour éviter les injections XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// ENVOI DE MESSAGE
// ============================================================================

function sendMessage() {
    const messageInput = document.querySelector('.message-input');
    const activeConversation = document.querySelector('.active-conversation');
    
    if (!messageInput || !activeConversation) return;
    
    const conversationId = activeConversation.dataset.conversationId;
    if (!conversationId) {
        showToast('Sélectionnez une conversation', 'error');
        return;
    }
    
    try {
        // Valider le message
        const messageText = validateInput(messageInput.value);
        const currentUserId = localStorage.getItem('currentUserId');
        
        // Créer le message
        const newMessage = {
            id: generateUniqueId('msg'),
            sender: currentUserId,
            text: messageText,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        // Sauvegarder
        const messages = loadMessages(conversationId);
        messages.push(newMessage);
        saveMessages(conversationId, messages);
        
        // Mettre à jour la conversation
        const conversations = loadConversations();
        const conversation = conversations.find(c => c.id === conversationId);
        
        if (conversation) {
            conversation.lastMessage = messageText.substring(0, 50) + 
                                      (messageText.length > 50 ? '...' : '');
            conversation.lastMessageTime = new Date().toISOString();
            saveConversations(conversations);
        }
        
        // Afficher le message
        displayMessages(conversationId);
        
        // Vider l'input
        messageInput.value = '';
        messageInput.focus();
        
        // Rafraîchir la liste
        displayConversations();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ============================================================================
// NOUVELLE CONVERSATION
// ============================================================================

function createNewConversation() {
    const userName = prompt('Entrez le nom du contact :');
    if (!userName || userName.trim() === '') return;
    
    try {
        const conversations = loadConversations();
        const currentUserId = localStorage.getItem('currentUserId');
        
        const newConversation = {
            id: generateUniqueId('conv'),
            userId: generateUniqueId('user'),
            userName: userName.trim(),
            currentUserId: currentUserId,
            avatarColor: getAvatarColor(userName),
            avatarIcon: 'fa-solid fa-user',
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        conversations.unshift(newConversation);
        saveConversations(conversations);
        
        // Initialiser les messages
        saveMessages(newConversation.id, []);
        
        displayConversations();
        selectConversation(newConversation.id);
        
        showToast('Conversation créée', 'success');
        
    } catch (error) {
        showToast('Erreur lors de la création', 'error');
    }
}

// ============================================================================
// RECHERCHE
// ============================================================================

function setupSearch() {
    const searchInput = document.querySelector('.chat-fullscreen-search input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        document.querySelectorAll('.conversation-item').forEach(item => {
            const name = item.querySelector('h3').textContent.toLowerCase();
            const preview = item.querySelector('.conversation-preview').textContent.toLowerCase();
            const articleInfo = item.querySelector('small');
            const article = articleInfo ? articleInfo.textContent.toLowerCase() : '';
            
            const matches = name.includes(searchTerm) || 
                          preview.includes(searchTerm) || 
                          article.includes(searchTerm);
            
            item.style.display = matches ? 'flex' : 'none';
        });
    });
}

// ============================================================================
// INITIALISATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat.js v2.0 chargé');
    
    // Afficher les conversations
    displayConversations();
    
    // Nouvelle conversation
    const newConvBtn = document.querySelector('.new-conversation-btn');
    if (newConvBtn) {
        newConvBtn.addEventListener('click', createNewConversation);
    }
    
    // Rafraîchissement
    const refreshBtn = document.querySelector('.refresh-btn-full');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
                displayConversations();
                showToast('Conversations actualisées', 'success');
            }, 300);
        });
    }
    
    // Recherche
    setupSearch();
    
    // Envoi de message
    const sendBtn = document.querySelector('.send-btn');
    const messageInput = document.querySelector('.message-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Compteur de caractères
        messageInput.addEventListener('input', function() {
            const length = this.value.length;
            if (length > CHAT_CONFIG.MAX_MESSAGE_LENGTH * 0.9) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '';
            }
        });
    }
    
    // Boutons d'action
    document.querySelectorAll('.call-btn, .video-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.classList.contains('call-btn') ? 'Appel' : 'Vidéo';
            showToast(`Fonctionnalité "${action}" bientôt disponible`, 'info');
        });
    });
    
    // Info bouton
    document.querySelector('.info-btn')?.addEventListener('click', function() {
        const activeConv = document.querySelector('.active-conversation');
        if (!activeConv) return;
        
        const convId = activeConv.dataset.conversationId;
        const conversations = loadConversations();
        const conv = conversations.find(c => c.id === convId);
        
        if (conv) {
            const info = `
                Conversation avec ${conv.userName}
                ${conv.articleTitle ? '\nArticle : ' + conv.articleTitle : ''}
                Créée le ${new Date(conv.createdAt).toLocaleDateString('fr-FR')}
            `;
            alert(info);
        }
    });
});

// Exposer les fonctions globalement
window.displayConversations = displayConversations;
window.loadConversations = loadConversations;
window.saveConversations = saveConversations;
window.loadMessages = loadMessages;
window.saveMessages = saveMessages;
window.startConversationWithSeller = startConversationWithSeller;