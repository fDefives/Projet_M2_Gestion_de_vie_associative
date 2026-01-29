import React, { useState, useEffect } from 'react';
import { LogOut, FileText, Users, Upload, AlertCircle, CheckCircle2, Clock, Download, Plus, Edit2, Trash2, Search, Building2, Mail, Phone, Instagram } from 'lucide-react';
import { User } from '../App';
import { DocumentStatusBadge } from './shared/DocumentStatusBadge';
import { MandatsManager } from './admin/MandatsManager';
import * as API from '../api';

const REQUIRED_DOCUMENT_TYPES = ['statuts', 'assurance', 'budget', 'rapport'];

const DOCUMENT_TYPES: Record<string, { label: string }> = {
  statuts: { label: 'Statuts' },
  assurance: { label: 'Assurance' },
  budget: { label: 'Budget' },
  rapport: { label: 'Rapport' },
};

interface AssociationDashboardProps {
  user: User;
  onLogout: () => void;
}

type AssociationTab = 'overview' | 'documents' | 'leaders';

export function AssociationDashboard({ user, onLogout }: AssociationDashboardProps) {
  const [activeTab, setActiveTab] = useState<AssociationTab>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dateEmission, setDateEmission] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [association, setAssociation] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger l'utilisateur connecté pour récupérer son association
      const userMe = await API.getCurrentUser();
      
      if (userMe.id_association) {
        const asso = await API.getAssociationDetails(userMe.id_association);
        setAssociation(asso);

        // Charger les documents de cette association
        const allDocs = await API.getDocuments();
        const docsArray = Array.isArray(allDocs) ? allDocs : allDocs?.results || [];
        setDocuments(docsArray.filter((d: any) => d.id_association === userMe.id_association));

        // Charger les types de documents
        const typesData = await API.getDocumentTypes();
        setDocumentTypes(Array.isArray(typesData) ? typesData : typesData?.results || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      const blob = await API.downloadDocument(doc.id_document);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nom_fichier.split('/').pop() || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const handlePreviewDocument = async (doc: any) => {
    try {
      const blob = await API.downloadDocument(doc.id_document);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur prévisualisation:', error);
      alert('Erreur lors de l\'ouverture du document');
    }
  };

  useEffect(() => {
    loadData();
    
    // Event listener pour ouvrir la modale d'édition depuis l'overview
    const handleEdit = () => setShowEditModal(true);
    window.addEventListener('editAssociation', handleEdit);
    return () => window.removeEventListener('editAssociation', handleEdit);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  // Si pas d'association, afficher un dashboard vide
  if (!association) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Espace Association</h1>
                <p className="text-sm text-gray-600">Bienvenue</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucune association</h2>
            <p className="text-gray-600">Vous n'avez pas encore créé d'association. Contactez l'administration.</p>
          </div>
        </main>
      </div>
    );
  }

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
      formData.append('id_association', association.id_association.toString());
      formData.append('id_type_document', selectedDocType);
      formData.append('date_emission', dateEmission);

      await API.uploadDocument(formData);
      await loadData();
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedDocType('');
      setDateEmission('');
    } catch (err) {
      console.error('Erreur upload:', err);
      setError('Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">{association.nom_association}</h1>
              <p className="text-sm text-gray-600">Espace association</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {(() => {
          const approvedDocsByType = REQUIRED_DOCUMENT_TYPES.map(type => {
            return documents.find(
              d => d.type_document_name?.toLowerCase().includes(type.toLowerCase())
            )?.statut === 'approved';
          }).filter(Boolean).length;
          const completionRate = Math.round((approvedDocsByType / REQUIRED_DOCUMENT_TYPES.length) * 100);
          
          return completionRate < 100 && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-orange-900 mb-1">Votre dossier est incomplet</div>
                  <p className="text-sm text-orange-800">
                    Il manque {REQUIRED_DOCUMENT_TYPES.length - approvedDocsByType} document(s) pour valider votre dossier. Cela pourrait impacter
                    l'attribution de subventions.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-orange-900">{completionRate}%</div>
                  <div className="text-xs text-orange-700">Complétude</div>
                </div>
              </div>
            </div>
          );
        })()}

        {(() => {
          const approvedDocsByType = REQUIRED_DOCUMENT_TYPES.map(type => {
            return documents.find(
              d => d.type_document_name?.toLowerCase().includes(type.toLowerCase())
            )?.statut === 'approved';
          }).filter(Boolean).length;
          const completionRate = Math.round((approvedDocsByType / REQUIRED_DOCUMENT_TYPES.length) * 100);
          
          return completionRate === 100 && (

            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <div className="text-green-900 mb-1">Dossier complet ! 🎉</div>
                  <p className="text-sm text-green-800">
                    Tous vos documents sont validés. Votre association est en règle.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'documents'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Mes documents
              </button>
              <button
                onClick={() => setActiveTab('leaders')}
                className={`px-4 py-3 border-b-2 transition-colors ${
                  activeTab === 'leaders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Dirigeants
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <AssociationOverviewTab
                association={association}
                documents={documents}
              />
            )}

            {activeTab === 'documents' && (
              <AssociationDocumentsTab
                documents={documents}
                onUpload={() => setShowUploadModal(true)}
                onDownload={handleDownloadDocument}
                onPreview={handlePreviewDocument}
              />
            )}

            {activeTab === 'leaders' && association?.id_association && (
              <MandatsManager 
                associationId={association.id_association}
                onDataChanged={loadData}
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Déposer un document</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
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

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
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
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Envoi en cours...' : 'Déposer le document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Association Modal */}
      {showEditModal && (
        <EditAssociationModal
          association={association}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

// Modal pour modifier l'association
interface EditAssociationModalProps {
  association: any;
  onClose: () => void;
  onSuccess: () => void;
}

function EditAssociationModal({ association, onClose, onSuccess }: EditAssociationModalProps) {
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

// Sub-components

function AssociationOverviewTab({ association, documents }: any) {
  const documentStatus = REQUIRED_DOCUMENT_TYPES.map((type) => {
    const doc = documents.find((d: any) => 
      d.type_document_name?.toLowerCase().includes(type.toLowerCase())
    );
    
    let status: 'submitted' | 'approved' | 'rejected' | 'expired' | 'draft' | 'missing' = 'missing';
    if (doc) {
      status = doc.statut;
    }
    
    return {
      type,
      label: DOCUMENT_TYPES[type]?.label || type,
      status,
      doc,
    };
  });

  const validatedCount = documents.filter((d: any) => d.statut === 'approved').length;
  const pendingCount = documents.filter((d: any) => d.statut === 'submitted').length;
  const actionCount = documents.filter(
    (d: any) => d.statut === 'rejected' || d.statut === 'expired'
  ).length;
  const missingCount = documentStatus.filter(ds => ds.status === 'missing').length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700 font-medium">Validés</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{validatedCount}</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700 font-medium">En attente</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">{pendingCount}</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-700 font-medium">Action requise</span>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-900">{actionCount}</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700 font-medium">Manquants</span>
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{missingCount}</div>
        </div>
      </div>

      {/* Association Info */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations de l'association</h3>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('editAssociation'))}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Modifier
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-4 h-4" />
            <div>
              <div className="text-xs text-gray-500">UFR</div>
              <div className="text-gray-900 font-medium">{association.ufr}</div>
            </div>
          </div>
          {association.association_type_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-4 h-4" />
              <div>
                <div className="text-xs text-gray-500">Type</div>
                <div className="text-gray-900 font-medium">{association.association_type_name}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="text-gray-900 font-medium">{association.email_contact}</div>
            </div>
          </div>
          {association.tel_contact && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <div>
                <div className="text-xs text-gray-500">Téléphone</div>
                <div className="text-gray-900 font-medium">{association.tel_contact}</div>
              </div>
            </div>
          )}
          {association.insta_contact && (
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Instagram className="w-4 h-4" />
              <div>
                <div className="text-xs text-gray-500">Instagram</div>
                <div className="text-gray-900 font-medium">{association.insta_contact}</div>
              </div>
            </div>
          )}
          {association.num_siret && (
            <div className="flex items-center gap-2 text-gray-600 col-span-2">
              <Building2 className="w-4 h-4" />
              <div>
                <div className="text-xs text-gray-500">SIRET</div>
                <div className="text-gray-900 font-medium">{association.num_siret}</div>
              </div>
            </div>
          )}
        </div>
        {association.desc_association && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">{association.desc_association}</div>
          </div>
        )}
      </div>

      {/* Document Checklist */}
      <div>
        <h3 className="text-gray-900 mb-4">Documents requis</h3>
        <div className="space-y-2">
          {documentStatus.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <DocumentStatusBadge status={item.status} />
                <span className="text-gray-900">{item.label}</span>
              </div>
              {item.doc?.rejectionReason && (
                <div className="text-sm text-red-600">
                  Motif : {item.doc.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssociationDocumentsTab({ documents, onUpload, onDownload, onPreview }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mes documents</h3>
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Déposer un document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucun document déposé</p>
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Déposer votre premier document
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc: any) => (
            <div
              key={doc.id_document}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <DocumentStatusBadge status={doc.statut} />
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{doc.nom_fichier?.split('/').pop() || 'Document'}</div>
                  <div className="text-sm text-gray-600">
                    {doc.type_document_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Déposé le {new Date(doc.date_depot).toLocaleDateString('fr-FR')}
                  </div>
                  {doc.statut === 'submitted' && (
                    <div className="text-sm text-orange-600 mt-1">
                      En cours de vérification par l'administration
                    </div>
                  )}
                  {doc.statut === 'rejected' && doc.commentaire_refus && (
                    <div className="text-sm text-red-600 mt-1">
                      ❌ Refusé : {doc.commentaire_refus}
                    </div>
                  )}
                  {doc.statut === 'approved' && (
                    <div className="text-sm text-green-600 mt-1">
                      ✓ Document validé
                    </div>
                  )}
                  {doc.statut === 'expired' && (
                    <div className="text-sm text-red-600 mt-1">
                      ⚠️ Document expiré - Merci de déposer une nouvelle version
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onPreview(doc)}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  title="Prévisualiser"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDownload(doc)}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

