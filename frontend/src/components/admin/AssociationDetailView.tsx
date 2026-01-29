import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Users, 
  FileText,
  Upload,
  Download,
  Search,
  Check,
  X,
  Clock,
  AlertCircle,
  Edit2,
  Plus,
  Trash2,
} from 'lucide-react';
import { DocumentStatusBadge } from '../shared/DocumentStatusBadge';
import * as API from '../../api';
import { MandatsManager } from './MandatsManager';

interface AssociationData {
  id_association: number;
  nom_association: string;
  ufr: string;
  statut: string;
  email_contact: string;
  tel_contact: string;
  date_creation_association: string;
}

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

interface RoleTypeData {
  id: number;
  name: string;
  description: string;
}

interface MandatData {
  id_mandat: number;
  membre: number;
  membre_detail?: MembreData;
  association: number;
  role_type: number;
  role_type_name?: string;
  statut: 'active' | 'termine' | 'suspendu';
  date_debut: string;
  date_fin: string | null;
}

type DocumentStatus = 'submitted' | 'approved' | 'rejected' | 'expired' | 'draft' | 'missing';
type TabType = 'overview' | 'documents' | 'leaders';

interface AssociationDetailViewProps {
  association: any;
  onBack: () => void;
  onDataChanged?: () => void;
}

const REQUIRED_DOCUMENT_TYPES = ['statuts', 'assurance', 'budget', 'rapport'];

const DOCUMENT_TYPES: Record<string, { label: string }> = {
  statuts: { label: 'Statuts' },
  assurance: { label: 'Assurance' },
  budget: { label: 'Budget' },
  rapport: { label: 'Rapport' },
};

