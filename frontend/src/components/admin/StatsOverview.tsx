import React, { useMemo, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Users, FileText, AlertTriangle, Check, X, Search } from 'lucide-react';
import { DocumentStatusBadge } from '../shared/DocumentStatusBadge';
import * as API from '../../api';

interface Association {
  id: number;
  name: string;
  ufr: string;
  status: string;
  completionRate: number;
  missingDocuments: number;
}

interface StatsOverviewProps {
  onSelectAssociation: (association: Association) => void;
  refreshKey?: number;
}

const REQUIRED_DOCUMENT_TYPES = ['statuts', 'assurance', 'budget', 'rapport'];

export function StatsOverview({ onSelectAssociation, refreshKey = 0 }: StatsOverviewProps) {
  const [associations, setAssociations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const assoData = await API.getAssociations();
        const assoArray = Array.isArray(assoData) ? assoData : (assoData?.results || []);
        setAssociations(assoArray);
        
        const docData = await API.getDocuments();
        const docArray = Array.isArray(docData) ? docData : (docData?.results || []);
        setDocuments(docArray);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  const handleOpenValidationModal = (doc: any) => {
    setSelectedDocument(doc);
    setShowValidationModal(true);
  };

  const handleApproveDocument = async () => {
    if (!selectedDocument) return;
    const docId = selectedDocument.id_document || selectedDocument.id;
    if (!docId) return;

    setActionLoading((prev) => ({ ...prev, [docId]: true }));
    try {
      await API.approveDocument(docId);
      setDocuments((prev) =>
        prev.map((d) =>
          (d.id_document || d.id) === docId ? { ...d, statut: 'approved', status: 'approved' } : d
        )
      );
      setShowValidationModal(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Erreur lors de l\'approbation du document:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocument || !rejectionReason.trim()) return;
    const docId = selectedDocument.id_document || selectedDocument.id;
    if (!docId) return;

    setActionLoading((prev) => ({ ...prev, [docId]: true }));
    try {
      await API.rejectDocument(docId, rejectionReason);
      setDocuments((prev) =>
        prev.map((d) =>
          (d.id_document || d.id) === docId ? { ...d, statut: 'rejected', status: 'rejected' } : d
        )
      );
      setShowValidationModal(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Erreur lors du rejet du document:', error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [docId]: false }));
    }
  };

  const handlePreviewDocument = async (doc: any) => {
    const docId = doc?.id_document || doc?.id;
    if (!docId) return;
    try {
      const blob = await API.fetchDocumentBlob(docId);
      const url = URL.createObjectURL(new Blob([blob], { type: blob.type || 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du document:', error);
    }
  };

  const stats = useMemo(() => {
    console.log('Loading:', loading, 'Associations count:', associations.length);
    const data = associations;
    const docs = documents;

    const associationHasDocs = (assoc: any) =>
      docs.some(
        (d) => d.id_association === assoc.id_association || d.id_association === assoc.id,
      );

    const normalized = data.map((a) => {
      const assocDocs = docs.filter((d) => d.id_association === a.id_association || d.id_association === a.id);
      const hasDocs = assocDocs.length > 0;
      const approvedTypes = REQUIRED_DOCUMENT_TYPES.filter((type) =>
        assocDocs.some(
          (doc) => doc.type_document_name?.toLowerCase().includes(type.toLowerCase()) && doc.statut === 'approved'
        )
      );
      const approvedCount = approvedTypes.length;
      const totalRequired = REQUIRED_DOCUMENT_TYPES.length;
      const completionRate = totalRequired > 0 ? Math.round((approvedCount / totalRequired) * 100) : 0;

      return { ...a, completionRate, hasDocs };
    });

    const total = normalized.length;
    const active = normalized.filter((a) => (a.status || a.statut) === 'active').length;
    const complete = normalized.filter((a) => a.hasDocs && a.completionRate === 100).length;
    const incomplete = normalized.filter((a) => a.hasDocs && a.completionRate < 100).length;
    const notStarted = normalized.filter((a) => !a.hasDocs).length;

    const statusValue = (d: any) => d.status || d.statut;
    const pendingDocsList = docs.filter((d) => statusValue(d) === 'submitted');
    const pendingDocs = pendingDocsList.length;
    const expiredDocs = docs.filter((d) => statusValue(d) === 'expired').length;
    const rejectedDocs = docs.filter((d) => statusValue(d) === 'rejected').length;

    return {
      total,
      active,
      complete,
      incomplete,
      notStarted,
      pendingDocs,
      pendingDocsList,
      expiredDocs,
      rejectedDocs,
      normalized,
    };
  }, [associations, documents, loading]);

  const incompleteAssociations = stats.normalized
    .filter((a: any) => a.completionRate < 100 || !a.hasDocs)
    .sort((a: any, b: any) => a.completionRate - b.completionRate);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total associations</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-gray-900">{stats.total}</div>
          <div className="text-sm text-green-600 mt-1">
            {stats.active} actives
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Dossiers complets</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-gray-900">{stats.complete}</div>
          <div className="text-sm text-gray-500 mt-1">
            {Math.round((stats.complete / stats.total) * 100)}% du total
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Documents en attente</span>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-gray-900">{stats.pendingDocs}</div>
          <div className="text-sm text-orange-600 mt-1">
            À valider
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Actions requises</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-gray-900">{stats.expiredDocs + stats.rejectedDocs}</div>
          <div className="text-sm text-red-600 mt-1">
            Docs expirés/rejetés
          </div>
        </div>
      </div>

      {/* Alertes importantes */}
      {(stats.pendingDocs > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Alertes et actions nécessaires
          </h2>
          
            <div className="space-y-3">
            {stats.pendingDocs > 0 && (
              <div className="mt-4">
              <div className="space-y-2">
                {stats.pendingDocsList
                .slice(0, 5)
                .map((doc, index) => {
                  const assoc = associations.find(
                  (a) => a.id_association === doc.id_association || a.id === doc.id_association
                  );
                  const docId = doc.id_document || doc.id || `${doc.nom_fichier || 'doc'}-${index}`;
                  const submittedDate = doc.date_depot ? new Date(doc.date_depot).toLocaleDateString('fr-FR') : null;
                  const statusValue = (doc.statut || doc.status || 'submitted') as any;
                  return (
                  <div
                    key={docId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                    <DocumentStatusBadge status={statusValue} />
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="text-gray-900 font-medium">
                      {doc.nom_fichier?.split('/').pop() || doc.type_document_name || 'Document'}
                      </div>
                      {assoc && (
                      <div className="text-xs text-blue-700 font-semibold">
                        Association : {assoc.nom_association || assoc.name}
                      </div>
                      )}
                      <div className="text-sm text-gray-600">
                      {doc.type_document_name || 'Document'}
                      </div>
                      {submittedDate && (
                      <div className="text-xs text-gray-500">Soumis le {submittedDate}</div>
                      )}
                    </div>
                    </div>
                        <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => assoc && onSelectAssociation(assoc)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-white transition disabled:opacity-60"
                      disabled={!assoc}
                    >
                      Voir dossier
                    </button>
                          <button
                            type="button"
                            onClick={() => handlePreviewDocument(doc)}
                            className="p-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-white transition"
                            aria-label="Prévisualiser"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                    <button
                      type="button"
                      onClick={() => handleOpenValidationModal(doc)}
                      className="px-4 py-2 text-sm rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
                    >
                      Traiter
                    </button>
                    </div>
                  </div>
                  );
                })}
              </div>
              </div>
            )}
            </div>
        </div>
      )}

      {/* Associations nécessitant une attention */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-4">Associations nécessitant une attention</h2>
        
        {incompleteAssociations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">Toutes les associations ont un dossier complet !</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incompleteAssociations.slice(0, 5).map((association) => (
              <button
                key={association.id_association}
                onClick={() => onSelectAssociation(association)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {association.completionRate >= 75 && (
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                    )}
                    {association.completionRate >= 50 && association.completionRate < 75 && (
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      </div>
                    )}
                    {association.completionRate < 50 && (
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-left">
                    <div className="text-gray-900">{association.nom_association}</div>
                    <div className="text-sm text-gray-500">{association.ufr}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-700">
                      {association.missingDocuments} doc(s) manquant(s)
                    </div>
                    <div className="text-sm text-gray-500">
                      Complétude : {association.completionRate}%
                    </div>
                  </div>
                  
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        association.completionRate >= 75
                          ? 'bg-yellow-500'
                          : association.completionRate >= 50
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${association.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Répartition par statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-900">Dossiers complets</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-green-900">{stats.complete} associations</div>
          <div className="text-sm text-green-700 mt-1">
            Prêtes pour les subventions
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-900">Dossiers incomplets</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-orange-900">{stats.incomplete} associations</div>
          <div className="text-sm text-orange-700 mt-1">
            Documents manquants
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-900">Non commencés</span>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-red-900">{stats.notStarted} associations</div>
          <div className="text-sm text-red-700 mt-1">
            Relance nécessaire
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Validation du document</h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Document</div>
              <div className="font-semibold text-gray-900">
                {selectedDocument.nom_fichier?.split('/').pop() || 'Document'}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Type : {selectedDocument.type_document_name || 'Non spécifié'}
              </div>
              <div className="text-sm text-gray-600">
                Déposé le {selectedDocument.date_depot ? new Date(selectedDocument.date_depot).toLocaleDateString('fr-FR') : 'N/A'}
              </div>
              {selectedDocument.uploaded_by_email && (
                <div className="text-sm text-gray-600">
                  Par : {selectedDocument.uploaded_by_email}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleApproveDocument}
                disabled={!!actionLoading[selectedDocument.id_document || selectedDocument.id]}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                {actionLoading[selectedDocument.id_document || selectedDocument.id] ? 'Validation...' : 'Valider le document'}
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
                  disabled={!rejectionReason.trim() || !!actionLoading[selectedDocument.id_document || selectedDocument.id]}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5" />
                  {actionLoading[selectedDocument.id_document || selectedDocument.id] ? 'Rejet...' : 'Refuser le document'}
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
