import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  FileText,
  Download,
  Search,
  Check,
  X,
  Clock,
  AlertCircle,
  Edit2,
  Plus,
  Users,
  Trash2,
} from 'lucide-react';
import { DocumentStatusBadge } from '../shared/DocumentStatusBadge';
import * as API from '../../api';
import { MandatsManager } from './MandatsManager';
import { OverviewTab } from './tabs/OverviewTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { LeadersTab } from './tabs/LeadersTab';
import { UploadDocumentModal } from './modals/UploadDocumentModal';
import { EditAssociationModal } from './modals/EditAssociationModal';

interface DocumentData {
  id_document: number;
  nom_fichier: string;
  statut: 'submitted' | 'approved' | 'rejected' | 'expired' | 'draft';
  id_type_document: number;
  type_document_name: string;
  date_depot: string;
  date_expiration: string;
  uploaded_by_email: string;
  commentaire_refus: string;
}

interface MembreData {
  id_membre: number;
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  statut_membre: string;
  date_adhesion: string;
  date_fin_adhesion: string;
}

type DocumentStatus = 'submitted' | 'approved' | 'rejected' | 'expired' | 'draft' | 'missing';
type TabType = 'overview' | 'documents' | 'leaders';

interface AssociationDetailViewProps {
  association: any;
  onBack: () => void;
  onDataChanged?: () => void;
}

