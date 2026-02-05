import { Users } from 'lucide-react';
import { DocumentStatusBadge } from '../../shared/DocumentStatusBadge';

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

interface OverviewTabProps {
  association: any;
  documents: DocumentData[];
  members: MembreData[];
  documentTypes: any[];
  stats: {
    total: number;
    validated: number;
    pending: number;
    rejected: number;
    expired: number;
  };
  completionRate: number;
}

export function OverviewTab({ association, documents, members, documentTypes, stats, completionRate }: OverviewTabProps) {
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

      {/* Document checklist - affiche TOUS les types de documents */}
      <div>
        <h3 className="text-gray-900 font-semibold mb-4">État de tous les documents</h3>
        <div className="space-y-2">
          {documentTypes.map((type: any) => {
            const doc = documents.find(d => d.type_document_name?.toLowerCase() === type.libelle.toLowerCase());
            const status = doc?.statut || 'missing';
            
            return (
              <div
                key={type.id_type_document}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <DocumentStatusBadge status={status as DocumentStatus} />
                  <span className="text-gray-900 font-medium">
                    {type.libelle}
                    {type.obligatoire && <span className="ml-2 text-xs text-red-600 font-semibold">*</span>}
                  </span>
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
        <div className="text-xs text-gray-500 mt-2">
          * Document obligatoire
        </div>
      </div>
    </div>
  );
}
