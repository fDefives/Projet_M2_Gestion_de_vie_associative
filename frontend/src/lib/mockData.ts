export type DocumentStatus = 'missing' | 'pending' | 'validated' | 'rejected' | 'expired';
export type AssociationStatus = 'active' | 'dormant' | 'in_creation';

export interface Association {
  id: string;
  name: string;
  acronym?: string;
  ufr: string;
  type: string;
  status: AssociationStatus;
  email: string;
  phone?: string;
  siret?: string;
  completionRate: number;
  missingDocuments: number;
  createdAt: string;
}

export interface Leader {
  id: string;
  associationId: string;
  firstName: string;
  lastName: string;
  role: 'president' | 'treasurer' | 'secretary' | 'member';
  email: string;
  phone?: string;
  startDate: string;
  endDate?: string;
}

export interface Document {
  id: string;
  associationId: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  validatedAt?: string;
  validatedBy?: string;
  rejectionReason?: string;
  expiresAt?: string;
  year?: string;
}

export type DocumentType =
  | 'statuts'
  | 'pv_ag'
  | 'bilan_moral'
  | 'bilan_financier'
  | 'assurance'
  | 'rib'
  | 'charte'
  | 'cer'
  | 'liste_dirigeants';

export interface Subsidy {
  id: string;
  associationId: string;
  year: string;
  amount: number;
  requested: number;
  status: 'requested' | 'approved' | 'paid' | 'rejected';
  requestedAt: string;
  paidAt?: string;
}

export const DOCUMENT_TYPES: Record<DocumentType, { label: string; required: boolean; renewable?: 'yearly' | 'on_change' }> = {
  statuts: { label: 'Statuts', required: true },
  pv_ag: { label: "PV de l'Assemblée Générale", required: true, renewable: 'yearly' },
  bilan_moral: { label: 'Bilan moral', required: true, renewable: 'yearly' },
  bilan_financier: { label: 'Bilan financier', required: true, renewable: 'yearly' },
  assurance: { label: "Attestation d'assurance", required: true, renewable: 'yearly' },
  rib: { label: 'RIB', required: true },
  charte: { label: "Charte de l'université", required: true, renewable: 'on_change' },
  cer: { label: 'CER signé', required: true },
  liste_dirigeants: { label: 'Liste des dirigeants', required: true, renewable: 'on_change' },
};

// Données mockées pour la démonstration
export const mockAssociations: Association[] = [
  {
    id: 'asso-bde',
    name: 'Bureau Des Étudiants de La Rochelle',
    acronym: 'BDE',
    ufr: 'Toutes UFR',
    type: 'BDE',
    status: 'active',
    email: 'bde@univ-larochelle.fr',
    phone: '05 46 45 67 89',
    siret: '123 456 789 00012',
    completionRate: 100,
    missingDocuments: 0,
    createdAt: '2020-09-01',
  },
  {
    id: 'asso-sport',
    name: 'Sport & Co',
    ufr: 'STAPS',
    type: 'Sport',
    status: 'active',
    email: 'sport@associations.fr',
    phone: '06 12 34 56 78',
    siret: '987 654 321 00023',
    completionRate: 67,
    missingDocuments: 3,
    createdAt: '2019-10-15',
  },
  {
    id: 'asso-culture',
    name: 'Association Culturelle',
    acronym: 'CultureLR',
    ufr: 'Lettres, Langues, Arts et Sciences Humaines',
    type: 'Culture',
    status: 'active',
    email: 'culture@associations.fr',
    siret: '456 789 123 00034',
    completionRate: 45,
    missingDocuments: 5,
    createdAt: '2021-01-10',
  },
  {
    id: 'asso-eco',
    name: 'Étudiants Entrepreneurs',
    acronym: 'EcoStart',
    ufr: 'Droit, Science Politique, Économie et Gestion',
    type: 'Entrepreneuriat',
    status: 'active',
    email: 'entreprendre@associations.fr',
    phone: '07 89 12 34 56',
    siret: '321 654 987 00045',
    completionRate: 89,
    missingDocuments: 1,
    createdAt: '2022-03-20',
  },
  {
    id: 'asso-env',
    name: 'Environnement Campus',
    ufr: 'Sciences et Technologies',
    type: 'Environnement',
    status: 'active',
    email: 'environnement@associations.fr',
    completionRate: 34,
    missingDocuments: 6,
    createdAt: '2023-09-01',
  },
  {
    id: 'asso-solidaire',
    name: 'Solidarité Étudiante',
    acronym: 'SolidLR',
    ufr: 'Toutes UFR',
    type: 'Humanitaire',
    status: 'active',
    email: 'solidarite@associations.fr',
    phone: '06 98 76 54 32',
    siret: '789 123 456 00056',
    completionRate: 78,
    missingDocuments: 2,
    createdAt: '2020-11-05',
  },
  {
    id: 'asso-musique',
    name: 'Harmonie Universitaire',
    ufr: 'Lettres, Langues, Arts et Sciences Humaines',
    type: 'Musique',
    status: 'dormant',
    email: 'musique@associations.fr',
    completionRate: 12,
    missingDocuments: 8,
    createdAt: '2018-05-12',
  },
];

