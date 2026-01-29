import React, { useState } from 'react';
import { LogOut, Users, FileText, BarChart3, Settings, Plus } from 'lucide-react';
import DocumentsList from './admin/DocumentsList';
import { User } from '../App';
import { AssociationsList } from './admin/AssociationsList';
import { AssociationDetailView } from './admin/AssociationDetailView';
import { StatsOverview } from './admin/StatsOverview';
import { SettingsPanel } from './admin/SettingsPanel';
import * as API from '../api';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'overview' | 'associations' | 'documents' | 'subsidies' | 'settings';

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newAsso, setNewAsso] = useState({
    nom_association: '',
    ufr: '',
    num_siret: '',
    date_creation_association: new Date().toISOString().split('T')[0],
    email_contact: '',
    tel_contact: '',
    insta_contact: '',
    association_type: '',
  });
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);
  const [associationTypeFilter, setAssociationTypeFilter] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Load association types on mount
  React.useEffect(() => {
    const loadTypes = async () => {
      try {
        const data = await API.getAssociationTypes();
        const typesArray = Array.isArray(data) ? data : (data?.results || []);
        setAssociationTypes(typesArray);
      } catch (error) {
        console.error('Erreur lors du chargement des types:', error);
      }
    };
    loadTypes();
  }, []);

  // Fonctions de validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    // Accepte les formats: 0612345678, +33612345678, 06 12 34 56 78, etc.
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
    const cleanPhone = phone.replace(/[\s\-\.]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const isValidSiret = (siret: string): boolean => {
    // SIRET doit être exactement 14 chiffres
    return /^\d{14}$/.test(siret);
  };

  const isValidDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate <= today;
  };

  const handleSelectAssociation = (association: Association) => {
    setSelectedAssociation(association);
    setCurrentView('associations');
  };

  const handleDataChanged = () => setRefreshKey((k) => k + 1);

  const handleBackToList = () => {
    setSelectedAssociation(null);
  };

  const handleCancelCreate = () => {
    setNewAsso({
      nom_association: '',
      ufr: '',
      num_siret: '',
      date_creation_association: new Date().toISOString().split('T')[0],
      email_contact: '',
      tel_contact: '',
    });
    setNewUser({ email: '', password: '' });
    setAssociationTypeFilter('');
    setShowCreateModal(false);
  };

  const handleCreateAssociation = async () => {
    // Vérifications basiques
    if (!newAsso.nom_association || !newAsso.ufr || !newAsso.num_siret || !newAsso.date_creation_association || !newAsso.email_contact || !newAsso.tel_contact || !newAsso.association_type) {
      alert('Tous les champs association sont obligatoires');
      return;
    }
    if (!newUser.email || !newUser.password) {
      alert('Email et mot de passe du compte association sont obligatoires');
      return;
    }

    // Validations spécifiques
    if (!isValidEmail(newAsso.email_contact)) {
      alert('Format d\'email de contact invalide. Exemple: contact@association.fr');
      return;
    }

    if (!isValidEmail(newUser.email)) {
      alert('Format d\'email utilisateur invalide. Exemple: user@mail.com');
      return;
    }

    if (!isValidSiret(newAsso.num_siret)) {
      alert('SIRET invalide. Le SIRET doit contenir exactement 14 chiffres.');
      return;
    }

    if (!isValidPhoneNumber(newAsso.tel_contact)) {
      alert('Numéro de téléphone invalide. Veuillez entrer un numéro français valide (ex: 0612345678 ou +33612345678).');
      return;
    }

    if (!isValidDate(newAsso.date_creation_association)) {
      alert('La date de création ne peut pas être dans le futur.');
      return;
    }

    if (newUser.password.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        ...newAsso,
        user_email: newUser.email,
        user_password: newUser.password,
      };

      await API.createAssociation(payload);
      alert('Association créée avec succès!');
      setNewAsso({
        nom_association: '',
        ufr: '',
        num_siret: '',
        date_creation_association: new Date().toISOString().split('T')[0],
        email_contact: '',
        tel_contact: '',
        insta_contact: '',
        association_type: '',
      });
      setNewUser({ email: '', password: '' });
      setAssociationTypeFilter('');
      setShowCreateModal(false);
      // Refresh associations list
      setCurrentView('associations');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-gray-900">Gestion Vie Associative</h1>
              <span className="text-gray-500 text-sm">Administration</span>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-2 sticky top-24">
              <button
                onClick={() => { setCurrentView('overview'); setSelectedAssociation(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'overview' && !selectedAssociation
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Vue d'ensemble</span>
              </button>

              <button
                onClick={() => { setCurrentView('associations'); setSelectedAssociation(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'associations' && !selectedAssociation
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Associations</span>
              </button>

              <button
                onClick={() => { setCurrentView('documents'); setSelectedAssociation(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'documents'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Documents</span>
              </button>

              <div className="my-2 border-t border-gray-200"></div>

              <button
                onClick={() => { setCurrentView('settings'); setSelectedAssociation(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Paramètres</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {currentView === 'overview' && !selectedAssociation && (
              <StatsOverview onSelectAssociation={handleSelectAssociation} refreshKey={refreshKey} />
            )}

            {currentView === 'associations' && !selectedAssociation && (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Créer une association
                  </button>
                </div>
                <AssociationsList onSelectAssociation={handleSelectAssociation} />
              </>
            )}

            {/* Modal de création */}
            {showCreateModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(23, 23, 23, 0.54)' }}>
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full my-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer une association</h2>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                          <input
                            type="text"
                            value={newAsso.nom_association}
                            onChange={(e) => setNewAsso({ ...newAsso, nom_association: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nom de l'association"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">UFR</label>
                          <input
                            type="text"
                            value={newAsso.ufr}
                            onChange={(e) => setNewAsso({ ...newAsso, ufr: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="UFR Sciences"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
                          <input
                            type="text"
                            value={newAsso.num_siret}
                            onChange={(e) => setNewAsso({ ...newAsso, num_siret: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="12345678901234"
                            maxLength="14"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date de création</label>
                          <input
                            type="date"
                            value={newAsso.date_creation_association}
                            onChange={(e) => setNewAsso({ ...newAsso, date_creation_association: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                          <input
                            type="email"
                            value={newAsso.email_contact}
                            onChange={(e) => setNewAsso({ ...newAsso, email_contact: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="contact@association.fr"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                          <input
                            type="tel"
                            value={newAsso.tel_contact}
                            onChange={(e) => setNewAsso({ ...newAsso, tel_contact: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="01234567890"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Type d'association</label>
                          <input
                            type="text"
                            placeholder="Chercher un type..."
                            value={associationTypeFilter}
                            onChange={(e) => setAssociationTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                          />
                          <select
                            value={newAsso.association_type}
                            onChange={(e) => {
                              setNewAsso({ ...newAsso, association_type: e.target.value });
                              const selected = associationTypes.find((t: any) => t.id.toString() === e.target.value);
                              if (selected) {
                                setAssociationTypeFilter(selected.name);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            size={5}
                            required
                          >
                            <option value="">-- Sélectionner un type --</option>
                            {associationTypes
                              .filter((type: any) => type.name.toLowerCase().includes(associationTypeFilter.toLowerCase()))
                              .map((type: any) => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                          <input
                            type="text"
                            value={newAsso.insta_contact}
                            onChange={(e) => setNewAsso({ ...newAsso, insta_contact: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="@association"
                          />
                        </div>
                      </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ marginTop: '5%' }}>Email utilisateur</label>
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="user@mail.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ marginTop: '5%' }}>Mot de passe</label>
                          <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="********"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-6" />
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={handleCancelCreate}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreateAssociation}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Création...' : 'Créer'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedAssociation && (
              <AssociationDetailView
                association={selectedAssociation}
                onBack={handleBackToList}
                onDataChanged={handleDataChanged}
              />
            )}

            {currentView === 'documents' && !selectedAssociation && (
              <DocumentsList />
            )}

            {currentView === 'settings' && (
              <SettingsPanel />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
