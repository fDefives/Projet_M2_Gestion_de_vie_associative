import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronRight, Download, Eye } from 'lucide-react';
import * as API from '../../api';
import { DocumentStatusBadge } from '../shared/DocumentStatusBadge';

interface DocumentsListProps {}

export function DocumentsList(_props: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssociationId, setFilterAssociationId] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [docsData, associationsData] = await Promise.all([
          API.getDocuments(),
          API.getAssociations(),
        ]);
        const arr = Array.isArray(docsData) ? docsData : docsData?.results || [];
        const assocArr = Array.isArray(associationsData)
          ? associationsData
          : associationsData?.results || [];
        setDocuments(arr);
        setAssociations(assocArr);
      } catch (err) {
        console.error('Erreur:', err);
        setDocuments([]);
        setAssociations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const types = useMemo(() => {
    const s = new Set<string>();
    documents.forEach((d) => {
      // Le champ peut être 'type_document_name' (du serializer) ou via la relation
      const typeName = d.type_document_name || d.id_type_document?.libelle;
      if (typeName) s.add(typeName);
    });
    return Array.from(s).sort();
  }, [documents]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    documents.forEach((d) => {
      // Les statuts possibles: draft, submitted, approved, rejected, expired
      const st = d.statut || d.status;
      if (st) s.add(st);
    });
    return Array.from(s).sort();
  }, [documents]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    documents.forEach((d) => {
      if (d.date_depot) {
        const y = new Date(d.date_depot).getFullYear();
        if (!Number.isNaN(y)) years.add(String(y));
      }
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [documents]);

  const getFileName = (value: string) => value.split('/').pop() || value;

  const associationMap = useMemo(() => {
    const map: Record<string | number, string> = {};
    associations.forEach((a) => {
      const id = a.id_association || a.id;
      map[id] = a.nom_association || a.name || 'Association inconnue';
    });
    return map;
  }, [associations]);

  const getAssociationName = (doc: any): string => {
    const assocId = doc.association?.id_association || doc.id_association || doc.association_id || doc.association;
    return associationMap[assocId] || 'Association inconnue';
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      await API.downloadDocument(doc.id_document, doc.nom_fichier);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const handlePreviewDocument = async (doc: any) => {
    try {
      const blob = await API.fetchDocumentBlob(doc.id_document);
      const url = URL.createObjectURL(new Blob([blob], { type: blob.type || 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      console.error('Error previewing document:', err);
      alert('Erreur lors de l\'ouverture du document');
    }
  };

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const typeMatch = filterType ? (d.type_document_name || d.id_type_document?.libelle || '').toLowerCase() === filterType.toLowerCase() : true;
      const statusVal = (d.statut || d.status || '').toLowerCase();
      const statusMatch = filterStatus ? statusVal === filterStatus.toLowerCase() : true;

      const assocId = d.association?.id_association || d.id_association || d.association_id || d.association;
      const associationMatch = filterAssociationId ? String(assocId) === filterAssociationId : true;

      const dateDepot = d.date_depot ? new Date(d.date_depot) : null;
      const docYear = dateDepot ? String(dateDepot.getFullYear()) : '';
      const yearMatch = filterYear ? docYear === filterYear : true;
      
      // Recherche uniquement sur le nom du fichier
      const fileName = getFileName(d.nom_fichier || '');
      const assocMatch = searchQuery
        ? fileName.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      return typeMatch && statusMatch && associationMatch && yearMatch && assocMatch;
    });
  }, [documents, filterType, filterStatus, filterAssociationId, filterYear, searchQuery]);

  const resultsCount = filtered.length;

  if (loading) return <div className="text-center py-8 text-gray-600">Chargement des documents...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Tous les documents</h2>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">

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

          <select
            value={filterAssociationId}
            onChange={(e) => setFilterAssociationId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les associations</option>
            {associations.map((a) => (
              <option key={a.id_association || a.id} value={a.id_association || a.id}>
                {a.nom_association || a.name || 'Association'}
              </option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les années</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600 mb-4">{resultsCount} document(s) trouvés</div>
      </div>

      <div className="space-y-2">
        {filtered.map((doc) => (
          <div
            key={doc.id_document || `${doc.nom_fichier}-${Math.random()}`}
            className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <div className="flex items-center gap-4 flex-1">
              <DocumentStatusBadge status={(doc.statut || doc.status || 'draft') as any} />
              <div className="flex-1">
                <div className="text-gray-900 font-medium">{getFileName(doc.nom_fichier || 'Fichier')}</div>
                <div className="text-sm text-gray-600">
                  {doc.type_document_name || doc.id_type_document?.libelle || 'Type non précisé'}
                </div>
                <div className="text-sm text-gray-500">
                  {getAssociationName(doc)} • Déposé le {doc.date_depot ? new Date(doc.date_depot).toLocaleDateString('fr-FR') : '—'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePreviewDocument(doc)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voir le document"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDownloadDocument(doc)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger le document"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {resultsCount === 0 && (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-600">Aucun document trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsList;
