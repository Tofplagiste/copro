/**
 * Données initiales pour le Carnet de Copropriété
 * Migré depuis Gestion_Copro_Complet.html
 */

export const CARNET_INITIAL_STATE = {
    // Informations générales
    general: {
        address: "7-9 rue André Leroux, 33780 Soulac-sur-Mer",
        lots: "21 (14 Principaux, 7 Celliers)",
        reglement: "29 septembre 2009 - Notaire: S.C.P Michel MARTIN (Ref: 52-531)",
        modifications: "Aucune"
    },

    // Administration
    admin: {
        syndic: {
            name: "Mr LE MERLE Christophe",
            address: "7 rue André Leroux",
            phone: "06 17 25 02 66"
        },
        agNomination: "17 décembre 2025",
        finMandat: "31 décembre 2026",
        conseilSyndical: [
            "Mme Tropamer Véronique",
            "Mme Béliard Véronique",
            "M. Sibrac Vincent"
        ]
    },

    // Budget & Finances
    finances: {
        avanceTresorerie: "1 555.50€ / trimestre",
        fondsTravaux: "13 487.27€ (Loi ALUR)"
    },

    // Données techniques
    technique: {
        construction: "Avant 1900 (Pierre / Brique / Bois)",
        surface: "679 m² (RDC: 331m², 1er: 321m², 2e: 22m²)",
        toiture: "Tuile Marseille et Romane",
        facade: "Pierre et Enduit",
        codePeinture: "Tollens T 2004-2 (Bleue)",
        chauffage: "Individuel (Chauffage + Eau Chaude)",
        eauChaude: "Individuelle"
    },

    // Diagnostics
    diagnostics: {
        amiante: "Négatif (sauf conduit combles) - 16/09/2009",
        plomb: "RAS - 16/09/2009",
        termites: "Contrôlé - 16/09/2009"
    },

    // Copropriétaires avec répartition
    proprietaires: [
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
    ],

    // Prestataires
    prestataires: [
        { id: 1, name: "ACC SUD OUEST", contrat: "33254", contact: "", phones: ["05 57 22 87 36", "05 57 22 42 10", "05 57 22 42 12"], emails: ["contact@accsudouest.org"], address: "73 Avenue du Château d'Eau, 33700 MÉRIGNAC", codes: { id: "33254", mdp: "33254" } },
        { id: 2, name: "AXA", contrat: "0000021799969904", contact: "Balke Serge", phones: ["05 56 09 47 55"], emails: ["agence.balke@axa.fr"], address: "11 Cours du Dr Jacques Noël, 33590 Saint-Vivien-de-Médoc", codes: { id: "coprolsp@gmail.com", mdp: "3Rivieres." } },
        { id: 3, name: "CIC", contrat: "923515107917", contact: "", phones: ["05 56 05 41 11", "05 56 05 40 50"], emails: ["19317@cic.fr"], address: "76 Avenue du Médoc, 33320 Eysines", codes: { id: "923515107917", mdp: "3Rivieres." } },
        { id: 4, name: "EAU (Mairie)", contrat: "51405001201", contact: "Svc Eau: N. Dupuis", phones: ["05 56 09 85 77", "05 56 73 29 29"], emails: ["n.dupuis@mairie-soulac.fr"], address: "2 Rue Hôtel de Ville, 33780 Soulac-Sur-Mer", codes: { id: "", mdp: "" } }
    ],

    // Historique des travaux
    travaux: [
        { id: 1, annee: "2025", nature: "Réfection totale du portillon cour", entreprise: "Fait par REPT", cout: "0€" },
        { id: 2, annee: "2024", nature: "Toiture (60 tuiles + faitage)", entreprise: "Boudassou Stéphane (07 77 82 47 83)", cout: "1556.50€" },
        { id: 3, annee: "2024", nature: "Changement partie de l'appartement Listrac (Balcon)", entreprise: "Réalisé par Mr Sibrac", cout: "0€" },
        { id: 4, annee: "2024", nature: "Peinture hall Cellier", entreprise: "Réalisé par Mr Sibrac", cout: "0€" },
        { id: 5, annee: "2022", nature: "Peinture Porte d'entrée", entreprise: "Une Pointe de Couleurs (Pianalto Lydia)", cout: "237.00€" },
        { id: 6, annee: "2021", nature: "Fibre optique", entreprise: "Gironde très haut débit", cout: "0€" },
        { id: 7, annee: "2020", nature: "Porte d'entrée", entreprise: "Cahuzac Jean-Pierre", cout: "3313.20€" },
        { id: 8, annee: "2018", nature: "Réparation portillon", entreprise: "Sarl David Videau", cout: "165.00€" },
        { id: 9, annee: "2017", nature: "Tempête (volet)", entreprise: "Cyril Lira", cout: "929.50€" },
        { id: 10, annee: "2016", nature: "Dégâts des eaux", entreprise: "Sarl Videau / Raspail Adrien", cout: "2900€" },
        { id: 11, annee: "2015", nature: "Peinture boiseries (Communs + Coloc)", entreprise: "Birot Frères Sarl", cout: "5262.69€" },
        { id: 12, annee: "2014", nature: "Peinture façade arrière impasse", entreprise: "Eurl La Caisse à Out's (M. Raspail)", cout: "7709.90€" },
        { id: 13, annee: "2014", nature: "Incendie", entreprise: "Diverses", cout: "Assurance" },
        { id: 14, annee: "2013", nature: "Mise en retrait portail (Compteurs EDF)", entreprise: "...", cout: "?" },
        { id: 15, annee: "2013", nature: "Dégâts des eaux", entreprise: "Dubouilh", cout: "966.76€" },
        { id: 16, annee: "2013", nature: "Ravalement de façade", entreprise: "Fourniaud & Fils", cout: "14058.98€" },
        { id: 17, annee: "2011", nature: "Remplacement pierres érodées", entreprise: "Castet", cout: "2400.13€" },
        { id: 18, annee: "2005", nature: "Toiture (Tuiles et Zinc)", entreprise: "Gallocher Pierre", cout: "22851.59€" }
    ]
};

export const CARNET_TABS = [
    { id: 'carnet', label: 'Carnet', icon: 'Book' },
    { id: 'repartition', label: 'Répartition', icon: 'Calculator' },
    { id: 'annuaire', label: 'Annuaire', icon: 'Users' },
    { id: 'prestataires', label: 'Prestataires', icon: 'Briefcase' },
    { id: 'plan', label: 'Plan', icon: 'Map' }
];
