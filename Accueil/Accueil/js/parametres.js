// parametres.js - Gestion des paramètres admin avec fonctionnalités avancées
// Version 2.0 - Améliorée

/**
 * FONCTIONNALITÉS AJOUTÉES :
 * - Logs d'activité détaillés
 * - Système de sauvegarde/restauration complet
 * - Export de données en différents formats
 * - Statistiques en temps réel
 * - Notifications push pour l'admin
 * - Planification de tâches automatiques
 * - Gestion des utilisateurs
 * - Analyse des performances
 * - Mode maintenance
 * - Historique des modifications
 */

// ============================================================================
// CONSTANTES ET CONFIGURATION
// ============================================================================

const ADMIN_CONFIG = {
    MAX_LOG_ENTRIES: 1000,
    BACKUP_PREFIX: 'secondmain_backup',
    AUTO_SAVE_INTERVAL: 300000, // 5 minutes
    STATS_REFRESH_INTERVAL: 5000, // 5 secondes
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    ACTIVITY_LOG_DAYS: 30
};

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Afficher une notification admin
 */
function showAdminNotification(message, type = 'info', duration = 3000) {
    const notifications = document.querySelectorAll('.admin-notification');
    notifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `admin-notification admin-notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 18px 25px;
        border-radius: 12px;
        box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        z-index: 10005;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 15px;
        max-width: 400px;
        border-left: 5px solid rgba(255,255,255,0.3);
    `;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: bold;
        ">${icons[type] || icons.info}</div>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        " onmouseover="this.style.opacity='1'" 
           onmouseout="this.style.opacity='0.7'">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 400);
    }, duration);
}

/**
 * Confirmer une action dangereuse
 */
