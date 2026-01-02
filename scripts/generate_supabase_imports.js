import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'supabase_imports');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

// Helper to escape CSV fields
const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Helper to write CSV
const writeCSV = (filename, headers, rows) => {
    const headerLine = headers.join(',');
    const dataLines = rows.map(row => headers.map(h => escape(row[h])).join(','));
    const content = [headerLine, ...dataLines].join('\n');
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), content, 'utf8');
    console.log(`Created ${filename} (${rows.length} rows)`);
};

// --- DATA ---
const OWNERS = [
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
];

const CARNET_OWNERS = [
    { id: 1, name: "BELLIARD Véronique", lots: "ST ESTEPHE (Lot 12: 58) + Apt (Lot 13: 44)", tantiemes: 102, gestion: 12.47, menage: null, infos: "Gd Balcon, Pt Balcon", phone: "06 70 95 70 11", email: "veroniquebelliard@neuf.fr", address: "7 Rue André LEROUX 33780 SOULAC" },
    { id: 2, name: "CARSOULE", lots: "SAUTERNE (Lot 1)", tantiemes: 74, gestion: 9.05, menage: 10.59, infos: "Cellier: Lot 9 (4)", phone: "06 64 84 79 60", email: "fcarsoule@yahoo.fr", address: "295 rue du faubourg saint Antoine 75011 PARIS" },
    { id: 3, name: "CARSOULE", lots: "PESSAC LEOGNAN (Lot 21)", tantiemes: 43, gestion: 5.26, menage: 6.15, infos: "", phone: "", email: "", address: "" },
    { id: 4, name: "CAUPENE Corinne", lots: "LIBRAIRIE (Lot 10: 137) + Apt (Lot 11: 62)", tantiemes: 199, gestion: 24.33, menage: null, infos: "Pt Balcon", phone: "06 76 15 58 29", email: "librairiecorinne@orange.fr", address: "17 Avenue Georges POMPIDOU 33780 SOULAC" },
    { id: 5, name: "GABRIEL Thomas", lots: "ST CROIX DU MONT (Lot 14)", tantiemes: 62, gestion: 7.58, menage: 8.87, infos: "Cellier: Lot 5 (3)", phone: "06 89 15 89 95", email: "tho.gabriel@gmail.com", address: "42 Rue A LEROI 33400 Talence" },
    { id: 6, name: "IDEALAMBARD SAS", lots: "POMEROL (Lot 19)", tantiemes: 125, gestion: 15.28, menage: 17.88, infos: "Cellier: Lot 3 (4), Pt Balcon", phone: "06 80 03 34 53", email: "ideal.33@wanadoo.fr", address: "2 rue du Maréchal Leclerc 33780 Soulac" },
    { id: 7, name: "LE MERLE Christophe", lots: "MOULIS (Lot 18)", tantiemes: 96, gestion: null, menage: 13.73, infos: "Cellier: Lot 8 (3), Gd Balcon", phone: "06 12 55 26 21", email: "clemerle.lormont@gmail.com", address: "15 rue andré Leroux 33780 Soulac-Sur-Mer" },
    { id: 8, name: "PALMARO", lots: "MARGAUX (Lot 15)", tantiemes: 41, gestion: 5.01, menage: 5.87, infos: "Cellier: Lot 6 (3), Gd Balcon", phone: "06 45 63 72 89", email: "bpalmaro@free.fr", address: "42 rue du général Chanzy 33400 Talence" },
    { id: 9, name: "PIRAS Eric", lots: "PAUILLAC (Lot 20)", tantiemes: 69, gestion: 8.44, menage: 9.87, infos: "Cellier: Lot 4 (3)", phone: "06 18 03 33 05", email: "piras.eric@orange.fr", address: "13 rue andré Leroux 33780 Soulac-Sur-Mer" },
    { id: 10, name: "SALAHUN Yves", lots: "ST EMILION (Lot 16)", tantiemes: 37, gestion: 4.52, menage: 5.29, infos: "Gd Balcon", phone: "06 71 60 54 25", email: "yves.salahun@orange.fr", address: "12 chemin de la renardière montlegun 11000 CARCASSONE" },
    { id: 11, name: "SCI le CLOT Sibrac", lots: "LISTRAC (Lot 17)", tantiemes: 86, gestion: null, menage: 12.30, infos: "Cellier: Lot 7 (2), Gd Balcon", phone: "06 82 44 50 88", email: "sibrac_vincent@orange.fr", address: "19 chemin de Lescapon 33340 Queyrac" },
    { id: 12, name: "TROPAMER Véronique", lots: "ENTRE 2 MERS (Lot 2)", tantiemes: 66, gestion: 8.07, menage: 9.44, infos: "", phone: "06 22 08 60 20", email: "veronique.tropamer@orange.fr", address: "9 rue andré Leroux 33780 Soulac-Sur-Mer" }
];

