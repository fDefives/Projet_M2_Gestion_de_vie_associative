import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, FileText, Users, Building2 } from 'lucide-react';
import * as API from '../../api';

type SettingsTab = 'documents' | 'roles' | 'associations';

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('documents');
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [docsRes, rolesRes, assosRes] = await Promise.all([
        API.getDocumentTypes(),
        API.getRoleTypes(),
        API.getAssociationTypes(),
      ]);

      const docsList = Array.isArray(docsRes) ? docsRes : docsRes?.results || [];
      const rolesList = Array.isArray(rolesRes) ? rolesRes : rolesRes?.results || [];
      const assosList = Array.isArray(assosRes) ? assosRes : assosRes?.results || [];

      setDocumentTypes(docsList);
      setRoleTypes(rolesList);
      setAssociationTypes(assosList);
    } catch (err) {
      console.error('Erreur lors du chargement des types:', err);
      setError('Impossible de charger les paramètres');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h2>
        <p className="text-gray-600">Gérez les types de documents, rôles et associations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Types de documents ({documentTypes.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Types de rôles ({roleTypes.length})
            </button>
            <button
              onClick={() => setActiveTab('associations')}
              className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'associations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Types d'associations ({associationTypes.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'documents' && (
            <DocumentTypesSection
              types={documentTypes}
              onRefresh={loadData}
              onAdd={() => setShowAddModal(true)}
            />
          )}
          {activeTab === 'roles' && (
            <RoleTypesSection
              types={roleTypes}
              onRefresh={loadData}
              onAdd={() => setShowAddModal(true)}
            />
          )}
          {activeTab === 'associations' && (
            <AssociationTypesSection
              types={associationTypes}
              onRefresh={loadData}
              onAdd={() => setShowAddModal(true)}
            />
          )}
        </div>
      </div>

      {showAddModal && (
        <AddTypeModal
          type={activeTab}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Document Types Section
interface DocumentTypesSectionProps {
  types: any[];
  onRefresh: () => void;
  onAdd: () => void;
}

function DocumentTypesSection({ types, onRefresh, onAdd }: DocumentTypesSectionProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ 
    libelle: '', 
    obligatoire: false, 
    duree_validite_mois: null as number | null,
    expire_si_changement_president: false
  });

  const handleEdit = (type: any) => {
    setEditingId(type.id_type_document);
    setEditData({ 
      libelle: type.libelle, 
      obligatoire: type.obligatoire || false,
      duree_validite_mois: type.duree_validite_mois || null,
      expire_si_changement_president: type.expire_si_changement_president || false
    });
  };

  const handleSave = async (id: number) => {
    try {
      await API.updateDocumentType(id, editData);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Impossible de mettre à jour le type de document');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Supprimer le type "${name}" ?\nCette action est irréversible.`)) {
      try {
        await API.deleteDocumentType(id);
        onRefresh();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Impossible de supprimer ce type (peut-être utilisé par des documents)');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Types de documents</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un type
        </button>
      </div>

      {types.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun type de document</p>
        </div>
      ) : (
        <div className="space-y-2">
          {types.map((type) => (
            <div
              key={type.id_type_document}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {editingId === type.id_type_document ? (
                <div className="flex items-center gap-4 flex-1">
                  <input
                    type="text"
                    value={editData.libelle}
                    onChange={(e) => setEditData({ ...editData, libelle: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du type"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editData.duree_validite_mois || ''}
                      onChange={(e) => setEditData({ ...editData, duree_validite_mois: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12"
                      min="1"
                    />
                    <span className="text-sm text-gray-600">mois</span>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editData.obligatoire}
                      onChange={(e) => setEditData({ ...editData, obligatoire: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Obligatoire
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={editData.expire_si_changement_president}
                      onChange={(e) => setEditData({ ...editData, expire_si_changement_president: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Expire au changement de président
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSave(type.id_type_document)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Enregistrer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                      title="Annuler"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{type.libelle}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          {type.obligatoire ? (
                            <span className="text-red-600 font-medium">Obligatoire</span>
                          ) : (
                            <span className="text-gray-500">Optionnel</span>
                          )}
                          {type.duree_validite_mois && (
                            <span className="ml-2 text-blue-600">• Validité: {type.duree_validite_mois} mois</span>
                          )}
                        </div>
                        {type.expire_si_changement_president && (
                          <div className="text-orange-600 font-medium">
                            ⚠️ Expire au changement de président
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id_type_document, type.libelle)}
                      className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Role Types Section
interface RoleTypesSectionProps {
  types: any[];
  onRefresh: () => void;
  onAdd: () => void;
}

function RoleTypesSection({ types, onRefresh, onAdd }: RoleTypesSectionProps) {
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Supprimer le rôle "${name}" ?\nCette action est irréversible.`)) {
      try {
        await API.deleteRoleType(id);
        onRefresh();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Impossible de supprimer ce rôle (peut-être utilisé par des mandats)');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Types de rôles</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un rôle
        </button>
      </div>

      {types.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun type de rôle</p>
        </div>
      ) : (
        <div className="space-y-2">
          {types.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Users className="w-5 h-5 text-blue-600" />
                <div className="font-medium text-gray-900">{type.name}</div>
              </div>
              <button
                onClick={() => handleDelete(type.id, type.name)}
                className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Association Types Section
interface AssociationTypesSectionProps {
  types: any[];
  onRefresh: () => void;
  onAdd: () => void;
}

function AssociationTypesSection({ types, onRefresh, onAdd }: AssociationTypesSectionProps) {
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Supprimer le type "${name}" ?\nCette action est irréversible.`)) {
      try {
        await API.deleteAssociationType(id);
        onRefresh();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Impossible de supprimer ce type (peut-être utilisé par des associations)');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Types d'associations</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un type
        </button>
      </div>

      {types.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Aucun type d'association</p>
        </div>
      ) : (
        <div className="space-y-2">
          {types.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div className="font-medium text-gray-900">{type.name}</div>
              </div>
              <button
                onClick={() => handleDelete(type.id, type.name)}
                className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add Type Modal
interface AddTypeModalProps {
  type: SettingsTab;
  onClose: () => void;
  onSuccess: () => void;
}

function AddTypeModal({ type, onClose, onSuccess }: AddTypeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    libelle: '',
    description: '',
    obligatoire: false,
    duree_validite_mois: null as number | null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const getTitle = () => {
    switch (type) {
      case 'documents':
        return 'Nouveau type de document';
      case 'roles':
        return 'Nouveau type de rôle';
      case 'associations':
        return "Nouveau type d'association";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      switch (type) {
        case 'documents':
          await API.createDocumentType({
            libelle: formData.libelle,
            obligatoire: formData.obligatoire,
            duree_validite_mois: formData.duree_validite_mois,
          });
          break;
        case 'roles':
          const createdRole = await API.createRoleType({
            name: formData.name,
          });
          break;
        case 'associations':
          await API.createAssociationType({
            name: formData.name,
          });
          break;
      }
      onSuccess();
    } catch (err) {
      console.error('Erreur lors de la création:', err);
      setError('Impossible de créer ce type');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(23, 23, 23, 0.54)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{getTitle()}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {type === 'documents' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Libellé <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.libelle}
                    onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Statuts, Assurance, Budget..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de validité (en mois)
                  </label>
                  <input
                    type="number"
                    value={formData.duree_validite_mois || ''}
                    onChange={(e) => setFormData({ ...formData, duree_validite_mois: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 12 pour 1 an, 24 pour 2 ans..."
                    min="1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="obligatoire"
                    checked={formData.obligatoire}
                    onChange={(e) => setFormData({ ...formData, obligatoire: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="obligatoire" className="text-sm text-gray-700">
                    Document obligatoire
                  </label>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={type === 'roles' ? 'Ex: Président, Trésorier...' : 'Ex: Culturelle, Sportive...'}
                />
              </div>
            )}
          </div>

          <div className="h-6" />
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
