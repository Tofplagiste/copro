/**
 * Données et constantes pour le module Vote AG
 * Extraites de VoteApp.jsx
 */

/**
 * Liste initiale des copropriétaires pour le vote
 * @type {Array<{id: number, nom: string, tantiemes: number, presence: string|null, procurationDonneeA: number|null}>}
 */
export const COPROS_INITIAL = [
    { id: 1, nom: 'CARSOULE', tantiemes: 117, presence: null, procurationDonneeA: null },
    { id: 2, nom: 'TROPAMER', tantiemes: 66, presence: null, procurationDonneeA: null },
    { id: 3, nom: 'PIRAS', tantiemes: 69, presence: null, procurationDonneeA: null },
    { id: 4, nom: 'GABRIEL', tantiemes: 62, presence: null, procurationDonneeA: null },
    { id: 5, nom: 'PALMARO', tantiemes: 41, presence: null, procurationDonneeA: null },
    { id: 6, nom: 'SALAHUN', tantiemes: 37, presence: null, procurationDonneeA: null },
    { id: 7, nom: 'SCI Clot', tantiemes: 86, presence: null, procurationDonneeA: null },
    { id: 8, nom: 'LE MERLE', tantiemes: 96, presence: null, procurationDonneeA: null },
    { id: 9, nom: 'LAMBARD', tantiemes: 125, presence: null, procurationDonneeA: null },
    { id: 10, nom: 'BELLIARD', tantiemes: 102, presence: null, procurationDonneeA: null },
    { id: 11, nom: 'CAUPENE', tantiemes: 199, presence: null, procurationDonneeA: null }
];

/**
 * Points de vote initiaux pour l'ordre du jour
 * @type {Array<{id: number, titre: string, article: string}>}
 */
export const POINTS_INITIAL = [
    { id: 1, titre: "Élection du Bureau de Séance", article: "24" },
    { id: 2, titre: "Renouvellement du Conseil Syndical", article: "25" },
    { id: 3, titre: "Renouvellement du Syndic Bénévole", article: "25" },
    { id: 4, titre: "Validation du Procès-Verbal AG 2024", article: "24" },
    { id: 5, titre: "Rapport Moral de l'Année 2025", article: "24" },
    { id: 6, titre: "Validation des Comptes au 31 déc 2025", article: "24" },
    { id: 7, titre: "Obligations Légales 2026 DPE PPT", article: "25" },
    { id: 8, titre: "Budget Prévisionnel 2026", article: "24" }
];

/**
 * Définition des articles de loi et leurs règles de majorité
 */
export const ARTICLES = {
    '24': { nom: 'Majorité simple', description: 'Majorité des tantièmes des votants', seuil: 0.5 },
    '25': { nom: 'Majorité absolue', description: 'Majorité de tous les tantièmes', seuil: 0.5 },
    '26': { nom: 'Double majorité', description: '2/3 des tantièmes de tous', seuil: 0.667 }
};

/**
 * Types de présence possibles
 */
export const PRESENCE_TYPES = [
    { key: 'present', label: 'Présent', color: 'bg-green-100 text-green-700 border-green-500' },
    { key: 'procuration', label: 'Procuration', color: 'bg-amber-100 text-amber-700 border-amber-500' },
    { key: 'correspondance', label: 'Corresp.', color: 'bg-blue-100 text-blue-700 border-blue-500' },
    { key: 'absent', label: 'Absent', color: 'bg-red-100 text-red-700 border-red-500' }
];

/** Total des tantièmes */
export const TOTAL_TANTIEMES = 1000;