export const mockLeaders: Leader[] = [
  {
    id: 'l1',
    associationId: 'asso-bde',
    firstName: 'Sophie',
    lastName: 'Martin',
    role: 'president',
    email: 'sophie.martin@etu.univ-larochelle.fr',
    phone: '06 11 22 33 44',
    startDate: '2024-09-01',
  },
  {
    id: 'l2',
    associationId: 'asso-bde',
    firstName: 'Lucas',
    lastName: 'Dubois',
    role: 'treasurer',
    email: 'lucas.dubois@etu.univ-larochelle.fr',
    startDate: '2024-09-01',
  },
  {
    id: 'l3',
    associationId: 'asso-bde',
    firstName: 'Emma',
    lastName: 'Bernard',
    role: 'secretary',
    email: 'emma.bernard@etu.univ-larochelle.fr',
    startDate: '2024-09-01',
  },
  {
    id: 'l4',
    associationId: 'asso-sport',
    firstName: 'Thomas',
    lastName: 'Leroy',
    role: 'president',
    email: 'thomas.leroy@etu.univ-larochelle.fr',
    phone: '07 22 33 44 55',
    startDate: '2024-01-15',
  },
  {
    id: 'l5',
    associationId: 'asso-sport',
    firstName: 'Léa',
    lastName: 'Moreau',
    role: 'treasurer',
    email: 'lea.moreau@etu.univ-larochelle.fr',
    startDate: '2024-01-15',
  },
];

