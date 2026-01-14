import React, { useState, useEffect } from 'react';
import { LogOut, FileText, Users, Upload, AlertCircle, CheckCircle2, Clock, Download, Plus, Edit2, Trash2 } from 'lucide-react';
import { User } from '../App';
import { mockAssociations, mockDocuments, mockLeaders, DOCUMENT_TYPES, DocumentType } from '../lib/mockData';
import { DocumentStatusBadge } from './shared/DocumentStatusBadge';
import * as API from '../api';

interface AssociationDashboardProps {
  user: User;
  onLogout: () => void;
}

type AssociationTab = 'overview' | 'documents' | 'leaders';

export function AssociationDashboard({ user, onLogout }: AssociationDashboardProps) {
  const [activeTab, setActiveTab] = useState<AssociationTab>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('statuts');
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<any>(null);
  const [association, setAssociation] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssociation = async () => {
      try {
        const assos = await API.getAssociations();
        if (assos && assos.length > 0) {
          setAssociation(assos[0]);
        }
        const docs = await API.getDocuments();
        setDocuments(docs || []);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAssociation();
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

  const associationLeaders = mockLeaders.filter((l) => l.associationId === user.associationId);

  const handleUploadDocument = () => {
    console.log('Upload document:', selectedDocType);
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">{association.name}</h1>
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
        {/* Completion Alert */}
        {association.completionRate < 100 && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-orange-900 mb-1">Votre dossier est incomplet</div>
                <p className="text-sm text-orange-800">
                  Il manque {association.missingDocuments} document(s) pour valider votre dossier. Cela pourrait impacter
                  l'attribution de subventions.
                </p>
              </div>
              <div className="text-right">
                <div className="text-orange-900">{association.completionRate}%</div>
                <div className="text-xs text-orange-700">Complétude</div>
              </div>
            </div>
          </div>
        )}

        {association.completionRate === 100 && (
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
        )}

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
                leaders={associationLeaders}
              />
            )}

            {activeTab === 'documents' && (
              <AssociationDocumentsTab
                documents={documents}
                onUpload={() => setShowUploadModal(true)}
              />
            )}

            {activeTab === 'leaders' && (
              <AssociationLeadersTab 
                leaders={associationLeaders}
                onEdit={(leader) => {
                  setEditingLeader(leader);
                  setShowLeaderModal(true);
                }}
                onAdd={() => {
                  setEditingLeader(null);
                  setShowLeaderModal(true);
                }}
                onDelete={(leaderId) => {
                  console.log('Delete leader:', leaderId);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-gray-900 mb-4">Déposer un document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Type de document</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Fichier</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">Cliquez pour sélectionner un fichier</p>
                  <p className="text-sm text-gray-500">ou glissez-déposez un fichier ici</p>
                  <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG (max 10 Mo)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUploadDocument}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Déposer le document
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leader Modal */}
      {showLeaderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-gray-900 mb-4">Modifier un dirigeant</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={editingLeader?.firstName || ''}
                  onChange={(e) => setEditingLeader({ ...editingLeader, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={editingLeader?.lastName || ''}
                  onChange={(e) => setEditingLeader({ ...editingLeader, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingLeader?.email || ''}
                  onChange={(e) => setEditingLeader({ ...editingLeader, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={editingLeader?.phone || ''}
                  onChange={(e) => setEditingLeader({ ...editingLeader, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Update the leader in the mock data
                    const index = associationLeaders.findIndex((l) => l.id === editingLeader.id);
                    if (index !== -1) {
                      associationLeaders[index] = editingLeader;
                    }
                    setShowLeaderModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowLeaderModal(false)}
                  className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components

function AssociationOverviewTab({ association, documents, leaders }: any) {
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

  const validatedCount = documents.filter((d: any) => d.status === 'validated').length;
  const pendingCount = documents.filter((d: any) => d.status === 'pending').length;
  const actionCount = documents.filter(
    (d: any) => d.status === 'rejected' || d.status === 'expired'
  ).length;
  const missingCount = requiredDocs.length - documents.length;

  const president = leaders.find((l: any) => l.role === 'president');

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-700">Validés</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-green-900">{validatedCount}</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-700">En attente</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-orange-900">{pendingCount}</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-700">Action requise</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-red-900">{actionCount}</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Manquants</span>
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <div className="text-gray-900">{missingCount}</div>
        </div>
      </div>

      {/* Association Info */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-blue-900 mb-3">Informations de l'association</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-blue-700">UFR</div>
            <div className="text-blue-900">{association.ufr}</div>
          </div>
          <div>
            <div className="text-blue-700">Type</div>
            <div className="text-blue-900">{association.type}</div>
          </div>
          <div>
            <div className="text-blue-700">Email</div>
            <div className="text-blue-900">{association.email}</div>
          </div>
          {association.phone && (
            <div>
              <div className="text-blue-700">Téléphone</div>
              <div className="text-blue-900">{association.phone}</div>
            </div>
          )}
          {association.siret && (
            <div className="col-span-2">
              <div className="text-blue-700">SIRET</div>
              <div className="text-blue-900">{association.siret}</div>
            </div>
          )}
        </div>
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

function AssociationDocumentsTab({ documents, onUpload }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">Mes documents</h3>
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
                    Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                  </div>
                  {doc.status === 'pending' && (
                    <div className="text-sm text-orange-600 mt-1">
                      En cours de vérification par l'administration
                    </div>
                  )}
                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <div className="text-sm text-red-600 mt-1">
                      ❌ Refusé : {doc.rejectionReason}
                    </div>
                  )}
                  {doc.status === 'validated' && doc.validatedAt && (
                    <div className="text-sm text-green-600 mt-1">
                      ✓ Validé le {new Date(doc.validatedAt).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  {doc.status === 'expired' && (
                    <div className="text-sm text-red-600 mt-1">
                      ⚠️ Document expiré - Merci de déposer une nouvelle version
                    </div>
                  )}
                </div>
              </div>

              <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssociationLeadersTab({ leaders, onEdit, onAdd, onDelete }: any) {
  const roleLabels = {
    president: 'Président·e',
    treasurer: 'Trésorier·e',
    secretary: 'Secrétaire',
    member: 'Membre',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">Bureau de l'association</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
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
            <div key={leader.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-gray-900">
                    {leader.firstName} {leader.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{roleLabels[leader.role as keyof typeof roleLabels]}</div>
                  <div className="text-sm text-gray-500 mt-1">{leader.email}</div>
                  {leader.phone && <div className="text-sm text-gray-500">{leader.phone}</div>}
                  <div className="text-sm text-gray-500 mt-1">
                    En fonction depuis le {new Date(leader.startDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(leader)}
                    className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(leader.id)}
                    className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}