export function AssociationDetailView({ association, onBack, onDataChanged }: AssociationDetailViewProps) {
  const associationId = association.id_association || association.id;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [associationDocs, setAssociationDocs] = useState<DocumentData[]>([]);
  const [associationMembers, setAssociationMembers] = useState<MembreData[]>([]);
  const [associationDetails, setAssociationDetails] = useState<any>(association);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  // Load association documents, members, and full details
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load full association details
        const detailsResponse = await API.getAssociationDetails(association.id_association || association.id);
        setAssociationDetails(detailsResponse);

        // Load all documents and filter by association
        const docsResponse = await API.getDocuments();
        const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
        const filteredDocs = docs.filter((d: any) => d.id_association === associationId);
        setAssociationDocs(filteredDocs);

        // Load members for this association
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

  const handleApproveDocument = async () => {
    if (!selectedDocument) return;
    try {
      await API.approveDocument(selectedDocument.id_document);
      // Reload documents
      const docsResponse = await API.getDocuments();
      const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
      const filteredDocs = docs.filter((d: any) => d.id_association === association.id_association || d.id_association === association.id);
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
      // Reload documents
      const docsResponse = await API.getDocuments();
      const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
      const filteredDocs = docs.filter((d: any) => d.id_association === association.id_association || d.id_association === association.id);
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
      const filteredDocs = docs.filter((d: any) => d.id_association === association.id_association || d.id_association === association.id);
      setAssociationDocs(filteredDocs);
    } catch (err) {
      console.error('Error reloading documents:', err);
    }
  };

  // Calculate completion rate and statistics
  // Count only approved documents for each required type
  const approvedDocsByType = REQUIRED_DOCUMENT_TYPES.map(type => {
    return associationDocs.find(
      d => d.type_document_name?.toLowerCase().includes(type.toLowerCase())
    )?.statut === 'approved';
  }).filter(Boolean).length;

  const documentStats = {
    total: REQUIRED_DOCUMENT_TYPES.length,
    validated: associationDocs.filter(d => d.statut === 'approved').length,
    pending: associationDocs.filter(d => d.statut === 'submitted').length,
    rejected: associationDocs.filter(d => d.statut === 'rejected').length,
    expired: associationDocs.filter(d => d.statut === 'expired').length,
  };

  const completionRate = Math.round((approvedDocsByType / documentStats.total) * 100);
  
  const displayName = association.nom_association;
  const displayUFR = association.ufr;
  const displaySiret = association.num_siret;
  const displayStatus = association.statut;
  const displayEmail = association.email_contact;
  const displayPhone = association.tel_contact;

  // Use association details with fallback to association prop
  const displayAssociation = { ...association, ...associationDetails };

  // Debug description
  console.log('Description values:');
  console.log('desc_association:', displayAssociation.desc_association);
  console.log('description:', displayAssociation.description);
  console.log('Full association:', displayAssociation);

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
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  displayStatus === 'active'
                    ? 'bg-green-100 text-green-700'
                    : displayStatus === 'dormant'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {displayStatus === 'active' ? 'Active' : displayStatus === 'dormant' ? 'En sommeil' : 'En création'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{displayUFR}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{displayEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{displayPhone || 'Non fourni'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Créée le {displayAssociation.date_creation_association || displayAssociation.created_at
                    ? new Date(displayAssociation.date_creation_association || displayAssociation.created_at).toLocaleDateString('fr-FR')
                    : 'Non renseignée'
                  }
                </span>
              </div>
              {(displayAssociation.associationTypeName || displayAssociation.association_type_name) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm font-medium">Type</span>
                  <span>{displayAssociation.associationTypeName || displayAssociation.association_type_name}</span>
                </div>
              )}
              {(displayAssociation.insta_contact || displayAssociation.insta) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm font-medium">@</span>
                  <span>{displayAssociation.insta_contact || displayAssociation.insta}</span>
                </div>
              )}
            </div>
            
            {(displayAssociation.desc_association || displayAssociation.description) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">{displayAssociation.desc_association || displayAssociation.description}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            </div>

            <div className="text-right">
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

        {/* Tab Content */}
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
          associationId={association.id_association || association.id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={reloadDocuments}
          onDataChanged={onDataChanged}
        />
      )}

      {/* Edit Association Modal */}
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

// Sub-components for each tab

interface OverviewTabProps {
  association: any;
  documents: DocumentData[];
  members: MembreData[];
  stats: {
    total: number;
    validated: number;
    pending: number;
    rejected: number;
    expired: number;
  };
  completionRate: number;
}

function OverviewTab({ association, documents, members, stats, completionRate }: OverviewTabProps) {
  const president = members.find((m) => m.statut_membre === 'president');

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700 font-medium mb-1">Documents validés</div>
          <div className="text-2xl font-bold text-green-900">{stats.validated}</div>
          <div className="text-xs text-green-600 mt-1">sur {stats.total} requis</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-sm text-yellow-700 font-medium mb-1">En attente</div>
          <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          <div className="text-xs text-yellow-600 mt-1">À traiter</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-700 font-medium mb-1">Refusés</div>
          <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
          <div className="text-xs text-red-600 mt-1">À corriger</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-700 font-medium mb-1">Taux complet</div>
          <div className="text-2xl font-bold text-purple-900">{completionRate}%</div>
          <div className="text-xs text-purple-600 mt-1">Dossier</div>
        </div>
      </div>

      {/* President info */}
      {president && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-900 mb-3">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Responsable actuel·le</span>
          </div>
          <div className="text-blue-900 font-semibold">
            {president.prenom} {president.nom}
          </div>
          <div className="text-sm text-blue-700">{president.email}</div>
          {president.tel && <div className="text-sm text-blue-700">{president.tel}</div>}
          <div className="text-sm text-blue-700">
            Depuis le {new Date(president.date_adhesion).toLocaleDateString('fr-FR')}
          </div>
        </div>
      )}

      {/* Document checklist */}
      <div>
        <h3 className="text-gray-900 font-semibold mb-4">État des documents requis</h3>
        <div className="space-y-2">
          {REQUIRED_DOCUMENT_TYPES.map((type) => {
            const doc = documents.find(d => d.type_document_name?.toLowerCase() === type.toLowerCase());
            const status = doc?.statut || 'missing';
            
            return (
              <div
                key={type}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DocumentStatusBadge status={status as DocumentStatus} />
                  <span className="text-gray-900 font-medium">{DOCUMENT_TYPES[type]?.label || type}</span>
                </div>
                {doc && (
                  <div className="text-sm text-gray-600">
                    Déposé le {new Date(doc.date_depot).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface DocumentsTabProps {
  documents: DocumentData[];
  onValidateDocument: (doc: DocumentData) => void;
  onDownloadDocument: (doc: DocumentData) => void;
  onPreviewDocument: (doc: DocumentData) => void;
  onUploadClick: () => void;
}

function DocumentsTab({ documents, onValidateDocument, onDownloadDocument, onPreviewDocument, onUploadClick }: DocumentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Gestion des documents</h3>
        <button 
          onClick={onUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Importer un document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun document déposé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id_document}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <DocumentStatusBadge status={doc.statut as DocumentStatus} />
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{doc.nom_fichier.split('/').pop()}</div>
                  <div className="text-sm text-gray-600">
                    {doc.type_document_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Déposé le {new Date(doc.date_depot).toLocaleDateString('fr-FR')} par {doc.uploaded_by_email}
                  </div>
                  {doc.commentaire_refus && (
                    <div className="text-sm text-red-600 mt-1">
                      Motif de refus : {doc.commentaire_refus}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onPreviewDocument(doc)}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  aria-label="Prévisualiser"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDownloadDocument(doc)}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                {doc.statut === 'submitted' && (
                  <button
                    onClick={() => onValidateDocument(doc)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Traiter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface LeadersTabProps {
  associationId: number;
}

function LeadersTab({ associationId }: LeadersTabProps) {
  const [mandats, setMandats] = useState<MandatData[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMandatForm, setShowAddMandatForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les mandats et les types de rôles
        const mandatsResponse = await API.getAssociationMandats(associationId);
        const mandatsArray = Array.isArray(mandatsResponse) ? mandatsResponse : mandatsResponse?.results || [];
        setMandats(mandatsArray);

        const roleTypesResponse = await API.getRoleTypes();
        const roleTypesArray = Array.isArray(roleTypesResponse) ? roleTypesResponse : roleTypesResponse?.results || [];
        setRoleTypes(roleTypesArray);
      } catch (err) {
        console.error('Erreur lors du chargement des mandats:', err);
        setError('Erreur lors du chargement des mandats');
        setMandats([]);
        setRoleTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [associationId]);

  const activeMandats = mandats.filter(m => m.statut === 'active');

  const getRoleTypeName = (roleTypeId: number) => {
    const roleType = roleTypes.find(rt => rt.id === roleTypeId);
    return roleType?.name || 'Rôle inconnu';
  };

  const handleDeleteMandat = async (mandatId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mandat ?')) {
      try {
        await API.deleteMandat(mandatId);
        setMandats(mandats.filter(m => m.id_mandat !== mandatId));
      } catch (err) {
        console.error('Erreur lors de la suppression du mandat:', err);
        setError('Erreur lors de la suppression du mandat');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des mandats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bureau et mandats</h3>
        <button
          onClick={() => setShowAddMandatForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un mandat
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {activeMandats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun mandat actif déclaré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeMandats.map((mandat) => (
            <div
              key={mandat.id_mandat}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-900 font-medium">
                    {mandat.membre_detail?.prenom} {mandat.membre_detail?.nom || 'Membre'}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">{getRoleTypeName(mandat.role_type)}</div>
                  {mandat.membre_detail?.email && (
                    <div className="text-sm text-gray-500">{mandat.membre_detail.email}</div>
                  )}
                  <div className="text-sm text-gray-500">
                    Depuis le {new Date(mandat.date_debut).toLocaleDateString('fr-FR')}
                    {mandat.date_fin && ` • Jusqu'au ${new Date(mandat.date_fin).toLocaleDateString('fr-FR')}`}
                  </div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded inline-block ${
                    mandat.statut === 'active' ? 'bg-green-100 text-green-700' :
                    mandat.statut === 'termine' ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {mandat.statut === 'active' ? 'Actif' : mandat.statut === 'termine' ? 'Terminé' : 'Suspendu'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMandat(mandat.id_mandat)}
                  className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandats terminés */}
      {mandats.filter(m => m.statut === 'termine').length > 0 && (
        <div className="mt-8">
          <h4 className="text-gray-900 font-semibold mb-3">Mandats précédents</h4>
          <div className="space-y-2">
            {mandats.filter(m => m.statut === 'termine').map((mandat) => (
              <div
                key={mandat.id_mandat}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600"
              >
                <span className="font-medium">{mandat.membre_detail?.prenom} {mandat.membre_detail?.nom || 'Membre'}</span>
                {' • '}
                <span>{getRoleTypeName(mandat.role_type)}</span>
                {' • '}
                <span>
                  {new Date(mandat.date_debut).toLocaleDateString('fr-FR')}
                  {mandat.date_fin && ` - ${new Date(mandat.date_fin).toLocaleDateString('fr-FR')}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// Modal pour l'upload de documents
interface UploadDocumentModalProps {
  associationId: number;
  onClose: () => void;
  onSuccess: () => void;
  onDataChanged?: () => void;
}

function UploadDocumentModal({ associationId, onClose, onSuccess, onDataChanged }: UploadDocumentModalProps) {
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState('');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      setError('Veuillez sélectionner un fichier et un type de document');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('nom_fichier', selectedFile);
      formData.append('id_association', associationId.toString());
      formData.append('id_type_document', selectedType);

      await API.uploadDocument(formData);
      onSuccess();
      onClose();
      onDataChanged?.();
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de document</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
            <input
              type="file"
              onChange={handleFileChange}
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
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedType || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Envoi en cours...' : 'Importer'}
          </button>
        </div>
      </div>
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
    email_contact: association.email_contact || '',
    tel_contact: association.tel_contact || '',
    num_siret: association.num_siret || '',
    insta_contact: association.insta_contact || '',
    desc_association: association.desc_association || '',
    statut: association.statut || 'active',
    association_type: association.association_type || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);
  const [associationTypeFilter, setAssociationTypeFilter] = useState('');

  useEffect(() => {
    const loadAssociationTypes = async () => {
      try {
        const data = await API.getAssociationTypes();
        const typesArray = Array.isArray(data) ? data : (data?.results || []);
        setAssociationTypes(typesArray);
      } catch (err) {
        console.error('Error loading association types:', err);
      }
    };
    loadAssociationTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      await API.updateAssociation(association.id_association || association.id, formData);
      onSuccess();
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier l'association</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'association <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom_association"
                  value={formData.nom_association}
                  onChange={handleChange}
                  required
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
                  placeholder="UFR Sciences"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspendue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'association</label>
                <input
                  type="text"
                  placeholder="Chercher un type..."
                  value={associationTypeFilter}
                  onChange={(e) => setAssociationTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                />
                <select
                  name="association_type"
                  value={formData.association_type}
                  onChange={(e) => {
                    handleChange(e);
                    const selected = associationTypes.find((t: any) => t.id.toString() === e.target.value);
                    if (selected) {
                      setAssociationTypeFilter(selected.name);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size={5}
                >
                  <option value="">-- Sélectionner un type --</option>
                  {associationTypes
                    .filter((type: any) => type.name.toLowerCase().includes(associationTypeFilter.toLowerCase()))
                    .map((type: any) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
                <input
                  type="text"
                  name="num_siret"
                  value={formData.num_siret}
                  onChange={handleChange}
                  maxLength={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345678901234"
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

              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="desc_association"
                  value={formData.desc_association}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description de l'association"
                />
              </div>
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