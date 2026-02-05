import { Upload, FileText, Search, Download, Edit2, X } from 'lucide-react';
import { DocumentStatusBadge } from '../../shared/DocumentStatusBadge';

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

type DocumentStatus = 'submitted' | 'approved' | 'rejected' | 'expired' | 'draft' | 'missing';

interface DocumentsTabProps {
  documents: DocumentData[];
  onValidateDocument: (doc: DocumentData) => void;
  onDownloadDocument: (doc: DocumentData) => void;
  onPreviewDocument: (doc: DocumentData) => void;
  onUploadClick: () => void;
  editingDocStatus: number | null;
  onEditStatus: (docId: number | null) => void;
  onUpdateStatus: (docId: number, status: string) => void;
  updatingStatus: boolean;
}

export function DocumentsTab({
  documents,
  onValidateDocument,
  onDownloadDocument,
  onPreviewDocument,
  onUploadClick,
  editingDocStatus,
  onEditStatus,
  onUpdateStatus,
  updatingStatus,
}: DocumentsTabProps) {
  const statusOptions = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'submitted', label: 'Soumis' },
    { value: 'approved', label: 'Approuvé' },
    { value: 'rejected', label: 'Rejeté' },
    { value: 'expired', label: 'Expiré' },
  ];

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
                {editingDocStatus === doc.id_document ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={doc.statut}
                      onChange={(e) => onUpdateStatus(doc.id_document, e.target.value)}
                      disabled={updatingStatus}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => onEditStatus(null)}
                      disabled={updatingStatus}
                      className="p-1 text-gray-600 hover:bg-white rounded transition-colors"
                      title="Annuler"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <DocumentStatusBadge status={doc.statut as DocumentStatus} />
                    <button
                      onClick={() => onEditStatus(doc.id_document)}
                      className="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Modifier le statut"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
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
