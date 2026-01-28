import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, Edit2, Mail, Phone, Plus, Save, Trash2, UserCircle, Users, X } from 'lucide-react';
import * as API from '../../api';

interface MandatsManagerProps {
  associationId: number;
  onDataChanged?: () => void;
}

interface MandatData {
  id_mandat: number;
  membre: number;
  membre_nom?: string;
  membre_detail?: MembreData;
  association: number;
  association_nom?: string;
  role_type: number;
  role_type_name?: string;
  statut: 'active' | 'termine' | 'suspendu';
  date_debut: string;
  date_fin?: string | null;
}

interface RoleTypeData {
  id: number;
  name: string;
  description?: string;
}

interface MembreData {
  id_membre: number;
  prenom: string;
  nom: string;
  email: string;
  tel?: string;
  statut_membre: string;
}

export function MandatsManager({ associationId, onDataChanged }: MandatsManagerProps) {
  const [mandats, setMandats] = useState<MandatData[]>([]);
  const [membres, setMembres] = useState<MembreData[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMandat, setEditingMandat] = useState<MandatData | null>(null);
  const [showNewMembreForm, setShowNewMembreForm] = useState(false);
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    membre: '',
    role_type: '',
    statut: 'active' as 'active' | 'termine' | 'suspendu',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: '',
  });

  const [newMembreData, setNewMembreData] = useState({
    prenom: '',
    nom: '',
    email: '',
    tel: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const mandatsResponse = await API.getAssociationMandats(associationId);
      const mandatsArray = Array.isArray(mandatsResponse)
        ? mandatsResponse
        : mandatsResponse?.results || [];
      setMandats(mandatsArray);

      const membresResponse = await API.getAssociationMembers(associationId);
      const membresArray = Array.isArray(membresResponse)
        ? membresResponse
        : membresResponse?.results || [];
      setMembres(membresArray);

      const roleTypesResponse = await API.getRoleTypes();
      const roleTypesArray = Array.isArray(roleTypesResponse)
        ? roleTypesResponse
        : roleTypesResponse?.results || [];
      setRoleTypes(roleTypesArray);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingMandat(null);
    setShowAddForm(false);
    setShowNewMembreForm(false);
    setFormData({
      membre: '',
      role_type: '',
      statut: 'active',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: '',
    });
    setNewMembreData({ prenom: '', nom: '', email: '', tel: '' });
  };

  const handleSubmitMandat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let membreId = parseInt(formData.membre, 10);

      if (showNewMembreForm) {
        const newMembre = await API.createMembre({
          ...newMembreData,
          statut_membre: 'actif',
          date_adhesion: new Date().toISOString().split('T')[0],
        });
        membreId = newMembre.id_membre;
      }

      const payload = {
        membre: membreId,
        association: associationId,
        role_type: parseInt(formData.role_type, 10),
        statut: formData.statut,
        date_debut: formData.date_debut,
        date_fin: formData.date_fin || null,
      };

      if (editingMandat) {
        await API.updateMandat(editingMandat.id_mandat, payload);
      } else {
        await API.createMandat(payload);
      }

      await loadData();
      onDataChanged?.();
      resetForm();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du mandat:', err);
      setError("Impossible d'enregistrer le mandat");
    }
  };

  const handleEditMandat = (mandat: MandatData) => {
    setEditingMandat(mandat);
    setShowAddForm(true);
    setShowNewMembreForm(false);
    setFormData({
      membre: mandat.membre.toString(),
      role_type: mandat.role_type.toString(),
      statut: mandat.statut,
      date_debut: mandat.date_debut,
      date_fin: mandat.date_fin || '',
    });
  };

  const handleDeleteMandat = async (id: number) => {
    const confirmDelete = window.confirm('Supprimer ce mandat ?');
    if (!confirmDelete) return;

    try {
      await API.deleteMandat(id);
      setMandats((prev) => prev.filter((m) => m.id_mandat !== id));
      onDataChanged?.();
    } catch (err) {
      console.error('Erreur lors de la suppression du mandat:', err);
      setError('Suppression impossible');
    }
  };

  const getMembreInfo = (id: number) => membres.find((m) => m.id_membre === id);
  const getRoleTypeName = (id: number) => roleTypes.find((r) => r.id === id)?.name || 'Rôle';

  // Separate active and past mandates
  const activeMandats = useMemo(() => mandats.filter((m) => m.statut !== 'termine'), [mandats]);
  const terminedMandats = useMemo(() => mandats.filter((m) => m.statut === 'termine'), [mandats]);

  // Group active mandates by role
  const mandatsByRole = useMemo(() => {
    return activeMandats.reduce<Record<string, MandatData[]>>((acc, mandat) => {
      const roleName = mandat.role_type_name || getRoleTypeName(mandat.role_type);
      acc[roleName] = acc[roleName] ? [...acc[roleName], mandat] : [mandat];
      return acc;
    }, {});
  }, [activeMandats, roleTypes]);

  // Group terminated mandates by period (year range)
  const pastBureauByPeriod = useMemo(() => {
    return terminedMandats.reduce<Record<string, MandatData[]>>((acc, mandat) => {
      const startDate = new Date(mandat.date_debut);
      const endDate = mandat.date_fin ? new Date(mandat.date_fin) : new Date();
      const period = `${startDate.getFullYear()} - ${endDate.getFullYear()}`;
      acc[period] = acc[period] ? [...acc[period], mandat] : [mandat];
      return acc;
    }, {});
  }, [terminedMandats]);

  const togglePeriod = (period: string) => {
    setExpandedPeriods((prev) => ({
      ...prev,
      [period]: !prev[period],
    }));
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600 bg-white rounded-xl border border-gray-200">
        Chargement des mandats...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion des mandats</h3>
          <p className="text-sm text-gray-600">Bureau et rôles des membres</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (showAddForm) resetForm();
          }}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Fermer' : 'Ajouter un mandat'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

      {/* Formulaire d'ajout au-dessus */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-900">
              {editingMandat ? 'Modifier le mandat' : 'Créer un mandat'}
            </h4>
            {editingMandat && (
              <button
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                onClick={resetForm}
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitMandat} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membre *</label>
                {!showNewMembreForm ? (
                  <div className="space-y-2">
                    <select
                      required
                      value={formData.membre}
                      onChange={(e) => setFormData({ ...formData, membre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un membre existant</option>
                      {membres.map((membre) => (
                        <option key={membre.id_membre} value={membre.id_membre}>
                          {membre.prenom} {membre.nom} ({membre.email})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMembreForm(true);
                        setFormData({ ...formData, membre: '' });
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Ou créer un nouveau membre
                    </button>
                  </div>
                ) : (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Nouveau membre</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewMembreForm(false);
                          setNewMembreData({ prenom: '', nom: '', email: '', tel: '' });
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Prénom *"
                        value={newMembreData.prenom}
                        onChange={(e) => setNewMembreData({ ...newMembreData, prenom: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Nom *"
                        value={newMembreData.nom}
                        onChange={(e) => setNewMembreData({ ...newMembreData, nom: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Email *"
                        value={newMembreData.email}
                        onChange={(e) => setNewMembreData({ ...newMembreData, email: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="tel"
                        placeholder="Téléphone"
                        value={newMembreData.tel}
                        onChange={(e) => setNewMembreData({ ...newMembreData, tel: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  required
                  value={formData.role_type}
                  onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un rôle</option>
                  {roleTypes.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                <input
                  type="date"
                  required
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnelle)</label>
                <input
                  type="date"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                <select
                  required
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'active' | 'termine' | 'suspendu' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Actif</option>
                  <option value="termine">Terminé</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingMandat ? 'Enregistrer les modifications' : 'Créer le mandat'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bureau actuel */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-4">Bureau actuel</h4>
        {Object.keys(mandatsByRole).length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun bureau actif déclaré</p>
            <p className="text-sm text-gray-500 mt-1">Commencez par créer les mandats des membres du bureau</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(mandatsByRole).map(([roleName, roleMandats]) => (
              <div key={roleName} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">{roleName}</h4>
                  <p className="text-sm text-gray-600">{roleMandats.length} personne(s)</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {roleMandats.map((mandat) => (
                    <MandatCard
                      key={mandat.id_mandat}
                      mandat={mandat}
                      onEdit={handleEditMandat}
                      onDelete={handleDeleteMandat}
                      getMembreInfo={getMembreInfo}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bureaux passés */}
      {Object.keys(pastBureauByPeriod).length > 0 && (
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-4">Bureaux précédents</h4>
          <div className="space-y-3">
            {Object.entries(pastBureauByPeriod)
              .sort(([periodA], [periodB]) => periodB.localeCompare(periodA))
              .map(([period, mandats]) => (
                <div key={period} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => togglePeriod(period)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-left">
                      <h5 className="font-semibold text-gray-900">Période {period}</h5>
                      <p className="text-sm text-gray-600">{mandats.length} mandat(s)</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        expandedPeriods[period] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedPeriods[period] && (
                    <div className="divide-y divide-gray-200 bg-gray-50">
                      {mandats.map((mandat) => (
                        <div key={mandat.id_mandat} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <UserCircle className="w-6 h-6 text-gray-500" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {mandat.membre_detail?.prenom} {mandat.membre_detail?.nom}
                                </div>
                                <div className="text-sm text-blue-600 font-medium">
                                  {mandat.role_type_name}
                                </div>
                                {mandat.membre_detail?.email && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                    <Mail className="w-3 h-3" />
                                    {mandat.membre_detail.email}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(mandat.date_debut).toLocaleDateString('fr-FR')}
                                  {mandat.date_fin && ` - ${new Date(mandat.date_fin).toLocaleDateString('fr-FR')}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleEditMandat(mandat)}
                                className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMandat(mandat.id_mandat)}
                                className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors"
                                title="Supprimer"
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
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MandatCardProps {
  mandat: MandatData;
  onEdit: (mandat: MandatData) => void;
  onDelete: (id: number) => void;
  getMembreInfo: (id: number) => MembreData | undefined;
}

function MandatCard({ mandat, onEdit, onDelete, getMembreInfo }: MandatCardProps) {
  const membre = mandat.membre_detail || getMembreInfo(mandat.membre);

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-8 h-8 text-blue-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h5 className="text-gray-900 font-semibold">
                {membre?.prenom || 'Prénom'} {membre?.nom || 'Nom'}
              </h5>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  mandat.statut === 'active'
                    ? 'bg-green-100 text-green-700'
                    : mandat.statut === 'termine'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {mandat.statut === 'active' ? 'Actif' : mandat.statut === 'termine' ? 'Terminé' : 'Suspendu'}
              </span>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              {membre?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {membre.email}
                </div>
              )}
              {membre?.tel && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {membre.tel}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Depuis le {new Date(mandat.date_debut).toLocaleDateString('fr-FR')}
                {mandat.date_fin && ` • Jusqu'au ${new Date(mandat.date_fin).toLocaleDateString('fr-FR')}`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(mandat)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(mandat.id_mandat)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
