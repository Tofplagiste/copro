/**
 * Données initiales de l'application
 * Structure STATE migrée depuis le fichier legacy
 */

export const DEFAULT_CATEGORIES = [
    { code: "601", label: "Eau" },
    { code: "602", label: "Électricité" },
    { code: "615-MEN", label: "Ménage" },
    { code: "615-POU", label: "Poubelles" },
    { code: "615-SEC", label: "Sécurité Incendie" },
    { code: "616", label: "Assurances" },
    { code: "622-SYN", label: "Indem. Syndic" },
    { code: "622-RPTE", label: "Indem. RPTE" },
    { code: "622-MNT", label: "Gestion Maint." },
    { code: "623", label: "Frais Bancaires" },
    { code: "701", label: "Appels de Fonds" },
    { code: "702", label: "Travaux (Appel)" },
    { code: "580", label: "Virement Interne" },
    { code: "105", label: "Provision Fond Travaux" }
];

export const INITIAL_STATE = {
    timestamp: 0,
    owners: [
        { id: 10, name: "BELLIARD V", apt: "ST ESTEPHE", lot: "Lots 12, 13", tantiemes: 102, hasMeter: true, exoGest: false, exoMen: true, email: "veroniquebelliard@neuf.fr" },
        { id: 7, name: "CARSOULE (1)", apt: "SAUTERNE", lot: "Lot 1, C9", tantiemes: 74, hasMeter: true, exoGest: false, exoMen: false, email: "fcarsoule@yahoo.fr" },
        { id: 3, name: "CARSOULE (2)", apt: "PESSAC LEOGNAN", lot: "Lot 21", tantiemes: 43, hasMeter: true, exoGest: false, exoMen: false, email: "fcarsoule@yahoo.fr" },
        { id: 13, name: "CAUPENNE C", apt: "Librairie", lot: "Lots 10, 11", tantiemes: 199, hasMeter: false, exoGest: false, exoMen: true, email: "librairiecorinne@orange.fr" },
        { id: 4, name: "GABRIEL T", apt: "ST CROIX DU MONT", lot: "Lot 14, C5", tantiemes: 62, hasMeter: true, exoGest: false, exoMen: false, email: "tho.gabriel@gmail.com" },
        { id: 12, name: "IDEA.L.C (Lambard)", apt: "POMEROL", lot: "Lot 19, C9", tantiemes: 125, hasMeter: true, exoGest: false, exoMen: false, email: "christinelambard66@gmail.com" },
        { id: 9, name: "LE MERLE C", apt: "MOULIS (Syndic)", lot: "Lot 18, C3", tantiemes: 96, hasMeter: true, exoGest: true, exoMen: false, email: "tof33123@gmail.com" },
        { id: 2, name: "PALMARO", apt: "MARGAUX", lot: "Lot 15, C6", tantiemes: 41, hasMeter: true, exoGest: false, exoMen: false, email: "bpalmaro@free.fr" },
        { id: 6, name: "PIRAS E", apt: "PAUILLAC", lot: "Lot 20, C4", tantiemes: 69, hasMeter: true, exoGest: false, exoMen: false, email: "eric.piras0046@orange.fr" },
        { id: 1, name: "SALAHUN Y", apt: "ST EMILION", lot: "Lot 16", tantiemes: 37, hasMeter: true, exoGest: false, exoMen: false, email: "yves.salahun@orange.fr" },
        { id: 8, name: "SCI LE CLOT", apt: "LISTRAC (REPT)", lot: "Lot 17, C7", tantiemes: 86, hasMeter: true, exoGest: true, exoMen: false, email: "sibrac_vince@hotmail.com" },
        { id: 5, name: "TROPAMER V", apt: "ENTRE 2 MERS", lot: "Lot 2", tantiemes: 66, hasMeter: true, exoGest: false, exoMen: false, email: "veronique.tropamer@orange.fr" },
        { id: 0, name: "COMMUN (Général)", apt: "Services", lot: "", tantiemes: 0, hasMeter: true, isCommon: true }
    ],
    accounts: [
        { id: "512-CIC", name: "Compte Courant CIC", initial: 2654.25 },
        { id: "5021-OBNL", name: "Livret OBNL", initial: 1555.5 },
        { id: "5022-ALUR", name: "Livret Fonds Travaux", initial: 13487.27 }
    ],
    water: {
        activeQuarter: "T1",
        priceMode: "annual",
        invoiceTotal: 0,
        annualTotal: 1706.46,
        annualSub: 92.21,
        annualVol: 318,
        manualPrice: 4.5,
        subAmount: 23.05,
        readings: {},
        meters: {}
    },
    waterPrevi: { subs: {}, charges: {}, reguls: {} },
    finance: { operations: [], realBalances: {} },
    budget: {
        general: [
            { name: "Frais bancaire", reel: 138, previ: 140, previ_n1: 140 },
            { name: "Poubelles", reel: 550, previ: 570, previ_n1: 570 },
            { name: "Sécurité incendie", reel: 280, previ: 300, previ_n1: 300 },
            { name: "Assurance AXA", reel: 1020, previ: 1050, previ_n1: 1050 },
            { name: "Gestion courante", reel: 150, previ: 150, previ_n1: 150 },
            { name: "EDF communs", reel: 195, previ: 210, previ_n1: 210 },
            { name: "Fond de travaux", reel: 3000, previ: 3000, previ_n1: 3000 },
            { name: "Réserve DPE PPT", reel: 800, previ: 800, previ_n1: 800 },
            { name: "Assurance ACC", reel: 0, previ: 180, previ_n1: 180 }
        ],
        special: [
            { name: "Indemnité Syndic", reel: 600, previ: 600, previ_n1: 600 },
            { name: "Indemnité RPTE", reel: 600, previ: 600, previ_n1: 600 }
        ],
        menage: [
            { name: "Ménage", reel: 1100, previ: 1166, previ_n1: 1166 }
        ],
        travaux: []
    },
    budgetMode: "previ",
    monthly: {
        expenses: {},
        income: {}
    },
    annexesManual: [],
    categories: DEFAULT_CATEGORIES
};

/**
 * Configuration des onglets de l'application
 */
export const TABS_CONFIG = [
    { id: 'water', label: '1. Gestion Eau', icon: 'Droplets' },
    { id: 'budget', label: '2. Budget & Appels', icon: 'FileText' },
    { id: 'finance', label: '3. Comptabilité', icon: 'PieChart' },
    { id: 'annexes', label: '4. Annexes Bilan', icon: 'BookOpen' },
    { id: 'budget-detail', label: '5. Détail & Trésorerie', icon: 'Calendar' },
    { id: 'params', label: 'Paramètres', icon: 'Settings' }
];
