import React, { useState } from 'react';
import { LogOut, Users, FileText, BarChart3, Settings, Search, Filter, Download, Mail } from 'lucide-react';
import { User } from '../App';
import { AssociationsList } from './admin/AssociationsList';
import { AssociationDetailView } from './admin/AssociationDetailView';
import { StatsOverview } from './admin/StatsOverview';
import { mockAssociations, Association } from '../lib/mockData';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'overview' | 'associations' | 'documents' | 'subsidies' | 'settings';

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);

  const handleSelectAssociation = (association: Association) => {
    setSelectedAssociation(association);
    setCurrentView('associations');
  };

  const handleBackToList = () => {
    setSelectedAssociation(null);
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
              <AssociationsList onSelectAssociation={handleSelectAssociation} />
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
