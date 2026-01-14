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

interface Association {
  id: number;
  name: string;
  ufr: string;
  status: string;
}

type DocumentType = 'statuts' | 'assurance' | 'budget' | 'rapport';

const DOCUMENT_TYPES: Record<DocumentType, { label: string }> = {
  statuts: { label: 'Statuts' },
  assurance: { label: 'Assurance' },
  budget: { label: 'Budget' },
  rapport: { label: 'Rapport' },
};

interface AssociationDetailViewProps {
  association: Association;
  onBack: () => void;
}

type TabType = 'overview' | 'documents' | 'leaders' | 'history';

export function AssociationDetailView({ association, onBack }: AssociationDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [associationDocs, setAssociationDocs] = useState<any[]>([]);
  const [associationLeaders, setAssociationLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const docs = await API.getDocuments();
        setAssociationDocs(Array.isArray(docs) ? docs : docs?.results || []);
        
        // Load leaders from API if available
        setAssociationLeaders([]);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [association.id]);

  const handleValidateDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowValidationModal(true);
  };

  const handleRejectDocument = () => {
    console.log('Document rejected:', selectedDocument, rejectionReason);
    setShowValidationModal(false);
    setRejectionReason('');
  };

  const handleApproveDocument = () => {
    console.log('Document approved:', selectedDocument);
    setShowValidationModal(false);
  };

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
              <h1 className="text-gray-900">{association.name}</h1>
              {association.acronym && (
                <span className="text-gray-500 text-xl">({association.acronym})</span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  association.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : association.status === 'dormant'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {association.status === 'active' ? 'Active' : association.status === 'dormant' ? 'En sommeil' : 'En création'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{association.ufr}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{association.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{association.email}</span>
              </div>
              {association.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{association.phone}</span>
                </div>
              )}
            </div>

            {association.siret && (
              <div className="mt-3 text-sm text-gray-600">
                <span>SIRET : {association.siret}</span>
              </div>
            )}
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
                      association.completionRate === 100
                        ? 'bg-green-500'
                        : association.completionRate >= 75
                        ? 'bg-yellow-500'
                        : association.completionRate >= 50
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${association.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-gray-900">{association.completionRate}%</span>
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
              Dirigeants ({associationLeaders.length})
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
          {activeTab === 'overview' && (
            <OverviewTab
              association={association}
              documents={associationDocs}
              leaders={associationLeaders}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              documents={associationDocs}
              onValidateDocument={handleValidateDocument}
              onUpload={() => setShowUploadModal(true)}
            />
          )}

          {activeTab === 'leaders' && <LeadersTab leaders={associationLeaders} />}

          {activeTab === 'history' && <HistoryTab associationId={association.id} />}
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-gray-900 mb-4">Validation du document</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Document</div>
              <div className="text-gray-900">{selectedDocument.fileName}</div>
              <div className="text-sm text-gray-600 mt-2">
                Type : {DOCUMENT_TYPES[selectedDocument.type as DocumentType].label}
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
                <label className="block text-gray-700 mb-2">Ou refuser avec un motif :</label>
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
              onClick={() => setShowValidationModal(false)}
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

function OverviewTab({ association, documents, leaders }: any) {
  const requiredDocs = Object.keys(DOCUMENT_TYPES) as DocumentType[];
  const documentStatus = requiredDocs.map((type) => {
    const doc = documents.find((d: any) => d.type === type);
    return {
      type,
      label: DOCUMENT_TYPES[type].label,
      status: doc ? doc.status : 'missing',
      doc,
    };
  });

  const president = leaders.find((l: any) => l.role === 'president');

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700 mb-1">Documents validés</div>
          <div className="text-green-900">
            {documents.filter((d: any) => d.status === 'validated').length} / {requiredDocs.length}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-700 mb-1">En attente</div>
          <div className="text-orange-900">
            {documents.filter((d: any) => d.status === 'pending').length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="text-sm text-red-700 mb-1">Action requise</div>
          <div className="text-red-900">
            {documents.filter((d: any) => d.status === 'rejected' || d.status === 'expired').length}
          </div>
        </div>
      </div>

      {/* President info */}
      {president && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-900 mb-2">
            <Users className="w-4 h-4" />
            <span>Président·e actuel·le</span>
          </div>
          <div className="text-blue-900">
            {president.firstName} {president.lastName}
          </div>
          <div className="text-sm text-blue-700">{president.email}</div>
          <div className="text-sm text-blue-700">
            En fonction depuis le {new Date(president.startDate).toLocaleDateString('fr-FR')}
          </div>
        </div>
      )}

      {/* Document checklist */}
      <div>
        <h3 className="text-gray-900 mb-4">État des documents requis</h3>
        <div className="space-y-2">
          {documentStatus.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <DocumentStatusBadge status={item.status} />
                <span className="text-gray-900">{item.label}</span>
              </div>
              {item.doc && (
                <div className="text-sm text-gray-600">
                  Déposé le {new Date(item.doc.uploadedAt).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ documents, onValidateDocument, onUpload }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Gestion des documents</h3>
        <button
          onClick={onUpload}
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
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <DocumentStatusBadge status={doc.status} />
                <div className="flex-1">
                  <div className="text-gray-900">{doc.fileName}</div>
                  <div className="text-sm text-gray-600">
                    {DOCUMENT_TYPES[doc.type as DocumentType].label}
                  </div>
                  <div className="text-sm text-gray-500">
                    Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} par {doc.uploadedBy}
                  </div>
                  {doc.rejectionReason && (
                    <div className="text-sm text-red-600 mt-1">
                      Motif de refus : {doc.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                {doc.status === 'pending' && (
                  <button
                    onClick={() => onValidateDocument(doc)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Valider / Refuser
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

function LeadersTab({ leaders }: any) {
  const roleLabels = {
    president: 'Président·e',
    treasurer: 'Trésorier·e',
    secretary: 'Secrétaire',
    member: 'Membre',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900">Bureau de l'association</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter un dirigeant
        </button>
      </div>

      {leaders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun dirigeant déclaré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((leader: any) => (
            <div
              key={leader.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-900">
                    {leader.firstName} {leader.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{roleLabels[leader.role as keyof typeof roleLabels]}</div>
                  <div className="text-sm text-gray-500">{leader.email}</div>
                  {leader.phone && <div className="text-sm text-gray-500">{leader.phone}</div>}
                  <div className="text-sm text-gray-500">
                    En fonction depuis le {new Date(leader.startDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ associationId }: any) {
  const mockHistory = [
    {
      id: '1',
      date: '2024-12-20T16:45:00',
      action: 'Document déposé',
      details: 'Charte universitaire 2024.pdf',
      user: 'Thomas Leroy',
    },
    {
      id: '2',
      date: '2024-09-15T14:30:00',
      action: 'Document refusé',
      details: 'PV AG 2024.pdf - Document non signé',
      user: 'Marie Goupille Bergère',
    },
    {
      id: '3',
      date: '2024-01-22T09:10:00',
      action: 'Document validé',
      details: 'Liste bureau 2024.pdf',
      user: 'Marie Goupille Bergère',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-gray-900">Historique des actions</h3>

      <div className="space-y-3">
        {mockHistory.map((entry) => (
          <div key={entry.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">{entry.action}</div>
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