import React, { useState, useEffect } from 'react';
import * as API from '../../../api';

interface UserUploadDocumentModalProps {
  associationId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserUploadDocumentModal({ associationId, onClose, onSuccess }: UserUploadDocumentModalProps) {
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [dateEmission, setDateEmission] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const response = await API.getDocumentTypes();
        const types = Array.isArray(response) ? response : response?.results || [];
        setDocumentTypes(types);
      } catch (err) {
        console.error('Error loading document types:', err);
        setError('Erreur lors du chargement des types de documents');
      }
    };

    loadDocumentTypes();
  }, []);

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedDocType || !dateEmission) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('nom_fichier', selectedFile);
      formData.append('id_association', associationId.toString());
      formData.append('id_type_document', selectedDocType);
      formData.append('date_emission', dateEmission);

      await API.uploadDocument(formData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(23, 23, 23, 0.54)' }}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Importer un document</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              {documentTypes.map((type) => (
                <option key={type.id_type_document} value={type.id_type_document}>
                  {type.libelle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'émission <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateEmission}
              onChange={(e) => setDateEmission(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setError('');
                }
              }}
              accept=".pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Fichier sélectionné : {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <div className="h-6" />
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => {
              onClose();
              setSelectedFile(null);
              setSelectedDocType('');
              setDateEmission('');
              setError('');
            }}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleUploadDocument}
            disabled={!selectedFile || !selectedDocType || !dateEmission || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Envoi en cours...' : 'Importer'}
          </button>
        </div>
      </div>
    </div>
  );
}
