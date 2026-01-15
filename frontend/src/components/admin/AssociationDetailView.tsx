import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Users, 
  FileText,
  Upload,
  Download,
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
  statut: 'validated' | 'pending' | 'rejected' | 'expired' | 'missing';
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

type DocumentStatus = 'validated' | 'pending' | 'rejected' | 'expired' | 'missing';
type TabType = 'overview' | 'documents' | 'leaders' | 'history';

interface AssociationDetailViewProps {
  association: any;
  onBack: () => void;
}

const REQUIRED_DOCUMENT_TYPES = ['statuts', 'assurance', 'budget', 'rapport'];

const DOCUMENT_TYPES: Record<string, { label: string }> = {
  statuts: { label: 'Statuts' },
  assurance: { label: 'Assurance' },
  budget: { label: 'Budget' },
  rapport: { label: 'Rapport' },
};

export function AssociationDetailView({ association, onBack }: AssociationDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [associationDocs, setAssociationDocs] = useState<DocumentData[]>([]);
  const [associationMembers, setAssociationMembers] = useState<MembreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load association documents and members
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all documents and filter by association
        const docsResponse = await API.getDocuments();
        const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
        const filteredDocs = docs.filter((d: any) => d.id_association === association.id_association || d.id_association === association.id);
        setAssociationDocs(filteredDocs);

        // Load members for this association
        setAssociationMembers([]);
      } catch (err) {
        console.error('Error loading association data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [association.id_association || association.id]);

  const handleValidateDocument = (doc: DocumentData) => {
    setSelectedDocument(doc);
    setShowValidationModal(true);
  };

  const handleApproveDocument = async () => {
    if (!selectedDocument) return;
    try {
      // Call API to approve document
      console.log('Approving document:', selectedDocument.id_document);
      // Reload documents
      const docsResponse = await API.getDocuments();
      const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
      const filteredDocs = docs.filter((d: any) => d.id_association === association.id_association || d.id_association === association.id);
      setAssociationDocs(filteredDocs);
      setShowValidationModal(false);
    } catch (err) {
      console.error('Error approving document:', err);
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocument || !rejectionReason.trim()) return;
    try {
      // Call API to reject document
      console.log('Rejecting document:', selectedDocument.id_document, rejectionReason);
      // Reload documents
      const docsResponse = await API.getDocuments();
      const docs = Array.isArray(docsResponse) ? docsResponse : docsResponse?.results || [];
      const filteredDocs = docs.filter((d: any) => d.id_association === association.id_association || d.id_association === association.id);
      setAssociationDocs(filteredDocs);
      setShowValidationModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting document:', err);
    }
  };

  // Calculate completion rate and statistics
  const documentStats = {
    total: REQUIRED_DOCUMENT_TYPES.length,
    validated: associationDocs.filter(d => d.statut === 'validated').length,
    pending: associationDocs.filter(d => d.statut === 'pending').length,
    rejected: associationDocs.filter(d => d.statut === 'rejected').length,
    expired: associationDocs.filter(d => d.statut === 'expired').length,
  };

  const completionRate = Math.round((documentStats.validated / documentStats.total) * 100);
  
  const displayName = association.nom_association || association.name;
  const displayUFR = association.ufr;
  const displayStatus = association.statut || association.status;
  const displayEmail = association.email_contact || association.email;
  const displayPhone = association.tel_contact || association.phone;

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
                <span>Créée le {new Date(association.date_creation_association || association.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Mail className="w-4 h-4" />
                Envoyer un email
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
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
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Historique
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
                />
              )}

              {activeTab === 'leaders' && (
                <LeadersTab associationId={association.id_association || association.id} />
              )}

              {activeTab === 'history' && (
                <HistoryTab associationId={association.id_association || association.id} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Validation du document</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Document</div>
              <div className="font-semibold text-gray-900">{selectedDocument.nom_fichier}</div>
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

            <button
              onClick={() => {
                setShowValidationModal(false);
                setRejectionReason('');
              }}
              className="w-full mt-4 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
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
}

function DocumentsTab({ documents, onValidateDocument }: DocumentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Gestion des documents</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
                  <div className="text-gray-900 font-medium">{doc.nom_fichier}</div>
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
                <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                {doc.statut === 'pending' && (
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

interface HistoryTabProps {
  associationId: number;
}

function HistoryTab({ associationId }: HistoryTabProps) {
  // For now, using placeholder history
  const mockHistory = [
    {
      id: '1',
      date: new Date().toISOString(),
      action: 'Fiche créée',
      details: 'Fiche association créée dans le système',
      user: 'Admin',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Historique des actions</h3>

      <div className="space-y-3">
        {mockHistory.map((entry) => (
          <div key={entry.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900 font-medium">{entry.action}</div>
              <div className="text-sm text-gray-600">{entry.details}</div>
              <div className="text-sm text-gray-500 mt-1">
                Par {entry.user} • {new Date(entry.date).toLocaleDateString('fr-FR')} à{' '}
                {new Date(entry.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}