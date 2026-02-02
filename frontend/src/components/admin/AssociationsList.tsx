import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import * as API from '../../api';

interface AssociationsListProps {
  onSelectAssociation: (association: Association) => void;
  refreshKey?: number;
}

type FilterStatus = 'all' | 'complete' | 'incomplete' | 'pending';
type SortField = 'name' | 'completion' | 'missing';

export function AssociationsList({ onSelectAssociation, refreshKey = 0 }: AssociationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterAssociationType, setFilterAssociationType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [associations, setAssociations] = useState<any[]>([]);
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await API.getAssociations();
        
        // Gérer la pagination Django REST Framework
        const assoArray = Array.isArray(data) ? data : (data?.results || []);
        // Convertir les données de la BDD au format attendu
        const formatted = assoArray.map((asso: any) => ({
          id_association: asso.id_association,
          nom_association: asso.nom_association,
          ufr: asso.ufr,
          statut: asso.statut,
          associationType: asso.association_type,
          associationTypeName: asso.association_type_name,
          president: 'Unknown',
          memberCount: 0,
          completionRate: 0,
          missingDocuments: 0,
          email_contact: asso.email_contact,
          tel_contact: asso.tel_contact,
          num_siret: asso.num_siret,
        }));
        setAssociations(formatted);

        // Charger les types d'associations
        const typesData = await API.getAssociationTypes();
        const typesArray = Array.isArray(typesData) ? typesData : (typesData?.results || []);
        setAssociationTypes(typesArray);

        // Charger les documents pour savoir si un dossier existe vraiment
        const docsData = await API.getDocuments();
        const docsArray = Array.isArray(docsData) ? docsData : (docsData?.results || []);
        setDocuments(docsArray);

        // Charger les types de documents
        const docTypesData = await API.getDocumentTypes();
        const docTypesArray = Array.isArray(docTypesData) ? docTypesData : (docTypesData?.results || []);
        setDocumentTypes(docTypesArray);
      } catch (error) {
        console.error('Erreur:', error);
        setAssociations([]);
        setAssociationTypes([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  const filteredAndSortedAssociations = useMemo(() => {
    // Normalisation : un dossier sans aucun document n'est jamais complet
    const docs = documents;
    
    const obligatoryDocTypes = documentTypes.filter((dt: any) => dt.obligatoire);
    const obligatoryTypeNames = obligatoryDocTypes.map((dt: any) => dt.libelle.toLowerCase());
    
    let result = associations.map((a) => {
      // Récupérer les documents de cette association
      const associationDocs = docs.filter((d) => d.id_association === a.id_association);
      const hasDocs = associationDocs.length > 0;

      // Compter les documents obligatoires approuvés
      const approvedObligatoryDocs = associationDocs.filter((doc) => {
        const docTypeName = doc.type_document_name?.toLowerCase() || '';
        return obligatoryTypeNames.some(name => docTypeName.includes(name)) && doc.statut === 'approved';
      }).length;

      const approvedCount = approvedObligatoryDocs;
      const totalRequired = obligatoryDocTypes.length;
      const missingDocuments = Math.max(totalRequired - approvedCount, 0);
      const completionRate = totalRequired > 0 ? Math.round((approvedCount / totalRequired) * 100) : 0;

      return { ...a, completionRate, missingDocuments, hasDocs, validatedCount: approvedCount, totalRequired };
    });

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (a) =>
          a.nom_association.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.ufr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.statut.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'complete') {
      result = result.filter((a) => a.hasDocs && a.completionRate === 100);
    } else if (filterStatus === 'incomplete') {
      result = result.filter((a) => a.hasDocs && a.completionRate < 100);
    } else if (filterStatus === 'pending') {
      result = result.filter((a) => !a.hasDocs);
    }

    // Filter by association type
    if (filterAssociationType !== 'all') {
      result = result.filter((a) => a.associationType === parseInt(filterAssociationType));
    }

    // Sort
    result.sort((a, b) => {
      if (sortField === 'name') {
        return a.nom_association.localeCompare(b.nom_association);
      } else if (sortField === 'completion') {
        return b.completionRate - a.completionRate;
      } else if (sortField === 'missing') {
        return b.missingDocuments - a.missingDocuments;
      }
      return 0;
    });

    return result;
  }, [searchQuery, filterStatus, filterAssociationType, sortField, associations, documents, documentTypes]);

  const getCompletionColor = (rate: number) => {
    if (rate === 100) return 'text-green-700 bg-green-100';
    if (rate >= 75) return 'text-yellow-700 bg-yellow-100';
    if (rate >= 50) return 'text-orange-700 bg-orange-100';
    return 'text-red-700 bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      dormant: 'bg-gray-100 text-gray-700',
      in_creation: 'bg-blue-100 text-blue-700',
    };
    const labels = {
      active: 'Active',
      dormant: 'En sommeil',
      in_creation: 'En création',
    };
    return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] };
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Chargement des associations...</p>
        </div>
      )}

      {!loading && (
        <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Liste des associations</h2>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une association..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="complete">Dossiers complets</option>
            <option value="incomplete">Dossiers incomplets</option>
            <option value="pending">Non commencés</option>
          </select>

          <select
            value={filterAssociationType}
            onChange={(e) => setFilterAssociationType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types</option>
            {associationTypes.map((type: any) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Trier par nom</option>
            <option value="completion">Trier par complétude</option>
            <option value="missing">Trier par docs manquants</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600 mb-4">
          {filteredAndSortedAssociations.length} association(s) trouvée(s)
        </div>
      </div>

      {/* Associations List */}
      <div className="space-y-3">
        {filteredAndSortedAssociations.map((association) => {
          const statusBadge = getStatusBadge(association.statut);
          
          return (
            <button
              key={association.id_association}
              onClick={() => onSelectAssociation(association)}
              className="w-full bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${getCompletionColor(
                        association.completionRate
                      )}`}
                    >
                      {association.completionRate}%
                    </div>
                  </div>

                  {/* Association info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900">{association.nom_association}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{association.ufr}</span>
                      {association.num_siret && (
                        <>
                          <span>•</span>
                          <span>{association.num_siret}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span>{association.email_contact}</span>
                      {association.tel_contact && (
                        <>
                          <span>•</span>
                          <span>{association.tel_contact}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Completion stats */}
                  <div className="flex-shrink-0 text-right">
                    {association.missingDocuments > 0 ? (
                      <>
                        <div className="text-orange-700 font-semibold">
                          {association.missingDocuments} document(s)
                        </div>
                        <div className="text-sm text-gray-500">manquant(s)</div>
                      </>
                    ) : (
                      <>
                        <div className="text-green-700 font-semibold">Complet</div>
                        <div className="text-sm text-gray-500">Tous les docs validés</div>
                        <div className="text-xs text-green-600 mt-1">
                          {association.totalRequired}/{association.totalRequired} requis
                        </div>
                      </>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
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
              </div>
            </button>
          );
        })}

        {filteredAndSortedAssociations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">Aucune association trouvée</p>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
