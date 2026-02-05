import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import * as API from '../../../api';

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

interface RoleTypeData {
  id: number;
  name: string;
  description: string;
}

interface MandatData {
  id_mandat: number;
  membre: number;
  membre_detail?: MembreData;
  association: number;
  role_type: number;
  role_type_name?: string;
  statut: 'active' | 'termine' | 'suspendu';
  date_debut: string;
  date_fin: string | null;
}

interface LeadersTabProps {
  associationId: number;
}

export function LeadersTab({ associationId }: LeadersTabProps) {
  const [mandats, setMandats] = useState<MandatData[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les mandats et les types de rôles
        const mandatsResponse = await API.getAssociationMandats(associationId);
        const mandatsArray = Array.isArray(mandatsResponse) ? mandatsResponse : mandatsResponse?.results || [];
        setMandats(mandatsArray);

        const roleTypesResponse = await API.getRoleTypes();
        const roleTypesArray = Array.isArray(roleTypesResponse) ? roleTypesResponse : roleTypesResponse?.results || [];
        setRoleTypes(roleTypesArray);
      } catch (err) {
        console.error('Erreur lors du chargement des mandats:', err);
        setError('Erreur lors du chargement des mandats');
        setMandats([]);
        setRoleTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [associationId]);

  const activeMandats = mandats.filter(m => m.statut === 'active');

  const getRoleTypeName = (roleTypeId: number) => {
    const roleType = roleTypes.find(rt => rt.id === roleTypeId);
    return roleType?.name || 'Rôle inconnu';
  };

  const handleDeleteMandat = async (mandatId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mandat ?')) {
      try {
        await API.deleteMandat(mandatId);
        setMandats(mandats.filter(m => m.id_mandat !== mandatId));
      } catch (err) {
        console.error('Erreur lors de la suppression du mandat:', err);
        setError('Erreur lors de la suppression du mandat');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des mandats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bureau et mandats</h3>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un mandat
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {activeMandats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun mandat actif déclaré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeMandats.map((mandat) => (
            <div
              key={mandat.id_mandat}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-900 font-medium">
                    {mandat.membre_detail?.prenom} {mandat.membre_detail?.nom || 'Membre'}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold">{getRoleTypeName(mandat.role_type)}</div>
                  {mandat.membre_detail?.email && (
                    <div className="text-sm text-gray-500">{mandat.membre_detail.email}</div>
                  )}
                  <div className="text-sm text-gray-500">
                    Depuis le {new Date(mandat.date_debut).toLocaleDateString('fr-FR')}
                    {mandat.date_fin && ` • Jusqu'au ${new Date(mandat.date_fin).toLocaleDateString('fr-FR')}`}
                  </div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded inline-block ${
                    mandat.statut === 'active' ? 'bg-green-100 text-green-700' :
                    mandat.statut === 'termine' ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {mandat.statut === 'active' ? 'Actif' : mandat.statut === 'termine' ? 'Terminé' : 'Suspendu'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMandat(mandat.id_mandat)}
                  className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandats terminés */}
      {mandats.filter(m => m.statut === 'termine').length > 0 && (
        <div className="mt-8">
          <h4 className="text-gray-900 font-semibold mb-3">Mandats précédents</h4>
          <div className="space-y-2">
            {mandats.filter(m => m.statut === 'termine').map((mandat) => (
              <div
                key={mandat.id_mandat}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600"
              >
                <span className="font-medium">{mandat.membre_detail?.prenom} {mandat.membre_detail?.nom || 'Membre'}</span>
                {' • '}
                <span>{getRoleTypeName(mandat.role_type)}</span>
                {' • '}
                <span>
                  {new Date(mandat.date_debut).toLocaleDateString('fr-FR')}
                  {mandat.date_fin && ` - ${new Date(mandat.date_fin).toLocaleDateString('fr-FR')}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
