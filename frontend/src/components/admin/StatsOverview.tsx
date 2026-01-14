import React, { useMemo, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Users, FileText, AlertTriangle } from 'lucide-react';
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
}

export function StatsOverview({ onSelectAssociation }: StatsOverviewProps) {
  const [associations, setAssociations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const stats = useMemo(() => {
    console.log('Loading:', loading, 'Associations count:', associations.length);
    const data = associations;
    const docs = documents;
    
    const total = data.length;
    const active = data.filter(a => (a.status || a.statut) === 'active').length;
    const complete = data.filter(a => a.completionRate === 100).length;
    const incomplete = data.filter(a => a.completionRate < 100 && a.completionRate > 0).length;
    const notStarted = data.filter(a => a.completionRate === 0).length;
    
    const pendingDocs = docs.filter(d => d.status === 'pending').length;
    const expiredDocs = docs.filter(d => d.status === 'expired').length;
    const rejectedDocs = docs.filter(d => d.status === 'rejected').length;

    return {
      total,
      active,
      complete,
      incomplete,
      notStarted,
      pendingDocs,
      expiredDocs,
      rejectedDocs,
    };
  }, [associations, documents, loading]);

  const incompleteAssociations = associations
    .filter(a => a.completionRate < 100)
    .sort((a, b) => a.completionRate - b.completionRate);

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
      {(stats.expiredDocs > 0 || stats.rejectedDocs > 0 || stats.pendingDocs > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Alertes et actions nécessaires
          </h2>
          
          <div className="space-y-3">
            {stats.pendingDocs > 0 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-orange-900">{stats.pendingDocs} document(s) en attente de validation</div>
                  <div className="text-sm text-orange-700 mt-1">
                    Des associations attendent votre validation pour compléter leur dossier
                  </div>
                </div>
              </div>
            )}

            {stats.expiredDocs > 0 && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-red-900">{stats.expiredDocs} document(s) expiré(s)</div>
                  <div className="text-sm text-red-700 mt-1">
                    Certaines associations ont des documents expirés (ex: assurance)
                  </div>
                </div>
              </div>
            )}

            {stats.rejectedDocs > 0 && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-amber-900">{stats.rejectedDocs} document(s) rejeté(s)</div>
                  <div className="text-sm text-amber-700 mt-1">
                    Les associations doivent soumettre à nouveau ces documents
                  </div>
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
                key={association.id}
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
                    <div className="text-gray-900">{association.name}</div>
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
    </div>
  );
}
