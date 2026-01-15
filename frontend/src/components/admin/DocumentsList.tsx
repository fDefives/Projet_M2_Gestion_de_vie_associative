import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronRight } from 'lucide-react';
import * as API from '../../api';
import { DocumentStatusBadge } from '../shared/DocumentStatusBadge';

interface DocumentsListProps {}

export function DocumentsList(_props: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await API.getDocuments();
        const arr = Array.isArray(data) ? data : data?.results || [];
        setDocuments(arr);
      } catch (err) {
        console.error('Erreur:', err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const types = useMemo(() => {
    const s = new Set<string>();
    documents.forEach((d) => d.type_document_name && s.add(d.type_document_name));
    return Array.from(s).sort();
  }, [documents]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    documents.forEach((d) => {
      const st = d.statut || d.status;
      if (st) s.add(st);
    });
    return Array.from(s).sort();
  }, [documents]);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const typeMatch = filterType ? (d.type_document_name || '').toLowerCase() === filterType.toLowerCase() : true;
      const statusVal = (d.statut || d.status || '').toLowerCase();
      const statusMatch = filterStatus ? statusVal === filterStatus.toLowerCase() : true;
      const nameFields = [d.nom_association, d.association_name, d.association?.name, d.association?.nom, ''];
      const assocName = nameFields.find(Boolean) || '';
      const assocMatch = searchQuery ? (assocName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (d.nom_fichier || '').toLowerCase().includes(searchQuery.toLowerCase()) : true;
      return typeMatch && statusMatch && assocMatch;
    });
  }, [documents, filterType, filterStatus, searchQuery]);

  const resultsCount = filtered.length;

  if (loading) return <div className="text-center py-8 text-gray-600">Chargement des documents...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Tous les documents</h2>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom d'association ou fichier..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600 mb-4">{resultsCount} document(s) trouvés</div>
      </div>

      <div className="space-y-3">
        {filtered.map((doc) => (
          <div key={doc.id_document || `${doc.nom_fichier}-${Math.random()}`} className="w-full bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-gray-900">{doc.nom_fichier || 'Fichier'}</h3>
                    <span className="text-sm text-gray-500">{doc.type_document_name || 'Type non précisé'}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{doc.nom_association || doc.association_name || doc.association?.name || 'Association inconnue'}</span>
                    <span>•</span>
                    <span>{doc.date_depot ? new Date(doc.date_depot).toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <DocumentStatusBadge status={(doc.statut || doc.status || 'missing') as any} />
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        ))}

        {resultsCount === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">Aucun document trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsList;
