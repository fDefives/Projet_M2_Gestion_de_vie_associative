/**
 * Exemple de composant React utilisant l'API
 * Ce fichier montre comment intégrer l'API Django avec React
 */

import React, { useState, useEffect } from 'react';
import * as API from './api';

/**
 * Hook personnalisé pour gérer l'authentification
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const currentUser = await API.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Erreur lors de la vérification de l\'authentification:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      await API.loginUser(username, password);
      const currentUser = await API.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    API.logout();
    setUser(null);
  };

  return { user, loading, error, login, logout };
};

/**
 * Composant d'exemple pour lister les documents
 */
export const DocumentsList = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = user?.role === 'admin' 
        ? await API.getDocuments() 
        : await API.getMyDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (user?.role !== 'admin') return;
    try {
      await API.approveDocument(id);
      loadDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id, comment) => {
    if (user?.role !== 'admin') return;
    try {
      await API.rejectDocument(id, comment);
      loadDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.deleteDocument(id);
      loadDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Documents</h2>
      {user?.role === 'admin' && <div className="admin-badge">Vous êtes ADMIN</div>}
      
      <table>
        <thead>
          <tr>
            <th>Fichier</th>
            <th>Statut</th>
            <th>Date</th>
            {user?.role === 'admin' && <th>Actions</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id_document}>
              <td>{doc.nom_fichier}</td>
              <td>{doc.statut}</td>
              <td>{new Date(doc.date_depot).toLocaleDateString()}</td>
              {user?.role === 'admin' && (
                <td>
                  {doc.statut === 'submitted' && (
                    <>
                      <button onClick={() => handleApprove(doc.id_document)}>
                        Approuver
                      </button>
                      <button onClick={() => handleReject(doc.id_document, 'Rejected')}>
                        Rejeter
                      </button>
                    </>
                  )}
                </td>
              )}
              <td>
                <button onClick={() => handleDelete(doc.id_document)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Composant d'exemple pour uploader un document
 */
export const DocumentUpload = ({ associationId }) => {
  const [file, setFile] = useState(null);
  const [typeDocId, setTypeDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !typeDocId || !associationId) {
      setError('Tous les champs sont requis');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('nom_fichier', file);
      formData.append('id_association', associationId);
      formData.append('id_type_document', typeDocId);

      await API.uploadDocument(formData);
      setSuccess(true);
      setFile(null);
      setTypeDocId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Ajouter un document</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Document uploadé avec succès!</div>}
      
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={loading}
      />
      
      <select
        value={typeDocId}
        onChange={(e) => setTypeDocId(e.target.value)}
        disabled={loading}
      >
        <option value="">Sélectionner un type de document</option>
        <option value="1">Statuts</option>
        <option value="2">Assurance</option>
        <option value="3">Budget</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Upload...' : 'Uploader'}
      </button>
    </form>
  );
};

/**
 * Composant de login d'exemple
 */
export const LoginForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(username, password);
      onSuccess?.(user);
    } catch (err) {
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

export default {
  useAuth,
  DocumentsList,
  DocumentUpload,
  LoginForm,
};
