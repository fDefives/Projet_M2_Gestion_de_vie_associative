import React, { useState } from 'react';
import * as API from '../../../api';

interface UserEditAssociationModalProps {
  association: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditAssociationModal({ association, onClose, onSuccess }: UserEditAssociationModalProps) {
  const [formData, setFormData] = useState({
    nom_association: association.nom_association || '',
    ufr: association.ufr || '',
    num_siret: association.num_siret || '',
    email_contact: association.email_contact || '',
    tel_contact: association.tel_contact || '',
    insta_contact: association.insta_contact || '',
    desc_association: association.desc_association || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      await API.updateAssociation(association.id_association, formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating association:', err);
      setError('Erreur lors de la mise à jour de l\'association');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(23, 23, 23, 0.54)' }}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full my-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier les informations</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'association</label>
              <input
                type="text"
                name="nom_association"
                value={formData.nom_association}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de l'association"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UFR</label>
              <input
                type="text"
                name="ufr"
                value={formData.ufr}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="UFR"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
              <input
                type="text"
                name="num_siret"
                value={formData.num_siret}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123 456 789 00012"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
              <input
                type="email"
                name="email_contact"
                value={formData.email_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@association.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                name="tel_contact"
                value={formData.tel_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="01234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="text"
                name="insta_contact"
                value={formData.insta_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@association"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="desc_association"
                value={formData.desc_association}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description de l'association..."
              />
            </div>
          </div>

          <div className="h-6" />
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
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
