import React, { useState, useEffect } from 'react';
import { LogOut, FileText, AlertCircle, CheckCircle2, Clock, Download, Edit2, Search, Building2, Mail, Phone, Instagram, Upload } from 'lucide-react';
import { User } from '../App';
import { DocumentStatusBadge } from './shared/DocumentStatusBadge';
import { MandatsManager } from './admin/MandatsManager';
import { UserUploadDocumentModal } from './shared/modals/UserUploadDocumentModal';
import { UserEditAssociationModal } from './shared/modals/UserEditAssociationModal';
import * as API from '../api';

interface AssociationDashboardProps {
  user: User;
  onLogout: () => void;
}

type AssociationTab = 'overview' | 'documents' | 'leaders';

export function AssociationDashboard({ user, onLogout }: AssociationDashboardProps) {
  const [activeTab, setActiveTab] = useState<AssociationTab>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [association, setAssociation] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
          // Trouver les types de documents obligatoires
          const requiredDocTypes = documentTypes.filter((dt: any) => dt.obligatoire);
          const obligatoryTypeNames = requiredDocTypes.map((dt: any) => dt.libelle.toLowerCase());
          
          // Compter les documents obligatoires approuvés
          const approvedObligatoryDocs = documents.filter((d: any) => {
            const docTypeName = d.type_document_name?.toLowerCase() || '';
            return obligatoryTypeNames.some(name => docTypeName.includes(name)) && d.statut === 'approved';
          }).length;
          
          const totalObligatory = requiredDocTypes.length;
          const completionRate = totalObligatory > 0 ? Math.round((approvedObligatoryDocs / totalObligatory) * 100) : 100;
          
          return completionRate < 100 && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-orange-900 mb-1">Votre dossier est incomplet</div>
                  <p className="text-sm text-orange-800">
                    Il manque {totalObligatory - approvedObligatoryDocs} document(s) obligatoire(s) pour valider votre dossier. Cela pourrait impacter
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
          // Trouver les types de documents obligatoires
          const requiredDocTypes = documentTypes.filter((dt: any) => dt.obligatoire);
          const obligatoryTypeNames = requiredDocTypes.map((dt: any) => dt.libelle.toLowerCase());
          
          // Compter les documents obligatoires approuvés
          const approvedObligatoryDocs = documents.filter((d: any) => {
            const docTypeName = d.type_document_name?.toLowerCase() || '';
            return obligatoryTypeNames.some(name => docTypeName.includes(name)) && d.statut === 'approved';
          }).length;
          
          const totalObligatory = requiredDocTypes.length;
          const completionRate = totalObligatory > 0 ? Math.round((approvedObligatoryDocs / totalObligatory) * 100) : 100;
          
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

        {(() => {
          // Vérifier les documents qui expirent dans les 2 prochains mois
          const twoMonthsFromNow = new Date();
          twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
          
          const expiringDocs = documents.filter((d: any) => {
            if (!d.date_expiration || d.statut !== 'approved') return false;
            const expirationDate = new Date(d.date_expiration);
            const now = new Date();
            return expirationDate > now && expirationDate <= twoMonthsFromNow;
          });
          
          return expiringDocs.length > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-yellow-900 mb-1">Documents à renouveler prochainement</div>
                  <p className="text-sm text-yellow-800 mb-2">
                    {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expire{expiringDocs.length > 1 ? 'nt' : ''} dans les 2 prochains mois :
                  </p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {expiringDocs.map((doc: any) => (
                      <li key={doc.id_document} className="flex items-center gap-2">
                        <span className="font-medium">{doc.type_document_name}</span>
                        <span>- expire le {new Date(doc.date_expiration).toLocaleDateString('fr-FR')}</span>
                      </li>
                    ))}
                  </ul>
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
                documentTypes={documentTypes}
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
        <UserUploadDocumentModal
          associationId={association?.id_association}
          onClose={() => setShowUploadModal(false)}
          onSuccess={loadData}
        />
      )}

      {/* Edit Association Modal */}
      {showEditModal && (
        <UserEditAssociationModal
          association={association}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

// Sub-components

function AssociationOverviewTab({ association, documents, documentTypes }: any) {
  // Filtrer les types de documents obligatoires pour les statistiques
  const requiredDocTypes = documentTypes.filter((dt: any) => dt.obligatoire);
  const obligatoryTypeNames = requiredDocTypes.map((dt: any) => dt.libelle.toLowerCase());
  
  // Créer le statut pour TOUS les documents (obligatoires et non obligatoires)
  const documentStatus = documentTypes.map((docType: any) => {
    const doc = documents.find((d: any) => 
      d.type_document_name?.toLowerCase() === docType.libelle.toLowerCase()
    );
    
    let status: 'submitted' | 'approved' | 'rejected' | 'expired' | 'draft' | 'missing' = 'missing';
    if (doc) {
      status = doc.statut;
    }
    
    return {
      type: docType.libelle.toLowerCase(),
      label: docType.libelle,
      status,
      doc,
      isRequired: docType.obligatoire,
    };
  });

  // Calculer les stats uniquement sur les documents obligatoires
  const obligatoryDocs = documents.filter((d: any) => {
    const docTypeName = d.type_document_name?.toLowerCase() || '';
    return obligatoryTypeNames.some(name => docTypeName.includes(name));
  });
  
  const validatedCount = obligatoryDocs.filter((d: any) => d.statut === 'approved').length;
  const pendingCount = obligatoryDocs.filter((d: any) => d.statut === 'submitted').length;
  const actionCount = obligatoryDocs.filter(
    (d: any) => d.statut === 'rejected' || d.statut === 'expired'
  ).length;
  const missingCount = documentStatus.filter(ds => ds.status === 'missing' && ds.isRequired).length;

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
        <h3 className="text-gray-900 mb-4">Tous les documents</h3>
        <div className="space-y-2">
          {documentStatus.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <DocumentStatusBadge status={item.status} />
                <span className="text-gray-900">
                  {item.label}
                  {item.isRequired && <span className="ml-2 text-xs text-red-600 font-semibold">*</span>}
                </span>
              </div>
              {item.doc?.rejectionReason && (
                <div className="text-sm text-red-600">
                  Motif : {item.doc.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          * Document obligatoire
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
                      ✗ Document expiré
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