export const mockDocuments: Document[] = [
  // BDE - Complet
  {
    id: 'd1',
    associationId: 'asso-bde',
    type: 'statuts',
    status: 'validated',
    fileName: 'statuts-bde-2024.pdf',
    uploadedAt: '2024-09-05T10:30:00',
    uploadedBy: 'Sophie Martin',
    validatedAt: '2024-09-06T14:20:00',
    validatedBy: 'Marie Goupille Bergère',
  },
  {
    id: 'd2',
    associationId: 'asso-bde',
    type: 'pv_ag',
    status: 'validated',
    fileName: 'pv-ag-2024.pdf',
    uploadedAt: '2024-09-10T09:15:00',
    uploadedBy: 'Sophie Martin',
    validatedAt: '2024-09-11T11:00:00',
    validatedBy: 'Marie Goupille Bergère',
    year: '2024-2025',
  },
  {
    id: 'd3',
    associationId: 'asso-bde',
    type: 'bilan_moral',
    status: 'validated',
    fileName: 'bilan-moral-2023-2024.pdf',
    uploadedAt: '2024-09-10T09:20:00',
    uploadedBy: 'Sophie Martin',
    validatedAt: '2024-09-12T10:30:00',
    validatedBy: 'Marie Goupille Bergère',
    year: '2023-2024',
  },
  {
    id: 'd4',
    associationId: 'asso-bde',
    type: 'bilan_financier',
    status: 'validated',
    fileName: 'bilan-financier-2023-2024.pdf',
    uploadedAt: '2024-09-10T09:25:00',
    uploadedBy: 'Lucas Dubois',
    validatedAt: '2024-09-12T10:35:00',
    validatedBy: 'Marie Goupille Bergère',
    year: '2023-2024',
  },
  {
    id: 'd5',
    associationId: 'asso-bde',
    type: 'assurance',
    status: 'validated',
    fileName: 'assurance-2024-2025.pdf',
    uploadedAt: '2024-09-08T14:00:00',
    uploadedBy: 'Sophie Martin',
    validatedAt: '2024-09-09T09:00:00',
    validatedBy: 'Marie Goupille Bergère',
    expiresAt: '2025-09-01',
  },
  {
    id: 'd6',
    associationId: 'asso-bde',
    type: 'rib',
    status: 'validated',
    fileName: 'rib-bde.pdf',
    uploadedAt: '2024-09-05T10:35:00',
    uploadedBy: 'Lucas Dubois',
    validatedAt: '2024-09-06T14:25:00',
    validatedBy: 'Marie Goupille Bergère',
  },
  {
    id: 'd7',
    associationId: 'asso-bde',
    type: 'charte',
    status: 'validated',
    fileName: 'charte-signee-2024.pdf',
    uploadedAt: '2024-09-05T11:00:00',
    uploadedBy: 'Sophie Martin',
    validatedAt: '2024-09-06T14:30:00',
    validatedBy: 'Marie Goupille Bergère',
  },
  {
    id: 'd8',
    associationId: 'asso-bde',
    type: 'cer',
    status: 'validated',
    fileName: 'cer-2024.pdf',
    uploadedAt: '2024-09-05T11:05:00',
    uploadedBy: 'Sophie Martin',
    validatedAt: '2024-09-06T14:35:00',
    validatedBy: 'Marie Goupille Bergère',
  },
  {
    id: 'd9',
    associationId: 'asso-bde',
    type: 'liste_dirigeants',
    status: 'validated',
    fileName: 'liste-bureau-2024-2025.pdf',
    uploadedAt: '2024-09-05T11:10:00',
    uploadedBy: 'Sophie Martin',
    validatedAt: '2024-09-06T14:40:00',
    validatedBy: 'Marie Goupille Bergère',
  },
  // Sport & Co - Incomplet
  {
    id: 'd10',
    associationId: 'asso-sport',
    type: 'statuts',
    status: 'validated',
    fileName: 'statuts-sport.pdf',
    uploadedAt: '2024-01-20T10:00:00',
    uploadedBy: 'Thomas Leroy',
    validatedAt: '2024-01-22T09:00:00',
    validatedBy: 'Marie Goupille Bergère',
  },
  {
    id: 'd11',
    associationId: 'asso-sport',
    type: 'pv_ag',
    status: 'rejected',
    fileName: 'pv-ag-2024.pdf',
    uploadedAt: '2024-09-15T14:30:00',
    uploadedBy: 'Thomas Leroy',
    rejectionReason: 'Le document n\'est pas signé par le secrétaire',
  },
  {
    id: 'd12',
    associationId: 'asso-sport',
    type: 'assurance',
    status: 'expired',
    fileName: 'assurance-2023-2024.pdf',
    uploadedAt: '2023-09-10T10:00:00',
    uploadedBy: 'Ancien président',
    validatedAt: '2023-09-11T11:00:00',
    validatedBy: 'Marie Goupille Bergère',
    expiresAt: '2024-09-01',
  },
  {
    id: 'd13',
    associationId: 'asso-sport',
    type: 'rib',
    status: 'validated',
    fileName: 'rib-sport.pdf',
    uploadedAt: '2024-01-20T10:05:00',
    uploadedBy: 'Léa Moreau',
    validatedAt: '2024-01-22T09:05:00',
    validatedBy: 'Marie Goupille Bergère',
  },
  {
    id: 'd14',
    associationId: 'asso-sport',
    type: 'charte',
    status: 'pending',
    fileName: 'charte-2024.pdf',
    uploadedAt: '2024-12-20T16:45:00',
    uploadedBy: 'Thomas Leroy',
  },
  {
    id: 'd15',
    associationId: 'asso-sport',
    type: 'liste_dirigeants',
    status: 'validated',
    fileName: 'bureau-2024.pdf',
    uploadedAt: '2024-01-20T10:10:00',
    uploadedBy: 'Thomas Leroy',
    validatedAt: '2024-01-22T09:10:00',
    validatedBy: 'Marie Goupille Bergère',
  },
];

export const mockSubsidies: Subsidy[] = [
  {
    id: 's1',
    associationId: 'asso-bde',
    year: '2024-2025',
    amount: 5000,
    requested: 5000,
    status: 'paid',
    requestedAt: '2024-09-15T10:00:00',
    paidAt: '2024-10-05T14:30:00',
  },
  {
    id: 's2',
    associationId: 'asso-bde',
    year: '2023-2024',
    amount: 4500,
    requested: 5000,
    status: 'paid',
    requestedAt: '2023-09-10T10:00:00',
    paidAt: '2023-10-10T14:30:00',
  },
  {
    id: 's3',
    associationId: 'asso-sport',
    year: '2024-2025',
    amount: 0,
    requested: 3000,
    status: 'requested',
    requestedAt: '2024-09-20T11:00:00',
  },
  {
    id: 's4',
    associationId: 'asso-sport',
    year: '2023-2024',
    amount: 2800,
    requested: 3000,
    status: 'paid',
    requestedAt: '2023-09-15T11:00:00',
    paidAt: '2023-11-20T10:00:00',
  },
];