const ACCOUNTS = [
    { id: "512-CIC", name: "Compte Courant CIC", initial_balance: 2654.25 },
    { id: "5021-OBNL", name: "Livret OBNL", initial_balance: 1555.5 },
    { id: "5022-ALUR", name: "Livret Fonds Travaux", initial_balance: 13487.27 }
];

const BUDGET = [
    { category: 'general', name: "Frais bancaire", reel: 138, previ: 140, previ_n1: 140 },
    { category: 'general', name: "Poubelles", reel: 550, previ: 570, previ_n1: 570 },
    { category: 'general', name: "Sécurité incendie", reel: 280, previ: 300, previ_n1: 300 },
    { category: 'general', name: "Assurance AXA", reel: 1020, previ: 1050, previ_n1: 1050 },
    { category: 'general', name: "Gestion courante", reel: 150, previ: 150, previ_n1: 150 },
    { category: 'general', name: "EDF communs", reel: 195, previ: 210, previ_n1: 210 },
    { category: 'general', name: "Fond de travaux", reel: 3000, previ: 3000, previ_n1: 3000 },
    { category: 'general', name: "Réserve DPE PPT", reel: 800, previ: 800, previ_n1: 800 },
    { category: 'general', name: "Assurance ACC", reel: 0, previ: 180, previ_n1: 180 },
    { category: 'special', name: "Indemnité Syndic", reel: 600, previ: 600, previ_n1: 600 },
    { category: 'special', name: "Indemnité RPTE", reel: 600, previ: 600, previ_n1: 600 },
    { category: 'menage', name: "Ménage", reel: 1100, previ: 1166, previ_n1: 1166 }
];

const CARNET_GENERAL = {
    address: "7-9 rue André Leroux, 33780 Soulac-sur-Mer",
    lots_description: "21 (14 Principaux, 7 Celliers)",
    reglement: "29 septembre 2009 - Notaire: S.C.P Michel MARTIN (Ref: 52-531)",
    modifications: "Aucune"
};

const CARNET_ADMIN = {
    syndic_name: "Mr LE MERLE Christophe",
    syndic_address: "7 rue André Leroux",
    syndic_phone: "06 17 25 02 66",
    ag_nomination: "2025-12-17",
    fin_mandat: "2026-12-31",
    conseil_syndical: JSON.stringify(["Mme Tropamer Véronique", "Mme Béliard Véronique", "M. Sibrac Vincent"])
};

const CARNET_TECH = {
    construction: "Avant 1900 (Pierre / Brique / Bois)",
    surface: "679 m² (RDC: 331m², 1er: 321m², 2e: 22m²)",
    toiture: "Tuile Marseille et Romane",
    facade: "Pierre et Enduit",
    code_peinture: "Tollens T 2004-2 (Bleue)",
    chauffage: "Individuel (Chauffage + Eau Chaude)",
    eau_chaude: "Individuelle",
    diagnostics: JSON.stringify({
        amiante: "Négatif (sauf conduit combles) - 16/09/2009",
        plomb: "RAS - 16/09/2009",
        termites: "Contrôlé - 16/09/2009"
    })
};

