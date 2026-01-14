import React, { useState, useEffect } from 'react';
import { LogOut, Users, FileText, BarChart3, Settings, Search, Filter, Download, Mail, Plus } from 'lucide-react';
import { User } from '../App';
import { AssociationsList } from './admin/AssociationsList';
import { AssociationDetailView } from './admin/AssociationDetailView';
import { StatsOverview } from './admin/StatsOverview';
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
  const [newAsso, setNewAsso] = useState({
    nom_association: '',
    ufr: '',
    email_contact: '',
    tel_contact: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSelectAssociation = (association: Association) => {
    setSelectedAssociation(association);
    setCurrentView('associations');
  };

  const handleBackToList = () => {
    setSelectedAssociation(null);
  };

  const handleCreateAssociation = async () => {
    if (!newAsso.nom_association || !newAsso.ufr) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    try {
      setLoading(true);
      await API.createAssociation(newAsso);
      alert('Association créée avec succès!');
      setNewAsso({
        nom_association: '',
        ufr: '',
        email_contact: '',
        tel_contact: '',
      });
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
              <StatsOverview onSelectAssociation={handleSelectAssociation} />
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
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer une association</h2>
                  
                  <div className="space-y-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => setShowCreateModal(false)}
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
              />
            )}

            {currentView === 'documents' && !selectedAssociation && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-gray-900 mb-4">Gestion des documents</h2>
                <p className="text-gray-600">Vue en cours de développement...</p>
              </div>
            )}

            {currentView === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-gray-900 mb-4">Paramètres</h2>
                <p className="text-gray-600">Configuration en cours de développement...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