export function AssociationDetailView({ association, onBack, onDataChanged }: AssociationDetailViewProps) {
  const associationId = association.id_association || association.id;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [associationDocs, setAssociationDocs] = useState<DocumentData[]>([]);
  const [associationMembers, setAssociationMembers] = useState<MembreData[]>([]);
  const [editingDocStatus, setEditingDocStatus] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [associationDetails, setAssociationDetails] = useState<any>(association);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);

  const loadMembers = async (id: number) => {
    try {
      const membersResponse = await API.getAssociationMembers(id);
      const membersArray = Array.isArray(membersResponse)
        ? membersResponse
        : membersResponse?.results || [];
      setAssociationMembers(membersArray);
    } catch (err) {
      console.error('Error loading association members:', err);
      setAssociationMembers([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const detailsResponse = await API.getAssociationDetails(association.id_association || association.id);
        setAssociationDetails(detailsResponse);

        const docsResponse = await API.getDocuments();
        const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
        const filteredDocs = docs.filter((d: any) => d.id_association === associationId);
        setAssociationDocs(filteredDocs);

        const typesData = await API.getDocumentTypes();
        setDocumentTypes(Array.isArray(typesData) ? typesData : typesData?.results || []);

        await loadMembers(associationId);
      } catch (err) {
        console.error('Error loading association data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [associationId]);

  const handleValidateDocument = (doc: DocumentData) => {
    setSelectedDocument(doc);
    setShowValidationModal(true);
  };

  const handleUpdateDocumentStatus = async (docId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await API.updateDocument(docId, { statut: newStatus });
      
      setAssociationDocs(prevDocs => 
        prevDocs.map(doc => 
          doc.id_document === docId ? { ...doc, statut: newStatus as any } : doc
        )
      );
      
      setEditingDocStatus(null);
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Impossible de mettre à jour le statut du document');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApproveDocument = async () => {
    if (!selectedDocument) return;
    try {
      await API.approveDocument(selectedDocument.id_document);
      const docsResponse = await API.getDocuments();
      const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
      const filteredDocs = docs.filter((d: any) => d.id_association === associationId);
      setAssociationDocs(filteredDocs);
      setShowValidationModal(false);
      onDataChanged?.();
    } catch (err) {
      console.error('Error approving document:', err);
      setError('Erreur lors de l\'approbation du document');
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocument || !rejectionReason.trim()) return;
    try {
      await API.rejectDocument(selectedDocument.id_document, rejectionReason);
      const docsResponse = await API.getDocuments();
      const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
      const filteredDocs = docs.filter((d: any) => d.id_association === associationId);
      setAssociationDocs(filteredDocs);
      setShowValidationModal(false);
      setRejectionReason('');
      onDataChanged?.();
    } catch (err) {
      console.error('Error rejecting document:', err);
      setError('Erreur lors du rejet du document');
    }
  };

  const handleDownloadDocument = async (doc: DocumentData) => {
    try {
      await API.downloadDocument(doc.id_document, doc.nom_fichier);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Erreur lors du téléchargement du document');
    }
  };

  const handlePreviewDocument = async (doc: DocumentData) => {
    try {
      const blob = await API.fetchDocumentBlob(doc.id_document);
      const url = URL.createObjectURL(new Blob([blob], { type: blob.type || 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error('Error previewing document:', err);
      setError('Erreur lors de l\'ouverture du document');
    }
  };

  const reloadDocuments = async () => {
    try {
      const docsResponse = await API.getDocuments();
      const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
      const filteredDocs = docs.filter((d: any) => d.id_association === associationId);
      setAssociationDocs(filteredDocs);
    } catch (err) {
      console.error('Error reloading documents:', err);
    }
  };

  const requiredDocTypes = documentTypes.filter((dt: any) => dt.obligatoire);
  const obligatoryTypeNames = requiredDocTypes.map((dt: any) => dt.libelle.toLowerCase());
  
  const approvedDocsByType = requiredDocTypes.map(type => {
    return associationDocs.find(
      d => d.type_document_name?.toLowerCase().includes(type.libelle.toLowerCase())
    )?.statut === 'approved';
  }).filter(Boolean).length;

  const obligatoryDocs = associationDocs.filter((d: any) => {
    const docTypeName = d.type_document_name?.toLowerCase() || '';
    return obligatoryTypeNames.some(name => docTypeName.includes(name));
  });

  const documentStats = {
    total: requiredDocTypes.length,
    validated: obligatoryDocs.filter(d => d.statut === 'approved').length,
    pending: obligatoryDocs.filter(d => d.statut === 'submitted').length,
    rejected: obligatoryDocs.filter(d => d.statut === 'rejected').length,
    expired: associationDocs.filter(d => d.statut === 'expired').length,
  };

  const completionRate = Math.round((approvedDocsByType / documentStats.total) * 100);

  const displayAssociation = { ...association, ...associationDetails };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à la liste
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">{association.nom_association}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  association.statut === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {association.statut === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{displayAssociation.ufr || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{displayAssociation.email_contact || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{displayAssociation.tel_contact || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {displayAssociation.date_creation_association
                    ? new Date(displayAssociation.date_creation_association).toLocaleDateString('fr-FR')
                    : '-'}
                </span>
              </div>
              {displayAssociation.num_siret && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>SIRET: {displayAssociation.num_siret}</span>
                </div>
              )}
            </div>
            
            {association.desc_association && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                <div className="text-sm text-gray-600">{association.desc_association}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>

            <div>
              <div className="text-sm text-gray-600 mb-1">Complétude du dossier</div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      completionRate === 100
                        ? 'bg-green-500'
                        : completionRate >= 75
                        ? 'bg-yellow-500'
                        : completionRate >= 50
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span className="text-gray-900 font-semibold">{completionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
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
              Documents ({associationDocs.length})
            </button>
            <button
              onClick={() => setActiveTab('leaders')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'leaders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Membres ({associationMembers.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement des données...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  association={association}
                  documents={associationDocs}
                  members={associationMembers}
                  documentTypes={documentTypes}
                  stats={documentStats}
                  completionRate={completionRate}
                />
              )}

              {activeTab === 'documents' && (
                <DocumentsTab
                  documents={associationDocs}
                  onValidateDocument={handleValidateDocument}
                  onDownloadDocument={handleDownloadDocument}
                  onPreviewDocument={handlePreviewDocument}
                  onUploadClick={() => setShowUploadModal(true)}
                  editingDocStatus={editingDocStatus}
                  onEditStatus={setEditingDocStatus}
                  onUpdateStatus={handleUpdateDocumentStatus}
                  updatingStatus={updatingStatus}
                />
              )}

              {activeTab === 'leaders' && (
                <MandatsManager
                  associationId={associationId}
                  onDataChanged={async () => {
                    await loadMembers(associationId);
                    onDataChanged?.();
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedDocument && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(23, 23, 23, 0.54)' }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Validation du document</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Document</div>
              <div className="font-semibold text-gray-900">{selectedDocument.nom_fichier.split('/').pop()}</div>
              <div className="text-sm text-gray-600 mt-2">
                Type : {selectedDocument.type_document_name || 'Non spécifié'}
              </div>
              <div className="text-sm text-gray-600">
                Déposé le {new Date(selectedDocument.date_depot).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleApproveDocument}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Check className="w-5 h-5" />
                Valider le document
              </button>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-gray-700 font-medium mb-2">Ou refuser avec un motif :</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Document non signé, mauvaise année..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                  rows={3}
                />
                <button
                  onClick={handleRejectDocument}
                  disabled={!rejectionReason.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  Refuser le document
                </button>
              </div>
            </div>

            <div className="h-6" />
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApproveDocument}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          associationId={associationId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={reloadDocuments}
          onDataChanged={onDataChanged}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditAssociationModal
          association={displayAssociation}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