const CARNET_PREST = [
    { name: "ACC SUD OUEST", contrat: "33254", contact: "", phones: JSON.stringify(["05 57 22 87 36", "05 57 22 42 10", "05 57 22 42 12"]), emails: JSON.stringify(["contact@accsudouest.org"]), address: "73 Avenue du Château d'Eau, 33700 MÉRIGNAC", codes: JSON.stringify({ id: "33254", mdp: "33254" }) },
    { name: "AXA", contrat: "0000021799969904", contact: "Balke Serge", phones: JSON.stringify(["05 56 09 47 55"]), emails: JSON.stringify(["agence.balke@axa.fr"]), address: "11 Cours du Dr Jacques Noël, 33590 Saint-Vivien-de-Médoc", codes: JSON.stringify({ id: "coprolsp@gmail.com", mdp: "3Rivieres." }) },
    { name: "CIC", contrat: "923515107917", contact: "", phones: JSON.stringify(["05 56 05 41 11", "05 56 05 40 50"]), emails: JSON.stringify(["19317@cic.fr"]), address: "76 Avenue du Médoc, 33320 Eysines", codes: JSON.stringify({ id: "923515107917", mdp: "3Rivieres." }) },
    { name: "EAU (Mairie)", contrat: "51405001201", contact: "Svc Eau: N. Dupuis", phones: JSON.stringify(["05 56 09 85 77", "05 56 73 29 29"]), emails: JSON.stringify(["n.dupuis@mairie-soulac.fr"]), address: "2 Rue Hôtel de Ville, 33780 Soulac-Sur-Mer", codes: JSON.stringify({ id: "", mdp: "" }) }
];

const CARNET_TRAVAUX = [
    { annee: "2025", nature: "Réfection totale du portillon cour", entreprise: "Fait par REPT", cout: "0€" },
    { annee: "2024", nature: "Toiture (60 tuiles + faitage)", entreprise: "Boudassou Stéphane (07 77 82 47 83)", cout: "1556.50€" },
    { annee: "2024", nature: "Changement partie de l'appartement Listrac (Balcon)", entreprise: "Réalisé par Mr Sibrac", cout: "0€" },
    { annee: "2024", nature: "Peinture hall Cellier", entreprise: "Réalisé par Mr Sibrac", cout: "0€" },
    { annee: "2022", nature: "Peinture Porte d'entrée", entreprise: "Une Pointe de Couleurs (Pianalto Lydia)", cout: "237.00€" },
    { annee: "2021", nature: "Fibre optique", entreprise: "Gironde très haut débit", cout: "0€" },
    { annee: "2020", nature: "Porte d'entrée", entreprise: "Cahuzac Jean-Pierre", cout: "3313.20€" },
    { annee: "2018", nature: "Réparation portillon", entreprise: "Sarl David Videau", cout: "165.00€" },
    { annee: "2017", nature: "Tempête (volet)", entreprise: "Cyril Lira", cout: "929.50€" },
    { annee: "2016", nature: "Dégâts des eaux", entreprise: "Sarl Videau / Raspail Adrien", cout: "2900€" },
    { annee: "2015", nature: "Peinture boiseries (Communs + Coloc)", entreprise: "Birot Frères Sarl", cout: "5262.69€" },
    { annee: "2014", nature: "Peinture façade arrière impasse", entreprise: "Eurl La Caisse à Out's (M. Raspail)", cout: "7709.90€" },
    { annee: "2014", nature: "Incendie", entreprise: "Diverses", cout: "Assurance" },
    { annee: "2013", nature: "Mise en retrait portail (Compteurs EDF)", entreprise: "...", cout: "?" },
    { annee: "2013", nature: "Dégâts des eaux", entreprise: "Dubouilh", cout: "966.76€" },
    { annee: "2013", nature: "Ravalement de façade", entreprise: "Fourniaud & Fils", cout: "14058.98€" },
    { annee: "2011", nature: "Remplacement pierres érodées", entreprise: "Castet", cout: "2400.13€" },
    { annee: "2005", nature: "Toiture (Tuiles et Zinc)", entreprise: "Gallocher Pierre", cout: "22851.59€" }
];

// --- GENERATE ---

// 1. Owners
// New Schema: id, name, apt, lot_principal, lot_annexe, tantiemes, has_meter, exo_gest, exo_men, email, phone, address, is_common, is_archived, archived_at
const ownersHeader = ['id', 'name', 'apt', 'lot_principal', 'lot_annexe', 'tantiemes', 'has_meter', 'exo_gest', 'exo_men', 'email', 'phone', 'address', 'is_common', 'is_archived', 'archived_at'];

