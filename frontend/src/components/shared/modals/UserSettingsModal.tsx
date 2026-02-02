import React, { useState } from 'react';
import * as API from '../../../api';

interface UserSettingsModalProps {
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserSettingsModal({ userEmail, onClose, onSuccess }: UserSettingsModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'password'>('email');

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      setError('Veuillez saisir une nouvelle adresse email');
      return;
    }

    if (!isValidEmail(newEmail)) {
      setError('Format d\'email invalide');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await API.updateUserProfile({ email: newEmail });
      alert('Email mis à jour avec succès. Veuillez vous reconnecter.');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Erreur lors de la mise à jour de l\'email');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      setError('Veuillez saisir votre mot de passe actuel');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Veuillez saisir et confirmer le nouveau mot de passe');
      return;
    }

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await API.changeUserPassword(currentPassword, newPassword, confirmPassword);
      alert('Mot de passe mis à jour avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(23, 23, 23, 0.54)' }}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full my-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres du compte</h2>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Modifier l'email
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Modifier le mot de passe
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'email' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email actuel</label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouvel email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="nouveau@email.com"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateEmail}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
