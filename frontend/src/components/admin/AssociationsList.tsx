import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Mail, ChevronRight } from 'lucide-react';
import { mockAssociations, Association } from '../../lib/mockData';

interface AssociationsListProps {
  onSelectAssociation: (association: Association) => void;
}

type FilterStatus = 'all' | 'complete' | 'incomplete' | 'pending';
type SortField = 'name' | 'completion' | 'missing';

export function AssociationsList({ onSelectAssociation }: AssociationsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');

  const filteredAndSortedAssociations = useMemo(() => {
    let result = [...mockAssociations];

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.ufr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'complete') {
      result = result.filter((a) => a.completionRate === 100);
    } else if (filterStatus === 'incomplete') {
      result = result.filter((a) => a.completionRate < 100 && a.completionRate > 0);
    } else if (filterStatus === 'pending') {
      result = result.filter((a) => a.completionRate === 0);
    }

    // Sort
    result.sort((a, b) => {
      if (sortField === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortField === 'completion') {
        return b.completionRate - a.completionRate;
      } else if (sortField === 'missing') {
        return b.missingDocuments - a.missingDocuments;
      }
      return 0;
    });

    return result;
  }, [searchQuery, filterStatus, sortField]);

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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Liste des associations</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
              <Mail className="w-4 h-4" />
              Envoyer un email
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
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
          const statusBadge = getStatusBadge(association.status);
          
          return (
            <button
              key={association.id}
              onClick={() => onSelectAssociation(association)}
              className="w-full bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Status indicator */}
                  <div className="flex-shrink-0 mt-1">
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
                      <h3 className="text-gray-900">{association.name}</h3>
                      {association.acronym && (
                        <span className="text-sm text-gray-500">({association.acronym})</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{association.ufr}</span>
                      <span>•</span>
                      <span>{association.type}</span>
                      {association.siret && (
                        <>
                          <span>•</span>
                          <span>SIRET : {association.siret}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span>{association.email}</span>
                      {association.phone && (
                        <>
                          <span>•</span>
                          <span>{association.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Completion stats */}
                  <div className="flex-shrink-0 text-right">
                    {association.missingDocuments > 0 ? (
                      <>
                        <div className="text-orange-700">
                          {association.missingDocuments} document(s)
                        </div>
                        <div className="text-sm text-gray-500">manquant(s)</div>
                      </>
                    ) : (
                      <>
                        <div className="text-green-700">Complet</div>
                        <div className="text-sm text-gray-500">Tous les docs validés</div>
                      </>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-3" />
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
    </div>
  );
}