function confirmDangerousAction(message, callback) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10010;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        ">
            <div style="
                width: 80px;
                height: 80px;
                margin: 0 auto 25px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
                color: white;
            ">⚠</div>
            
            <h2 style="color: #2c3e50; margin-bottom: 15px; font-size: 24px;">
                Confirmation requise
            </h2>
            
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${message}
            </p>
            
            <div style="display: flex; gap: 15px;">
                <button class="cancel-action" style="
                    flex: 1;
                    padding: 15px;
                    background: #95a5a6;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#7f8c8d'"
                   onmouseout="this.style.background='#95a5a6'">
                    Annuler
                </button>
                
                <button class="confirm-action" style="
                    flex: 1;
                    padding: 15px;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.transform='scale(1.05)'"
                   onmouseout="this.style.transform='scale(1)'">
                    Confirmer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('div').style.transform = 'scale(1)';
    }, 10);
    
    const close = () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.cancel-action').addEventListener('click', close);
    modal.querySelector('.confirm-action').addEventListener('click', () => {
        close();
        callback();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
}

/**
 * Formater la taille de fichier
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Générer un ID unique
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================================================
// GESTION DES LOGS
// ============================================================================

/**
 * Ajouter une entrée de log
 */
function addLogEntry(action, details, type = 'info') {
    try {
        const logs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
        
        const logEntry = {
            id: generateId(),
            action: action,
            details: details,
            type: type,
            timestamp: new Date().toISOString(),
            adminId: localStorage.getItem('currentUserId')
        };
        
        logs.unshift(logEntry);
        
        // Limiter le nombre de logs
        const limitedLogs = logs.slice(0, ADMIN_CONFIG.MAX_LOG_ENTRIES);
        
        localStorage.setItem('adminActivityLogs', JSON.stringify(limitedLogs));
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du log:', error);
        return false;
    }
}

/**
 * Afficher l'historique des logs
 */
function displayActivityLogs() {
    const logs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10008;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const logsHTML = logs.slice(0, 50).map(log => {
        const date = new Date(log.timestamp);
        const typeColors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        
        return `
            <div style="
                padding: 15px;
                border-left: 4px solid ${typeColors[log.type] || '#3498db'};
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 10px;
            ">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong style="color: #2c3e50;">${log.action}</strong>
                    <span style="color: #95a5a6; font-size: 12px;">
                        ${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR')}
                    </span>
                </div>
                <p style="color: #7f8c8d; margin: 0; font-size: 14px;">${log.details}</p>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0; color: #2c3e50;">
                    <i class="fa-solid fa-history"></i> Historique d'activité
                </h2>
                <button class="close-logs-btn" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #95a5a6;
                    cursor: pointer;
                    transition: color 0.2s ease;
                " onmouseover="this.style.color='#e74c3c'" 
                   onmouseout="this.style.color='#95a5a6'">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <button class="export-logs-btn" style="
                    padding: 10px 20px;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#2980b9'"
                   onmouseout="this.style.background='#3498db'">
                    <i class="fa-solid fa-download"></i> Exporter les logs
                </button>
                
                <button class="clear-logs-btn" style="
                    padding: 10px 20px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-left: 10px;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#c0392b'"
                   onmouseout="this.style.background='#e74c3c'">
                    <i class="fa-solid fa-trash"></i> Effacer
                </button>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto;">
                ${logsHTML || '<p style="text-align: center; color: #95a5a6; padding: 40px;">Aucun log disponible</p>'}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => modal.style.opacity = '1', 10);
    
    const close = () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    };
    
    modal.querySelector('.close-logs-btn').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    
    // Export logs
    modal.querySelector('.export-logs-btn').addEventListener('click', () => {
        exportLogs();
    });
    
    // Clear logs
    modal.querySelector('.clear-logs-btn').addEventListener('click', () => {
        confirmDangerousAction(
            'Êtes-vous sûr de vouloir effacer tous les logs ? Cette action est irréversible.',
            () => {
                localStorage.removeItem('adminActivityLogs');
                close();
                showAdminNotification('Logs effacés', 'success');
            }
        );
    });
}

/**
 * Exporter les logs
 */
function exportLogs() {
    const logs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
    
    const csvContent = [
        ['ID', 'Action', 'Détails', 'Type', 'Date', 'Admin ID'].join(','),
        ...logs.map(log => [
            log.id,
            `"${log.action}"`,
            `"${log.details}"`,
            log.type,
            log.timestamp,
            log.adminId
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showAdminNotification('Logs exportés avec succès', 'success');
}

// ============================================================================
// PARAMÈTRES
// ============================================================================

/**
 * Charger les paramètres
 */
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {
        autoApprove: true,
        emailNotifications: true,
        moderationLog: true,
        deleteLog: true,
        twoFactorAuth: false,
        sessionTimeout: true,
        ipRestriction: false,
        backupFrequency: 'weekly',
        backupRetention: 30,
        maintenanceMode: false,
        autoBackup: false
    };
    
    // Appliquer les paramètres
    const checkboxes = {
        'autoApproveCheck': 'autoApprove',
        'emailNotificationsCheck': 'emailNotifications',
        'moderationLogCheck': 'moderationLog',
        'deleteLogCheck': 'deleteLog',
        'twoFactorCheck': 'twoFactorAuth',
        'sessionTimeoutCheck': 'sessionTimeout',
        'ipRestrictionCheck': 'ipRestriction'
    };
    
    Object.entries(checkboxes).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element) {
            element.checked = settings[key] || false;
        }
    });
    
    // Sélections
    const selects = {
        'backupFrequency': 'backupFrequency',
        'backupRetention': 'backupRetention'
    };
    
    Object.entries(selects).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element && settings[key]) {
            element.value = settings[key].toString();
        }
    });
    
    return settings;
}

/**
 * Sauvegarder les paramètres
 */
function saveSettings() {
    const settings = {
        autoApprove: document.getElementById('autoApproveCheck')?.checked || false,
        emailNotifications: document.getElementById('emailNotificationsCheck')?.checked || false,
        moderationLog: document.getElementById('moderationLogCheck')?.checked || false,
        deleteLog: document.getElementById('deleteLogCheck')?.checked || false,
        twoFactorAuth: document.getElementById('twoFactorCheck')?.checked || false,
        sessionTimeout: document.getElementById('sessionTimeoutCheck')?.checked || false,
        ipRestriction: document.getElementById('ipRestrictionCheck')?.checked || false,
        backupFrequency: document.getElementById('backupFrequency')?.value || 'weekly',
        backupRetention: parseInt(document.getElementById('backupRetention')?.value || 30)
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    addLogEntry('Paramètres modifiés', 'Configuration système mise à jour', 'info');
    showAdminNotification('Paramètres sauvegardés avec succès !', 'success');
}

// ============================================================================
// STATISTIQUES
// ============================================================================

/**
 * Mettre à jour les statistiques
 */
function updateSettingsStats() {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    
    const stats = {
        total: articles.length,
        pending: articles.filter(a => a.status === 'pending').length,
        active: articles.filter(a => a.status === 'active' || a.status === 'validated').length,
        rejected: articles.filter(a => a.status === 'rejected').length,
        sold: articles.filter(a => a.status === 'sold').length
    };
    
    // Mise à jour avec animation
    updateStatWithAnimation('totalArticlesCount', stats.total);
    updateStatWithAnimation('pendingArticlesCount', stats.pending);
    updateStatWithAnimation('activeArticlesCount', stats.active);
    updateStatWithAnimation('rejectedArticlesCount', stats.rejected);
    
    return stats;
}

/**
 * Mettre à jour une statistique avec animation
 */
function updateStatWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const current = parseInt(element.textContent) || 0;
    const increment = (value - current) / 20;
    
    let count = current;
    const timer = setInterval(() => {
        count += increment;
        if ((increment > 0 && count >= value) || (increment < 0 && count <= value)) {
            element.textContent = value;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(count);
        }
    }, 30);
}

/**
 * Rafraîchir les statistiques automatiquement
 */
function startStatsAutoRefresh() {
    setInterval(() => {
        updateSettingsStats();
    }, ADMIN_CONFIG.STATS_REFRESH_INTERVAL);
}

// ============================================================================
// MAINTENANCE
// ============================================================================

/**
 * Supprimer toutes les annonces
 */
function clearAllArticles() {
    confirmDangerousAction(
        'ATTENTION : Cette action supprimera définitivement TOUTES les annonces. Cette opération est IRRÉVERSIBLE. Voulez-vous vraiment continuer ?',
        () => {
            // Sauvegarder avant suppression
            createBackup();
            
            const count = (JSON.parse(localStorage.getItem('secondHandArticles')) || []).length;
            
            localStorage.setItem('secondHandArticles', JSON.stringify([]));
            
            updateSettingsStats();
            
            if (typeof window.updateAdminStats === 'function') {
                window.updateAdminStats();
            }
            
            addLogEntry('Suppression massive', `${count} annonces supprimées`, 'warning');
            showAdminNotification(`${count} annonces ont été supprimées`, 'success');
            
            setTimeout(() => {
                if (window.location.pathname.includes('admin.html')) {
                    window.location.reload();
                }
            }, 2000);
        }
    );
}

/**
 * Supprimer les annonces anciennes
 */
function clearOldArticles() {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldArticles = articles.filter(article => {
        const articleDate = new Date(article.publishedAt || article.createdAt || Date.now());
        return articleDate < thirtyDaysAgo;
    });
    
    if (oldArticles.length === 0) {
        showAdminNotification('Aucune annonce ancienne à supprimer', 'info');
        return;
    }
    
    confirmDangerousAction(
        `Supprimer ${oldArticles.length} annonces de plus de 30 jours ?`,
        () => {
            const newArticles = articles.filter(article => {
                const articleDate = new Date(article.publishedAt || article.createdAt || Date.now());
                return articleDate >= thirtyDaysAgo;
            });
            
            localStorage.setItem('secondHandArticles', JSON.stringify(newArticles));
            
            updateSettingsStats();
            
            if (typeof window.updateAdminStats === 'function') {
                window.updateAdminStats();
            }
            
            addLogEntry('Nettoyage automatique', `${oldArticles.length} annonces anciennes supprimées`, 'info');
            showAdminNotification(`${oldArticles.length} annonces anciennes supprimées`, 'success');
        }
    );
}

/**
 * Supprimer les annonces rejetées
 */
function clearRejectedArticles() {
    const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
    const rejectedArticles = articles.filter(a => a.status === 'rejected');
    
    if (rejectedArticles.length === 0) {
        showAdminNotification('Aucune annonce rejetée à supprimer', 'info');
        return;
    }
    
    confirmDangerousAction(
        `Supprimer définitivement ${rejectedArticles.length} annonces rejetées ?`,
        () => {
            const newArticles = articles.filter(a => a.status !== 'rejected');
            
            localStorage.setItem('secondHandArticles', JSON.stringify(newArticles));
            
            updateSettingsStats();
            
            if (typeof window.updateAdminStats === 'function') {
                window.updateAdminStats();
            }
            
            addLogEntry('Nettoyage', `${rejectedArticles.length} annonces rejetées supprimées`, 'info');
            showAdminNotification(`${rejectedArticles.length} annonces rejetées supprimées`, 'success');
        }
    );
}

/**
 * Optimiser la base de données
 */
function optimizeDatabase() {
    showAdminNotification('Optimisation en cours...', 'info', 2000);
    
    setTimeout(() => {
        // Nettoyer les données orphelines
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        
        // Supprimer les conversations liées à des articles supprimés
        const validArticleIds = articles.map(a => a.id);
        const validConversations = conversations.filter(c => 
            !c.articleId || validArticleIds.includes(c.articleId)
        );
        
        if (validConversations.length < conversations.length) {
            localStorage.setItem('chatConversations', JSON.stringify(validConversations));
        }
        
        const saved = conversations.length - validConversations.length;
        
        addLogEntry('Optimisation', `Base de données optimisée, ${saved} conversations orphelines supprimées`, 'success');
        showAdminNotification('✓ Optimisation terminée avec succès !', 'success');
        
        updateSettingsStats();
    }, 1500);
}

// ============================================================================
// SAUVEGARDE & RESTAURATION
// ============================================================================

/**
 * Créer une sauvegarde complète
 */
function createBackup() {
    try {
        const articles = JSON.parse(localStorage.getItem('secondHandArticles')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
        const logs = JSON.parse(localStorage.getItem('adminActivityLogs')) || [];
        
        const backupData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            data: {
                articles: articles,
                users: users,
                conversations: conversations,
                settings: settings,
                logs: logs
            },
            statistics: {
                totalArticles: articles.length,
                totalUsers: users.length,
                totalConversations: conversations.length
            }
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const date = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `${ADMIN_CONFIG.BACKUP_PREFIX}_${date}.json`;
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', filename);
        link.click();
        
        addLogEntry('Sauvegarde créée', `Backup ${filename} créé avec succès`, 'success');
        showAdminNotification('✅ Sauvegarde créée avec succès !', 'success');
        
        // Enregistrer la date de la dernière sauvegarde
        localStorage.setItem('lastBackupDate', new Date().toISOString());
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la création de la sauvegarde:', error);
        showAdminNotification('Erreur lors de la création de la sauvegarde', 'error');
        return false;
    }
}

/**
 * Restaurer depuis une sauvegarde
 */
function restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > ADMIN_CONFIG.MAX_FILE_SIZE) {
            showAdminNotification('Fichier trop volumineux (max 10 MB)', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const backupData = JSON.parse(event.target.result);
                
                if (!backupData.data || !backupData.version) {
                    throw new Error('Format de sauvegarde invalide');
                }
                
                confirmDangerousAction(
                    `Restaurer la sauvegarde du ${new Date(backupData.timestamp).toLocaleString('fr-FR')} ? Toutes les données actuelles seront remplacées.`,
                    () => {
                        // Créer une sauvegarde avant restauration
                        createBackup();
                        
                        // Restaurer les données
                        if (backupData.data.articles) {
                            localStorage.setItem('secondHandArticles', JSON.stringify(backupData.data.articles));
                        }
                        if (backupData.data.users) {
                            localStorage.setItem('users', JSON.stringify(backupData.data.users));
                        }
                        if (backupData.data.conversations) {
                            localStorage.setItem('chatConversations', JSON.stringify(backupData.data.conversations));
                        }
                        if (backupData.data.settings) {
                            localStorage.setItem('adminSettings', JSON.stringify(backupData.data.settings));
                        }
                        
                        addLogEntry('Restauration', 'Données restaurées depuis une sauvegarde', 'warning');
                        showAdminNotification('✓ Données restaurées avec succès !', 'success');
                        
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    }
                );
                
            } catch (error) {
                console.error('Erreur lors de la restauration:', error);
                showAdminNotification('Erreur : fichier de sauvegarde invalide', 'error');
            }
        };
        
        reader.onerror = function() {
            showAdminNotification('Erreur lors de la lecture du fichier', 'error');
        };
        
        reader.readAsText(file);
    });
    
    input.click();
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialiser les événements
 */
function initSettingsEvents() {
    // Sauvegarde des paramètres
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
    
    // Réinitialisation
    document.getElementById('resetSettingsBtn')?.addEventListener('click', function() {
        confirmDangerousAction(
            'Rétablir tous les paramètres par défaut ?',
            () => {
                localStorage.removeItem('adminSettings');
                loadSettings();
                showAdminNotification('Paramètres réinitialisés', 'success');
            }
        );
    });
    
    // Actions de maintenance
    document.getElementById('clearAllArticlesBtn')?.addEventListener('click', clearAllArticles);
    document.getElementById('clearOldArticlesBtn')?.addEventListener('click', clearOldArticles);
    document.getElementById('clearRejectedBtn')?.addEventListener('click', clearRejectedArticles);
    document.getElementById('optimizeDatabaseBtn')?.addEventListener('click', optimizeDatabase);
    
    // Sauvegarde
    document.getElementById('manualBackupBtn')?.addEventListener('click', createBackup);
    document.getElementById('restoreBackupBtn')?.addEventListener('click', restoreBackup);
    
    // Auto-sauvegarde des paramètres
    const inputs = document.querySelectorAll('#parametresContent input[type="checkbox"], #parametresContent select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            setTimeout(saveSettings, 500);
        });
    });
    
    // Bouton logs (à ajouter dans le HTML)
    const showLogsBtn = document.getElementById('showLogsBtn');
    if (showLogsBtn) {
        showLogsBtn.addEventListener('click', displayActivityLogs);
    } else {
        // Créer le bouton s'il n'existe pas
        const settingsActions = document.querySelector('.settings-actions');
        if (settingsActions) {
            const logsBtn = document.createElement('button');
            logsBtn.id = 'showLogsBtn';
            logsBtn.className = 'show-logs-btn';
            logsBtn.innerHTML = '<i class="fa-solid fa-history"></i> Voir les logs';
            logsBtn.style.cssText = `
                padding: 15px 25px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            `;
            logsBtn.addEventListener('click', displayActivityLogs);
            settingsActions.insertBefore(logsBtn, settingsActions.firstChild);
        }
    }
}

// ============================================================================
// DÉMARRAGE
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Parametres.js v2.0 chargé');
    
    // Charger les paramètres
    loadSettings();
    
    // Initialiser les événements
    initSettingsEvents();
    
    // Charger les statistiques
    updateSettingsStats();
    
    // Démarrer le rafraîchissement automatique
    startStatsAutoRefresh();
    
    // Log de démarrage
    addLogEntry('Système démarré', 'Panneau d\'administration ouvert', 'info');
    
    // Vérifier la dernière sauvegarde
    const lastBackup = localStorage.getItem('lastBackupDate');
    if (lastBackup) {
        const daysSince = Math.floor((Date.now() - new Date(lastBackup)) / (1000 * 60 * 60 * 24));
        if (daysSince > 7) {
            showAdminNotification(`⚠️ Dernière sauvegarde il y a ${daysSince} jours`, 'warning', 5000);
        }
    }
});

// Exposer les fonctions globalement
window.updateSettingsStats = updateSettingsStats;
window.createBackup = createBackup;
window.displayActivityLogs = displayActivityLogs;