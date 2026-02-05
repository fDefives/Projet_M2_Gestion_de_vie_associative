import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import * as API from '../../../api';

interface Mandat {
  id_mandat: number;
  membre: {
    id_membre: number;
    prenom: string;
    nom: string;
  };
  role_type: {
    id: number;
    name: string;
  };
  date_debut: string;
  date_fin: string;
  statut: string;
}

interface MandatsByYear {
  [year: number]: Mandat[];
}

interface MandatsHistoryTabProps {
  associationId: number;
}

export function MandatsHistoryTab({ associationId }: MandatsHistoryTabProps) {
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [mandatsByYear, setMandatsByYear] = useState<MandatsByYear>({});
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMandats();
  }, [associationId]);

  const loadMandats = async () => {
    try {
      setLoading(true);
      const data = await API.getAssociationMandats(associationId);
      const mandatsList = Array.isArray(data) ? data : data?.results || [];
      
      // Filtrer seulement les mandats terminés
      const finishedMandats = mandatsList.filter((m: Mandat) => m.statut === 'termine');
      setMandats(finishedMandats);

      // Grouper par année de fin
      const grouped: MandatsByYear = {};
      finishedMandats.forEach((mandat: Mandat) => {
        const year = new Date(mandat.date_fin).getFullYear();
        if (!grouped[year]) {
          grouped[year] = [];
        }
        grouped[year].push(mandat);
      });

      // Trier les années en ordre décroissant
      setMandatsByYear(grouped);
    } catch (error) {
      console.error('Erreur lors du chargement des mandats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const years = Object.keys(mandatsByYear)
    .map(Number)
    .sort((a, b) => b - a); // Ordre décroissant

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement de l'historique...</p>
      </div>
    );
  }

  if (mandats.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Aucun mandat terminé pour cette association</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Historique des mandats
        </h3>
        <p className="text-sm text-blue-700 mt-1">
          {mandats.length} mandat(s) terminé(s)
        </p>
      </div>

      {years.map((year) => (
        <div key={year} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Year Header / Dropdown Button */}
          <button
            onClick={() => toggleYear(year)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {expandedYears.has(year) ? (
                <ChevronUp className="w-5 h-5 text-blue-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
              <span className="font-semibold text-gray-900">{year}</span>
              <span className="text-sm text-gray-600">
                ({mandatsByYear[year].length} mandat{mandatsByYear[year].length > 1 ? 's' : ''})
              </span>
            </div>
          </button>

          {/* Year Content */}
          {expandedYears.has(year) && (
            <div className="divide-y divide-gray-200">
              {mandatsByYear[year].map((mandat) => (
                <div key={mandat.id_mandat} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {mandat.membre.prenom} {mandat.membre.nom}
                      </div>
                      <div className="text-sm text-blue-600 font-medium mt-1">
                        {mandat.role_type.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <div>
                          Début: <span className="font-medium">{new Date(mandat.date_debut).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div>
                          Fin: <span className="font-medium">{new Date(mandat.date_fin).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                        Terminé
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
