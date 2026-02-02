/**
 * Exemple de configuration et utilisation de l'API Django depuis React
 * 
 * Installation requise:
 * npm install axios
 */

import axios from 'axios';

// Configuration de l'API - utilise VITE_API_URL ou par défaut localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs (token expiré, etc.)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si c'est une erreur 401 et qu'on n'a pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Réessayer la requête originale avec le nouveau token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Le refresh a échoué, nettoyer et rediriger vers login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// ============= AUTHENTIFICATION =============

/**
 * Enregistrer un nouvel utilisateur
 */
export const registerUser = async (email, username, password, firstName, lastName) => {
  try {
    const response = await api.post('/users/register/', {
      email,
      username,
      password,
      password2: password,
      first_name: firstName,
      last_name: lastName,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    throw error;
  }
};

/**
 * Se connecter et obtenir les tokens JWT
 */
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/login/', {
      username,
      password,
    });
    
    // Stocker les tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // Récupérer les infos de l'utilisateur
    const userResponse = await api.get('/users/me/');
    
    return {
      access: response.data.access,
      refresh: response.data.refresh,
      user: userResponse.data,
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

/**
 * Rafraîchir le token d'accès
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post('/auth/refresh/', {
      refresh: refreshToken,
    });
    
    localStorage.setItem('access_token', response.data.access);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    throw error;
  }
};

/**
 * Se déconnecter
 */
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Obtenir le profil de l'utilisateur connecté
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

/**
 * Demander un lien de réinitialisation de mot de passe
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/users/password_reset_request/', { email });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la demande de reset:', error);
    throw error;
  }
};

/**
 * Confirmer la réinitialisation de mot de passe avec le token
 */
export const resetPassword = async (uidb64, token, newPassword, newPassword2) => {
  try {
    const response = await api.post('/users/password_reset_confirm/', {
      uidb64,
      token,
      new_password: newPassword,
      new_password2: newPassword2,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Erreur lors de la réinitialisation';
    console.error('Erreur lors du reset:', error);
    throw new Error(message);
  }
};


// ============= ASSOCIATIONS =============

/**
 * Récupérer la liste des associations
 */
export const getAssociations = async () => {
  try {
    const response = await api.get('/associations/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des associations:', error);
    throw error;
  }
};

/**
 * Récupérer la liste des types d'associations
 */
export const getAssociationTypes = async () => {
  try {
    const response = await api.get('/association-types/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'associations:', error);
    throw error;
  }
};

/**
 * Récupérer la liste des utilisateurs (réservé admin)
 */
export const getUsers = async () => {
  try {
    const response = await api.get('/users/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

/**
 * Créer une association
 */
export const createAssociation = async (associationData) => {
  try {
    const response = await api.post('/associations/', associationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'association:', error);
    throw error;
  }
};

/**
 * Récupérer les détails d'une association
 */
export const getAssociationDetails = async (id) => {
  try {
    const response = await api.get(`/associations/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'association:', error);
    throw error;
  }
};

/**
 * Mettre à jour une association
 */
export const updateAssociation = async (id, associationData) => {
  try {
    const response = await api.patch(`/associations/${id}/`, associationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'association:', error);
    throw error;
  }
};

/**
 * Récupérer les documents d'une association
 */
export const getAssociationDocuments = async (id) => {
  try {
    const response = await api.get(`/associations/${id}/documents/`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

/**
 * Récupérer les membres d'une association
 */
export const getAssociationMembers = async (id) => {
  try {
    const response = await api.get(`/associations/${id}/members/`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    throw error;
  }
};

// ============= DOCUMENTS (Cœur du système de rôles) =============

/**
 * Récupérer les documents accessibles par l'utilisateur
 * - Utilisateur: ses documents uniquement
 * - Admin: tous les documents
 */
export const getDocuments = async () => {
  try {
    const response = await api.get('/documents/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

/**
 * Récupérer les propres documents de l'utilisateur
 */
export const getMyDocuments = async () => {
  try {
    const response = await api.get('/documents/my_documents/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de vos documents:', error);
    throw error;
  }
};

/**
 * Récupérer les documents d'une association (Admin)
 */
export const getDocumentsByAssociation = async (associationId) => {
  try {
    const response = await api.get('/documents/by_association/', {
      params: { association_id: associationId },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

/**
 * Récupérer les documents par statut (Admin)
 */
export const getDocumentsByStatus = async (status) => {
  try {
    const response = await api.get('/documents/by_status/', {
      params: { status },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    throw error;
  }
};

/**
 * Ajouter un nouveau document
 */
export const uploadDocument = async (formData) => {
  try {
    const response = await api.post('/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    throw error;
  }
};

/**
 * Récupérer les détails d'un document
 */
export const getDocumentDetails = async (id) => {
  try {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    throw error;
  }
};

/**
 * Télécharger un document
 */
export const downloadDocument = async (id, filename) => {
  try {
    const response = await api.get(`/documents/${id}/download/`, {
      responseType: 'blob',
    });
    
    // Créer un lien de téléchargement et le cliquer
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    throw error;
  }
};

// Récupérer le binaire d'un document (pour prévisualisation)
export const fetchDocumentBlob = async (id) => {
  try {
    const response = await api.get(`/documents/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    throw error;
  }
};

/**
 * Approuver un document (Admin)
 */
export const approveDocument = async (id) => {
  try {
    const response = await api.patch(`/documents/${id}/approve/`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'approbation du document:', error);
    throw error;
  }
};

/**
 * Rejeter un document (Admin)
 */
export const rejectDocument = async (id, comment) => {
  try {
    const response = await api.patch(`/documents/${id}/reject/`, {
      commentaire_refus: comment,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du rejet du document:', error);
    throw error;
  }
};

/**
 * Supprimer un document
 * Utilisateur: peut supprimer ses propres documents
 * Admin: peut supprimer n'importe quel document
 */
export const deleteDocument = async (id) => {
  try {
    const response = await api.delete(`/documents/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    throw error;
  }
};

/**
 * Récupérer les types de documents
 */
export const getDocumentTypes = async () => {
  try {
    const response = await api.get('/type-documents/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des types de documents:', error);
    throw error;
  }
};

// ============= MEMBRES =============

/**
 * Récupérer la liste des membres
 */
export const getMembers = async () => {
  try {
    const response = await api.get('/membres/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    throw error;
  }
};

/**
 * Ajouter un member
 */
export const createMember = async (memberData) => {
  try {
    const response = await api.post('/membres/', memberData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error);
    throw error;
  }
};

/**
 * Supprimer un membre
 */
export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/membres/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    throw error;
  }
};

// ============= ROLES ET MANDATS =============

/**
 * Récupérer les types de rôles disponibles
 */
export const getRoleTypes = async () => {
  try {
    const response = await api.get('/role-types/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des types de rôles:', error);
    throw error;
  }
};

/**
 * Créer un type de rôle (Admin)
 */
export const createRoleType = async (roleData) => {
  try {
    const response = await api.post('/role-types/', roleData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du type de rôle:', error);
    throw error;
  }
};

/**
 * Récupérer les mandats
 */
export const getMandats = async () => {
  try {
    const response = await api.get('/mandats/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des mandats:', error);
    throw error;
  }
};

/**
 * Récupérer les mandats d'une association
 */
export const getAssociationMandats = async (associationId) => {
  try {
    const response = await api.get(`/mandats/`, {
      params: { association_id: associationId },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des mandats:', error);
    throw error;
  }
};

/**
 * Créer un mandat pour un membre
 */
export const createMandat = async (mandatData) => {
  try {
    const response = await api.post('/mandats/', mandatData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du mandat:', error);
    throw error;
  }
};

/**
 * Mettre à jour un mandat
 */
export const updateMandat = async (id, mandatData) => {
  try {
    const response = await api.patch(`/mandats/${id}/`, mandatData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mandat:', error);
    throw error;
  }
};

/**
 * Supprimer un mandat
 */
export const deleteMandat = async (id) => {
  try {
    const response = await api.delete(`/mandats/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du mandat:', error);
    throw error;
  }
};

// ============= MEMBRES =============

/**
 * Récupérer tous les membres
 */
export const getMembres = async () => {
  try {
    const response = await api.get('/membres/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    throw error;
  }
};

/**
 * Créer un membre
 */
export const createMembre = async (membreData) => {
  try {
    const response = await api.post('/membres/', membreData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du membre:', error);
    throw error;
  }
};

/**
 * Mettre à jour un membre
 */
export const updateMembre = async (id, membreData) => {
  try {
    const response = await api.patch(`/membres/${id}/`, membreData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    throw error;
  }
};

// ============= NOTIFICATIONS =============

/**
 * Récupérer les notifications
 */
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

/**
 * Récupérer les notifications non lues
 */
export const getUnreadNotifications = async () => {
  try {
    const response = await api.get('/notifications/unread/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications non lues:', error);
    throw error;
  }
};

/**
 * Marquer les notifications comme lues
 */
export const markNotificationsAsRead = async (ids) => {
  try {
    const response = await api.post('/notifications/mark_as_read/', { ids });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage des notifications:', error);
    throw error;
  }
};

// ============= TYPES (PARAMÈTRES) =============

/**
 * Créer un type d'association
 */
export const createAssociationType = async (typeData) => {
  try {
    const response = await api.post('/association-types/', typeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du type d\'association:', error);
    throw error;
  }
};

/**
 * Créer un type de document
 */
export const createDocumentType = async (typeData) => {
  try {
    const response = await api.post('/type-documents/', typeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du type de document:', error);
    throw error;
  }
};

/**
 * Mettre à jour un type de document
 */
export const updateDocumentType = async (id, typeData) => {
  try {
    const response = await api.patch(`/type-documents/${id}/`, typeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type de document:', error);
    throw error;
  }
};

/**
 * Mettre à jour un document
 */
export const updateDocument = async (id, documentData) => {
  try {
    const response = await api.patch(`/documents/${id}/`, documentData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    throw error;
  }
};

/**
 * Supprimer un type d'association
 */
export const deleteAssociationType = async (id) => {
  try {
    const response = await api.delete(`/association-types/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du type d\'association:', error);
    throw error;
  }
};

/**
 * Supprimer un type de document
 */
export const deleteDocumentType = async (id) => {
  try {
    const response = await api.delete(`/type-documents/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du type de document:', error);
    throw error;
  }
};

/**
 * Supprimer un type de rôle
 */
export const deleteRoleType = async (id) => {
  try {
    const response = await api.delete(`/role-types/${id}/`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du type de rôle:', error);
    throw error;
  }
};

/**
 * Mettre à jour le profil utilisateur (email, username, first_name, last_name)
 */
export const updateUserProfile = async (data) => {
  try {
    const response = await api.patch('/users/me/', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

/**
 * Changer le mot de passe utilisateur
 */
export const changeUserPassword = async (oldPassword, newPassword, newPassword2) => {
  try {
    const response = await api.post('/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
};

export default api;