const parseLots = (lotStr) => {
    if (!lotStr) return { principal: '', annexe: '' };
    const clean = lotStr.replace(/Lots?\s+/i, '');
    const parts = clean.split(',').map(s => s.trim());
    return {
        principal: parts[0] || '',
        annexe: parts[1] || ''
    };
};

// Map Carnet ID to Initial/Gestion ID
const ID_MAP = {
    1: 10,  // Belliard
    2: 7,   // Carsoule 1
    3: 3,   // Carsoule 2
    4: 13,  // Caupenne
    5: 4,   // Gabriel
    6: 12,  // Ideal
    7: 9,   // Le Merle
    8: 2,   // Palmaro
    9: 6,   // Piras
    10: 1,  // Salahun
    11: 8,  // Sci Clot
    12: 5   // Tropamer
};

const ownersData = CARNET_OWNERS.map(o => {
    const gestionId = ID_MAP[o.id];
    const basic = OWNERS.find(b => b.id === gestionId) || {};
    // Use basic.lot because CARNET lots are too verbose ("ST ESTEPHE (Lot 12: 58)...")
    const lots = parseLots(basic.lot || '');


    return {
        id: o.id,
        name: o.name,
        apt: o.infos || basic.apt,
        lot_principal: lots.principal,
        lot_annexe: lots.annexe,
        tantiemes: o.tantiemes,
        has_meter: basic.hasMeter !== undefined ? basic.hasMeter : true,
        exo_gest: o.gestion === null,
        exo_men: o.menage === null,
        email: o.email,
        phone: o.phone,
        address: o.address,
        is_common: false,
        is_archived: false,
        archived_at: ''
    };
});
// Add Common
const common = OWNERS.find(o => o.id === 0);
if (common) {
    ownersData.push({
        id: 0,
        name: common.name,
        apt: common.apt,
        lot_principal: '',
        lot_annexe: '',
        tantiemes: 0,
        has_meter: true,
        exo_gest: false,
        exo_men: false,
        email: '',
        phone: '',
        address: '',
        is_common: true,
        is_archived: false,
        archived_at: ''
    });
}
writeCSV('owners.csv', ownersHeader, ownersData);

// 2. Budget Items
const budgetHeader = ['category', 'name', 'reel', 'previ', 'previ_n1', 'sort_order'];
const budgetData = BUDGET.map((b, i) => ({
    category: b.category,
    name: b.name,
    reel: b.reel,
    previ: b.previ,
    previ_n1: b.previ_n1,
    sort_order: i + 1
}));
writeCSV('budget_items.csv', budgetHeader, budgetData);

// 3. Accounts
const accountsHeader = ['id', 'name', 'initial_balance'];
writeCSV('accounts.csv', accountsHeader, ACCOUNTS);

// 4. Carnet General
const carnetGenHeader = ['address', 'lots_description', 'reglement', 'modifications'];
writeCSV('carnet_general.csv', carnetGenHeader, [CARNET_GENERAL]);

// 5. Carnet Admin
const carnetAdminHeader = ['syndic_name', 'syndic_address', 'syndic_phone', 'ag_nomination', 'fin_mandat', 'conseil_syndical'];
writeCSV('carnet_admin.csv', carnetAdminHeader, [CARNET_ADMIN]);

// 6. Carnet Technique
const carnetTechHeader = ['construction', 'surface', 'toiture', 'facade', 'code_peinture', 'chauffage', 'eau_chaude', 'diagnostics'];
writeCSV('carnet_technique.csv', carnetTechHeader, [CARNET_TECH]);

// 7. Prestataires
const carnetPrestHeader = ['name', 'contrat', 'contact', 'phones', 'emails', 'address', 'codes'];
writeCSV('carnet_prestataires.csv', carnetPrestHeader, CARNET_PREST);

// 8. Travaux
const carnetTravHeader = ['annee', 'nature', 'entreprise', 'cout'];
writeCSV('carnet_travaux.csv', carnetTravHeader, CARNET_TRAVAUX);

console.log('Valid generation.');
